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
// In a git worktree .git is a file that points at the parent repository, so every copy
// below would share its refs: the fixtures' tags once landed in the real repository.
if (existsSync(join(root, '.git')) && !statSync(join(root, '.git')).isDirectory()) {
  console.error('Run the self-test from a full clone, not a git worktree: its copies would write into the parent repository.')
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
// A missing file reads as no hooks, so a refused adopt fails its cases instead of stopping the suite.
const hookCommands = (body) =>
  (JSON.parse(body ?? '{}').hooks?.PreToolUse ?? []).flatMap((m) => (m.hooks ?? []).map((h) => h.command)).filter((c) => c.includes('guard-slots'))

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
  // HTML comments, such as the block markers an installer appends to AGENTS.md
  ['<!-- notes:start -->', false],
  ['text <!-- a note --> more', false],
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
const templateFiles = ['AGENTS.md', 'README.md', 'CHANGELOG.md', 'CLAUDE.md', 'GEMINI.md', 'HANDOFF.md', 'DESIGN.md', '_starter/templates/CONTRIBUTING.md', ...readdirSync(join(root, 'docs')).filter((f) => f.endsWith('.md')).map((f) => `docs/${f}`)]
const wrapped = templateFiles.flatMap((f) =>
  read(join(root, f))
    .split('\n')
    .map((l, i) => [l.replace(SLOT_PATTERN, '').replace(/<>/g, ''), `${f}:${i + 1}`])
    .filter(([rest]) => rest.lastIndexOf('<') !== -1 && !rest.slice(rest.lastIndexOf('<')).includes('>'))
    .map(([, at]) => at),
)
check('no slot in any template wraps onto a second line', wrapped.length === 0, wrapped.join(' '))
// A one-word placeholder reads as an HTML tag, so the slot check skips it: `Branches: <model>` once passed as filled.
const NOT_PLACEHOLDERS = ['AGENTS.md <slot>', 'docs/ARCHITECTURE.md <slug>', 'docs/TODO.md <epic>', 'docs/TODO.md <n>']
const oneWord = templateFiles
  .flatMap((f) => (read(join(root, f)).match(/(?<![A-Za-z0-9_])<[A-Za-z_][A-Za-z0-9_.]*>/g) ?? []).map((t) => `${f} ${t}`))
  .filter((t) => !NOT_PLACEHOLDERS.includes(t))
check('every placeholder in the templates is one the slot check counts', oneWord.length === 0, oneWord.join('  '))
// U+FEFF shows in no editor and no diff; code that needs one writes the escape.
const BOM = String.fromCharCode(0xfeff)
const withBom = git(root, 'ls-files').stdout.split('\n').filter(Boolean).filter((f) => (read(join(root, f)) ?? '').includes(BOM))
check('no file in the starter carries an invisible U+FEFF character', withBom.length === 0, withBom.join(' '))

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
// Without a tools line a subagent gets every tool, Bash included.
const hunterLine = read(join(root, '.claude/agents/silent-failure-hunter.md')).match(/^tools:(.*)$/m)
const hunterTools = hunterLine ? hunterLine[1].split(',').map((t) => t.trim()).filter(Boolean) : []
check(
  'silent-failure-hunter can only read: Read, Grep, Glob',
  hunterTools.length > 0 && hunterTools.every((t) => ['Read', 'Grep', 'Glob'].includes(t)),
  hunterLine ? hunterTools.join(', ') : 'no tools line',
)
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
// A profile opts in to the profile checks with this line; a marked block may carry any name.
const MARK = '<!-- operator-profile -->\n'
const block = '<!-- shared:start -->\n# SHARED\nthe block\n<!-- shared:end -->\n'
const notes = '<!-- notes:start -->\nmore\n<!-- notes:end -->\n'
const writeHome = () => {
  rmSync(home, { recursive: true, force: true })
  for (const d of ['.claude', '.codex', '.gemini']) mkdirSync(join(home, d), { recursive: true })
  const master = `${MARK}# profile\n\nrules\n\n${block}${notes}`
  writeFileSync(join(home, 'CLAUDE.md'), master)
  writeFileSync(join(home, '.codex', 'AGENTS.md'), master)
  writeFileSync(join(home, '.gemini', 'GEMINI.md'), master)
  writeFileSync(join(home, '.claude', 'CLAUDE.md'), `# global\n\n${block}${notes}`)
}
const ac = copyStarter('ac')
const env = { ...process.env, USERPROFILE: home, HOME: home }
const agentCheck = () => node(ac, ['.claude/tools/agent-check.mjs'], { env })
const line = (out, name) => (out.stdout + out.stderr).split('\n').find((l) => l.includes(name)) ?? ''
const pointer = read(join(ac, 'CLAUDE.md'))

writeHome()
let out = agentCheck()
check('baseline: red only on template slots', out.status === 1 && line(out, 'unfilled <> slots').startsWith('FAIL'))
check('baseline: pointers, profile and marked blocks green', ['still pointers', 'operator profile', 'marked blocks'].every((n) => line(out, n).startsWith('ok')))
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
// Copilot reads its own file, a pointer like the others, and once nothing checked it.
const copilot = join(ac, '.github', 'copilot-instructions.md')
const copilotPointer = read(copilot)
writeFileSync(copilot, copilotPointer + '\n'.repeat(70))
check('Copilot pointer grown past 60 lines -> red', line(agentCheck(), 'still pointers').startsWith('FAIL'))
writeFileSync(copilot, copilotPointer)

appendFileSync(join(home, '.codex', 'AGENTS.md'), 'drift\n')
check('a profile mirror drifts -> red', line(agentCheck(), 'operator profile').startsWith('FAIL'))
writeHome()
writeFileSync(join(home, '.claude', 'CLAUDE.md'), `# global\n\n${block}${notes.replace('more', 'other')}`)
check('a marked block in ~/.claude/CLAUDE.md drifts -> red, whatever its name', line(agentCheck(), 'marked blocks').startsWith('FAIL'))
writeFileSync(join(home, '.claude', 'CLAUDE.md'), `# global\n\n${block}`)
check('a marked block of the master missing from ~/.claude/CLAUDE.md -> red', line(agentCheck(), 'marked blocks').startsWith('FAIL'))
for (const p of ['CLAUDE.md', '.codex/AGENTS.md', '.gemini/GEMINI.md']) writeFileSync(join(home, p), `${MARK}# profile\n`)
writeFileSync(join(home, '.claude', 'CLAUDE.md'), '# global\n')
check('no marked block anywhere -> SKIP, not a pass', line(agentCheck(), 'marked blocks').startsWith('SKIP'))
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
  'blocks in ~/.claude/CLAUDE.md, no marked profile -> SKIP, not red',
  line(out, 'marked blocks').startsWith('SKIP') && line(out, 'operator profile').startsWith('SKIP'),
  `${line(out, 'marked blocks')} / ${line(out, 'operator profile')}`,
)
homeWith({ 'CLAUDE.md': `${MARK}# my notes\n` })
check('a marked ~/CLAUDE.md with no Codex or Gemini copy -> SKIP, not red', line(agentCheck(), 'operator profile').startsWith('SKIP'))
// Different notes per tool are a choice; only a marked master asks for identical copies.
homeWith({ '.claude/CLAUDE.md': '# my Claude Code notes\n', '.codex/AGENTS.md': '# my Codex notes\n' })
check('unmarked: different Claude Code and Codex notes -> SKIP, not red', line(agentCheck(), 'operator profile').startsWith('SKIP'))
homeWith({ '.claude/CLAUDE.md': `${MARK}# profile\n\n${block}`, '.codex/AGENTS.md': `${MARK}# profile\n\n${block}` })
out = agentCheck()
check('marked master in ~/.claude/CLAUDE.md, matching Codex copy -> green', line(out, 'operator profile').startsWith('ok'))
check('a master in ~/.claude/CLAUDE.md has no block to compare with itself -> SKIP', line(out, 'marked blocks').startsWith('SKIP'))
appendFileSync(join(home, '.codex', 'AGENTS.md'), 'drift\n')
check('marked master in ~/.claude/CLAUDE.md, drifted Codex copy -> red', line(agentCheck(), 'operator profile').startsWith('FAIL'))
// Antigravity's global rules are ~/.gemini/config/AGENTS.md; they once held an older, separate profile.
homeWith({ 'CLAUDE.md': `${MARK}# profile\n`, '.gemini/config/AGENTS.md': '# other rules\n' })
check("Antigravity's rules differ from the master -> red", line(agentCheck(), 'operator profile').startsWith('FAIL'))
homeWith({ 'CLAUDE.md': `${MARK}# profile\n`, '.gemini/config/AGENTS.md': `${MARK}# profile\n` })
check("Antigravity's rules identical to the master -> green", line(agentCheck(), 'operator profile').startsWith('ok'))
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
// ARCHITECTURE.md says it is written when the second component appears, and the report once said otherwise.
const [, fillAndLater = ''] = out.stdout.split('Fill before application code')
const [fillNow, fillLater = ''] = fillAndLater.split('Later, when the second component appears')
check(
  'ARCHITECTURE.md is listed as later work, not before application code',
  !fillNow.includes('docs/ARCHITECTURE.md') && fillLater.includes('docs/ARCHITECTURE.md'),
)
check('_starter/ deleted', !existsSync(join(committed, '_starter')))
check(
  'the other starter-only files are gone: LICENSE, .github/README.md, the self-test workflow',
  ['LICENSE', '.github/README.md', '.github/workflows/selftest.yml'].every((p) => !existsSync(join(committed, p))),
)
check('tools/adopt.mjs is gone: it refuses to run outside the starter', !existsSync(join(committed, 'tools', 'adopt.mjs')))
const mjsUnder = (dir) => readdirSync(dir, { recursive: true }).map(String).filter((f) => f.endsWith('.mjs')).map((f) => join(dir, f))
const unmarked = ['.claude', 'tools'].flatMap((d) => mjsUnder(join(committed, d))).filter((f) => !read(f).includes('SPDX-License-Identifier: MIT'))
check('every tool file a project receives keeps the MIT notice', unmarked.length === 0, unmarked.join(' '))
check(
  'no <PROJECT NAME> left in the templates',
  ['AGENTS.md', 'README.md', 'CLAUDE.md', 'HANDOFF.md', 'DESIGN.md'].every((f) => !(read(join(committed, f)) ?? '').includes('<PROJECT NAME>')),
)
check('the Name row of AGENTS.md §0 holds the name', read(join(committed, 'AGENTS.md')).includes('| **Name** | Demo App |'))
check(
  "the starter's inherited git history is gone (Explorer copies .git too)",
  git(committed, 'rev-list', '--all', '--count').stdout.trim() === '0',
)
git(committed, 'add', '-A')
const stagedCommitted = git(committed, 'diff', '--cached', '--name-only').stdout.split('\n')
check('committed mode: AGENTS.md and .claude/ would be committed', stagedCommitted.includes('AGENTS.md') && stagedCommitted.some((f) => f.startsWith('.claude/')))
check('committed mode: no CONTRIBUTING.md, since AGENTS.md is committed and holds the rules', !existsSync(join(committed, 'CONTRIBUTING.md')))
out = node(committed, ['tools/bootstrap.mjs', '--name', 'Demo App', '--apply'])
check('second run: "already a repo", history untouched', out.stdout.includes('already a repo'))
check('a new project ignores adopt backups from day one', git(committed, 'check-ignore', '-q', '.claude.backup-adopt-x/CLAUDE.md').status === 0)

