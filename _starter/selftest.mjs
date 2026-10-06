#!/usr/bin/env node
/**
 * The starter's own tests: slot pattern, hook, agent-check, bootstrap, adopt
 * and the docs-drift examples. Green before every commit, from the starter's root:
 *
 *     node _starter/selftest.mjs
 *
 * Each case pins a defect that was found and fixed once. It writes only to a
 * temporary directory and runs agent-check against a fake home, so the real
 * operator profile is never touched. bootstrap deletes it from projects.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, cpSync, readdirSync, statSync, appendFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const root = process.cwd()
if (!existsSync(join(root, '_starter', 'selftest.mjs'))) {
  console.error('Run this from the starter root: node _starter/selftest.mjs')
  process.exit(1)
}
const { slotsOf, SLOT: SLOT_PATTERN } = await import(pathToFileURL(join(root, '.claude/tools/lib/slot.mjs')).href)
const { isPointer } = await import(pathToFileURL(join(root, '.claude/tools/lib/pointer.mjs')).href)

let passed = 0
let failed = 0
let skipped = 0
const check = (name, ok, detail = '') => {
  if (ok) passed += 1
  else failed += 1
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${!ok && detail ? `\n      ${detail}` : ''}`)
}
const skip = (name, reason) => {
  skipped += 1
  console.log(`SKIP  ${name}\n      ${reason}`)
}
const section = (title) => console.log(`\n== ${title}`)

const node = (cwd, args, extra = {}) => spawnSync('node', args, { cwd, encoding: 'utf8', ...extra })
const git = (cwd, ...args) => spawnSync('git', args, { cwd, encoding: 'utf8' })
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null)

const tmp = mkdtempSync(join(tmpdir(), 'starter-selftest-'))
const copyStarter = (name) => {
  const dir = join(tmp, name)
  cpSync(root, dir, { recursive: true })
  return dir
}
// Hash of every file outside .git, to prove a dry run or a refusal wrote nothing.
const treeHash = (dir) => {
  const h = createHash('sha256')
  const walk = (d) => {
    for (const e of readdirSync(d).sort()) {
      if (e === '.git') continue
      const full = join(d, e)
      if (statSync(full).isDirectory()) walk(full)
      else h.update(relative(dir, full).split(sep).join('/')).update(readFileSync(full))
    }
  }
  walk(dir)
  return h.digest('hex')
}
// Claude Code sets CLAUDE_PROJECT_DIR, and the hook prefers it to the payload,
// so no call inherits it from the shell running this suite.
const baseEnv = { ...process.env }
delete baseEnv.CLAUDE_PROJECT_DIR
const runHook = ({ project, cwd = project, input, env = { CLAUDE_PROJECT_DIR: project } }) =>
  node(cwd, [join(project, '.claude/hooks/guard-slots.mjs')], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    env: { ...baseEnv, ...env },
  }).status
const write = (file_path, cwd) => ({ tool_name: 'Write', tool_input: { file_path }, cwd })
const hook = (cwd, file, input) => runHook({ project: cwd, input: input ?? write(join(cwd, file), cwd) })
const HOOK_CMD = 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/guard-slots.mjs"'
const hookCommands = (body) =>
  (JSON.parse(body).hooks?.PreToolUse ?? []).flatMap((m) => (m.hooks ?? []).map((h) => h.command)).filter((c) => c.includes('guard-slots'))

section('slot pattern')
const slotCases = [
  ['<PROJECT NAME>', true],
  ['<what it is, who uses it>', true],
  ['<Indonesian / English>', true],
  ['<https://example.com or none>', true],
  ['| **Name** | <> |', true],
  ['| Tests | <> | |', true],
  ['<>', true],
  ['- Dictionary languages: <>', true],
  // generic types and tags
  ['Map<string, Item>', false],
  ['<div>', false],
  ['<slot>', false],
  // git identities: every filled AGENTS.md has one in §7
  ['Jane Doe <jane@example.com>', false],
  ['see <https://keepachangelog.com/en/1.1.0/>', false],
  // <> that is not an empty slot
  ['  <>', false],
  ['return <></>', false],
  ['a fragment `<>` in prose', false],
  ['no unfilled <> slots remain', false],
  // placeholder words: what an agent writes to turn the gate green
  ['| **Name** | TBD |', true],
  ['| Tests | <TBD> |', true],
  ['- Production: TODO', true],
  ['| Runtime | ? |', true],
  ['| `docs/TODO.md` | stories |', false],
  ['Status: `TODO` · `WIP`', false],
  ['| Deploy | - |', false],
]
for (const [text, want] of slotCases) {
  check(`${want ? 'slot    ' : 'no slot '} ${JSON.stringify(text)}`, slotsOf(text).length > 0 === want)
}
check('three empty slots on three lines count as three', slotsOf('| a | <> |\n| b | <> |\n<>\n').length === 3)
const template = read(join(root, 'AGENTS.md'))
const templateSlots = slotsOf(template)
check(
  'the template has named AND empty slots (the 25 empty ones were once invisible)',
  templateSlots.some((s) => s.startsWith('<> at line')) && templateSlots.includes('<PROJECT NAME>'),
  `found: ${templateSlots.length}`,
)
// SLOT stops at a newline, so a template slot that wraps would never be counted.
const templateFiles = ['AGENTS.md', 'README.md', 'CHANGELOG.md', 'CLAUDE.md', 'GEMINI.md', 'HANDOFF.md', 'DESIGN.md', ...readdirSync(join(root, 'docs')).filter((f) => f.endsWith('.md')).map((f) => `docs/${f}`)]
const wrapped = templateFiles.flatMap((f) =>
  read(join(root, f))
    .split('\n')
    .map((l, i) => [l.replace(SLOT_PATTERN, '').replace(/<>/g, ''), `${f}:${i + 1}`])
    .filter(([rest]) => rest.lastIndexOf('<') !== -1 && !rest.slice(rest.lastIndexOf('<')).includes('>'))
    .map(([, at]) => at),
)
check('no slot in any template wraps onto a second line', wrapped.length === 0, wrapped.join(' '))

section('docs-first hook (starter itself, AGENTS.md has slots)')
check('application code is blocked (exit 2)', hook(root, 'src/app.ts') === 2)
for (const f of ['AGENTS.md', 'CLAUDE.md', 'HANDOFF.md', 'DESIGN.md', 'LICENSE', '.gitattributes', 'docs/BRIEF.md', 'tools/adopt.mjs', 'tools/docs-drift.mjs', '.claude/settings.json']) {
  check(`setup file allowed: ${f}`, hook(root, f) === 0)
}
check('malformed input fails open, as documented', hook(root, 'x', 'not json') === 0)
check('application code under tools/ is blocked', hook(root, 'tools/server.ts') === 2)
check('a relative path that climbs out of docs/ is blocked', runHook({ project: root, input: write('docs/../src/app.ts', root) }) === 2)
check(
  'a notebook outside setup is blocked (NotebookEdit names notebook_path)',
  runHook({ project: root, input: { tool_name: 'NotebookEdit', tool_input: { notebook_path: join(root, 'src', 'nb.ipynb') }, cwd: root } }) === 2,
)
const docsDir = join(root, 'docs')
check('session cwd moved to docs/: still blocked (a cd once opened it)', runHook({ project: root, cwd: docsDir, input: write(join(root, 'src', 'app.ts'), docsDir) }) === 2)
check('a relative path from a moved cwd resolves against that cwd', runHook({ project: root, cwd: docsDir, input: write('../src/app.ts', docsDir) }) === 2)
check(
  'without CLAUDE_PROJECT_DIR the payload cwd is the root',
  runHook({ project: root, cwd: docsDir, input: write(join(root, 'src', 'app.ts'), root), env: {} }) === 2,
)
const settingsCommand = hookCommands(read(join(root, '.claude/settings.json'))).join()
check('settings.json starts the hook from $CLAUDE_PROJECT_DIR', settingsCommand === HOOK_CMD, settingsCommand)
const deny = JSON.parse(read(join(root, '.claude/settings.json'))).permissions?.deny ?? []
const wantDeny = ['Read(./.env)', 'Read(./.env.*)', 'Read(~/.ssh/id_*)', 'Bash(git push --force:*)', 'Bash(git push -f:*)', 'Bash(git clean:*)']
check('settings.json denies secrets, home credentials, force pushes and git clean', wantDeny.every((r) => deny.includes(r)), wantDeny.filter((r) => !deny.includes(r)).join(' '))
// Claude Code runs hook commands through bash, Git Bash on Windows.
if (process.platform !== 'win32' || process.env.MSYSTEM) {
  const viaBash = spawnSync('bash', ['-c', settingsCommand], {
    cwd: docsDir,
    input: JSON.stringify(write(join(root, 'src', 'app.ts'), docsDir)),
    env: { ...baseEnv, CLAUDE_PROJECT_DIR: root },
    encoding: 'utf8',
  })
  check('the settings.json command blocks from a subdirectory, run through bash', viaBash.status === 2, `exit ${viaBash.status}: ${viaBash.stderr}`)
} else {
  skip('the settings.json command blocks from a subdirectory, run through bash', 'not inside Git Bash (MSYSTEM unset), so no bash to run it with')
}

section('agent-check (fake home, real profile untouched)')
const home = join(tmp, 'home')
const block = '<!-- antislop:start -->\n# ANTISLOP\nthe block\n<!-- antislop:end -->\n'
const writeHome = () => {
  for (const d of ['.claude', '.codex', '.gemini']) mkdirSync(join(home, d), { recursive: true })
  const master = `# profile\n\nrules\n\n${block}`
  writeFileSync(join(home, 'CLAUDE.md'), master)
  writeFileSync(join(home, '.codex', 'AGENTS.md'), master)
  writeFileSync(join(home, '.gemini', 'GEMINI.md'), master)
  writeFileSync(join(home, '.claude', 'CLAUDE.md'), `# global\n\n${block}`)
}
const ac = copyStarter('ac')
const env = { ...process.env, USERPROFILE: home, HOME: home }
const agentCheck = () => node(ac, ['.claude/tools/agent-check.mjs'], { env })
const line = (out, name) => (out.stdout + out.stderr).split('\n').find((l) => l.includes(name)) ?? ''
const pointer = read(join(ac, 'CLAUDE.md'))

writeHome()
let out = agentCheck()
check('baseline: red only on template slots', out.status === 1 && line(out, 'unfilled <> slots').startsWith('FAIL'))
check('baseline: pointers, profile and antislop block green', ['still pointers', 'operator profile', 'antislop block'].every((n) => line(out, n).startsWith('ok')))
// Not required by the gate, whose adopted projects keep their own GEMINI.md; pinned for the template.
check("the template's GEMINI.md imports AGENTS.md on a line of its own", /^@\.\/AGENTS\.md\s*$/m.test(read(join(root, 'GEMINI.md'))))

writeFileSync(join(ac, 'CLAUDE.md'), pointer + '\n'.repeat(70))
check('pointer grown past 60 lines -> red', line(agentCheck(), 'still pointers').startsWith('FAIL'))
writeFileSync(join(ac, 'CLAUDE.md'), '# CLAUDE.md\n\nsee the rules file\n')
check('pointer that lost its AGENTS.md reference -> red', line(agentCheck(), 'still pointers').startsWith('FAIL'))
// Claude Code skips an import inside code, so neither of these loads AGENTS.md.
writeFileSync(join(ac, 'CLAUDE.md'), pointer.replace(/^@AGENTS\.md$/m, '`@AGENTS.md`'))
check('pointer whose import sits in backticks -> red', line(agentCheck(), 'still pointers').startsWith('FAIL'))
writeFileSync(join(ac, 'CLAUDE.md'), pointer.replace(/^@AGENTS\.md$/m, '```\n@AGENTS.md\n```'))
check('pointer whose import sits in a code block -> red', line(agentCheck(), 'still pointers').startsWith('FAIL'))
const sixty = ['# CLAUDE.md', '', '@AGENTS.md', ...Array.from({ length: 57 }, (_, i) => `line ${i}`)].join('\n') + '\n'
writeFileSync(join(ac, 'CLAUDE.md'), sixty)
check('pointer of exactly 60 lines -> still a pointer', line(agentCheck(), 'still pointers').startsWith('ok') && isPointer(sixty))
writeFileSync(join(ac, 'CLAUDE.md'), pointer)

appendFileSync(join(home, '.codex', 'AGENTS.md'), 'drift\n')
check('a profile mirror drifts -> red', line(agentCheck(), 'operator profile').startsWith('FAIL'))
writeHome()
writeFileSync(join(home, '.claude', 'CLAUDE.md'), `# global\n\n${block.replace('the block', 'another block')}`)
check('the global antislop block drifts -> red', line(agentCheck(), 'antislop block').startsWith('FAIL'))
writeFileSync(join(home, '.claude', 'CLAUDE.md'), '# global\n')
check('the global antislop block goes missing -> red', line(agentCheck(), 'antislop block').startsWith('FAIL'))
writeFileSync(join(home, 'CLAUDE.md'), '# profile\n')
writeFileSync(join(home, '.codex', 'AGENTS.md'), '# profile\n')
writeFileSync(join(home, '.gemini', 'GEMINI.md'), '# profile\n')
check('no antislop block anywhere -> SKIP, not a pass', line(agentCheck(), 'antislop block').startsWith('SKIP'))
// Other machines keep other layouts; none of them is drift.
const homeWith = (files) => {
  rmSync(home, { recursive: true, force: true })
  mkdirSync(home, { recursive: true })
  for (const [p, body] of Object.entries(files)) {
    mkdirSync(join(home, p, '..'), { recursive: true })
    writeFileSync(join(home, p), body)
  }
}
homeWith({ '.claude/CLAUDE.md': `# global\n\n${block}` })
out = agentCheck()
check(
  'antislop in ~/.claude/CLAUDE.md alone, no ~/CLAUDE.md -> SKIP, not red',
  line(out, 'antislop block').startsWith('SKIP') && line(out, 'operator profile').startsWith('SKIP'),
  `${line(out, 'antislop block')} / ${line(out, 'operator profile')}`,
)
homeWith({ 'CLAUDE.md': '# my notes\n' })
check('a ~/CLAUDE.md with no Codex or Gemini copy -> SKIP, not red', line(agentCheck(), 'operator profile').startsWith('SKIP'))
homeWith({ '.claude/CLAUDE.md': '# profile\n', '.codex/AGENTS.md': '# profile\n' })
check('master in ~/.claude/CLAUDE.md, matching Codex copy -> green', line(agentCheck(), 'operator profile').startsWith('ok'))
appendFileSync(join(home, '.codex', 'AGENTS.md'), 'drift\n')
check('master in ~/.claude/CLAUDE.md, drifted Codex copy -> red', line(agentCheck(), 'operator profile').startsWith('FAIL'))
writeHome()

section('bootstrap')
check('refuses to run inside the starter itself', node(root, ['tools/bootstrap.mjs', '--name', 'X', '--apply']).status === 1)
// A clone takes the repository's name, and CI checks out into a folder of that name.
const clone = join(mkdtempSync(join(tmp, 'clone-')), 'agent-project-starter')
cpSync(root, clone, { recursive: true })
check(
  'refuses to run in a clone named agent-project-starter',
  node(clone, ['tools/bootstrap.mjs', '--name', 'X', '--apply']).status === 1 && existsSync(join(clone, '_starter')),
)
const noName = copyStarter('no-name')
check(
  'refuses a missing name ("--name --apply" once applied, named --apply)',
  node(noName, ['tools/bootstrap.mjs', '--name', '--apply']).status === 1 && existsSync(join(noName, '_starter')),
)

const committed = copyStarter('demo-committed')
const before = treeHash(committed)
node(committed, ['tools/bootstrap.mjs', '--name', 'Demo App', '--private-agents'])
check('dry run changes nothing', treeHash(committed) === before)

out = node(committed, ['tools/bootstrap.mjs', '--name', 'Demo App', '--apply'])
check('apply exits 0', out.status === 0, out.stderr)
check('_starter/ deleted', !existsSync(join(committed, '_starter')))
check(
  'the other starter-only files are gone: LICENSE, .github/README.md, the self-test workflow',
  ['LICENSE', '.github/README.md', '.github/workflows/selftest.yml'].every((p) => !existsSync(join(committed, p))),
)
const mjsUnder = (dir) => readdirSync(dir, { recursive: true }).map(String).filter((f) => f.endsWith('.mjs')).map((f) => join(dir, f))
const unmarked = ['.claude', 'tools'].flatMap((d) => mjsUnder(join(committed, d))).filter((f) => !read(f).includes('SPDX-License-Identifier: MIT'))
check('every tool file a project receives keeps the MIT notice', unmarked.length === 0, unmarked.join(' '))
check(
  'no <PROJECT NAME> left in the templates',
  ['AGENTS.md', 'README.md', 'CLAUDE.md', 'HANDOFF.md', 'DESIGN.md'].every((f) => !(read(join(committed, f)) ?? '').includes('<PROJECT NAME>')),
)
check(
  "the starter's inherited git history is gone (Explorer copies .git too)",
  git(committed, 'rev-list', '--all', '--count').stdout.trim() === '0',
)
git(committed, 'add', '-A')
const stagedCommitted = git(committed, 'diff', '--cached', '--name-only').stdout.split('\n')
check('committed mode: AGENTS.md and .claude/ would be committed', stagedCommitted.includes('AGENTS.md') && stagedCommitted.some((f) => f.startsWith('.claude/')))
out = node(committed, ['tools/bootstrap.mjs', '--name', 'Demo App', '--apply'])
check('second run: "already a repo", history untouched', out.stdout.includes('already a repo'))
check('a new project ignores adopt backups from day one', git(committed, 'check-ignore', '-q', '.claude.backup-adopt-x/CLAUDE.md').status === 0)

const priv = copyStarter('demo-private')
node(priv, ['tools/bootstrap.mjs', '--name', 'Demo App', '--private-agents', '--apply'])
node(priv, ['tools/bootstrap.mjs', '--name', 'Demo App', '--private-agents', '--apply'])
git(priv, 'add', '-A')
const stagedPrivate = git(priv, 'diff', '--cached', '--name-only').stdout.split('\n').filter(Boolean)
check(
  'private mode: no agent file would be committed (11 once stayed tracked)',
  !stagedPrivate.some((f) => /^(AGENTS|CLAUDE|GEMINI)\.md$|^\.claude\/|copilot-instructions/.test(f)),
  stagedPrivate.join(' '),
)
check('private mode: the .gitignore block appears once after two runs', read(join(priv, '.gitignore')).split('bootstrap --private-agents').length - 1 === 1)

const later = copyStarter('demo-later')
rmSync(join(later, '_starter'), { recursive: true, force: true })
out = node(later, ['tools/bootstrap.mjs', '--name', 'Demo App', '--apply'])
check(
  'inherited history with _starter/ gone: warned and kept (it may hold real commits)',
  out.stdout.includes('WARNING') && Number(git(later, 'rev-list', '--all', '--count').stdout.trim()) > 0,
)
check("a later run leaves LICENSE alone (by then it may be the project's own)", existsSync(join(later, 'LICENSE')))

section('new project lifecycle (the false green of 2026-09-23)')
const agentsPath = join(committed, 'AGENTS.md')
const agentsBody = read(agentsPath)
const { SLOT } = await import(pathToFileURL(join(committed, '.claude/tools/lib/slot.mjs')).href)
check('before setup: application code blocked', hook(committed, 'src/pos.ts') === 2)
writeFileSync(agentsPath, agentsBody.replace(SLOT, '(answered)'))
out = node(committed, ['.claude/tools/agent-check.mjs'], { env })
check('named slots filled, empty ones not: gate still red', out.status === 1)
check('named slots filled, empty ones not: code still blocked', hook(committed, 'src/pos.ts') === 2)
writeFileSync(agentsPath, agentsBody.replace(SLOT, '(answered)').replace(/<>/g, '(answered)'))
out = node(committed, ['.claude/tools/agent-check.mjs'], { env })
check('every slot filled: gate green', out.status === 0, out.stdout + out.stderr)
check('every slot filled: code allowed', hook(committed, 'src/pos.ts') === 0)

section('adopt')
const adopt = (target, apply) => node(root, ['tools/adopt.mjs', '--into', target, ...(apply ? ['--apply'] : [])])
const IGNORE_PRIVATE = 'AGENTS.md\nCLAUDE.md\nGEMINI.md\n.github/copilot-instructions.md\n.claude/\n.claude.backup-*/\n'
const makeRepo = (name, files) => {
  const dir = join(tmp, name)
  for (const [p, body] of Object.entries(files)) {
    mkdirSync(join(dir, p, '..'), { recursive: true })
    writeFileSync(join(dir, p), body)
  }
  git(dir, 'init', '-q')
  git(dir, 'add', '-A')
  git(dir, '-c', 'commit.gpgsign=false', 'commit', '-qm', 'fixture')
  return dir
}
const rules =
  '\uFEFF# CLAUDE.md: Fixture\n\n' +
  '├── CLAUDE.md                 # this file\n' +
  Array.from({ length: 80 }, (_, i) => `- rule ${i + 1}, identity Jane Doe <jane@example.com>`).join('\n') +
  '\n'

