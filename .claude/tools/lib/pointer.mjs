/**
 * What makes CLAUDE.md and GEMINI.md pointers, shared by the gate
 * (.claude/tools/agent-check.mjs) and by tools/adopt.mjs, which decides from it
 * whether a CLAUDE.md still holds rules. With two definitions, a pointer of
 * exactly 60 lines was a pointer to one and a violation to the other.
 */

/** Lines as `wc -l` counts them, so the report and the shell agree. */
export const lineCount = (body) => body.split('\n').length - (body.endsWith('\n') ? 1 : 0)

export const isPointer = (body) => body !== null && lineCount(body) <= 60 && body.includes('AGENTS.md')

/** The line that makes Claude Code load AGENTS.md. Imports inside code are skipped, as Claude Code skips them. */
export const importsAgents = (body) => /^@AGENTS\.md\s*$/m.test(body.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1/gm, ''))
