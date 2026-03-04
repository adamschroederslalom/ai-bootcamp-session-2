# Testing Guidelines

## Purpose

This document defines the testing principles, structure, and conventions for the project.

## Core Testing Principles

- Use the right test type for the right concern:
  - **Unit tests** for isolated functions and React components
  - **Integration tests** for backend API endpoints via real HTTP requests
  - **End-to-end (E2E) tests** for complete user workflows in the browser
- Keep all tests **isolated and independent**. Each test must set up its own data and never depend on another test.
- Use required **setup and teardown hooks** so tests pass reliably across repeated runs.
- Ensure all tests are maintainable, readable, and follow best practices.
- All new features must include appropriate tests.

## Unit Tests

- **Framework:** Jest
- **Scope:** Individual functions and React components in isolation
- **Naming convention:** `*.test.js` or `*.test.ts`
- **Backend location:** `packages/backend/__tests__/`
- **Frontend location:** `packages/frontend/src/__tests__/`
- **File naming rule:** Name files after what they test (example: `app.test.js` for `app.js`).

## Integration Tests

- **Frameworks:** Jest + Supertest
- **Scope:** Backend API endpoints using real HTTP requests
- **Location:** `packages/backend/__tests__/integration/`
- **Naming convention:** `*.test.js` or `*.test.ts`
- **File naming rule:** Use descriptive endpoint-focused names (example: `todos-api.test.js`).

## End-to-End (E2E) Tests

- **Required framework:** Playwright
- **Scope:** Complete UI workflows through browser automation
- **Location:** `tests/e2e/`
- **Naming convention:** `*.spec.js` or `*.spec.ts`
- **File naming rule:** Name by user journey (example: `todo-workflow.spec.js`).
- **Browser policy:** Use one browser only.
- **Design pattern:** Use the Page Object Model (POM) pattern for maintainability.
- **Coverage strategy:** Limit E2E tests to **5-8 critical user journeys**, prioritizing happy paths and key edge cases over exhaustive coverage.

## Port Configuration

Always use environment variables with sensible defaults so local development and CI/CD can configure ports dynamically.

- **Backend:**

```js
const PORT = process.env.PORT || 3030;
```

- **Frontend:**
  - Default React port is `3000`.
  - Allow override with the `PORT` environment variable.

This supports CI/CD workflows that need to detect and assign ports dynamically.

## Reliability Requirements

- Tests must be repeatable and stable across multiple runs.
- Setup and teardown hooks are required wherever shared state or external resources are involved.
- Avoid hidden coupling between tests.

## Definition of Done for Features

A feature is not complete until:

- Relevant unit tests are added/updated.
- Relevant integration tests are added/updated for backend API changes.
- E2E coverage is added/updated when user workflows change.
- Tests follow naming, location, isolation, and maintainability standards in this document.
