#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Wahyu Rahmadani. https://github.com/jaegerama/agent-project-starter
/**
 * Installs the starter into a project that already exists, or brings one that
 * adopted it earlier up to the current version.
 *
 *     node tools/adopt.mjs --into ../some-project            # dry run
 *     node tools/adopt.mjs --into ../some-project --apply    # do it
 *
 * Run it from the starter. Re-running it after the starter changes is how
 * every project stays on the same version of the process, while each keeps
 * its own stack, commands and rules.
 *
 * ## What it touches, and what it never touches
 *
 *   OWNED    files the starter owns. Copied, and overwritten when they differ,
 *            with a backup. A fix made to one of these inside a project is
 *            lost on the next adopt: make it in the starter.
 *   SEEDED   files a project is expected to customise. Copied only when
 *            missing; an existing one is never overwritten.
 *   project  everything else: the content of AGENTS.md, tools/docs-drift.mjs,
 *            the stack, other rules. Never touched.
 *
 * A CLAUDE.md that holds rules (no AGENTS.md yet) is moved into AGENTS.md
 * verbatim and replaced by the pointer. Moved, not rewritten: the rules are
 * the project's, and a migration that paraphrases them is a migration that
 * loses some.
 *
 * ## Why it will not wire the docs-first hook into every project
 *
 * The hook blocks Write/Edit while AGENTS.md has slots. That guards day one of
 * a new project. In a project that already has code and a running session, it
 * would block the session's real work instead. So adopt adds the hook only when
 * the target's AGENTS.md has no slots. It never removes one that is already
 * there: a new project copied from the starter carries the hook through its
 * setup on purpose, and adopt cannot tell that project from an old one.
 *
 * ## Private-agents repositories
 *
 * When git ignores AGENTS.md in the target, the repository goes to a shared
 * team remote and agent files are private. adopt then writes only into the
 * private files, and does not seed tracked files (HANDOFF.md, CHANGELOG.md,
 * tools/): adding files to a team repository is the project's decision.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs'
import { join, resolve, dirname, basename, relative, sep } from 'node:path'
import { execFileSync } from 'node:child_process'
import { slotsOf } from '../.claude/tools/lib/slot.mjs'
import { lineCount, isPointer, importsAgents } from '../.claude/tools/lib/pointer.mjs'

const starter = process.cwd()
const args = process.argv.slice(2)
const apply = args.includes('--apply')
const intoIdx = args.indexOf('--into')
const into = intoIdx >= 0 ? args[intoIdx + 1] : null

const fail = (msg) => {
  console.error(`\n${msg}\n`)
  process.exit(1)
}

if (!into) fail('Usage: node tools/adopt.mjs --into <path to project> [--apply]\nWithout --apply it only reports.')
if (!existsSync(join(starter, '_starter'))) {
  fail('Run this from the starter itself (the folder that still has _starter/).\nA bootstrapped project is not a source to adopt from.')
}
const target = resolve(into)
if (!existsSync(target) || !statSync(target).isDirectory()) fail(`Not a directory: ${target}`)
if (target === starter) fail('The target is the starter itself.')

const OWNED = [
  '.claude/tools/agent-check.mjs',
  '.claude/tools/lib/slot.mjs',
  '.claude/tools/lib/pointer.mjs',
  '.claude/hooks/guard-slots.mjs',
]
const SEEDED_PRIVATE = [
  '.claude/rules/review-severity.md',
  '.claude/commands/gate.md',
  '.claude/commands/docs-drift.md',
  '.claude/agents/silent-failure-hunter.md',
  'GEMINI.md',
  '.github/copilot-instructions.md',
]
// Tracked, project-owned files: seeded only in committed mode.
const SEEDED_TRACKED = ['CHANGELOG.md', 'tools/docs-drift.mjs']

const read = (base, p) => (existsSync(join(base, p)) ? readFileSync(join(base, p), 'utf8') : null)
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)
const backupDir = join(target, `.claude.backup-adopt-${stamp}`)
const actions = []
const note = (path, what) => actions.push([path, what])
const tag = apply ? '' : ' (would)'

const gitOk = (gitArgs) => {
  try {
    execFileSync('git', gitArgs, { cwd: target, stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}
// The target must be the top of its own repository. A folder inside another
// repository (or a workspace whose parent happens to be one) would otherwise
// be judged by someone else's .gitignore.
const isGitRepo = existsSync(join(target, '.git')) && gitOk(['rev-parse', '--is-inside-work-tree'])
const ignored = (p) => isGitRepo && gitOk(['check-ignore', '-q', p])
const privateMode = ignored('AGENTS.md')

const backup = (p) => {
  if (!apply || !existsSync(join(target, p))) return
  const to = join(backupDir, p)
  mkdirSync(dirname(to), { recursive: true })
  copyFileSync(join(target, p), to)
}
// In a private-agents repository every file adopt may write must be one git
// ignores. A path that is not would be picked up by the next `git add -A` of
// whatever session is working there and pushed to the team remote. Checked
// for every candidate BEFORE anything is written, so a refusal leaves the
// project exactly as it was instead of half-adopted.
if (privateMode) {
  const candidates = [
    ...OWNED,
    ...SEEDED_PRIVATE,
    'AGENTS.md',
    'CLAUDE.md',
    '.claude/settings.json',
    `.claude.backup-adopt-${stamp}/CLAUDE.md`,
  ]
  const exposed = candidates.filter((p) => !ignored(p))
  if (exposed.length) {
    fail(
      `Refused, nothing written. ${target} is a private-agents repository (git ignores AGENTS.md),\n` +
        `but git does NOT ignore these paths adopt would write:\n\n  ${exposed.join('\n  ')}\n\n` +
        `Add them to its .gitignore first. Written as they are, the next \`git add -A\` would send them\n` +
        `to the team remote.`,
    )
  }
}

const write = (p, body) => {
  if (!apply) return
  mkdirSync(dirname(join(target, p)), { recursive: true })
  writeFileSync(join(target, p), body)
}
const same = (p) => read(starter, p) === read(target, p)

// ── Owned: copy, overwrite when different ────────────────────────────────────
for (const p of OWNED) {
  if (!existsSync(join(target, p))) {
    write(p, read(starter, p))
    note(p, `added${tag}`)
  } else if (same(p)) {
    note(p, 'current')
  } else {
    backup(p)
    write(p, read(starter, p))
    note(p, `updated${tag}, old copy backed up`)
  }
}

// ── Seeded: copy only when missing ───────────────────────────────────────────
for (const p of SEEDED_PRIVATE) {
  if (!existsSync(join(target, p))) {
    write(p, read(starter, p))
    note(p, `seeded${tag}`)
  } else {
    note(p, same(p) ? 'current' : 'customised, kept')
  }
}
for (const p of SEEDED_TRACKED) {
  if (existsSync(join(target, p))) note(p, same(p) ? 'current' : 'project-owned, kept')
  else if (privateMode) note(p, 'missing, not seeded: tracked file in a team repository')
  else {
    write(p, read(starter, p))
    note(p, `seeded${tag}`)
  }
}

// HANDOFF.md may live at the root or anywhere under docs/.
const findHandoff = (dir, depth = 0) => {
  if (!existsSync(dir) || depth > 3) return null
  for (const e of readdirSync(dir)) {
    const full = join(dir, e)
    if (e === 'HANDOFF.md') return full
    if (statSync(full).isDirectory()) {
      const hit = findHandoff(full, depth + 1)
      if (hit) return hit
    }
  }
  return null
}
const handoff = existsSync(join(target, 'HANDOFF.md')) ? join(target, 'HANDOFF.md') : findHandoff(join(target, 'docs'))
if (handoff) note('HANDOFF.md', `present at ${relative(target, handoff).split(sep).join('/')}, kept`)
else if (privateMode) note('HANDOFF.md', 'missing, not seeded: tracked file in a team repository')
else {
  write('HANDOFF.md', read(starter, 'HANDOFF.md').split('<PROJECT NAME>').join(basename(target)))
  note('HANDOFF.md', `seeded${tag}`)
}

// ── CLAUDE.md and AGENTS.md ──────────────────────────────────────────────────
const claude = read(target, 'CLAUDE.md')
let agents = read(target, 'AGENTS.md')
const pointer = read(starter, 'CLAUDE.md')

if (agents === null && claude !== null && !isPointer(claude)) {
  backup('CLAUDE.md')
  // Only the title changes. The optional BOM is kept: one adopted file starts
  // with one, and a title regex without it silently renamed nothing.
  const moved = claude.replace(/^(\uFEFF?)# CLAUDE\.md\b/, '$1# AGENTS.md')
  write('AGENTS.md', moved)
  write('CLAUDE.md', pointer)
  agents = moved
  note('AGENTS.md', `created${tag} from CLAUDE.md, verbatim (${lineCount(claude)} lines)`)
  note('CLAUDE.md', `replaced${tag} by the pointer, original backed up`)
  // A verbatim move also moves sentences about the file itself: one project's
  // directory map said "CLAUDE.md # this file" inside AGENTS.md. Which of these
  // lines are now wrong is a reading of the project's rules, so they are
  // listed for review, never rewritten.
  const mentions = moved
    .split('\n')
    .map((line, i) => [i + 1, line.trim()])
    .filter(([, line]) => line.includes('CLAUDE.md'))
  for (const [n, line] of mentions) note(`  review AGENTS.md:${n}`, line.slice(0, 90))

} else if (agents === null && claude === null) {
  const template = read(starter, 'AGENTS.md').split('<PROJECT NAME>').join(basename(target))
  write('AGENTS.md', template)
  write('CLAUDE.md', pointer)
  agents = template
  note('AGENTS.md', `seeded${tag} from the template: fill it through its Setup section`)
  note('CLAUDE.md', `seeded${tag}`)
} else if (agents === null && isPointer(claude)) {
  note('CLAUDE.md', 'CONFLICT: a pointer to an AGENTS.md that does not exist. Nothing changed')
} else if (claude !== null && !isPointer(claude)) {
  note('CLAUDE.md', 'CONFLICT: AGENTS.md exists and CLAUDE.md also holds rules. Merge by hand; nothing changed')
} else if (claude === null) {
  write('CLAUDE.md', pointer)
  note('CLAUDE.md', `pointer added${tag}`)
} else if (claude === pointer) {
  note('CLAUDE.md', 'current')
} else if (importsAgents(claude)) {
  // The import line is the only part of the pointer the starter owns. The
  // "Claude Code only" table below it lists this project's own commands and
  // agents: one project's session rewrote it to name its four commands and
  // three agents, and overwriting that would erase accurate project facts.
  note('CLAUDE.md', 'customised pointer, kept: it imports AGENTS.md')
} else {
  // An older pointer that asks in words. Add the one line that makes Claude
  // Code load AGENTS.md, right after the title, and keep everything else.
  backup('CLAUDE.md')
  const withImport = /^\uFEFF?#[^\n]*\n/.test(claude)
    ? claude.replace(/^(\uFEFF?#[^\n]*\n)/, '$1\n@AGENTS.md\n')
    : `@AGENTS.md\n\n${claude}`
  write('CLAUDE.md', withImport)
  note('CLAUDE.md', `import line added${tag}, rest kept, old copy backed up`)
}

// ── Hook wiring in .claude/settings.json ─────────────────────────────────────
const slots = agents === null ? [] : slotsOf(agents)
// Started from CLAUDE_PROJECT_DIR: a relative command is not found after a `cd`.
const HOOK = 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/guard-slots.mjs"'
const settingsPath = '.claude/settings.json'
const settingsRaw = read(target, settingsPath)
let settings
try {
  settings = settingsRaw === null ? null : JSON.parse(settingsRaw)
} catch (error) {
  settings = undefined
  note(settingsPath, `not valid JSON, left alone: ${error.message}`)
}
if (settings !== undefined) {
  // The starter's hook used to live at tools/hooks/, and later ran from a
  // relative path; any entry calling guard-slots is the same hook.
  const isGuard = (m) => (m.hooks ?? []).some((h) => String(h.command ?? '').includes('guard-slots.mjs'))
  // A settings file created here starts from the starter's, minus the hook:
  // whether this project gets the hook is decided below, not inherited.
  const base = settings ?? JSON.parse(read(starter, settingsPath))
  base.hooks ??= {}
  if (settings === null) base.hooks.PreToolUse = (base.hooks.PreToolUse ?? []).filter((m) => !isGuard(m))
  const pre = base.hooks.PreToolUse ?? []
  const existing = pre.filter(isGuard)
  const current = existing.length === 1 && existing[0].hooks.some((h) => h.command === HOOK)
  let changed = settings === null
  // adopt never removes the hook. It once removed it whenever slots remained,
  // which cannot tell an existing project with code (where the hook would
  // block real work) from a new one copied from the starter and mid-setup
  // (where blocking code is the hook's whole job). A new project was the second case.
  if (existing.length && !current) {
    base.hooks.PreToolUse = [
      ...pre.filter((m) => !isGuard(m)),
      { matcher: 'Write|Edit|NotebookEdit', hooks: [{ type: 'command', command: HOOK }] },
    ]
    changed = true
    note('hook', `moved to the current command${tag}`)
  } else if (current) {
    note('hook', slots.length ? `wired, kept: AGENTS.md has ${slots.length} slots and the hook is guarding setup` : 'wired')
  } else if (slots.length > 0) {
    note('hook', `not wired: AGENTS.md has ${slots.length} slots, and in a project that already has code the hook would block its running work`)
  } else {
    base.hooks.PreToolUse = [
      ...pre.filter((m) => !isGuard(m)),
      { matcher: 'Write|Edit|NotebookEdit', hooks: [{ type: 'command', command: HOOK }] },
    ]
    changed = true
    note('hook', `wired${tag}`)
  }
  if (base.hooks.PreToolUse && base.hooks.PreToolUse.length === 0) delete base.hooks.PreToolUse
  if (Object.keys(base.hooks).length === 0) delete base.hooks
  if (changed) {
    backup(settingsPath)
    write(settingsPath, JSON.stringify(base, null, 2) + '\n')
    note(settingsPath, `${settings === null ? 'created' : 'updated'}${tag}`)
  } else {
    note(settingsPath, 'current')
  }
}

// ── .gitignore ───────────────────────────────────────────────────────────────
// Only the backup pattern matters to adopt: it writes backups, and one
// `git add -A` must not commit them.
if (!isGitRepo) {
  note('.gitignore', 'not a git repository: initialise one and ignore .claude.backup-*/ before the first commit')
} else if (!ignored(`.claude.backup-adopt-${stamp}/probe`)) {
  const gi = read(target, '.gitignore') ?? ''
  const sepLine = gi === '' || gi.endsWith('\n') ? '' : '\n'
  write('.gitignore', `${gi}${sepLine}\n# backups written by tools/adopt.mjs from the starter\n.claude.backup-*/\n`)
  note('.gitignore', `.claude.backup-*/ added${tag}`)
}

// ── Report ───────────────────────────────────────────────────────────────────
console.log(`\n${apply ? 'DONE' : 'DRY RUN, nothing was changed'}  ${target}`)
console.log(
  `  mode: ${privateMode ? 'private agents (git ignores AGENTS.md)' : 'committed agents'}${isGitRepo ? '' : ', not a git repository'}\n`,
)
const width = Math.max(...actions.map(([p]) => p.length))
for (const [p, what] of actions) console.log(`  ${p.padEnd(width)}  ${what}`)
if (apply && existsSync(backupDir)) console.log(`\n  backups: ${relative(target, backupDir)}`)

if (apply) {
  console.log('\n  agent-check in the target:')
  try {
    const out = execFileSync('node', ['.claude/tools/agent-check.mjs'], {
      cwd: target,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    console.log(out.replace(/^/gm, '    '))
  } catch (error) {
    console.log(`${error.stdout ?? ''}${error.stderr ?? ''}`.replace(/^/gm, '    '))
  }
} else {
  console.log('\nRun again with --apply to do it.')
}
