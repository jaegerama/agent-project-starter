#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Wahyu Rahmadani. https://github.com/jaegerama/agent-project-starter
/**
 * Does the mechanical part of "duplicate the starter folder, make it a project".
 *
 *     node tools/bootstrap.mjs --name "Acme Portal"           # dry run
 *     node tools/bootstrap.mjs --name "Acme Portal" --apply   # do it
 *     node tools/bootstrap.mjs --name "Acme Portal" --private-agents --apply
 *
 * ## What it does
 *
 *   1. Replaces <PROJECT NAME> across the templates.
 *   2. Deletes what belongs to the starter, not the project: _starter/,
 *      LICENSE, .github/README.md and the self-test workflow.
 *   3. Runs git init if this is not a repo yet.
 *   4. Prints the slots a human still has to fill, grouped by file.
 *   5. With --private-agents, appends the .gitignore block that keeps agent
 *      files out of git. Use it for a repository that goes to a shared team
 *      remote: there, agent configuration is per-developer, and the rules
 *      humans need belong in CONTRIBUTING.md and docs/.
 *
 * ## What it does NOT do, and why
 *
 * It does not fill slots. Slots hold decisions — the stack, the hard limits,
 * the gate commands, the business rules that may not be invented. A script that
 * fills them with guesses produces a file that reads as complete and is not,
 * which is precisely the failure mode this whole repo exists to prevent.
 *
 * ## Why dry run is the default
 *
 * Step 2 deletes a directory. A destructive operation without explicit
 * confirmation is CRITICAL under `.claude/rules/review-severity.md`, and that
 * rule applies to the tooling in this repo too.
 */

import { readFileSync, writeFileSync, existsSync, rmSync, readdirSync, statSync } from 'node:fs'
import { join, relative, basename, sep } from 'node:path'
import { execFileSync } from 'node:child_process'
import { slotsOf } from '../.claude/tools/lib/slot.mjs'

const root = process.cwd()
const args = process.argv.slice(2)
const apply = args.includes('--apply')
const privateAgents = args.includes('--private-agents')
const nameIdx = args.indexOf('--name')
const name = nameIdx >= 0 ? args[nameIdx + 1] : null

const PLACEHOLDER = '<PROJECT NAME>'

const fail = (msg) => {
  console.error(`\n${msg}\n`)
  process.exit(1)
}

// `--name --apply` once named the project `--apply`, and applied.
if (!name || name.startsWith('-')) {
  fail(
    'Usage: node tools/bootstrap.mjs --name "<Project Name>" [--private-agents] [--apply]\n' +
      'Without --apply it only reports what it would do.',
  )
}

// Guard: never dismantle the starter itself. That folder gets reused; deleting
// _starter/ inside it means losing every document explaining how to use it, and
// nothing puts them back. A clone takes the repository's name, so both count.
if (['project-starter', 'agent-project-starter'].includes(basename(root).toLowerCase())) {
  fail(
    'This is the starter folder itself, not a copy of it.\n' +
      "Copy or clone it under the project's name, then run this from inside the copy.",
  )
}

// Template files only. `tools/` and `.claude/` are deliberately out of scope:
// both contain <...> that are not slots for a human to fill — regexes, examples
// inside command docs, and the PLACEHOLDER constant in this very file. The
// first version of this script swept everything, reported 49 slots of which 19
// were not slots, and would have written the project name over its own constant
// on --apply.
const TEMPLATE_FILES = ['AGENTS.md', 'README.md', 'CHANGELOG.md', 'CLAUDE.md', 'GEMINI.md', 'HANDOFF.md', 'DESIGN.md']
const TEMPLATE_DIRS = ['docs']

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (entry.endsWith('.md')) out.push(full)
  }
  return out
}

const rel = (f) => relative(root, f).split(sep).join('/')
const files = [
  ...TEMPLATE_FILES.map((f) => join(root, f)).filter((f) => existsSync(f)),
  ...TEMPLATE_DIRS.map((d) => join(root, d))
    .filter((d) => existsSync(d))
    .flatMap((d) => walk(d)),
]

// ── 1. Replace <PROJECT NAME> ────────────────────────────────────────────────
const touched = []
for (const file of files) {
  const body = readFileSync(file, 'utf8')
  if (!body.includes(PLACEHOLDER)) continue
  touched.push(rel(file))
  if (apply) writeFileSync(file, body.split(PLACEHOLDER).join(name))
}

// ── 2. Delete what belongs to the starter ────────────────────────────────────
// Only on the first run, while _starter/ is still there: by a later run a
// LICENSE may be the project's own. The tool files keep their SPDX notice.
const STARTER_ONLY = ['_starter', 'LICENSE', '.github/README.md', '.github/workflows/selftest.yml']
const hasStarterDir = existsSync(join(root, '_starter'))
const starterOnly = hasStarterDir ? STARTER_ONLY.filter((p) => existsSync(join(root, p))) : []
if (apply) for (const p of starterOnly) rmSync(join(root, p), { recursive: true, force: true })

