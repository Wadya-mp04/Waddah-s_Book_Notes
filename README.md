⸻

Book Notes — Personal Reading Tracker

Book Notes is a full-stack web application for tracking books, ratings, and personal notes. The goal of the project was to build a clean, practical system using core web technologies, with an emphasis on correctness, performance, and user experience rather than heavy frameworks.

The application allows users to:
• View a collection of saved books
• Add new books through a dedicated admin page
• Edit or delete existing ratings and notes
• Automatically fetch book information using an ISBN

⸻

Tech Stack & Architecture

Frontend
• HTML with EJS for server-side rendering
• Vanilla JavaScript for all client-side logic
• CSS for layout, theming, and responsiveness
• Debounced input handling to reduce unnecessary network requests
• Inline form validation with user-friendly feedback (no alert popups)

Backend
• Node.js with Express
• PostgreSQL for persistent data storage
• pg for database interaction
• dotenv for environment configuration
• Axios for external API communication

External APIs
• Open Library API for ISBN validation and book metadata
• Open Library Covers API for dynamically loading book cover images

⸻

Key Features & Implementation Details

ISBN Validation & Metadata Fetching
• Supports both ISBN-10 and ISBN-13 formats
• Uses proper checksum validation instead of relying on string length
• Normalizes input by removing spaces, hyphens, and casing inconsistencies

Debounced ISBN Lookup
• Frontend debouncing ensures requests are only sent after the user pauses typing
• Prevents unnecessary calls to the backend and third-party APIs
• Provides clear, real-time feedback while the lookup is in progress

Backend Caching (LRU)
• Implements an in-memory Least Recently Used (LRU) cache
• Caches both successful and failed ISBN lookups
• Automatically evicts older entries once the cache reaches a fixed size
• Reduces response times and avoids redundant external API calls

CRUD Operations
• Books can be added, edited, or deleted without full page reloads
• AJAX-based updates provide a smoother user experience
• All database queries use parameterized SQL to prevent injection vulnerabilities

UI & UX Considerations
• Inline validation messages instead of intrusive alerts
• Auto-filled and disabled fields where appropriate
• Dynamic cover previews that update when a valid ISBN is entered
• Graceful handling of missing data or unavailable covers

⸻

AI Appendix — Use of Generative AI

Generative AI was used as a development aid rather than a code generator.

It primarily helped with:
• Discussing architectural choices and tradeoffs before implementation
• Reviewing existing logic and pointing out edge cases or improvements
• Exploring alternative ways to implement features such as debouncing, caching, and validation
• Brainstorming optional enhancements without inflating the project scope
• Assisting more directly with CSS and layout decisions where visual iteration benefits from rapid feedback

All core logic, integration, and final decisions were written and implemented manually. AI functioned as a form of guided peer review and problem-solving support rather than an automated solution.

⸻

Summary

This project focuses on practical full-stack development patterns, clean separation of concerns, and careful handling of real-world edge cases. It demonstrates how much can be achieved with a solid understanding of fundamentals and thoughtful design choices.
