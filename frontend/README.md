# Frontend - AI KnowledgeBase UI

A responsive and intuitive user interface built with React and Vite.

## ✨ Highlights
- **Auth Flow**: Complete signup/login cycle with token persistence.
- **Rich Editor**: Integrated **React Quill** for professional article composition.
- **AI Assist**: Direct buttons in the editor to call AI for improvements and summaries.
- **Dynamic Routing**: Managed with React Router 7, including route guards.
- **Premium Styling**: Custom CSS with a focus on modern typography and dark-mode compatible accents.

## 🏗️ Core Components
- **AuthContext**: Centralized auth state.
- **Navbar**: Responsive header with dynamic user controls.
- **ProtectedRoute**: Higher-order component for secure pages.
- **ArticleEditor**: Unified component for both creating and editing.

## 📡 Axios Configuration
The `services/api.js` client uses a **Request Interceptor** to automatically inject the JWT token from `localStorage` into every outgoing request, making authorized calls seamless.

## 📐 Styling Guidelines
- **Tokens**: Uses standard CSS variables for colors and spacing.
- **Grid**: Responsive card layouts using CSS Grid.
- **Micro-interactions**: Hover effects and smooth transitions on all interactive elements.
