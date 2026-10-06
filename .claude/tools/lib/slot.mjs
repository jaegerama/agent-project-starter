// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Wahyu Rahmadani. https://github.com/jaegerama/agent-project-starter

/**
 * The one definition of "an unfilled slot", shared by the gate
 * (.claude/tools/agent-check.mjs), the hook, bootstrap and adopt. A second copy
 * would let the gate and the hook disagree about whether code may start.
 *
 * A named slot is `<...>` of 3 to 120 characters on one line, except:
 *
 *   - glued to an identifier, a generic type: `Map<string, Item>`
 *   - a bare identifier, an HTML tag: `<div>`
 *   - an email address, as git writes an identity: `Name <someone@example.com>`
 *   - an autolink with a scheme: `<https://...>`, `<mailto:...>`
 */

export const SLOT =
  /(?<![A-Za-z0-9_])<(?![A-Za-z_][A-Za-z0-9_.]*>)(?![^<>\s]+@[^<>\s]+>)(?![A-Za-z][A-Za-z0-9+.-]*:[^<>\s]*>)[^<>\n]{3,120}>/g

/**
 * An empty slot: `<>`, or a placeholder word in a slot's place (TBD, TBC, TODO,
 * `?`, `...`, `<TBD>`). `<>` is also a JSX fragment, so these count only as a
 * whole table cell, a whole unindented line, or the end of a line after a
 * colon, each reported with its line number.
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
