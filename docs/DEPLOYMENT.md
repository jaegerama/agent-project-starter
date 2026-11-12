# DEPLOYMENT: <PROJECT NAME>

How a release reaches the servers, what it must not lose, and how it is
checked and undone. Delete this file when nothing is deployed.

What each server runs is recorded in `AGENTS.md` §2, and who may deploy in
§1; this file holds the procedure.

## What must survive a deploy

The data and files a release never overwrites, such as the database, uploaded
files, the environment file and certificates.

<each one, where it lives, and how it is backed up>

## Risks

What a deploy can break, and how far the damage reaches.

| Risk | What breaks, and for whom | How it is prevented or caught |
|---|---|---|
| <a migration that locks a large table> | <> | <> |

## Release steps

Exactly as they are run, in order.

1. <the first step, as it is typed>

## Checking a release

What proves the release works, run right after it: a health endpoint, a page
that reads from the database, a log with no new errors.

<each check, and what a pass looks like>

## Rolling back

How the previous release comes back, how long that takes, and what a rollback
cannot undo.

<the rollback steps>