const priv = copyStarter('demo-private')
node(priv, ['tools/bootstrap.mjs', '--name', 'Demo App', '--private-agents', '--apply'])
// Read before the second run, which would replace a name the first one missed.
const firstGuide = read(join(priv, 'CONTRIBUTING.md')) ?? ''
node(priv, ['tools/bootstrap.mjs', '--name', 'Demo App', '--private-agents', '--apply'])
git(priv, 'add', '-A')
const stagedPrivate = git(priv, 'diff', '--cached', '--name-only').stdout.split('\n').filter(Boolean)
check(
  'private mode: no agent file would be committed (11 once stayed tracked)',
  !stagedPrivate.some((f) => /^(AGENTS|CLAUDE|GEMINI)\.md$|^\.claude\/|copilot-instructions/.test(f)),
  stagedPrivate.join(' '),
)
check('private mode: the .gitignore block appears once after two runs', read(join(priv, '.gitignore')).split('bootstrap --private-agents').length - 1 === 1)
// The people without agent files once got no committed gate at all.
check(
  'private mode: CONTRIBUTING.md is written, named, and committed',
  firstGuide.startsWith('# Contributing to Demo App\n') && stagedPrivate.includes('CONTRIBUTING.md'),
)
const toAgents = (dir) =>
  ['README.md', 'CONTRIBUTING.md', 'docs/TODO.md'].filter((f) => (read(join(dir, f)) ?? '').replace(SLOT_PATTERN, '').includes('AGENTS.md'))
