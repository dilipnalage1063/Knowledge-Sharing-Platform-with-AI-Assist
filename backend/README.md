# Backend - AI KnowledgeBase API

The powerhouse of the platform, providing secure authentication, article management, and AI services.

## 🛠️ Features
- **MVC Architecture**: Clear separation of routes, controllers, and models.
- **Structured AI Service**: Handles OpenAI completions with JSON response formatting.
- **Smart Fallback**: Automatically switches to `mockImproveContent` if no API key is set.
- **Normalized DB**: Many-to-many relationship for tags using junction tables.

## 📊 Database Schema
The database uses **InnoDB** with normalized tables:
- `users`: Auth information and roles.
- `articles`: Core content, AI summaries, and category.
- `tags`: Unique tag names.
- `article_tags`: Junction table linking articles to tags.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup`: Create new account.
- `POST /api/auth/login`: Get JWT token.

### Articles
- `GET /api/articles`: List all (with search/filter/pagination).
- `POST /api/articles`: Create (Protected).
- `GET /api/articles/:id`: Get single details.
- `PUT /api/articles/:id`: Update (Owner only).
- `DELETE /api/articles/:id`: Delete (Owner only).

### AI Assistant
- `POST /api/ai/improve`: Polish title and content.
- `POST /api/ai/summary`: Generate catchy summary.
- `POST /api/ai/suggest-tags`: Recommend keywords.

## 🤖 AI Integration
The `aiService.js` is built to be resilient. It uses GPT-3.5 internally but detects the presence of `OPENAI_API_KEY`. If missing, it provides high-quality mock responses to ensure the frontend still feels "alive" during development.
