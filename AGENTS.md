# Balance

## Repository State

- This repository is currently a planning-only repository: there is no application source, package manifest, CI configuration, or runnable test/lint command yet.
- The project plan and ticket order are in `docs/checklist-expense-tracker.md`; use it as the scope reference while the implementation is being built.

## Working Rules

- Implement one numbered ticket at a time. Do not advance future tickets or touch unrelated modules without explaining why the current ticket requires it.
- Keep each ticket reviewable: make the smallest coherent diff and verify it before moving on.
- When the plan and executable project configuration eventually disagree, follow the configuration and update this file only with facts that can be verified.

## Planned Product Constraints

- Balance tracks expenses only; it does not record real income.
- Budgets are manually entered reference values, not values derived from income.
- The app is multi-user; every user must only access their own data.
- Currency is fixed to MXN; do not add multi-currency behavior.
- Recurring expenses are explicitly marked by the user; do not infer recurring patterns automatically.
- Authentication is intended to be implemented in the application, not delegated to Supabase Auth, Auth0, Clerk, or another hosted auth provider.

## Source Of Truth

- `docs/checklist-expense-tracker.md` contains the current planned stack, module scope, and ticket sequence. It is planning material, not evidence that those tools or modules already exist.