check('private mode: README, CONTRIBUTING.md and docs/TODO.md send nobody to the ignored AGENTS.md', toAgents(priv).length === 0, toAgents(priv).join(' '))
const ownGuide = copyStarter('demo-own-contributing')
writeFileSync(join(ownGuide, 'CONTRIBUTING.md'), '# How we work\n')
node(ownGuide, ['tools/bootstrap.mjs', '--name', 'Demo App', '--private-agents', '--apply'])
check("private mode: the project's own CONTRIBUTING.md is kept", read(join(ownGuide, 'CONTRIBUTING.md')) === '# How we work\n')

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
// The starter under test is mid-edit while this runs; the cases that need a clean source make one.
const adopt = (target, apply) => node(root, ['tools/adopt.mjs', '--into', target, '--allow-dirty', ...(apply ? ['--apply'] : [])])
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
check('the BOM is kept (a title rename was once lost to one)', (moved ?? '').startsWith('\uFEFF# AGENTS.md'))
check('CLAUDE.md is the starter pointer, with the import', read(join(team, 'CLAUDE.md')) === read(join(root, 'CLAUDE.md')))
const backups = readdirSync(team).filter((e) => e.startsWith('.claude.backup-adopt-'))
check('the original CLAUDE.md is backed up byte for byte', backups.length === 1 && read(join(team, backups[0], 'CLAUDE.md')) === rules)
check('self-references carried over by the move are listed for review', out.stdout.includes('review AGENTS.md:3'))
check('a filled AGENTS.md (git identities included) gets the hook wired', (read(join(team, '.claude/settings.json')) ?? '').includes('guard-slots.mjs'))
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