check('refuses when the target is the starter', adopt(root, false).status === 1)
check('refuses to run from outside the starter', node(tmp, [join(root, 'tools/adopt.mjs'), '--into', tmp]).status === 1)

const team = makeRepo('team', { '.gitignore': IGNORE_PRIVATE, 'CLAUDE.md': rules, 'HANDOFF.md': '# HANDOFF\n' })
const teamBefore = treeHash(team)
out = adopt(team, false)
check('dry run changes nothing', treeHash(team) === teamBefore && out.status === 0)
out = adopt(team, true)
check('private mode detected', out.stdout.includes('private agents'))
const moved = read(join(team, 'AGENTS.md'))
check('rules moved verbatim: only the title differs', moved === rules.replace('# CLAUDE.md', '# AGENTS.md'))
check('the BOM is kept (a title rename was once lost to one)', moved.startsWith('\uFEFF# AGENTS.md'))
check('CLAUDE.md is the starter pointer, with the import', read(join(team, 'CLAUDE.md')) === read(join(root, 'CLAUDE.md')))
const backups = readdirSync(team).filter((e) => e.startsWith('.claude.backup-adopt-'))
check('the original CLAUDE.md is backed up byte for byte', backups.length === 1 && read(join(team, backups[0], 'CLAUDE.md')) === rules)
check('self-references carried over by the move are listed for review', out.stdout.includes('review AGENTS.md:3'))
check('a filled AGENTS.md (git identities included) gets the hook wired', read(join(team, '.claude/settings.json')).includes('guard-slots.mjs'))
check('nothing tracked changed in the team repository', git(team, 'status', '--porcelain').stdout.trim() === '')
const teamAfter = treeHash(team)
adopt(team, true)
check('second run: idempotent, no new backup', treeHash(team) === teamAfter && readdirSync(team).filter((e) => e.startsWith('.claude.backup-adopt-')).length === 1)

