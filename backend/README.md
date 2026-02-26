# ⚙️ KnowledgeHub Backend — Node.js API

The **KnowledgeHub Backend** is a robust RESTful API built with **Express.js** and **MySQL**. It serves as the core intelligence engine for the platform, managing secure operations and external AI service integrations.

---

## 🚀 Key Highlights
- **MVC Architecture**: Strict separation of concerns for maximum maintainability.
- **Native Gemini Integration**: Direct implementation using the `@google/generative-ai` SDK (Flash 2.0).
- **Secure by Design**: JWT-based session management and Bcrypt password hashing.
- **Relational Integrity**: Normalized MySQL schema with junction tables for efficient tagging.

---

## 📂 Architecture & Approach
The backend is structured around the **Model-View-Controller (MVC)** pattern:
- **Controllers**: Handles request validation and orchestrates business logic.
- **Models**: Abstractions for raw SQL queries, ensuring safe data interaction via `mysql2`.
- **Services**: Specialized layers for external integrations (the AI Service).
- **Middleware**: Intercepts requests for authentication and centralized error handling across the app.

### 📐 Design Decisions
1. **Native AI SDK**: Bypassed generic wrappers to use the Google Generative AI SDK directly, enabling `responseMimeType: 'application/json'` for reliable machine-readable output.
2. **Centralized Error Middleware**: All async errors are caught and piped to a single error handler, ensuring consistent JSON error responses for the frontend.
3. **Database Normalization**: Used a `article_tags` junction table to allow N-N relationships, essential for a high-performance knowledge platform.

---

## 📊 Database Schema
The database uses standard **InnoDB** with the following normalized tables:
- `users`: Stores user profiles and auth credentials.
- `articles`: Primary content storage (Title, Category, Summary, Content).
- `tags`: Unique collection of technical keywords.
- `article_tags`: Links articles to their respective tags.

---

## 🤖 AI Usage Detail
- **SQL Engineering**: AI helped generate the initial migration scripts and the multi-table query for filtering articles by tags.
- **Service Refactoring**: The transition from mock data to real-time Gemini generation was designed by AI to include a **Safe Parse** mechanism that recovers from malformed LLM responses.

---
*Developed for the AI-KnowledgeBase Project — 2026.*
