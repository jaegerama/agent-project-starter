#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Wahyu Rahmadani. https://github.com/jaegerama/agent-project-starter
/**
 * Fail when the agent configuration of this project, or of this machine, has
 * drifted from what the starter guarantees.
 *
 *     node .claude/tools/agent-check.mjs
 *
 * ## Why it is separate from tools/docs-drift.mjs
 *
 * Everything here is about agent configuration: `AGENTS.md`, the pointer
 * files, the operator profile, the antislop block. In a team repository those
 * files are private and `.claude/` is ignored, so a check about them cannot
 * live in `tools/`, which is committed. `tools/docs-drift.mjs` keeps the checks
 * about this project's own documents and code, and it belongs to the project.
 * This file belongs to the starter: `tools/adopt.mjs` overwrites it, so a fix
 * made here in a project is lost on the next adopt. Make it in the starter.
 *
 * Dependency-free on purpose: it needs Node and nothing else, so it works in
 * a PHP, Python or Go project as easily as a JavaScript one.
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { slotsOf } from './lib/slot.mjs'
import { isPointer, importsAgents } from './lib/pointer.mjs'

const root = process.cwd()
const read = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : null)
const readAbs = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null)

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
    name: 'no unfilled <> slots remain in AGENTS.md',
    run() {
      // The cheapest and highest-value check in this repo, and the only one
      // that can go red on day one with no application code at all.
      //
      // The failure it prevents: a slot left as a placeholder reads like a rule
      // that has been satisfied, and then gets quoted back in a review. The
      // whole premise of this starter rests on that sentence, and before this
      // check existed no machine enforced it.
      const doc = read('AGENTS.md')
      if (!doc) return SKIP('no AGENTS.md yet')

      const slots = slotsOf(doc)
      if (slots.length === 0) return null

      return `AGENTS.md still has ${slots.length} unfilled slots — fill them before the first line of application code. For example: ${slots.slice(0, 4).join('  ')}`
    },
  },

  {
    name: 'CLAUDE.md and GEMINI.md are still pointers, and CLAUDE.md imports AGENTS.md',
    run() {
      // The failure it prevents: somebody pastes one rule into CLAUDE.md "so
      // Claude definitely reads it". From that moment there are two sources of
      // truth, and one will drift from the other with nobody noticing. The
      // 60-line limit is a crude fence, and a crude fence that fails is worth
      // more than tidy prose.
      if (!read('CLAUDE.md') && !read('GEMINI.md')) return SKIP('no pointer files yet')

      const offenders = ['CLAUDE.md', 'GEMINI.md']
        .map((p) => [p, read(p)])
        .filter(([, body]) => body !== null && !isPointer(body))
        .map(([p]) => p)
      // Without this line Claude Code never loads AGENTS.md, and nothing else says so.
      const claude = read('CLAUDE.md')
      if (claude !== null && !importsAgents(claude)) offenders.push('CLAUDE.md (no @AGENTS.md import line outside code)')

      return offenders.length === 0
        ? null
        : `pointer files are growing rules of their own, or lost the reference to AGENTS.md: ${offenders.join(', ')}`
    },
  },

  {
    name: 'the operator profile is identical across Claude, Codex and Gemini',
    run() {
      // The failure it prevents: the persona and hard limits get updated in one
      // tool while two others quietly run the old version. This has already
      // happened once — ~/.gemini/GEMINI.md carried a separate English profile
      // with port 3000 hardcoded, long after the master had stopped saying so.
      //
      // The master is ~/CLAUDE.md, or ~/.claude/CLAUDE.md on a machine without
      // one. Only copies that exist are compared: a tool nobody uses here has none.
      const home = homedir()
      const master = [join(home, 'CLAUDE.md'), join(home, '.claude', 'CLAUDE.md')].find((p) => existsSync(p))
      if (!master) return SKIP('no operator profile in the home directory')
      const copies = [join(home, '.codex', 'AGENTS.md'), join(home, '.gemini', 'GEMINI.md')].filter((p) => existsSync(p))
      if (copies.length === 0) return SKIP(`no Codex or Gemini copy of ${master} to compare`)

      const body = readAbs(master)
      const stale = copies.filter((p) => readAbs(p) !== body)
      return stale.length === 0
        ? null
        : `operator profile copies have drifted from ${master}: ${stale.join(', ')}. Copy the master over them again`
    },
  },

  {
    name: 'the antislop block in ~/.claude/CLAUDE.md matches the master profile',
    run() {
      // The failure it prevents: the block is edited in the master, copied to
      // Codex and Gemini (the check above goes green), and left stale in the one
      // file that reaches Claude sessions outside the home directory. The check
      // above cannot see it: ~/.claude/CLAUDE.md is not a copy of the profile,
      // only of this one block, so a whole-file compare would always fail.
      const home = homedir()
      const master = join(home, 'CLAUDE.md')
      const global = join(home, '.claude', 'CLAUDE.md')
      const block = (body) => {
        if (body === null) return null
        const start = body.indexOf('<!-- antislop:start -->')
        const end = body.indexOf('<!-- antislop:end -->')
        return start === -1 || end < start ? null : body.slice(start, end)
      }
      // Without ~/CLAUDE.md there is no master to copy the block from.
      if (!existsSync(master)) return SKIP('no ~/CLAUDE.md, so no master block to compare')
      const a = block(readAbs(master))
      const b = block(readAbs(global))
      if (a === null && b === null) return SKIP('no antislop block in either file')
      if (a === null || b === null) {
        return `the antislop block exists in ${a === null ? global : master} but not in ${a === null ? master : global}`
      }
      return a === b ? null : `the antislop block in ${global} has drifted from ${master}: copy it over again`
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
