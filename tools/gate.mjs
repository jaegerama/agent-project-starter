#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Wahyu Rahmadani. https://github.com/jaegerama/agent-project-starter
/**
 * Runs the gate exactly as it is written: the first fenced block under the
 * heading that names the gate, in AGENTS.md, or in CONTRIBUTING.md where there
 * is no AGENTS.md. From the project root:
 *
 *     node tools/gate.mjs
 *
 * Each line runs in order, and the first one that fails ends the run with its
 * exit code. A pre-push hook that calls it, such as the one bootstrap wires in
 * .githooks/, runs the gate on this machine before anything is pushed.
 */

import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const fail = (message) => {
  console.error(`gate: ${message}`)
  process.exit(1)
}

const source = ['AGENTS.md', 'CONTRIBUTING.md'].find((f) => existsSync(f))
if (!source) fail('no AGENTS.md or CONTRIBUTING.md here: run this from the project root')

const md = readFileSync(source, 'utf8')
const at = md.search(/^#{2,4} .*\bgate\b/im)
const block = at < 0 ? null : md.slice(at).match(/```[^\n]*\n([\s\S]*?)```/)?.[1]
if (!block) fail(`${source} has no code block under a heading that names the gate`)

const lines = block
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
if (lines.length === 0) fail(`the gate in ${source} is empty`)
if (lines.some((l) => l.startsWith('<') && l.endsWith('>'))) fail(`the gate in ${source} is still a slot: fill it first`)

// The block is written for a POSIX shell: Git's sh on Windows where git started us, cmd otherwise.
const shell = process.platform !== 'win32' ? '/bin/sh' : process.env.MSYSTEM ? 'sh' : true

for (const line of lines) {
  console.log(`gate: ${line}`)
  const { status } = spawnSync(line, { shell, stdio: 'inherit' })
  if (status !== 0) {
    console.error(`gate: FAILED, exit ${status ?? 1}: ${line}`)
    process.exit(status ?? 1)
  }
}
console.log(`gate: green, ${lines.length} line(s) from ${source}`)
