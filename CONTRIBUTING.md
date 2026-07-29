# Contributing to ReliefHub

Thanks for contributing.

## Development setup
1. Fork and clone the repository.
2. Follow setup instructions in the root `README.md`.
3. Create a feature branch from `main`.

## Contribution workflow
1. Keep changes focused and minimal.
2. Use descriptive commit messages.
3. Run relevant checks before submitting:
   - `cd frontend && npm run lint && npm run build`
   - `cd backend && php artisan test`
4. Open a pull request using the provided template.

## Coding standards
- Preserve existing functionality unless a change is explicitly requested.
- Prefer small, reviewable PRs.
- Avoid committing secrets, generated artifacts, or dependency directories.

## Reporting bugs
Use the bug report template and include clear reproduction steps and expected/actual behavior.
