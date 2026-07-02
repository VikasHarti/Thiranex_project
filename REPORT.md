# Project Report: Thiranex Accessible Portfolio

This report explains what this project is, what features it includes, and the key concepts learned during Step 1.

---

## 1. What is in the Project?

We built a **4-page personal portfolio website** (Home, About, Projects, and Contact) designed from the ground up to be beautiful, clean, and 100% accessible to everyone (including people using screen readers or keyboard-only navigation).

### Key Features:
*   **Theme Switcher (Dark & Light Mode):** A button that toggles between dark and light themes, remembering your preference.
*   **Accessible Navigation Menu:** A mobile menu that can be opened and closed easily using a keyboard or mouse, keeping focus locked inside the menu while open.
*   **Live Contact Form Validation:** Real-time form checks that immediately show error messages if you type something wrong or leave a required field empty.
*   **Skip-to-Content Link:** A hidden link that appears only when using the keyboard tab key, allowing screen reader users to skip past the header straight to the main page content.
*   **SVG Graphics:** Built-in vector graphics for layouts and page favicons so they load instantly and look sharp on any screen.

---

## 2. What Did I Learn?

Here are the core web design principles learned during this project:

### 🌟 Semantic HTML5 (Clean Structure)
Instead of using generic `<div>` tags for everything, we used meaningful HTML5 tags:
*   `<header>` and `<footer>` for the top branding and bottom copyright sections.
*   `<nav>` for lists of navigation links.
*   `<main>` for the core content area.
*   `<section>` and `<article>` to group related information.
*   *Why this matters:* It helps search engines find your site easily (SEO) and allows assistive technologies (like screen readers) to understand the structure of your page.

### 🌟 WCAG 2.1 Guidelines (Accessibility Standards)
We followed the official Web Content Accessibility Guidelines (WCAG) to ensure the site is fully inclusive:
*   **Color Contrast:** All colors maintain a high contrast ratio (at least 4.5:1 for normal text and 7:1 for headers) so people with low vision can read everything easily.
*   **Focus Indicator outlines:** Visible blue rings outline buttons and links when using keyboard navigation, making it clear where you are on the page.
*   **Motion Control:** Added media queries that stop animations automatically if the user has requested "Reduced Motion" in their computer system settings.

### 🌟 WAI-ARIA (Screen Reader Support)
We used ARIA attributes to tell screen readers what is happening on the page in real-time:
*   `aria-expanded`: Tells the screen reader if the mobile menu is open or closed.
*   `aria-pressed`: Tells the screen reader which project filter button is active.
*   `aria-describedby` & `aria-invalid`: Links input fields to their respective error messages, so screen reader users hear the error immediately.
*   `aria-live="polite"`: A custom live region that reads out announcements (like "Theme changed to Light mode") without interrupting the user.

### 🌟 Secure & Resilient JavaScript
*   We wrapped `localStorage` calls inside `try-catch` blocks.
*   *Why this matters:* Some browsers or sandbox environments block access to storage for security reasons. By wrapping them in try-catch blocks, we prevent the website's JavaScript from crashing, keeping the site functional.

---

## 3. What Did I Learn in Step 2? (Advanced CSS3 & Responsive Architecture)

In Step 2, we took our structural layout and turned it into a premium, responsive, and visually beautiful website. Here is what we learned and did in simple terms:

### 📱 Mobile-First Design (Starting Small)
*   **What we did:** We wrote the stylesheet so the default styles are designed for mobile screens (under 768px). We then used `@media (min-width: ...)` queries to expand and adjust the layout as the screen size increases.
*   *Why this matters:* It makes the website load faster and look great on phones first, then scales up beautifully to tablets and desktops.

### 🧩 CSS Grid (Major Layouts)
*   **What we did:** We used CSS Grid to structure two-dimensional sections:
    *   The side-by-side columns of the Hero and About sections on desktop.
    *   The multi-column grid layouts for the Projects lists and Philosophy cards.
    *   The side-by-side input fields on the Contact form.
    *   The professional timeline view (aligning dates on the left and description cards on the right).
*   *Why this matters:* It allows us to build complex, solid layouts that dynamically adjust their columns based on the screen width.

