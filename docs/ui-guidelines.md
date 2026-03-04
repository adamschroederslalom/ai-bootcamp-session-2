# UI Guidelines

## Purpose

This document defines the baseline user interface standards for the project to ensure a consistent, usable, and accessible experience.

## Component Library Requirement

1. The UI shall use Material Design components as the default component system.
2. New UI features shall be implemented with Material components before considering custom components.
3. Custom components are allowed only when no suitable Material component exists, and they must visually align with Material Design patterns.
4. Component behavior (states, spacing, elevation, and typography) shall follow Material conventions.

## Color Palette

1. The UI shall use a defined, consistent color palette across all screens.
2. At minimum, the palette shall include:
   - Primary color (brand/main actions)
   - Secondary color (supporting actions/highlights)
   - Background and surface colors
   - Text colors for primary and secondary content
   - Semantic colors (success, warning, error, info)
3. Colors shall be applied consistently by semantic meaning (for example, error colors only for error states).
4. Text and interactive elements shall maintain accessible contrast ratios against their backgrounds.

## Button Styles and Actions

1. Buttons shall use Material button variants consistently (for example: contained/filled for primary actions, outlined for secondary actions, text for low-emphasis actions).
2. Each view shall have one clearly identifiable primary action.
3. Destructive actions shall be visually distinct and use semantic error styling.
4. Disabled button states shall be clearly distinguishable while remaining legible.
5. Button labels shall be concise, action-oriented verbs (for example: “Save”, “Create Task”, “Delete”).

## Layout and Visual Consistency

1. Spacing, alignment, and sizing shall follow a consistent spacing scale.
2. Typography shall use a consistent hierarchy for headings, body text, and supporting text.
3. Icons shall come from the Material icon set (or compatible equivalent) and be used consistently.
4. UI patterns (forms, dialogs, navigation, notifications) shall be consistent across the application.

## Accessibility Requirements

1. All interactive elements shall be keyboard accessible.
2. Visible focus indicators shall be present for all focusable controls.
3. Form inputs shall have programmatically associated labels.
4. Validation errors shall be communicated with clear text and not by color alone.
5. Images and icons that convey meaning shall include accessible names (for example, alt text or aria-label).
6. The UI shall support screen readers with appropriate semantic structure and ARIA usage where needed.
7. Touch/click targets shall be large enough for reliable interaction.
8. Content shall remain usable at common zoom levels and on small screens.

## Responsiveness

1. The UI shall adapt to common viewport sizes (mobile, tablet, desktop).
2. Core task flows shall remain fully usable at all supported breakpoints.
3. Layout changes across breakpoints shall preserve information hierarchy and action visibility.

## Acceptance Criteria for UI Work

1. New screens/components use Material components by default.
2. Colors and button styles match the defined UI rules.
3. Accessibility checks pass for keyboard navigation, focus visibility, labeling, and contrast.
4. The feature is responsive and functionally complete on supported viewport sizes.
