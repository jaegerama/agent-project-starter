// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Wahyu Rahmadani. https://github.com/jaegerama/agent-project-starter

/**
 * What makes CLAUDE.md and GEMINI.md pointers. The gate and adopt both read it,
 * so they cannot disagree about a file at the 60-line limit.
 */

/** Lines as `wc -l` counts them, so the report and the shell agree. */
export const lineCount = (body) => body.split('\n').length - (body.endsWith('\n') ? 1 : 0)

export const isPointer = (body) => body !== null && lineCount(body) <= 60 && body.includes('AGENTS.md')

/** The line that makes Claude Code load AGENTS.md; like Claude Code, it ignores one inside code. */
export const importsAgents = (body) => /^@AGENTS\.md\s*$/m.test(body.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1/gm, ''))
