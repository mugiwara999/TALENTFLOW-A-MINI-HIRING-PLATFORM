# TALENTFLOW

A minimal hiring platform built with React, TypeScript, and Vite for managing jobs, candidates, and assessments.

## Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173`

## Features

- **Jobs Board**: Create, edit, archive, and reorder job postings with deep linking
- **Candidates**: Manage 1000+ candidates with virtualized lists, Kanban board, and status tracking
- **Assessments**: Build custom assessments with multiple question types and live preview
- **Notes & Mentions**: Add notes to candidates with @mention support
- **Drag & Drop**: Reorder jobs and move candidates between stages

## Architecture

### Tech Stack
- **Frontend**: React 18.3 + TypeScript
- **Routing**: React Router DOM 7.9
- **Styling**: Tailwind CSS 4
- **Database**: Dexie (IndexedDB wrapper)
- **Drag & Drop**: react-dnd
- **API Mocking**: MSW (Mock Service Worker)

### Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Route-based page components
├── services/        # API service layer
├── mocks/           # MSW handlers and seed data
├── types/           # TypeScript type definitions
└── utils/           # Database and storage utilities
```

### Data Flow

1. **IndexedDB (Dexie)**: Primary data persistence layer
2. **MSW**: Intercepts API calls during development
3. **Seed Data**: Auto-populates 1000+ candidates and sample jobs

### Key Design Patterns

- **Type Safety**: Strict TypeScript interfaces for all data models
- **Optimistic Updates**: UI updates immediately, rolls back on error
- **Client-side State**: All data managed in IndexedDB (no backend required)
- **Component Composition**: Reusable components with clear responsibilities

## Technical Decisions

### Why Dexie (IndexedDB)?
- Native browser storage with no server required
- Supports large datasets (1000+ candidates)
- Query capabilities with indexes
- Observable changes and transactions

### Why MSW?
- Simulates backend API without actual server
- Easy transition to real backend later
- Enables offline development
- Maintains realistic API contract

### Why Tailwind CSS v4?
- Utility-first approach for rapid development
- Small production bundle size
- Consistent design system
- Vite plugin for better DX

### Virtualization Strategy
- `react-window` for efficiently rendering large candidate lists
- Reduces DOM nodes and improves scroll performance
- Lazy loading prevents initial render bottlenecks

## Known Issues & Limitations

### Current Limitations

1. **No Backend**: All data stored in browser's IndexedDB
   - Data is lost on cache clear
   - No cross-device synchronization
   - No real authentication

2. **File Upload Stub**: File upload question type not fully implemented
   - UI exists but no actual file storage
   - Requires backend for production use

3. **@Mentions Not Validated**: 
   - Extracts mentions but doesn't validate against user list
   - No autocomplete suggestions
   - No notification system

4. **Conditional Logic**: 
   - Data structure exists but not rendered in preview
   - Question dependencies not evaluated

5. **No Real-time Collaboration**:
   - Single-user application
   - No conflict resolution
   - No activity feed

### Browser Compatibility
- Modern browsers only (Chrome, Firefox, Safari, Edge)
- Requires IndexedDB support
- Service Workers for MSW in development