// A GEMINI.md seeded before the import existed is never missing, so adopt once left it as it was.
// CRLF, as a Windows checkout wrote it.
const oldGemini = "# GEMINI.md\r\n\r\nThis project's rules live in **[AGENTS.md](AGENTS.md)**. Read it in full at\r\nsession start.\r\n"
const gOld = makeRepo('g-old', { ...agentsOnly, 'GEMINI.md': oldGemini })
const gOldBefore = treeHash(gOld)
out = adopt(gOld, false)
check('old GEMINI.md, dry run: the import is reported and nothing is written', treeHash(gOld) === gOldBefore && /GEMINI\.md +import line added \(would\)/.test(out.stdout), out.stdout)
adopt(gOld, true)
check('old GEMINI.md asking in words: only the import line is added', read(join(gOld, 'GEMINI.md')) === oldGemini.replace('# GEMINI.md\r\n', '# GEMINI.md\r\n\n@./AGENTS.md\n'))
const gBackups = readdirSync(gOld).filter((e) => e.startsWith('.claude.backup-adopt-'))
check('the old GEMINI.md is backed up byte for byte', gBackups.length === 1 && read(join(gOld, gBackups[0], 'GEMINI.md')) === oldGemini)
const gOldAfter = treeHash(gOld)
adopt(gOld, true)
check('second run: the GEMINI.md import is not added twice', treeHash(gOld) === gOldAfter)
const geminiKept = {
  'imports with ./ and carries a project note': read(join(root, 'GEMINI.md')) + '\nThe mobile client lives in app/.\n',
  'imports without ./': '# GEMINI.md\n\n@AGENTS.md\n\nRules live in AGENTS.md.\n',
  'holds rules of its own': ['# GEMINI.md', '', 'See AGENTS.md.', ...Array.from({ length: 70 }, (_, i) => `- rule ${i + 1}`)].join('\n') + '\n',
}
for (const [what, body] of Object.entries(geminiKept)) {
  const dir = makeRepo(`g-kept-${Object.keys(geminiKept).indexOf(what)}`, { ...agentsOnly, 'GEMINI.md': body })
  adopt(dir, true)
  check(`GEMINI.md that ${what}: kept byte for byte`, read(join(dir, 'GEMINI.md')) === body)
}

