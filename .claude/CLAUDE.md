# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `pnpm dlx ultracite fix`
- **Check for issues**: `pnpm dlx ultracite check`
- **Diagnose setup**: `pnpm dlx ultracite doctor`

Most issues are automatically fixable by Biome. Run `pnpm dlx ultracite fix` before committing.

## What Biome Handles Automatically

Biome enforces: arrow functions for callbacks, `for...of` over `.forEach()`, `const` by default,
optional chaining, no `console.log`/`debugger`, no barrel files, accessibility attributes,
`rel="noopener"` on external links, and hundreds more rules.

## What You Still Need to Watch

- Business logic correctness
- Meaningful naming
- Architecture decisions
- Edge cases and error states
