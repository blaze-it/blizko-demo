# Versioning and Releases

## Overview
The project uses **semantic-release** for fully automatic versioning with **fixed/locked versioning** - all packages share the same version number.

## How It Works

### Automatic Releases
Releases are triggered automatically on push to `master` branch:
- `feat:` commits → **minor** bump (1.0.0 → 1.1.0)
- `fix:` commits → **patch** bump (1.0.0 → 1.0.1)
- `perf:`, `refactor:` commits → **patch** bump
- `feat!:` or `BREAKING CHANGE` → **major** bump (1.0.0 → 2.0.0)
- `docs:`, `style:`, `chore:`, `test:`, `build:`, `ci:` → no release

### What Gets Updated
1. All 7 package.json files (root + 6 packages) get the same version
2. CHANGELOG.md is auto-generated from commit messages
3. Git tag `vX.Y.Z` is created
4. GitHub Release is created with release notes

## Key Files

| File | Purpose |
|------|---------|
| `release.config.cjs` | semantic-release configuration |
| `scripts/sync-versions.mjs` | Syncs version across all packages |
| `.github/workflows/release.yml` | GitHub Actions workflow |

## Commands

```bash
# Test release locally (requires GITHUB_TOKEN)
pnpm release:dry-run

# Manual release (not recommended, use CI)
pnpm release
```

## Commit Message Format
Use conventional commits:
```
feat: add new feature
fix: fix a bug
feat!: breaking change
fix(scope): scoped fix
```

## CI/CD Notes
- Release workflow runs on push to `master`
- Deployment and testing handled separately by Coolify
- Release commits include `[skip ci]` to prevent infinite loops
