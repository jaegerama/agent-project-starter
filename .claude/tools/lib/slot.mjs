/**
 * One definition of "an unfilled slot", shared by four callers:
 * .claude/tools/agent-check.mjs (the gate), tools/bootstrap.mjs (the report),
 * tools/adopt.mjs (hook wiring), and .claude/hooks/guard-slots.mjs (the hook).
 *
 * It briefly existed as three identical copies of the same regex. Three copies
 * of one rule are three sources of truth that will drift — and if this
 * particular definition drifts, the gate and the hook end up disagreeing about
 * whether a project is ready to accept code.
 *
 * The heuristic: `<...>` of 3–120 characters that is none of these:
 *
 *   - glued to an identifier, which is a generic type: `Map<string, Item>`
 *   - a bare identifier, which is an HTML tag or a placeholder name: `<div>`
 *   - an email address, which is how git writes an identity:
 *     `Name <someone@example.com>` belongs in every AGENTS.md §7
 *   - an autolink with a scheme: `<https://...>`, `<mailto:...>`
 *
 * An earlier version claimed `Map<string, Item>` was not caught. It was, and
 * so was every git identity, which would have kept the slot check of a filled
 * AGENTS.md red forever. Found by adopting two real projects; the cases are
 * pinned in `_starter/selftest.mjs`.
 */

export const SLOT =
  /(?<![A-Za-z0-9_])<(?![A-Za-z_][A-Za-z0-9_.]*>)(?![^<>\s]+@[^<>\s]+>)(?![A-Za-z][A-Za-z0-9+.-]*:[^<>\s]*>)[^<>\n]{3,120}>/g

/**
 * An empty slot, `<>`, is the plainest unfilled value there is, and SLOT cannot
 * see it: it needs three characters between the brackets. Until 2026-09-24 the
 * template's 25 empty slots (Name, every stack row, every §4 command, every §10
 * row) were invisible to the gate, so a setup could fill the named slots, turn
 * green and open the hook with all of them still empty.
 *
 * `<>` is also a JSX fragment and appears in prose, so it counts only in the
 * three shapes the template uses: a whole table cell, a whole unindented line,
 * or the end of a line after a colon. Each one is reported with its line
 * number, so the count is the number of empty places, not 1.
 *
 * A placeholder word in a slot's place is just as empty, and it is what an
 * agent writes to turn the gate green: TBD, TBC, TODO, `?`, `...` or `<TBD>`
 * count in the same three shapes.
 */
const EMPTY = String.raw`(<>|TBD|TBC|TODO|\?+|\.\.\.|…|<(?:TBD|TBC|TODO)>)`
const EMPTY_SLOT = [String.raw`\|\s*${EMPTY}\s*(?=\|)`, String.raw`^${EMPTY}\s*$`, String.raw`:\s*${EMPTY}\s*$`].map(
  (source) => new RegExp(source, 'i'),
)

/** Unfilled slots in a piece of text: named ones once each, empty ones per line. */
export const slotsOf = (text) => {
  const named = [...new Set(text.match(SLOT) ?? [])]
  const empty = text
    .split('\n')
    .map((line, i) => [line.replace(/\r$/, ''), i + 1])
    .map(([line, n]) => [EMPTY_SLOT.map((re) => re.exec(line)?.[1]).find(Boolean), n])
    .filter(([value]) => value)
    .map(([value, n]) => `${value} at line ${n}`)
  return [...named, ...empty]
}
