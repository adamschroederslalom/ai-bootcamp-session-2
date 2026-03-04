# Coding Guidelines

## Purpose

This document defines the coding style and quality principles for the project. The goal is to keep code readable, consistent, and easy to evolve across both the React frontend and Node.js backend.

## General Formatting Rules

Code should prioritize clarity over cleverness. Use consistent indentation, spacing, and line breaks so files are easy to scan and review. Keep functions focused on one responsibility, prefer descriptive names for variables and functions, and avoid unnecessary nesting where a simple early return would improve readability.

When adding new code, follow the surrounding style in the same file instead of introducing a new pattern. Keep modules small and cohesive, and split large files when they begin to mix multiple concerns. Favor explicit, straightforward logic over dense one-liners.

## Import Organization

Group imports in a predictable order to improve readability and reduce merge conflicts:

1. Node or framework/core imports (for example, React, Express)
2. Third-party library imports
3. Internal project imports
4. Relative imports from the same feature/module

Within each group, keep imports alphabetized where practical. Remove unused imports promptly, and avoid deep relative paths when a clearer module structure is possible.

## Linter Usage

Linting is part of day-to-day quality control, not a final cleanup step. In the frontend workspace, ESLint is configured through `react-scripts` (`react-app` and `react-app/jest` presets). Address lint warnings and errors as you develop instead of deferring them.

When introducing backend linting rules or expanding tooling, prefer consistent, team-agreed rules and avoid disabling checks unless there is a clear, documented reason. If a rule is frequently ignored, reassess whether the rule or the coding pattern should change.

## Quality Principles and Best Practices

### DRY (Don’t Repeat Yourself)

Avoid duplicating business logic, validation rules, or data transformation code. If the same logic appears in multiple places, extract a shared function, utility, or module. DRY improves maintainability by ensuring behavior changes are made once and applied consistently.

### Simplicity and Maintainability

Prefer small, composable units over large multi-purpose blocks. Keep interfaces minimal and intentional. Write code that another developer can understand quickly without extensive context.

### Test-Friendly Code

Design code for testability by isolating side effects, keeping pure logic separate from I/O, and using clear input/output boundaries. This aligns with the project testing strategy across unit, integration, and E2E tests.

### Consistent Error Handling

Handle errors explicitly and return predictable responses. Avoid silent failures and include useful error messages for debugging while keeping user-facing messages clear and safe.

### Incremental Improvement

When touching existing code, leave it slightly better than you found it: simplify naming, remove dead code, and improve structure when it can be done safely within scope.

## Working Agreement

These guidelines are a shared baseline for contributors. When trade-offs are necessary, choose the option that improves long-term readability, reduces duplication, and keeps behavior easy to test and reason about.