### ⛓️ Flexbox (Small Alignments)
*   **What we did:** We used Flexbox to align smaller elements inside headers, footers, and cards:
    *   Positioning the logo and menu buttons at the top corners.
    *   Spacing out links in the navigation bar and footer.
    *   Arranging project tags and links neatly in rows.
*   *Why this matters:* Flexbox is perfect for aligning items in a single direction (row or column) and spacing them out dynamically.

### 🎨 Custom CSS Variables & Fixed Theme Switcher
*   **What we did:** We defined global variables (like `--bg-primary`, `--primary`, and `--space-lg`) to manage colors, spacing, and borders in one place. We set dark mode as the default theme.
*   **Theme Switcher Fix:** We fixed the toggle icons to make sure that in dark mode a Sun icon is visible (indicating "click to switch to light"), and in light mode a Moon icon is visible (indicating "click to switch to dark"), keeping accessibility labels and visuals perfectly synchronized.
*   *Why this matters:* It makes updating colors or styles incredibly fast, and ensures that the user experience for changing themes is smooth and intuitive.

### ✨ Premium Aesthetics (The WOW Factor)
*   **What we did:** We added top-tier design features:
    *   **Glassmorphism:** Navigation headers and card containers use translucent backgrounds with subtle borders and backdrop blur.
    *   **Micro-animations:** Interactive cards scale up and glow when hovered, and buttons react smoothly to hover and keyboard focus events.
    *   **Vibrant Gradients:** Linear blue and purple gradients were added to highlights and buttons to give the site a modern, energetic feel.

---

## 4. What Did I Learn in Step 3? (JavaScript Logic, State Management & Local Storage)

In Step 3, we built an interactive Task Manager (To-Do List) app. Here is what we learned and did in simple terms:

### 🧩 Central State Management
*   **What we did:** Instead of reading and writing values directly to the HTML page all the time, we stored all task data in a central JavaScript list (an array of objects). The UI simply updates itself automatically to reflect the current state of this list.
*   *Why this matters:* It makes managing complex data clean and prevents bugs where the visual UI gets out of sync with the actual data.

### 💾 Local Data Persistence (localStorage)
*   **What we did:** We programmed the app to save the tasks list in the browser's storage (`window.localStorage`) whenever tasks are added, completed, edited, or deleted. We wrapped this in `try-catch` blocks.
*   *Why this matters:* It prevents the website from crashing if the browser blocks storage (like in private browsing), and ensures your tasks are not lost when you reload the page or close the tab.

### ⚡ Event Delegation (Smart Event Handling)
*   **What we did:** Instead of adding click listeners to every single task card, checkbox, edit button, and delete button individually, we attached one single listener to the parent container (`#todo-list`). We then look at which button was clicked using `e.target`.
*   *Why this matters:* It is highly efficient, uses very little memory, and automatically handles click events for new tasks added to the page dynamically without needing to re-bind event listeners.

### ⚙️ Full CRUD Cycle (Create, Read, Update, Delete)
*   **What we did:** We built all four essential database operations:
    *   **Create:** Adding a task with title validation, selected priorities, and due dates.
    *   **Read:** Loading and displaying tasks matching search queries, sort orders, and filter tabs.
    *   **Update:** Toggling a task as checked/unchecked, and using an inline edit mode to change titles and dates.
    *   **Delete:** Removing tasks with smooth fading exit animations.

### 🗣️ JavaScript Web Accessibility (WCAG 2.1)
*   **What we did:** We kept accessibility alive in dynamic JavaScript by:
    *   Using an `aria-live="polite"` region to read out actions (like "Task added", "Task deleted") to screen readers.
    *   Managing keyboard focus so that when you edit or restore a task, your keyboard cursor immediately jumps to the right place.
    *   Setting proper `aria-checked` states for custom-built buttons.

### 🔄 Interactive Undo & Recovery
*   **What we did:** When a task is deleted, we temporarily store it in a backup. We display a toast notification with an "Undo" button at the bottom of the screen. Clicking it restores the task at its exact previous position.
*   *Why this matters:* It gives users a second chance to recover accidentally deleted information without showing annoying confirmation dialogs.