// agent-check guards nothing unless a gate runs it.
const gateCases = {
  'no gate runs agent-check: the report says so': [{ '.claude/commands/gate.md': '# Gate\n\nRun npm test.\n' }, true],
  'a /gate command runs agent-check: no warning': [{ '.claude/commands/gate.md': '# Gate\n\nThen `node .claude/tools/agent-check.mjs`.\n' }, false],
  'a scripts/ gate runs agent-check: no warning': [{ '.claude/commands/gate.md': '# Gate\n\nRun scripts/gate.sh.\n', 'scripts/gate.sh': 'node .claude/tools/agent-check.mjs\n' }, false],
  'a /gate command this run seeds counts, even in a dry run': [{}, false],
}
for (const [name, [files, warns]] of Object.entries(gateCases)) {
  const dir = makeRepo(`gate-${Object.keys(gateCases).indexOf(name)}`, { ...agentsOnly, ...files })
  check(name, /^ {2}agent-check +run by no gate/m.test(adopt(dir, false).stdout) === warns)
}

// A seeded file still equal to one of the starter's own earlier copies was never customised.
const oldestOf = (p) => git(root, 'show', `${git(root, 'log', '--format=%H', '--', p).stdout.trim().split('\n').at(-1)}:${p}`).stdout
const hunterPath = '.claude/agents/silent-failure-hunter.md'
const oldHunter = oldestOf(hunterPath)
check('fixture: the oldest silent-failure-hunter differs from the current one', oldHunter.length > 0 && oldHunter !== read(join(root, hunterPath)))
const seedOld = makeRepo('seed-old', { ...agentsOnly, [hunterPath]: oldHunter })
out = adopt(seedOld, false)
check(
  'an untouched old seed, dry run: reported, nothing written',
  /silent-failure-hunter\.md +updated \(would\)/.test(out.stdout) && read(join(seedOld, hunterPath)) === oldHunter,
  out.stdout,
)
adopt(seedOld, true)
check('an untouched old seed is brought up to date (a fix to it once never reached a project)', read(join(seedOld, hunterPath)) === read(join(root, hunterPath)))
const seedBackups = readdirSync(seedOld).filter((e) => e.startsWith('.claude.backup-adopt-'))
check('the old seed is backed up byte for byte', seedBackups.length === 1 && read(join(seedOld, seedBackups[0], hunterPath)) === oldHunter)
const seedCrlf = makeRepo('seed-crlf', { ...agentsOnly, [hunterPath]: oldHunter.replace(/\n/g, '\r\n') })
adopt(seedCrlf, true)
check('the same old seed with CRLF line endings is brought up to date too', read(join(seedCrlf, hunterPath)) === read(join(root, hunterPath)))
// The current copy as a Windows checkout writes it is current, not an earlier copy to rewrite.
const currentCrlf = read(join(root, hunterPath)).replace(/\n/g, '\r\n')
const seedCurrentCrlf = makeRepo('seed-current-crlf', { ...agentsOnly, [hunterPath]: currentCrlf })
out = adopt(seedCurrentCrlf, true)
check(
  'the current seed with CRLF line endings is current: not rewritten, no backup',
  read(join(seedCurrentCrlf, hunterPath)) === currentCrlf &&
    /silent-failure-hunter\.md +current$/m.test(out.stdout) &&
    !readdirSync(seedCurrentCrlf).some((e) => e.startsWith('.claude.backup-adopt-')),
  out.stdout,
)
const customHunter = `${oldHunter}\nProject note: also check the queue workers.\n`
const seedCustom = makeRepo('seed-custom', { ...agentsOnly, [hunterPath]: customHunter })
adopt(seedCustom, true)
check('a seed the project changed is kept byte for byte', read(join(seedCustom, hunterPath)) === customHunter)
// A tracked seeded file in a private-agents repository is never written.
const driftPath = 'tools/docs-drift.mjs'
const oldDrift = oldestOf(driftPath)
const seedPrivate = makeRepo('seed-private', { '.gitignore': IGNORE_PRIVATE, 'AGENTS.md': '# AGENTS.md\n\nrules\n', [driftPath]: oldDrift })
adopt(seedPrivate, true)
check(
  'private repo: an old tracked seed is left alone, nothing tracked changes',
  read(join(seedPrivate, driftPath)) === oldDrift && git(seedPrivate, 'status', '--porcelain').stdout.trim() === '',
)
const seedTracked = makeRepo('seed-committed', { ...agentsOnly, [driftPath]: oldDrift })
adopt(seedTracked, true)
check('committed repo: an old tracked seed is brought up to date', read(join(seedTracked, driftPath)) === read(join(root, driftPath)))

