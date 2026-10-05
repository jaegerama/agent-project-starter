#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Wahyu Rahmadani. https://github.com/jaegerama/agent-project-starter
/**
 * Fail when a document and the code disagree about a number or a list.
 *
 * Dependency-free and stack-agnostic on purpose: it needs Node and nothing
 * else, so it works in a PHP, Python or Go project as easily as a JavaScript
 * one. Wire it into whatever test runner you have, or run it as its own gate
 * step:
 *
 *     node tools/docs-drift.mjs
 *
 * ## Why this exists
 *
 * A document that restates a number from the code goes stale the first time
 * that number changes, and nothing about editing the code reminds anybody that
 * a document repeats it. Prose asking people to remember does not work: in one
 * day on one production project, three documents were found stating things the code
 * had stopped doing, and two of them carried a note from a previous correction
 * of the exact same kind.
 *
 * The fix is not a better note. It is that the document is checked rather than
 * proofread.
 *
 * ## The one rule worth copying
 *
 * Check **claims**, not wording. A test that compares prose fails on a typo fix
 * and teaches everybody to ignore it. A test that compares one number to the
 * number it came from fails only when somebody is about to mislead a reader.
 *
 * The checks about agent configuration (slots, pointers, operator profile,
 * antislop block) live in `.claude/tools/agent-check.mjs`, which belongs to the
 * starter. This file belongs to the project: `tools/adopt.mjs` never
 * overwrites it once it exists.
 *
 * ## Adding a check
 *
 * Add an entry to CHECKS. Each one names what it reads, computes the truth from
 * the source, and asserts the document says it. Keep each under ten lines: a
 * check nobody can read is a check nobody will update.
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : null)

/**
 * A check returns one of three things, and the third one is the point:
 *
 *   null              it passed
 *   'some sentence'   it failed, and this says what disagrees
 *   SKIP('reason')    it could not run — the file it reads does not exist yet
 *
 * SKIP exists because the first version of this file did not have it. On a
 * brand-new project every check returned null, the runner printed `ok` twice,
 * and it exited 0 — a green result from a suite that had examined nothing. That
 * is the same false pass as an assertion that cannot fail, and it is most
 * dangerous exactly here, on day one, when somebody is deciding how much to
 * trust the setup.
 *
 * A skipped check is not a failure. It is also not a pass, and the output says
 * which.
 */
const SKIP = (reason) => ({ skipped: reason })

const CHECKS = [
  {
    name: 'the gate in AGENTS.md and CONTRIBUTING.md runs commands that actually exist',
    run() {
      // The failure it prevents: a script is renamed, the gate block in
      // AGENTS.md still names the old one, and the step silently stops running.
      // One project shipped for days with a format check that CI ran and the
      // documented gate did not.
      // In a private-agents repo AGENTS.md is not committed, so the gate a human
      // can see is in CONTRIBUTING.md. Read both; either one may be absent.
      const doc = [read('AGENTS.md'), read('CONTRIBUTING.md')].filter(Boolean).join('\n')
      if (!doc) return SKIP('no AGENTS.md or CONTRIBUTING.md yet')

      const npm = read('package.json')
      const composer = read('composer.json')
      if (!npm && !composer) return SKIP('no package.json/composer.json — adapt this check to your manifest')

      const declared = new Set([
        ...(npm ? Object.keys(JSON.parse(npm).scripts ?? {}) : []),
        ...(composer ? Object.keys(JSON.parse(composer).scripts ?? {}) : []),
      ])
      const invoked = [
        ...doc.matchAll(/(?:npm run|pnpm|yarn|composer(?: run-script)?) ([a-z][a-z0-9:_-]*)/g),
      ].map((m) => m[1])
      const missing = [...new Set(invoked)].filter((s) => !declared.has(s))

      return missing.length === 0
        ? null
        : `the gate runs scripts the manifest does not define: ${missing.join(', ')}`
    },
  },

  {
    name: 'every documented environment variable is read, and every variable read is documented',
    run() {
      // EXAMPLE — adapt the second path to wherever your code reads config.
      //
      // Drift in EITHER direction is a defect: a variable in the example file
      // that nothing reads is a lie to whoever fills it in, and a variable the
      // code reads that the example omits is a deploy that fails at boot.
      const example = read('.env.example')
      if (!example) return SKIP('no .env.example yet')

      const documented = new Set([...example.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((m) => m[1]))
      if (documented.size === 0) return '.env.example parsed to zero variables — check the format'

      return SKIP('half-written — extend it to scan your config module and compare both ways')
    },
  },
]

let failed = 0
let ran = 0
let skipped = 0

for (const check of CHECKS) {
  let result
  try {
    result = check.run()
  } catch (error) {
    result = `the check itself threw: ${error.message}`
  }

  if (result && typeof result === 'object' && 'skipped' in result) {
    skipped += 1
    console.log(`SKIP  ${check.name}\n      ${result.skipped}`)
  } else if (result) {
    failed += 1
    ran += 1
    console.error(`FAIL  ${check.name}\n      ${result}\n`)
  } else {
    ran += 1
    console.log(`ok    ${check.name}`)
  }
}

// The summary line exists so a green run cannot be read without its
// denominator. "2 passed" and "0 ran, 2 skipped" are the same two words of
// reassurance and mean opposite things.
console.log(`\n${ran - failed} passed, ${failed} failed, ${skipped} skipped of ${CHECKS.length}`)

if (CHECKS.length === 0) {
  console.error('FAIL  no checks are defined — an empty suite is not a green suite')
  process.exit(1)
}

if (ran === 0) {
  console.error(
    '\nNothing was actually checked. That is expected on a new project and it is' +
      '\nnot a pass: until a check runs, the rules it guards are aspiration. Adapt' +
      '\nthe examples above to files this project really has.',
  )
}

process.exit(failed === 0 ? 0 : 1)
