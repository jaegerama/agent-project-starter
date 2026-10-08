#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Wahyu Rahmadani. https://github.com/jaegerama/agent-project-starter
/**
 * Installs the starter into a project that exists already, or brings one that
 * adopted it up to date. Run it from the starter, dry run first:
 *
 *     node tools/adopt.mjs --into ../some-project            # dry run
 *     node tools/adopt.mjs --into ../some-project --apply    # do it
 *
 *   OWNED    starter files: copied, and overwritten with a backup when they
 *            differ. Fix them in the starter, or the next adopt undoes it.
 *   SEEDED   files a project customises: copied when missing, and updated
 *            while they still equal one of the starter's own earlier copies.
 *            One kept although the starter changed it is named in the report.
 *   project  everything else, AGENTS.md's content included: never touched.
 *
 * A CLAUDE.md that holds rules, with no AGENTS.md yet, moves into AGENTS.md
 * verbatim and the pointer takes its place: a paraphrased migration loses rules.
 * A CLAUDE.md or GEMINI.md pointer with no import line gets one; the rest is kept.
 *
 * The docs-first hook is wired only where AGENTS.md has no slots: in a project
 * with code it would block the running work. An existing hook is never removed,
 * because a new project carries it through setup.
 *
 * Where git ignores AGENTS.md, agent files are private (a team remote): adopt
 * writes only ignored files and seeds no tracked ones.
 *
 * A project receives releases only: adopt refuses a starter whose files differ
 * from its latest release tag (--allow-unreleased), or have uncommitted changes
 * (--allow-dirty, which implies the other). Both flags are for testing adopt.
 * The project's .claude/starter-version names the release it installed.
 * The report says when no gate in the project runs agent-check.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs'
import { join, resolve, dirname, basename, relative, sep } from 'node:path'
import { execFileSync } from 'node:child_process'
import { slotsOf } from '../.claude/tools/lib/slot.mjs'
import { lineCount, isPointer, importsAgents, geminiImportsAgents } from '../.claude/tools/lib/pointer.mjs'

const starter = process.cwd()
const args = process.argv.slice(2)
const apply = args.includes('--apply')
const allowDirty = args.includes('--allow-dirty')
const allowUnreleased = allowDirty || args.includes('--allow-unreleased')
const intoIdx = args.indexOf('--into')
const into = intoIdx >= 0 ? args[intoIdx + 1] : null

const fail = (msg) => {
  console.error(`\n${msg}\n`)
  process.exit(1)
}

if (!into) {
  fail(
    'Usage: node tools/adopt.mjs --into <path to project> [--apply] [--allow-unreleased] [--allow-dirty]\n' +
      'Without --apply it only reports.',
  )
}
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
const VERSION_FILE = '.claude/starter-version'
// Everything adopt copies from the starter, and the code that decides how.
const SOURCE = [...OWNED, ...SEEDED_PRIVATE, ...SEEDED_TRACKED, 'AGENTS.md', 'CLAUDE.md', 'HANDOFF.md', '.claude/settings.json', 'tools/adopt.mjs']

// null when git fails: a starter without git still adopts, unchecked and unversioned.
const gitIn = (cwd, gitArgs) => {
  try {
    return execFileSync('git', gitArgs, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return null
  }
}
const starterGit = existsSync(join(starter, '.git'))
const dirty = starterGit ? (gitIn(starter, ['status', '--porcelain', '--', ...SOURCE]) ?? '') : ''
if (dirty && !allowDirty) {
  fail(
    `Refused, nothing written. These starter files have uncommitted changes, and adopt copies what is\n` +
      `on disk:\n\n${dirty.replace(/^/gm, '  ')}\n\nCommit them first. --allow-dirty is for testing adopt itself.`,
  )
}
const version = (() => {
  if (!starterGit) return null
  const release = gitIn(starter, ['describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*'])
  const atRelease = release !== null && gitIn(starter, ['diff', '--quiet', release, '--', ...SOURCE]) !== null
  if (atRelease && !dirty) return release
  const last = gitIn(starter, ['log', '-1', '--format=%h', '--', ...SOURCE]) || 'uncommitted'
  return `${release ?? 'untagged'}+${last}${dirty ? '-dirty' : ''}`
})()
// A project receives releases only; work in progress stays in the starter.
if (version?.includes('+') && !allowUnreleased) {
  fail(
    `Refused, nothing written. The starter is not at a release: what adopt would install is ${version}.\n` +
      'Check out a release tag, or pass --allow-unreleased to test adopt itself.',
  )
}

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
// Only the target's own repository counts: a parent's .gitignore must not judge it.
const isGitRepo = existsSync(join(target, '.git')) && gitOk(['rev-parse', '--is-inside-work-tree'])
const ignored = (p) => isGitRepo && gitOk(['check-ignore', '-q', p])
const privateMode = ignored('AGENTS.md')

const backup = (p) => {
  if (!apply || !existsSync(join(target, p))) return
  const to = join(backupDir, p)
  mkdirSync(dirname(to), { recursive: true })
  copyFileSync(join(target, p), to)
}
// Private agents: every path adopt may write must be ignored, or the next
// `git add -A` sends it to the team remote. Checked before any write.
if (privateMode) {
  const candidates = [
    ...OWNED,
    ...SEEDED_PRIVATE,
    'AGENTS.md',
    'CLAUDE.md',
    '.claude/settings.json',
    VERSION_FILE,
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

// Owned files: copied, and overwritten when different.
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

// The release the project's files came from, read before this run records the new one.
const was = read(target, VERSION_FILE)?.trim() ?? null
if (version === null) {
  note(VERSION_FILE, 'not written: the starter is not a git checkout, so its version is unknown')
} else {
  if (was === version) note(VERSION_FILE, `current: ${version}`)
  else {
    write(VERSION_FILE, `${version}\n`)
    note(VERSION_FILE, `${was === null ? 'added' : `updated from ${was}`}${tag}: ${version}`)
  }
}

// An older pointer that asks in words: the import goes after its title, the rest is kept.
const withImport = (body, line) =>
  /^\uFEFF?#[^\n]*\n/.test(body) ? body.replace(/^(\uFEFF?#[^\n]*\n)/, `$1\n${line}\n`) : `${line}\n\n${body}`

// A seeded file that still equals one of the starter's own earlier copies was never
// customised, so a fix to it may reach the project. Line endings do not count.
const lf = (s) => s.replace(/\r\n/g, '\n')
const sameText = (p) => {
  const [a, b] = [read(starter, p), read(target, p)]
  return a !== null && b !== null && lf(a) === lf(b)
}
const gitShow = (commit, p) => {
  try {
    return execFileSync('git', ['show', `${commit}:${p}`], { cwd: starter, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    return null
  }
}
const untouchedSeed = (p, body) => {
  if (!starterGit) return false
  const commits = gitIn(starter, ['log', '--format=%H', '--', p])?.split('\n').filter(Boolean) ?? []
  return commits.some((c) => {
    const old = gitShow(c, p)
    return old !== null && lf(old) === lf(body)
  })
}
const refreshSeed = (p) => {
  backup(p)
  write(p, read(starter, p))
  note(p, `updated${tag}: the starter's own earlier copy, never customised; old copy backed up`)
}
// A kept seed gets none of the starter's later changes to it, so the report names the diff to read.
const since = /^v\d+\.\d+\.\d+$/.test(was ?? '') && gitIn(starter, ['rev-parse', '--verify', '--quiet', `${was}^{commit}`]) !== null ? was : null
const kept = (p, what) =>
  note(p, since && gitIn(starter, ['diff', '--quiet', since, '--', p]) === null ? `${what}, though the starter changed it after ${since}: git diff ${since} -- ${p}` : what)

// Seeded files: copied when missing, refreshed while the project has not changed them.
const seeded = new Set()
for (const p of SEEDED_PRIVATE) {
  const body = read(target, p)
  if (body === null) {
    write(p, read(starter, p))
    seeded.add(p)
    note(p, `seeded${tag}`)
  } else if (sameText(p)) {
    note(p, 'current')
  } else if (untouchedSeed(p, body)) {
    refreshSeed(p)
  } else if (p === 'GEMINI.md' && isPointer(body) && !geminiImportsAgents(body)) {
    // Gemini CLI reaches AGENTS.md only through this line.
    backup(p)
    write(p, withImport(body, '@./AGENTS.md'))
    note(p, `import line added${tag}, rest kept, old copy backed up`)
  } else {
    kept(p, 'customised, kept')
  }
}
for (const p of SEEDED_TRACKED) {
  const body = read(target, p)
  if (body !== null) {
    if (sameText(p)) note(p, 'current')
    else if (!privateMode && untouchedSeed(p, body)) refreshSeed(p)
    else kept(p, 'project-owned, kept')
  } else if (privateMode) note(p, 'missing, not seeded: tracked file in a team repository')
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

const claude = read(target, 'CLAUDE.md')
let agents = read(target, 'AGENTS.md')
const pointer = read(starter, 'CLAUDE.md')

if (agents === null && claude !== null && !isPointer(claude)) {
  backup('CLAUDE.md')
  // Only the title changes, and a leading BOM must not stop the rename.
  const moved = claude.replace(/^(\uFEFF?)# CLAUDE\.md\b/, '$1# AGENTS.md')
  write('AGENTS.md', moved)
  write('CLAUDE.md', pointer)
  agents = moved
  note('AGENTS.md', `created${tag} from CLAUDE.md, verbatim (${lineCount(claude)} lines)`)
  note('CLAUDE.md', `replaced${tag} by the pointer, original backed up`)
  // A verbatim move keeps sentences about CLAUDE.md itself. Which are now wrong
  // is the project's call, so they are listed for review, never rewritten.
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
  // The starter owns only the import line. The rest lists the project's own
  // commands and agents, and overwriting it would erase them.
  note('CLAUDE.md', 'customised pointer, kept: it imports AGENTS.md')
} else {
  backup('CLAUDE.md')
  write('CLAUDE.md', withImport(claude, '@AGENTS.md'))
  note('CLAUDE.md', `import line added${tag}, rest kept, old copy backed up`)
}

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
  // Any entry that calls guard-slots is this hook, whatever its path or command.
  const isGuard = (m) => (m.hooks ?? []).some((h) => String(h.command ?? '').includes('guard-slots.mjs'))
  // A new settings file starts from the starter's, minus the hook decided below.
  const base = settings ?? JSON.parse(read(starter, settingsPath))
  base.hooks ??= {}
  if (settings === null) base.hooks.PreToolUse = (base.hooks.PreToolUse ?? []).filter((m) => !isGuard(m))
  const pre = base.hooks.PreToolUse ?? []
  const existing = pre.filter(isGuard)
  const current = existing.length === 1 && existing[0].hooks.some((h) => h.command === HOOK)
  let changed = settings === null
  // Never remove the hook: a project with slots may be a new one in setup, where
  // blocking code is the point.
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

// agent-check guards nothing unless a gate runs it; a private repository cannot
// put it in a tracked gate, so its own gates are where it goes missing.
const AGENT_CHECK = 'node .claude/tools/agent-check.mjs'
const afterThisRun = (p) => read(target, p) ?? (seeded.has(p) ? read(starter, p) : null)
const scriptsDir = join(target, 'scripts')
const gateScripts = existsSync(scriptsDir)
  ? readdirSync(scriptsDir)
      .filter((f) => /gate/i.test(f) && statSync(join(scriptsDir, f)).isFile())
      .map((f) => `scripts/${f}`)
  : []
const gateFiles = ['CONTRIBUTING.md', '.claude/commands/gate.md', 'package.json', 'composer.json', 'Makefile', 'GNUmakefile', 'makefile', ...gateScripts]
if (![agents, ...gateFiles.map(afterThisRun)].some((body) => body?.includes(AGENT_CHECK))) {
  note('agent-check', `run by no gate: add \`${AGENT_CHECK}\` to the gate in AGENTS.md or .claude/commands/gate.md`)
}

// adopt writes backups, so the target ignores them before a `git add -A` commits one.
if (!isGitRepo) {
  note('.gitignore', 'not a git repository: initialise one and ignore .claude.backup-*/ before the first commit')
} else if (!ignored(`.claude.backup-adopt-${stamp}/probe`)) {
  const gi = read(target, '.gitignore') ?? ''
  const sepLine = gi === '' || gi.endsWith('\n') ? '' : '\n'
  write('.gitignore', `${gi}${sepLine}\n# backups written by tools/adopt.mjs from the starter\n.claude.backup-*/\n`)
  note('.gitignore', `.claude.backup-*/ added${tag}`)
}

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