const exposed = makeRepo('exposed', { '.gitignore': IGNORE_PRIVATE.replace('GEMINI.md\n', ''), 'CLAUDE.md': rules })
const exposedBefore = treeHash(exposed)
out = adopt(exposed, true)
check('private repo that does not ignore GEMINI.md: refused, exit 1', out.status === 1 && out.stderr.includes('GEMINI.md'))
check('the refusal wrote nothing (checked before any write)', treeHash(exposed) === exposedBefore)

const fresh = makeRepo('fresh', { '.gitignore': 'node_modules/\n', 'README.md': '# fresh\n' })
out = adopt(fresh, true)
check('no agent files: AGENTS.md seeded from the template', (read(join(fresh, 'AGENTS.md')) ?? '').includes('## Setup'))
check('slots remain: the hook is NOT wired (it would block running work)', !(read(join(fresh, '.claude/settings.json')) ?? '').includes('guard-slots.mjs'))
check('HANDOFF.md seeded where there is none', existsSync(join(fresh, 'HANDOFF.md')))

// A new project mid-setup keeps the hook its copy of the starter wired.
const hookEntry = (command) => JSON.stringify({ hooks: { PreToolUse: [{ matcher: 'Write|Edit|NotebookEdit', hooks: [{ type: 'command', command }] }] } }, null, 2)
const midSetup = makeRepo('mid-setup', {
  '.gitignore': 'node_modules/\n',
  'AGENTS.md': read(join(root, 'AGENTS.md')),
  'CLAUDE.md': read(join(root, 'CLAUDE.md')),
  '.claude/settings.json': hookEntry('node .claude/hooks/guard-slots.mjs'),
})
out = adopt(midSetup, true)
check('new project mid-setup: its hook is kept, and moved to the current command', hookCommands(read(join(midSetup, '.claude/settings.json'))).join() === HOOK_CMD, out.stdout)
const oldPath = makeRepo('old-hook-path', {
  '.gitignore': 'node_modules/\n',
  'AGENTS.md': '# AGENTS.md\n\nrules\n',
  '.claude/settings.json': hookEntry('node tools/hooks/guard-slots.mjs'),
})
adopt(oldPath, true)
const migrated = read(join(oldPath, '.claude/settings.json'))
check(
  'hook at the old tools/hooks/ path: moved to exactly one current entry',
  hookCommands(migrated).join() === HOOK_CMD,
)

