# Thiranex Portfolio - Accessible Semantic Web Skeleton

A premium, modern multi-page personal portfolio website built with a focus on **strict semantic HTML5 standards**, **WCAG 2.1 accessibility guidelines**, and **high Lighthouse SEO and Performance scores**.

## Features

- **Semantic HTML5 Markup**: Implemented structure using proper landmark tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- **A11y (Accessibility)**:
  - **Skip to Content Link**: Direct keyboard shortcut to bypass navigation links.
  - **Focus Indicators**: Custom high-contrast `:focus-visible` states to aid keyboard navigation.
  - **Keyboard Trap / Nav Drawer**: Full keyboard navigation support (closing on Esc, trap focus when open).
  - **WAI-ARIA Roles & Labels**: Accurate labelling (`aria-expanded`, `aria-pressed`, `aria-label`, `aria-describedby`, `aria-invalid`).
  - **Live Screen Reader Announcements**: Dynamic page filter counts and theme states are announced live to screen readers using `aria-live`.
  - **Contact Form Validation**: Clear aria-linked errors announced to screen readers.
  - **Reduced Motion Support**: Motion and animations respect users' operating system preferences via `prefers-reduced-motion`.
- **SEO Optimization**: Compelling meta descriptions, correct outline structure (h1 -> h2 -> h3), SVG favicon, robots tags, canonical links, and Open Graph previews.
- **Visual Design**: Sleek glassmorphic card patterns, premium gradients, light/dark theme toggles, and fully responsive layouts.

## Running Locally

To run the dev server locally:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Vite server:
   ```bash
   npm run dev
   ```
3. Open the browser: Navigate to the local URL (usually `http://localhost:5173`).