// ── 3. A fresh git history ───────────────────────────────────────────────────
// Duplicating the folder in Explorer copies the hidden .git as well, so a new
// project used to start life carrying the starter's own commits, and in
// private-agents mode AGENTS.md and .claude/ stayed tracked: .gitignore does
// not untrack what is already committed, so they would have been pushed to the
// team remote on the first push. Verified on a copy before this was written.
//
// Only on the first run (_starter/ still present) and only when the root
// commit is the starter's own. On any later run the history may hold the
// project's own commits on top, and deleting those cannot be undone.
// The root commit of the public history (2026-10-05), or of the private one before it.
const STARTER_ROOT = /^chore: import (?:the agent )?project starter\b/
let hasGit = existsSync(join(root, '.git'))
let inherited = false
if (hasGit) {
  try {
    const subjects = execFileSync('git', ['log', '--reverse', '--format=%s'], { cwd: root, encoding: 'utf8' })
    inherited = STARTER_ROOT.test(subjects.split('\n')[0])
  } catch {
    // A repository with no commits yet has no inherited history to remove.
  }
}
const resetHistory = inherited && hasStarterDir
if (resetHistory && apply) {
  rmSync(join(root, '.git'), { recursive: true, force: true })
  hasGit = false
}
if (!hasGit && apply) {
  try {
    execFileSync('git', ['init', '-q'], { cwd: root })
  } catch (error) {
    console.error(`  git init failed: ${error.message}`)
  }
}

// ── 3b. Private agent files ──────────────────────────────────────────────────
// The block is the one existing team repositories already carry, reduced to
// what is generic. The marker makes a second run a no-op instead of a
// duplicate block.
const IGNORE_MARKER = '# agent files: private (bootstrap --private-agents)'
const IGNORE_BLOCK = [
  '',
  IGNORE_MARKER,
  '# Agent configuration and memory are per-developer, and each developer may use',
  '# a different tool. Durable rules that humans need live in CONTRIBUTING.md and',
  '# docs/, which are committed. Git cannot restore anything below, so back it up',
  '# before something rewrites it; the backup pattern is ignored too, because one',
  '# `git add -A` would otherwise send it to a remote that must never receive it.',
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  '.github/copilot-instructions.md',
  '.claude/',
  '.claude.backup-*/',
  '',
].join('\n')
const gitignorePath = join(root, '.gitignore')
const gitignoreBody = existsSync(gitignorePath) ? readFileSync(gitignorePath, 'utf8') : ''
const alreadyPrivate = gitignoreBody.includes(IGNORE_MARKER)
if (privateAgents && !alreadyPrivate && apply) writeFileSync(gitignorePath, gitignoreBody + IGNORE_BLOCK)

// ── 4. Remaining slots ───────────────────────────────────────────────────────
// Split in two: what blocks the gate (AGENTS.md — the file .claude/tools/agent-check.mjs
// actually checks) and what must be filled before application code but does not
// turn the gate red. Merging them would print a number that disagrees with the
// drift checker's number, and two different numbers for the same thing is the
// fastest way to make people stop trusting both.
const slotsIn = (file) => (existsSync(file) ? slotsOf(readFileSync(file, 'utf8')) : [])

const blocking = slotsIn(join(root, 'AGENTS.md'))
const remaining = files
  .filter((f) => rel(f) !== 'AGENTS.md')
  .map((f) => [rel(f), slotsIn(f).filter((s) => !(apply && s === PLACEHOLDER))])
  .filter(([, slots]) => slots.length > 0)

// ── Report ───────────────────────────────────────────────────────────────────
const verb = apply ? '' : ' (would be)'
console.log(`\n${apply ? 'DONE' : 'DRY RUN — nothing was changed'}\n`)
console.log(`  project name      ${name}`)
console.log(`  ${PLACEHOLDER} replaced in${verb}  ${touched.length} files`)
for (const f of touched) console.log(`      ${f}`)
console.log(`  starter files     ${hasStarterDir ? `${starterOnly.join(', ')} deleted${verb}` : 'already gone'}`)
console.log(
  `  git               ${
    resetHistory
      ? `starter history removed, fresh repository initialised${verb}`
      : inherited
        ? "WARNING: history starts with the starter's commits; left alone because _starter/ is gone"
        : hasGit
          ? 'already a repo'
          : `initialised${verb}`
  }`,
)
console.log(
  `  agent files       ${
    privateAgents
      ? alreadyPrivate
        ? 'private (block already in .gitignore)'
        : `private, .gitignore block appended${verb}`
      : 'committed (default; --private-agents for a shared team remote)'
  }`,
)

const show = (file, slots) => {
  console.log(`  ${file}`)
  for (const slot of slots.slice(0, 8)) console.log(`      ${slot}`)
  if (slots.length > 8) console.log(`      … and ${slots.length - 8} more`)
}

if (blocking.length) {
  console.log(`\n  BLOCKS THE GATE — ${blocking.length} slots in AGENTS.md:\n`)
  show('AGENTS.md', blocking)
}

if (remaining.length) {
  const total = remaining.reduce((n, [, s]) => n + s.length, 0)
  console.log(`\n  Fill before application code — ${total} slots:\n`)
  for (const [file, slots] of remaining) show(file, slots)
}

if (!blocking.length && !remaining.length) console.log('\n  No slots left.')

console.log(
  apply
    ? '\nNext:\n' +
        '  follow the Setup section at the top of AGENTS.md: brief in docs/BRIEF.md,\n' +
        '  slots filled from it, unanswered ones as questions in docs/QUESTIONS.md,\n' +
        '  then node .claude/tools/agent-check.mjs until the slot check is green\n' +
        (starterOnly.includes('LICENSE') ? "  the starter's LICENSE is gone: add this project's own, if it needs one\n" : '')
    : '\nRun again with --apply to actually do it.\n',
)
