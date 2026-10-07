#!/usr/bin/env node
/**
 * Mutation check for a change to the starter: break one part of a fix in a
 * throwaway copy, run the self-test there, and report which cases went red.
 * From the starter's root:
 *
 *     node _starter/mutate.mjs mutations.json
 *
 * mutations.json is an array of { name, file, from, to, expect }: `from` must
 * match `file` exactly once, and `expect` lists the cases that must go red.
 * A mutation passes only when exactly those cases fail. Write the file with an
 * editor: JSON escaping inside shell quoting is easy to get wrong.
 */

import { readFileSync, writeFileSync, existsSync, cpSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const specFile = process.argv[2]
if (!existsSync(join(root, '_starter', 'selftest.mjs')) || !specFile) {
  console.error('Run this from the starter root: node _starter/mutate.mjs mutations.json')
  process.exit(1)
}
const mutations = JSON.parse(readFileSync(specFile, 'utf8'))

// The copy keeps the name project-starter, or the self-test's bootstrap refusal case would dismantle it.
const copy = () => {
  const dir = join(mkdtempSync(join(tmpdir(), 'mutate-')), 'project-starter')
  cpSync(root, dir, { recursive: true })
  return dir
}
const selftest = (dir) => {
  const r = spawnSync('node', ['_starter/selftest.mjs'], { cwd: dir, encoding: 'utf8' })
  const out = r.stdout + r.stderr
  return {
    status: r.status,
    red: out.split('\n').filter((l) => l.startsWith('FAIL')).map((l) => l.slice(6)),
    summary: out.trim().split('\n').pop(),
  }
}
const remove = (dir) => {
  try {
    rmSync(join(dir, '..'), { recursive: true, force: true })
  } catch {}
}

// A case that is already red "catches" every mutation, so the unmutated suite must be green first.
const baseDir = copy()
const base = selftest(baseDir)
remove(baseDir)
if (base.status !== 0) {
  console.log(`BASELINE NOT GREEN (exit ${base.status}): ${base.red.join('; ')}\nNo mutation result means anything until it is.`)
  process.exit(2)
}
console.log(`baseline green: ${base.summary}`)

let bad = 0
for (const m of mutations) {
  const dir = copy()
  const file = join(dir, m.file)
  const body = readFileSync(file, 'utf8')
  const hits = body.split(m.from).length - 1
  if (hits !== 1) {
    console.log(`\n## ${m.name}\n  MUTATION NOT APPLIED: "from" matched ${hits} times`)
    bad += 1
    remove(dir)
    continue
  }
  writeFileSync(file, body.replace(m.from, () => m.to))
  const run = selftest(dir)
  remove(dir)
  const missed = m.expect.filter((c) => !run.red.includes(c))
  const extra = run.red.filter((c) => !m.expect.includes(c))
  const ok = run.status === 1 && missed.length === 0 && extra.length === 0
  if (!ok) bad += 1
  console.log(`\n## ${ok ? 'CAUGHT' : 'PROBLEM'}  ${m.name}  (exit ${run.status}; ${run.summary})`)
  for (const c of m.expect.filter((c) => run.red.includes(c))) console.log(`  red as expected: ${c}`)
  for (const c of missed) console.log(`  NOT red: ${c}`)
  for (const c of extra) console.log(`  also red: ${c}`)
}
console.log(`\n${mutations.length - bad} of ${mutations.length} mutations caught exactly`)
process.exit(bad === 0 ? 0 : 1)
