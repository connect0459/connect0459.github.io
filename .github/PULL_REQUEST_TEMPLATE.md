<!-- # PULL_REQUEST_TEMPLATE -->

<!-- Remove unnecessary sections to keep the review focused -->

## Related Links

- Issues
  - <!-- <https://github.com/<organization>/<repository>/issues/xxx> -->
- PRs
  - <!-- <https://github.com/<organization>/<repository>/pull/xxx> -->

## [Required] Overview

- Describe the problem being solved, its background, and what changes when this PR is merged.
- Links to specs, design documents, or other references are welcome.

```txt
It is difficult to review without knowing the specifications and background.
```

## Scope of Change

- [ ] Blog content (`src/content/articles/`)
- [ ] Site code (pages / components / layouts / styles)
- [ ] Tooling / CI
- [ ] Documentation

## Breaking Changes

- [ ] No breaking changes
- [ ] Breaking changes (describe below)

<!--
For a blog, a breaking change is one that alters published URLs, the RSS feed
location, or removes existing content. Describe what breaks and why the
breakage is justified.
-->

## Deferred Items and TODOs

- Items intentionally deferred and the reasons why.

```txt
If you deferred something due to time constraints, document it here.
Reviewers cannot tell whether something was intentionally skipped or overlooked
without this information.
```

## Verification

- Describe how the change was verified beyond CI (e.g. checked with `npm run dev` / `npm run preview`).
- For visual changes, attach before/after screenshots.

## [Required] Quality Checklist

**Please check all items before merging.**

- [ ] **CI Workflow Execution**: Full quality check completed by manually running `Run workflow` in [Actions](../actions/workflows/ci.yml)
- [ ] **Docs**: `AGENTS.md` / `README.md` are updated when conventions or tooling change

> **Important**: This checklist ensures quality. Please verify all items before requesting review.