section('adopt: a committed source, and the version it records')
const src = copyStarter('src-clean')
git(src, 'add', '-A')
git(src, '-c', 'commit.gpgsign=false', 'commit', '-qm', 'wip', '--allow-empty')
git(src, 'tag', 'v9.9.9')
const adoptFrom = (source, target, ...extra) => node(source, ['tools/adopt.mjs', '--into', target, ...extra])
const versionIn = (dir) => read(join(dir, '.claude', 'starter-version'))
const commitIn = (dir, file, text) => {
  appendFileSync(join(dir, file), text)
  git(dir, 'add', '-A')
  git(dir, '-c', 'commit.gpgsign=false', 'commit', '-qm', `change ${file}`)
  return git(dir, 'rev-parse', '--short', 'HEAD').stdout.trim()
}

const v1 = makeRepo('v-release', agentsOnly)
out = adoptFrom(src, v1, '--apply')
check('a clean source at a release: adopt records the tag', out.status === 0 && versionIn(v1) === 'v9.9.9\n', out.stdout + out.stderr)
check('second run from the same source: the version is current', /starter-version +current: v9\.9\.9$/m.test(adoptFrom(src, v1).stdout))
const sha = commitIn(src, '.claude/tools/lib/pointer.mjs', '// a change after the release\n')
// A project receives releases only; work in progress stays in the starter.
const vPast = makeRepo('v-past-release', agentsOnly)
const vPastBefore = treeHash(vPast)
out = adoptFrom(src, vPast, '--apply')
check(
  'a source past its release: refused, nothing written',
  out.status === 1 && /not at a release/.test(out.stderr) && treeHash(vPast) === vPastBefore,
  out.stdout + out.stderr,
)
adoptFrom(src, v1, '--apply', '--allow-unreleased')
check('--allow-unreleased: the tag plus the commit that changed an owned file', versionIn(v1) === `v9.9.9+${sha}\n`, versionIn(v1))
commitIn(src, '_starter/HANDOFF.md', '\nA note.\n')
check(
  'a commit to a file adopt does not copy leaves the version alone',
  new RegExp(`starter-version +current: v9\\.9\\.9\\+${sha}$`, 'm').test(adoptFrom(src, v1, '--allow-unreleased').stdout),
)
git(src, 'tag', 'v9.9.10', sha)
const vLater = makeRepo('v-later-docs', agentsOnly)
out = adoptFrom(src, vLater, '--apply')
check(
  'a commit to other files after a release keeps the source at that release',
  out.status === 0 && versionIn(vLater) === 'v9.9.10\n',
  out.stdout + out.stderr,
)