const agentsOnly = { '.gitignore': 'x\n', 'AGENTS.md': '# AGENTS.md\n\nrules\n' }
const pointerCase = (name, claude) => makeRepo(name, claude === null ? agentsOnly : { ...agentsOnly, 'CLAUDE.md': claude })
const custom = read(join(root, 'CLAUDE.md')).replace('| Agent | `silent-failure-hunter` |', '| Agents | `silent-failure-hunter`, `db-reviewer` |')
const oldPointer = '# CLAUDE.md\n\nThis project\'s rules live in **[AGENTS.md](AGENTS.md)**. Read it in full at\nsession start.\n'

const pIdentical = pointerCase('p-identical', read(join(root, 'CLAUDE.md')))
// Matched on the CLAUDE.md line itself: "current" appears on other lines too.
check('pointer identical to the starter: "current"', /^ {2}CLAUDE\.md +current$/m.test(adopt(pIdentical, false).stdout))
const pCustom = pointerCase('p-custom', custom)
adopt(pCustom, true)
check("customised pointer with the import is kept (a project's own table was once nearly erased)", read(join(pCustom, 'CLAUDE.md')) === custom)
const pOld = pointerCase('p-old', oldPointer)
adopt(pOld, true)
check(
  'old pointer asking in words: only the import line is added',
  read(join(pOld, 'CLAUDE.md')) === oldPointer.replace('# CLAUDE.md\n', '# CLAUDE.md\n\n@AGENTS.md\n'),
)
const pNone = pointerCase('p-none', null)
adopt(pNone, true)
check('no pointer at all: the full pointer is written', read(join(pNone, 'CLAUDE.md')) === read(join(root, 'CLAUDE.md')))
// The gate and adopt must count a 60-line file the same way.
const pSixty = makeRepo('p-sixty', { '.gitignore': 'x\n', 'CLAUDE.md': sixty })
check('a 60-line CLAUDE.md is a pointer to adopt as well', /CLAUDE\.md +CONFLICT: a pointer/.test(adopt(pSixty, false).stdout))

