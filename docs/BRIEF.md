# Brief

The owner's description of the project, in any language. Setup fills every
other template from this file. A brief given in chat is copied under "The
brief", verbatim, before anything else: one that lives only in a chat message
is lost on the next session.

Answer the sections below, or write freely under "The brief" instead. You do
not need the technical terms: write what you know, and "ask me" where you are
unsure. Whatever is missing, the agent asks once, in one message. The more of
section 2 you know, the fewer questions now and the fewer revisions later.

## 1. What it is

What it does, who uses it (roles, roughly how many), and what it deliberately
is not.

## 2. Rules the agent must not invent

The business rules you already know: who may do what, what counts as what,
what happens when something is late, wrong or missing, what must never be lost
or changed, and anything it must agree with outside this repository, such as
an API another team uses, a file format or a law. Write "ask me" where you
have not decided.

## 3. Stack and where it runs

- Language, framework, database, tests:
- Locally, on the host or in containers:
- Deployed to, and by whom, or "nothing to deploy":

## 4. The repository

- Where the code is hosted (GitHub, GitLab, or nowhere yet), and whether it is
  yours alone or shared with a team (then the agent files stay private):
- Agent tools that will work in it (Claude Code, Codex, Cursor, GitHub
  Copilot, Gemini CLI, Antigravity):
- License, if it needs one:

## 5. Interface

None, or which kind (web, mobile, terminal, API) and in which languages. With
a screen: who writes its design direction.

## 6. First deliverable

First comes the walking skeleton: the smallest version that runs, with one
test. After it:

## 7. Conventions, which hold unless you change them

If these terms mean nothing to you, leave them as they are.

- Documents and commit messages: the language of this brief
- Commits: Conventional Commits; co-author and tool trailers: allowed
- Branches: `main`, and one branch per story when the repository is shared
- Commit scopes: none until the code has parts worth naming
- Tests and checks: on this machine, run by git before every push; no CI
  service
- Agent skills: none; to use one, name it with where it comes from and how
  you install it

---

## The brief

(free text, instead of or besides the sections above)
