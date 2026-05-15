# Frontend Design System

## Visual Foundations
- Color: neutral admin surfaces, blue primary actions, green success, amber warning, red danger.
- Typography: readable system sans for dense operational screens.
- Spacing: 4px base scale; forms use consistent label, helper, and error spacing.

## Component Rules
- Use shared Button, Input, Select, Table, Badge, Dialog, and Toast components before creating feature UI.
- Component names use PascalCase.
- Hooks use `useCamelCase`.
- Feature folders own workflow-specific screens and forms.

## Accessibility
- Every input has a label and field-level error text.
- Keyboard focus is visible.
- Tables support row focus and accessible actions.
- Danger actions require confirmation text.