appendFileSync(join(src, '_starter', 'README.md'), '\nUncommitted.\n')
check('an uncommitted change outside what adopt copies does not block it', adoptFrom(src, makeRepo('v-elsewhere', agentsOnly), '--apply').status === 0)
appendFileSync(join(src, '.claude', 'tools', 'agent-check.mjs'), '// uncommitted\n')
const v3 = makeRepo('v-dirty', agentsOnly)
const v3Before = treeHash(v3)
out = adoptFrom(src, v3, '--apply')
check(
  'an uncommitted change to a file adopt copies: refused, nothing written',
  out.status === 1 && out.stderr.includes('agent-check.mjs') && treeHash(v3) === v3Before,
  out.stdout + out.stderr,
)
adoptFrom(src, v3, '--apply', '--allow-dirty')
check('--allow-dirty goes ahead, and the version says -dirty', /^v9\.9\.10\+[0-9a-f]+-dirty\n$/.test(versionIn(v3) ?? ''), versionIn(v3))

const noGit = copyStarter('src-nogit')
rmSync(join(noGit, '.git'), { recursive: true, force: true })
const v4 = makeRepo('v-nogit', agentsOnly)
out = adoptFrom(noGit, v4, '--apply')
check(
  'a source that is not a git checkout: adopted, no version recorded',
  out.status === 0 && versionIn(v4) === null && /starter-version +not written/.test(out.stdout),
  out.stdout + out.stderr,
)
// The version file is a path adopt writes, so the private-agents preflight must cover it.
const narrowIgnore = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', '.github/copilot-instructions.md', '.claude/tools/', '.claude/hooks/', '.claude/rules/', '.claude/commands/', '.claude/agents/', '.claude/settings.json', '.claude.backup-*/'].join('\n') + '\n'
out = adoptFrom(src, makeRepo('v-private', { '.gitignore': narrowIgnore, 'AGENTS.md': '# AGENTS.md\n\nrules\n' }), '--apply', '--allow-dirty')
check('private repo that does not ignore .claude/starter-version: refused', out.status === 1 && out.stderr.includes('.claude/starter-version'), out.stdout + out.stderr)

