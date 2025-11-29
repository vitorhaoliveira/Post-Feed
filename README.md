# Post Feed - Angular Application

A modern Angular application for managing Posts and Comments, developed as part of a technical challenge. The application consumes the public JSONPlaceholder API and implements complete CRUD operations with in-memory cache, optimistic updates, and a responsive interface.

## 🚀 Technologies Used

- **Angular 17+** with Standalone Components
- **TypeScript** with strict typing
- **Tailwind CSS** for styling
- **RxJS** for reactive programming
- **Angular Signals** for state management
- **JSONPlaceholder API** for backend

## 📋 Requirements

Before starting, make sure you have installed:

- **Node.js** version 18.x or higher
- **npm** version 9.x or higher
- **Angular CLI** version 17.x or higher (will be installed automatically)

## 🔧 Installation

### 1. Clone the repository (or extract the files)

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm start
```

or

```bash
ng serve
```

### 4. Access the application

Open your browser and navigate to: ([http://post-feed](https://post-feed-smoky.vercel.app/))

## 📁 Project Structure

```
src/app/
├── core/
│   ├── interceptors/
│   │   ├── base-url.interceptor.ts       # Adds API base URL
│   │   └── error-handler.interceptor.ts  # Global error handling
│   ├── services/
│   │   ├── posts.service.ts              # Posts service with cache
│   │   └── comments.service.ts          # Comments service with cache
│   └── models/
│       ├── post.interface.ts             # Post interfaces and DTOs
│       └── comment.interface.ts          # Comment interfaces and DTOs
├── shared/
│   └── components/
│       ├── modal/                        # Reusable modal
│       ├── confirmation-dialog/          # Confirmation dialog
│       ├── spinner/                      # Loading indicator
│       └── error-message/                # Error message
├── features/
│   ├── posts/
│   │   ├── posts-list/                   # Posts listing (main route)
│   │   ├── post-detail/                  # Post details
│   │   ├── post-form-modal/              # Create/edit form
│   │   └── posts-table/                  # Table with pagination and search
│   └── comments/
│       ├── comments-list/                # Comments listing
│       └── comment-form/                 # Comment form
├── app.component.ts
├── app.config.ts                         # Application configuration
└── app.routes.ts                         # Route definitions
```

## ✨ Features

### Posts
- ✅ Posts listing with pagination (10, 25, 50 per page)
- ✅ Search by title and content (with debounce)
- ✅ Sorting by ID or Title (ascending/descending)
- ✅ Create new posts
- ✅ Edit existing posts
- ✅ Delete with confirmation
- ✅ View post details
- ✅ In-memory cache for better performance

### Comments
- ✅ Comments listing by post
- ✅ Add new comments
- ✅ Edit existing comments
- ✅ Delete with confirmation
- ✅ Email validation
- ✅ Synchronized in-memory cache

### User Experience
- ✅ Responsive interface (mobile-first)
- ✅ Loading indicators
- ✅ User-friendly error messages
- ✅ Informative empty states
- ✅ Optimistic updates with rollback
- ✅ Accessibility (ARIA labels, keyboard navigation)

## 🏗️ Architecture and Technical Decisions

### Hybrid State Management: Signals + RxJS

The application uses a hybrid approach that leverages the best of both paradigms:

**Angular Signals** are used for:
- Synchronous UI state (open/closed modals, loading, errors)
- In-memory cache of posts and comments
- Derived state with `computed()`
- Granular and efficient reactivity

**RxJS Observables** are used for:
- Asynchronous HTTP operations
- Data transformation and composition
- Error handling
- Complex stream operations

**Why?**
- Signals offer better performance for local state and UI reactivity
- RxJS remains ideal for asynchronous operations and HTTP
- The combination allows for cleaner and more maintainable code
- Use of `async pipe` in templates for automatic subscription management

### In-Memory Cache with Map

Cache implementation using `Map<id, entity>` for:
- O(1) data access
- Reduced API calls
- Automatic synchronization after CRUD operations
- Faster user experience

**Strategy:**
1. First, check the cache
2. If not found, fetch from API
3. Update cache with API data
4. Shared state between components via service

### Optimistic Updates with Rollback

All modification operations (Create, Update, Delete) implement:

1. **Save previous state** before the operation
2. **Update cache/UI immediately** (optimistic)
3. **Send request to API**
4. **On success**: confirm the change
5. **On error**: rollback to previous state + show error

**Benefits:**
- Instantly responsive interface
- Better user experience
- Immediate visual feedback
- Elegant error recovery

### Standalone Components

The entire application uses Standalone Components (Angular 17+):
- No need for NgModules
- Explicit imports in each component
- Simplified lazy loading
- Better tree-shaking

### HTTP Interceptors

**BaseUrlInterceptor:**
- Automatically adds the API base URL to all requests
- Centralizes API configuration

**ErrorHandlerInterceptor:**
- Intercepts all HTTP errors
- Translates error codes to user-friendly messages in English
- Provides structured error information

### Component Design Patterns

**Container/Presenter Pattern:**
- `PostsListComponent` = Container (logic, state, services)
- `PostsTableComponent` = Presenter (display only, @Input/@Output)

**Component Composition:**
- Small components focused on a single responsibility
- Reusability through `shared/components`
- Typed props with TypeScript

## ♿ Accessibility

The application implements accessibility practices:

- **HTML Semantics**: use of appropriate tags (`main`, `article`, `nav`, etc.)
- **ARIA Labels**: all interactive elements have descriptive labels
- **Keyboard Navigation**: 
  - `Tab` to navigate between elements
  - `Enter` to activate buttons
  - `Esc` to close modals
- **Focus Management**: focus is managed in modals and forms
- **Screen Readers**: loading and error announcements with `aria-live`
- **Color Contrast**: following WCAG 2.1 AA
- **Visual States**: hover, focus, active well defined

## 🎨 Styling

### Tailwind CSS

Chosen for:
- Utility class usage
- Minimal configuration
- Optimized bundle size (only used classes)
- Mobile-first responsiveness
- Customization via `tailwind.config.js`

### Design System

**Colors:**
- Primary: Blue-600 (main actions)
- Secondary: Indigo-600 (editing)
- Destructive: Red-600 (deletion)
- Neutral: Gray (texts, backgrounds)

**Spacing:**
- Consistent using Tailwind scale (4, 8, 16, 24px, etc.)
- Proportional padding and margin

**Typography:**
- Native font system for better performance
- Clear hierarchy (h1, h2, h3)
- Adequate line-height for reading

## 🔄 Data Flow

```
User Action → Component
              ↓
         Service (Signal/Observable)
              ↓
         HTTP Interceptor
              ↓
         JSONPlaceholder API
              ↓
         Cache Update (Map)
              ↓
         Signal Change
              ↓
         Component Re-render