section('docs-drift (the checks a new project starts with)')
const driftIn = (name, files) => {
  const dir = join(tmp, name)
  mkdirSync(join(dir, 'tools'), { recursive: true })
  cpSync(join(root, 'tools', 'docs-drift.mjs'), join(dir, 'tools', 'docs-drift.mjs'))
  for (const [p, body] of Object.entries(files)) {
    mkdirSync(join(dir, p, '..'), { recursive: true })
    writeFileSync(join(dir, p), body)
  }
  const r = node(dir, ['tools/docs-drift.mjs'])
  return r.stdout + r.stderr
}
const lineWith = (text, name) => text.split('\n').find((l) => l.includes(name)) ?? ''
const gateIs = (files, name) => lineWith(driftIn(name, files), 'runs commands that actually exist')
const todoIs = (files, name) => lineWith(driftIn(name, files), 'docs/TODO.md has')
const fence = (...cmds) => '```bash\n' + cmds.join('\n') + '\n```\n'
const scripts = (...names) => JSON.stringify({ scripts: Object.fromEntries(names.map((n) => [n, 'x'])) })

// pnpm install, yarn run and composer install are not scripts named install or run.
check(
  'package-manager subcommands are not scripts',
  gateIs({ 'package.json': scripts('build', 'lint', 'test'), 'AGENTS.md': fence('pnpm install', 'pnpm run build', 'yarn run lint', 'pnpm test', 'npm ci', 'composer install') }, 'd-builtins').startsWith('ok'),
)
check('a gate script the manifest lacks -> red', gateIs({ 'package.json': scripts('lint'), 'AGENTS.md': fence('npm run typecheck') }, 'd-missing').startsWith('FAIL'))
check('npm test with no test script -> red (it once passed)', gateIs({ 'package.json': scripts('lint'), 'AGENTS.md': fence('npm test') }, 'd-npmtest').startsWith('FAIL'))
check('a composer custom script is checked', gateIs({ 'composer.json': scripts('analyse'), 'AGENTS.md': fence('composer analyse', 'composer stan') }, 'd-composer').startsWith('FAIL'))
check('prose is not a command ("pnpm or yarn")', gateIs({ 'package.json': scripts('lint'), 'AGENTS.md': 'We use pnpm or yarn workspaces.\n' }, 'd-prose').startsWith('ok'))

