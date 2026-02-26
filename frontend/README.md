# 🎨 KnowledgeHub Frontend — React UI

The frontend of **KnowledgeHub** is a modern, high-performance web application built with **React** and **Vite**. It provides a seamless, professional experience for authors to compose, manage, and discover technical content with real-time AI assistance.

---

## 🚀 Key Highlights
- **Modern Tech Stack**: React 18, Vite, Axios, React Quill.
- **Glassmorphic Design**: A premium dark-theme design system built from scratch with Vanilla CSS.
- **AI-Driven UX**: Features a dedicated **AI Preview Panel** for reviewing AI suggestions before applying them.
- **Robust Auth**: Centralized context-based authentication with protected route guards.

---

## 📂 Architecture & Approach
The frontend follows a **Feature-Based Module** approach:
- **`context/`**: Global state management for User Authentication and Authorization.
- **`pages/`**: High-level view components (Dashboard, Login, Editor).
- **`components/`**: Reusable purely UI components (Navbar, PrivateRoute).
- **`services/`**: Centralized API abstraction using Axios with request/response interceptors.

### 📐 Design Decisions
1. **Request Interceptors**: Automatically injects JWT Bearer tokens into the headers, removing boilerplate from individual component calls.
2. **Per-Button Loading States**: Ensures that AI processing (which takes time) doesn't freeze the entire UI; users see specific pulsing spinners for each AI action.
3. **Markdown-Rich Rendering**: Uses `DOMPurify` to safely render AI-generated markdown content in the article details view.

---

## 🛠️ Project Structure
```text
├── src/
│   ├── components/      # Functional UI wrappers (Navbar, ProtectedRoute)
│   ├── context/         # AuthContext for global session state
│   ├── hooks/           # Future-ready custom hooks
│   ├── pages/           # Page-level components (Login, Signup, Home, Editor)
│   ├── services/        # Axios API client configuration
│   └── assets/          # Static images and icons
├── index.html           # SPA entry point
└── index.css            # Global Design System (CSS Variables)
```

---

## 🤖 AI Usage Detail
- **UI Architecture**: AI assisted in designing the state transition for the **AI Preview Pane**, moving away from standard alerts to a modern, non-blocking inline panel.
- **Component Scaffolding**: Scaffolding of the `React Quill` integration was AI-generated and then manually tuned for dark-mode compatibility.

---
*Developed for the AI-KnowledgeBase Project — 2026.*