```

## 🧪 How to Test

### Manual Testing

1. **Posts Listing**
   - Access the home page
   - Verify that posts load
   - Test pagination (previous/next)
   - Test search by title/content
   - Test sorting by ID and Title

2. **Posts CRUD**
   - Click "New Post" and create a post
   - Click "Edit" and modify a post
   - Click "Delete" and confirm deletion

3. **Post Details**
   - Click "View" on any post
   - Verify details and comments
   - Test editing and deletion on the details page

4. **Comments CRUD**
   - On the details page, add a comment
   - Edit an existing comment
   - Delete a comment with confirmation

5. **Error States**
   - Disconnect the internet and try to load data
   - Verify user-friendly error messages
   - Test "Try again" button

6. **Responsiveness**
   - Resize the browser window
   - Test on mobile device
   - Verify that all elements adapt

7. **Accessibility**
   - Navigate only with keyboard (Tab, Enter, Esc)
   - Use a screen reader
   - Verify focus indicators

## 📦 Production Build

To create an optimized build:

```bash
npm run build
```

The optimized files will be in `dist/post-feed/`.


## 📝 Available Scripts

- `npm start` - Starts development server
- `npm run build` - Production build
- `npm test` - Runs tests (if implemented)
- `npm run lint` - Checks code with ESLint

**Note**: This project consumes the public JSONPlaceholder API (https://jsonplaceholder.typicode.com), which is a fake API for testing and prototyping. Modification operations (POST, PUT, DELETE) simulate success but do not actually persist data on the server.