const story = (status, id) => `### [${status}] ${id} title\n`
check('two stories in WIP -> red', todoIs({ 'docs/TODO.md': story('DONE', 'S0.1') + story('WIP', 'S1.1') + story('WIP', 'S1.2') }, 't-two').startsWith('FAIL'))
check('a story past Epic 0 started before it is DONE -> red', todoIs({ 'docs/TODO.md': story('TODO', 'S0.1') + story('WIP', 'S1.1') }, 't-early').startsWith('FAIL'))
check('Epic 0 DONE and one story in WIP -> green', todoIs({ 'docs/TODO.md': story('DONE', 'S0.1') + story('WIP', 'S1.1') + story('TODO', 'S1.2') }, 't-ok').startsWith('ok'))
check("the template's own docs/TODO.md -> green", todoIs({ 'docs/TODO.md': read(join(root, 'docs', 'TODO.md')) }, 't-template').startsWith('ok'))
check('no story headings -> SKIP, not a pass', todoIs({ 'docs/TODO.md': '# TODO\n' }, 't-none').startsWith('SKIP'))

try {
  rmSync(tmp, { recursive: true, force: true })
} catch {
  console.log(`\n(could not remove ${tmp}; delete it by hand)`)
}
console.log(`\n${passed} passed, ${failed} failed, ${skipped} skipped, of ${passed + failed + skipped}`)
process.exit(failed === 0 ? 0 : 1)
