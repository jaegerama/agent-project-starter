#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Wahyu Rahmadani. https://github.com/jaegerama/agent-project-starter
/**
 * Fails when a document and the code disagree about a number or a list.
 *
 *     node tools/docs-drift.mjs
 *
 * Node only, no dependencies, any stack: run it as a step of the gate. It checks
 * claims, not wording, because a test on wording fails on a typo fix and
 * teaches everybody to ignore it.
 *
 * This file belongs to the project, and adopt never overwrites it; the agent
 * configuration checks live in .claude/tools/agent-check.mjs. A new check is an
 * entry in CHECKS that computes the truth from the source and asserts the
 * document says it, in under ten lines.
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : null)

// A check returns null (passed), a sentence (failed: what disagrees), or
// SKIP(reason) when it cannot run yet. A skip is not a pass, and the output says so.
const SKIP = (reason) => ({ skipped: reason })

// A package manager's own subcommands are not scripts: `pnpm lint` runs one,
// `pnpm install` is pnpm itself. npm runs a script only through `run`, or as `npm test`.
const BUILTIN = {
  pnpm: 'add audit bin config create dedupe deploy dlx doctor env exec fetch i import init install link list ls outdated pack patch prune publish rebuild remove rm root setup store unlink up update upgrade why',
  yarn: 'add audit bin cache config constraints create dlx exec explain info init install link npm pack patch plugin rebuild remove set unlink up upgrade version why workspace workspaces',
  composer: 'archive audit browse bump check-platform-reqs clear-cache config create-project depends diagnose dump-autoload exec fund global help init install licenses list outdated prohibits reinstall remove require search self-update show status suggests update validate why why-not',
}
const builtin = Object.fromEntries(Object.entries(BUILTIN).map(([tool, words]) => [tool, new Set(words.split(' '))]))

// Commands are read from code only, fenced or inline: in prose, "pnpm or yarn" is not a command.
const codeIn = (md) => [...md.matchAll(/```[^\n]*\n([\s\S]*?)```|`([^`\n]+)`/g)].map((m) => m[1] ?? m[2]).join('\n')
const scriptsInvoked = (md) =>
  [...codeIn(md).matchAll(/\b(npm|pnpm|yarn|composer)\s+(run(?:-script)?\s+)?([a-z][a-z0-9:_-]*)/g)].flatMap(([, tool, run, name]) => {
    if (run) return [name]
    if (tool === 'npm') return name === 'test' || name === 't' ? ['test'] : []
    return builtin[tool].has(name) ? [] : [name]
  })

const CHECKS = [
  {
    name: 'the gate in AGENTS.md and CONTRIBUTING.md runs commands that actually exist',
    run() {
      // A renamed script leaves the documented gate calling one that is gone. A
      // private-agents repository shows its gate in CONTRIBUTING.md, so both are read.
      const doc = [read('AGENTS.md'), read('CONTRIBUTING.md')].filter(Boolean).join('\n')
      if (!doc) return SKIP('no AGENTS.md or CONTRIBUTING.md yet')

      const npm = read('package.json')
      const composer = read('composer.json')
      if (!npm && !composer) return SKIP('no package.json/composer.json: adapt this check to your manifest')

      const declared = new Set([
        ...(npm ? Object.keys(JSON.parse(npm).scripts ?? {}) : []),
        ...(composer ? Object.keys(JSON.parse(composer).scripts ?? {}) : []),
      ])
      const missing = [...new Set(scriptsInvoked(doc))].filter((s) => !declared.has(s))

      return missing.length === 0
        ? null
        : `the gate runs scripts the manifest does not define: ${missing.join(', ')}`
    },
  },

  {
    name: 'docs/TODO.md has one story in WIP at most, and nothing past Epic 0 started before it is DONE',
    run() {
      // AGENTS.md §0.1, checked. A story is a heading like `### [WIP] S1.2 title`.
      const todo = read('docs/TODO.md')
      if (!todo) return SKIP('no docs/TODO.md yet')
      const stories = [...todo.matchAll(/^#{2,4}\s*\[(TODO|WIP|REVIEW|DONE|BLOCKED)\]\s*S(\d+)\.\d+/gm)].map(([, status, epic]) => ({
        status,
        epic: Number(epic),
      }))
      if (stories.length === 0) return SKIP('no story headings like `### [TODO] S0.1` in docs/TODO.md')

      const wip = stories.filter((s) => s.status === 'WIP').length
      const skeletonOpen = stories.some((s) => s.epic === 0 && s.status !== 'DONE')
      const early = stories.filter((s) => s.epic > 0 && ['WIP', 'REVIEW', 'DONE'].includes(s.status)).length
      const problems = [
        wip > 1 && `${wip} stories are in WIP, and one at a time is the rule`,
        skeletonOpen && early > 0 && `${early} story(s) past Epic 0 started before the walking skeleton is DONE`,
      ].filter(Boolean)
      return problems.length === 0 ? null : problems.join('; ')
    },
  },

  {
    name: 'every documented environment variable is read, and every variable read is documented',
    run() {
      // Example, half-written: extend it to your config module. Drift either way is a
      // defect: an unread variable misleads, and a missing one fails the deploy at boot.
      const example = read('.env.example')
      if (!example) return SKIP('no .env.example yet')

      const documented = new Set([...example.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((m) => m[1]))
      if (documented.size === 0) return '.env.example parsed to zero variables: check the format'

      return SKIP('half-written: extend it to scan your config module and compare both ways')
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

// The denominator is part of the result: "0 ran, 2 skipped" is not a pass.
console.log(`\n${ran - failed} passed, ${failed} failed, ${skipped} skipped of ${CHECKS.length}`)

if (CHECKS.length === 0) {
  console.error('FAIL  no checks are defined, and an empty suite is not a green suite')
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
