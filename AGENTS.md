# Project Agents.md Guide

This is an [Astro](https://docs.astro.build) blog project.

## Language Convention

This project may be released publicly. All of the following must be written in **English**:

- Commit messages
- Code comments
- Documentation (including `AGENTS.md`, `README.md`, etc.)
- Error messages

Blog post content under `src/content/articles/` is exempt: posts may be written in any language.

## Project Structure

- `src/pages/` — file-based routing; each `.astro` file (or dynamic route like `articles/[...slug].astro`) becomes a page. `rss.xml.js` generates the RSS feed.
- `src/content/articles/` — blog posts as Markdown (`.md`) or MDX (`.mdx`). Frontmatter is validated against the schema in `src/content.config.ts` (`title`, `description`, `pubDate` required; `updatedDate`, `heroImage` optional).
- `src/components/` — reusable `.astro` components (header, footer, meta tags, etc.).
- `src/layouts/` — page layouts (e.g. `ArticleLayout.astro`).
- `src/styles/` — global CSS.
- `src/assets/` — images and fonts processed by Astro (hero images, local fonts).
- `src/consts.ts` — site-wide constants (`SITE_TITLE`, `SITE_DESCRIPTION`).
- `public/` — static files served as-is (favicons, etc.).
- `astro.config.mjs` — Astro configuration (site URL, MDX/sitemap integrations, fonts).

## Tooling

- Node.js version is pinned by `.nvmrc` (see also `engines` in `package.json`). Use `nvm use` (or an equivalent version manager) before installing dependencies.

- Dependencies are installed with `npm install`. After cloning, run `pre-commit install` to enable the local pre-commit hooks.

- npm scripts:
  - `npm run dev` — start the local dev server with hot reload.
  - `npm run build` — production build; this also validates content frontmatter against the collection schema and fails on broken content. Use it as the CI-equivalent check before opening a PR.
  - `npm run preview` — serve the production build locally.
  - `npm run lint` / `npm run lint:fix` — ESLint (with `eslint-plugin-astro`) over `.astro`/`.ts`/`.js` files.
  - `npm run lint:md` / `npm run lint:md:fix` — markdownlint over `.md`/`.mdx` files; rules are configured in `.markdownlint.json`.
  - `npm run format` / `npm run format:check` — Prettier (with `prettier-plugin-astro`). Markdown is excluded; markdownlint owns it.
  - `npm run typecheck` — `astro check` for type errors in `.astro` and `.ts` files.

- For local quality verification, use two mechanisms:
  - **pre-commit hooks** (local only; CI does not depend on pre-commit) — catch whitespace and JSON/YAML issues, and run markdownlint, Prettier, ESLint, and `astro check` as local hooks via npm scripts on every commit (`pre-commit run --all-files` to run manually).
  - **npm scripts** — CI runs `format:check`, `lint`, `lint:md`, `typecheck`, and `build` directly; run the same scripts locally for the full CI-equivalent check before opening a PR.

## Development Philosophy

### Red/Green TDD (Detroit school)

- Red → Green → Refactor cycle strictly followed
- Use real objects; mocks are only permitted at external boundaries (file system, external API, network)
- Write tests BEFORE implementation; run tests AFTER implementation
- Discuss coverage targets with the user before starting implementation

### Domain Object Design

- Rich domain objects: pair data and logic in the same type
- Prefer immutability; avoid mutable state unless necessary
- Distinguish entities (identity-based) from value objects (value-based)
- Enforce layer boundaries through abstract types; no direct dependency on concrete implementations

### Evergreen Tests

- Test names describe WHAT business rule is being verified, not HOW
- Test names must not reference implementation details
- Test code serves as living documentation of the system's behavior

### Code Comments

- Do NOT write code comments unless explicitly permitted by the user
- Let the code speak for itself; let tests document the behavior
- Code = How, Tests = What, Commit messages = Why

## Git Conventions

### Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
| :--- | :--- |
| `feat` | New feature (site functionality) |
| `fix` | Bug fix |
| `content` | Blog content (add or update posts) |
| `docs` | Documentation only |
| `style` | Code style (formatting, whitespace) |
| `refactor` | Code change that is neither a fix nor a feature |
| `tidy` | Small, safe cleanup (< 2 min; no behavior change) |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, or config changes |
| `ci` | CI/CD pipeline changes (GitHub Actions, workflows) |
| `perf` | Performance improvement |

### Scopes

Scope is optional; use the affected area when the change is localized (e.g., `components`, `layouts`, `rss`). Omit for project-wide changes.

### Type vs. Scope Precedence

The type vocabulary above mixes two axes: an **impact axis** (`feat`, `fix`, `perf`, `refactor` — the SemVer-relevant effect of a change) and a **domain axis** (`content`, `docs`, `style`, `test`, `chore`, `ci`, `tidy` — a layer with no runtime/SemVer effect). When a change is fully contained within a domain, use that domain as `type` (e.g. `docs: fix typo`, `content: add post on Astro islands`); do not use it as `scope` on an impact-axis type (avoid `fix(docs): ...`). `scope` sub-divides whatever `type` already established (e.g. `feat(rss)`); it is not a substitute classification axis.

### Subject Line

- Use the imperative mood: "add", "fix", "remove" — not "added" or "adds"
- 72 characters max
- No trailing period

### Body (optional)

- Explain **why**, not what — the diff already shows what changed
- Leave one blank line between subject and body

### Footer (optional)

- `BREAKING CHANGE: <description>` for breaking changes
- `Closes #123` or `Fixes #456` to link issues

### Branch naming

`feat/xxx`, `fix/xxx`, `content/xxx`, `docs/xxx`