section('docs-drift (the checks a new project starts with)')
const driftRun = (name, files) => {
  const dir = join(tmp, name)
  mkdirSync(join(dir, 'tools'), { recursive: true })
  cpSync(join(root, 'tools', 'docs-drift.mjs'), join(dir, 'tools', 'docs-drift.mjs'))
  for (const [p, body] of Object.entries(files)) {
    mkdirSync(join(dir, p, '..'), { recursive: true })
    writeFileSync(join(dir, p), body)
  }
  return node(dir, ['tools/docs-drift.mjs'])
}
const driftIn = (name, files) => {
  const r = driftRun(name, files)
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
// A Makefile alone is a manifest: Go, Python, Rust and C gates often run through make.
const makefile = 'VAR := 1\nCFLAGS ::= -O2\n.PHONY: test lint\ntest:\n\tgo test ./...\nlint: vet\n\tgolangci-lint run\nvet:\n\tgo vet ./...\n'
check(
  'make targets the Makefile defines -> green, past flags and VAR=value',
  gateIs({ Makefile: makefile, 'AGENTS.md': fence('make test', 'make -j4 lint', 'make GOFLAGS=-v vet') }, 'm-ok').startsWith('ok'),
)
check('a make target the Makefile lacks -> red', gateIs({ Makefile: makefile, 'AGENTS.md': fence('make build') }, 'm-missing').startsWith('FAIL'))
check('a make variable is not a target', gateIs({ Makefile: makefile, 'AGENTS.md': fence('make VAR', 'make CFLAGS') }, 'm-var').startsWith('FAIL'))
check(
  'make -C and -f point at another makefile, so they are not judged',
  gateIs({ Makefile: makefile, 'AGENTS.md': fence('make -C sub build', 'make -f other.mk deploy') }, 'm-elsewhere').startsWith('ok'),
)
check('"make" alone on a line does not take the next line as its target', gateIs({ Makefile: makefile, 'AGENTS.md': fence('make', 'make test') }, 'm-bare').startsWith('ok'))

// Private agents: people run the CONTRIBUTING.md gate, agents the AGENTS.md one.
const gates = (people, agents) => ({ 'CONTRIBUTING.md': '## The gate\n\n' + fence(people), 'AGENTS.md': '### The gate: all green\n\n' + fence(agents) })
const peopleGate = (files, name) => lineWith(driftIn(name, files), 'CONTRIBUTING.md gate is also in')
check("the people's gate inside the agents' gate -> green", peopleGate(gates('npm test', 'npm test && node .claude/tools/agent-check.mjs'), 'c-ok').startsWith('ok'))
const lacking = driftIn('c-lacks', gates('npm run lint && npm test', 'npm test'))
check("a people's gate command the agents' gate lacks -> red, and named", lineWith(lacking, 'CONTRIBUTING.md gate is also in').startsWith('FAIL') && lacking.includes('lacks npm run lint'))
check('no CONTRIBUTING.md -> SKIP', peopleGate({ 'AGENTS.md': '### The gate\n\n' + fence('npm test') }, 'c-none').startsWith('SKIP'))
check(
  "the templates' own gates -> SKIP while they are slots, not red during setup",
  peopleGate({ 'CONTRIBUTING.md': read(join(root, '_starter', 'templates', 'CONTRIBUTING.md')), 'AGENTS.md': read(join(root, 'AGENTS.md')) }, 'c-templates').startsWith('SKIP'),
)
check('setup done and only the two gates compared -> red: no document met code', driftRun('c-guard', gates('npm test', 'npm test')).status === 1)

const story = (status, id) => `### [${status}] ${id} title\n`
check('two stories in WIP -> red', todoIs({ 'docs/TODO.md': story('DONE', 'S0.1') + story('WIP', 'S1.1') + story('WIP', 'S1.2') }, 't-two').startsWith('FAIL'))
check('a story past Epic 0 started before it is DONE -> red', todoIs({ 'docs/TODO.md': story('TODO', 'S0.1') + story('WIP', 'S1.1') }, 't-early').startsWith('FAIL'))
check('Epic 0 DONE and one story in WIP -> green', todoIs({ 'docs/TODO.md': story('DONE', 'S0.1') + story('WIP', 'S1.1') + story('TODO', 'S1.2') }, 't-ok').startsWith('ok'))
check("the template's own docs/TODO.md -> green", todoIs({ 'docs/TODO.md': read(join(root, 'docs', 'TODO.md')) }, 't-template').startsWith('ok'))
check('no story headings -> SKIP, not a pass', todoIs({ 'docs/TODO.md': '# TODO\n' }, 't-none').startsWith('SKIP'))
// Setup ends by deleting the Setup section of AGENTS.md; after that, a gate that compares no document with code is red.
check('setup done and no check ran -> red', driftRun('n-done', { 'AGENTS.md': '# AGENTS.md\n\nrules\n' }).status === 1)
// The template's TODO.md runs the story check from day one, and once that alone kept this guard quiet.
check(
  'setup done and only the story check ran -> red',
  driftRun('n-story', { 'AGENTS.md': '# AGENTS.md\n\nrules\n', 'docs/TODO.md': read(join(root, 'docs', 'TODO.md')) }).status === 1,
)
check(
  'setup done and a check against code ran -> exit 0',
  driftRun('n-code', { 'AGENTS.md': '# AGENTS.md\n\n' + fence('npm test'), 'package.json': scripts('test'), 'docs/TODO.md': read(join(root, 'docs', 'TODO.md')) })
    .status === 0,
)
check(
  'the Setup section still there and no check ran -> exit 0, a new project',
  driftRun('n-setup', { 'AGENTS.md': '# AGENTS.md\n\n## Setup, while this file still has slots\n' }).status === 0,
)
check('no AGENTS.md and no check ran -> exit 0', driftRun('n-none', { 'README.md': '# x\n' }).status === 0)

try {
  rmSync(tmp, { recursive: true, force: true })
} catch {
  console.log(`\n(could not remove ${tmp}; delete it by hand)`)
}
console.log(`\n${passed} passed, ${failed} failed, ${skipped} skipped, of ${passed + failed + skipped}`)
process.exit(failed === 0 ? 0 : 1)
