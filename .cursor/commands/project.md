# CourseMaster EdTech Platform - Cursor Command Rules

## How to Use This Guide

**Important**: This file provides step-by-step guidance and rules for building the CourseMaster project. It does NOT directly modify code. Instead, it guides you through:

- What to implement
- How to structure your code
- What conventions to follow
- Step-by-step instructions for setup

When implementing features, follow the guidance provided here and ask for help implementing specific steps.

**Research & Latest Information**: If needed, you can search the internet to get the latest data, documentation, or best practices for any technology, library, or framework mentioned in this guide. This is especially useful for:

- Latest API changes or deprecations
- New features in Next.js, React, or other dependencies
- Current best practices and patterns
- Troubleshooting specific errors or issues
- Version-specific documentation updates

---

## Project Context

**Project Name**: CourseMaster  
**Type**: Full-Featured EdTech Platform  
**Technology Stack**: Next.js 16.0.5 (App Router), shadcn/ui, MongoDB, Mongoose, Redux Toolkit, TypeScript, Tailwind CSS  
**Package Manager**: pnpm  
**Architecture**: MERN Stack (MongoDB, Express.js via Next.js API Routes, React, Node.js)

---

## Technology Stack & Versions

- **Next.js**: 16.0.5 (App Router only, no Pages Router)
- **React**: Latest (via Next.js)
- **TypeScript**: Latest stable
- **Tailwind CSS**: 4.0+
- **shadcn/ui**: Latest
- **MongoDB**: Latest
- **Mongoose**: 8.8+
- **Redux Toolkit**: 2.3+
- **Zod**: 4.0+
- **Package Manager**: pnpm (always use pnpm, never npm or yarn)

---

## Project Structure Rules

### Directory Organization

```
misun-academy/
├── app/                              # Next.js App Router (Server Components by default)
│   ├── (auth)/                       # Route groups for organization
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── admin-login/page.tsx
│   ├── (public)/                     # Public routes
│   │   ├── page.tsx                  # Home/Course listing
│   │   └── courses/[id]/page.tsx
│   ├── (student)/                    # Student protected routes
│   │   ├── dashboard/page.tsx
│   │   └── courses/[id]/page.tsx
│   ├── (admin)/                      # Admin protected routes
│   │   ├── dashboard/page.tsx
│   │   ├── courses/page.tsx
│   │   └── enrollments/page.tsx
│   ├── api/                          # API Routes (Next.js API Routes)
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── enrollments/
│   │   └── ...
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   └── providers.tsx                 # Redux & context providers
├── components/                       # React components
│   ├── ui/                           # shadcn/ui components (auto-generated)
│   ├── auth/                         # Auth-specific components
│   ├── course/                       # Course-related components
│   ├── student/                      # Student-specific components
│   ├── admin/                        # Admin-specific components
│   ├── shared/                       # Shared/reusable components
│   └── layout/                       # Layout components (Navbar, Sidebar)
├── lib/                              # Utility libraries
│   ├── utils.ts                      # cn() utility from shadcn
│   ├── db.ts                         # MongoDB connection
│   ├── auth.ts                       # JWT utilities
│   ├── validations/                  # Zod schemas
│   └── api/                          # API client utilities
├── models/                           # Mongoose models
│   ├── User.ts
│   ├── Course.ts
│   ├── Enrollment.ts
│   ├── Lesson.ts
│   ├── Assignment.ts
│   ├── Quiz.ts
│   ├── Batch.ts
│   └── Progress.ts
├── store/                            # Redux store
│   ├── store.ts
│   ├── slices/
│   └── hooks.ts                      # Typed Redux hooks
├── types/                            # TypeScript type definitions
│   ├── index.ts                      # Barrel export
│   ├── user.types.ts
│   ├── course.types.ts
│   └── api.types.ts
├── middleware.ts                     # Next.js middleware (auth protection)
└── .env.local                        # Environment variables
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `CourseCard.tsx`, `LoginForm.tsx`)
- **Utilities/Helpers**: camelCase (e.g., `auth.ts`, `db.ts`)
- **Types/Interfaces**: PascalCase with `.types.ts` suffix (e.g., `user.types.ts`)
- **API Routes**: `route.ts` (Next.js convention)
- **Pages**: `page.tsx` (Next.js App Router convention)
- **Layouts**: `layout.tsx` (Next.js App Router convention)
- **Directories**: kebab-case for route groups, camelCase for component directories

---

## Next.js 16.0.5 Specific Rules

### Server Components (Default)

- **Default to Server Components**: All components should be Server Components unless they need interactivity
- **Use `'use client'` sparingly**: Only mark components as Client Components when they:
  - Use React hooks (useState, useEffect, etc.)
  - Use browser APIs (localStorage, window, etc.)
  - Handle user interactions (onClick, onChange, etc.)
  - Use context providers
- **Data Fetching**: Use async Server Components for data fetching, not useEffect
- **No useEffect in Server Components**: Server Components cannot use hooks

### App Router Patterns

- **Route Groups**: Use `(auth)`, `(public)`, `(student)`, `(admin)` for organization
- **Dynamic Routes**: Use `[id]` for dynamic segments
- **Parallel Routes**: Not needed for this project
- **Intercepting Routes**: Not needed for this project
- **Layouts**: Use nested layouts for shared UI (navbar, sidebar)

### API Routes

- **File-based**: Use `app/api/[route]/route.ts` structure
- **HTTP Methods**: Export named functions (GET, POST, PUT, DELETE, PATCH)
- **Request/Response**: Use `NextRequest` and `NextResponse` from `next/server`
- **Error Handling**: Always use try-catch blocks
- **Status Codes**: Use appropriate HTTP status codes

### How to Create API Routes

**Step-by-Step Guide**:

1. **Create the route file**: Create `app/api/[your-route]/route.ts`
2. **Import required modules**:
   - Import `NextRequest` and `NextResponse` from `next/server`
   - Import `connectDB` from `@/lib/db`
   - Import validation schemas if needed
3. **Export HTTP method functions**: Export `GET`, `POST`, `PUT`, `DELETE`, or `PATCH` as async functions
4. **Structure your route**:
   - Always call `await connectDB()` at the start
   - Wrap logic in try-catch blocks
   - Validate input using Zod schemas
   - Return `NextResponse.json()` with appropriate status codes
5. **Error handling**: Return error responses with appropriate HTTP status codes (400, 401, 403, 404, 500)

**Example Structure** (for reference):

```typescript
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { validateRequest } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Your implementation here
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error message" }, { status: 500 });
  }
}
```

---

## shadcn/ui Rules

### Component Usage

- **Import from `@/components/ui`**: Always import shadcn components from `@/components/ui/[component]`
- **Customization**: Modify shadcn components directly in `components/ui/` (they're your code)
- **Composition**: Compose shadcn components to build complex UI
- **Styling**: Use Tailwind classes, avoid inline styles
- **Theming**: Use CSS variables for theming (defined in `globals.css`)

### Adding Components

```bash
pnpm dlx shadcn@latest add [component-name]
```

### Component Patterns

- **Forms**: Use shadcn Form component with react-hook-form
- **Dialogs**: Use Dialog component for modals
- **Tables**: Use Table component for data display
- **Cards**: Use Card component for content containers
- **Buttons**: Use Button component with variants (default, destructive, outline, etc.)

---

## TypeScript Rules

### Type Definitions

- **Interfaces over Types**: Prefer `interface` for object shapes
- **Type Exports**: Export types from `types/` directory
- **Avoid `any`**: Never use `any`, use `unknown` if type is truly unknown
- **Type Guards**: Use type guards for runtime type checking
- **Generic Types**: Use generics for reusable components/utilities

### How to Define Types

**Step-by-Step Guide**:

1. **Create type files**: Create files in `types/` directory (e.g., `types/course.types.ts`)
2. **Use interfaces**: Prefer `interface` over `type` for object shapes
3. **Export types**: Export all types so they can be imported elsewhere
4. **Organize related types**: Group related types in the same file
5. **Use descriptive names**: Name interfaces clearly (e.g., `Course`, `CourseListResponse`)

**Example Structure** (for reference):

```typescript
// types/course.types.ts
export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  instructor: {
    _id: string;
    name: string;
  };
}

export interface CourseListResponse {
  courses: Course[];
  currentPage: number;
  totalPages: number;
  total: number;
}
```

### Component Props

- **Interface for Props**: Always define props interface
- **Optional Props**: Use `?` for optional props
- **Default Props**: Use default parameters, not defaultProps

```typescript
interface CourseCardProps {
  course: Course;
  onEnroll?: () => void;
  showPrice?: boolean;
}

export function CourseCard({
  course,
  onEnroll,
  showPrice = true,
}: CourseCardProps) {
  // Component implementation
}
```

---

## Component Architecture Rules

### Component Hierarchy

1. **Server Components** (default): Data fetching, static content
2. **Client Components** (`'use client'`): Interactivity, hooks, browser APIs
3. **Shared Components**: Reusable across features
4. **Feature Components**: Specific to a feature (auth, course, student, admin)

### Component Structure

```typescript
// 1. Imports (external, then internal)
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/course/course-card';

// 2. Types/Interfaces
interface ComponentProps {
  // props
}

// 3. Component
export function Component({ props }: ComponentProps) {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
  return (
    // JSX
  );
}
```

### Component Guidelines

- **Single Responsibility**: One component, one purpose
- **Small Components**: Keep components under 200 lines
- **Extract Logic**: Move complex logic to custom hooks or utilities
- **Reusability**: Make components reusable when possible
- **Composition**: Compose smaller components into larger ones

---

## State Management Rules

### Redux Toolkit

- **Slices**: Use Redux Toolkit slices for state management
- **Async Actions**: Use `createAsyncThunk` for API calls
- **Typed Hooks**: Use typed hooks from `store/hooks.ts`
- **Selectors**: Create selectors for derived state

### When to Use Redux vs Local State

- **Redux**: Global state (auth, user data, global UI state)
- **Local State**: Component-specific state (form inputs, UI toggles)
- **Server State**: Use Server Components for server data, Redux for client-side cache

### How to Create Redux Slices

**Step-by-Step Guide**:

1. **Create slice file**: Create `store/slices/[feature]Slice.ts`
2. **Define state interface**: Create an interface for your slice state
3. **Set initial state**: Define the initial state object
4. **Create async thunks** (if needed): Use `createAsyncThunk` for API calls
5. **Create slice**: Use `createSlice` with name, initialState, reducers, and extraReducers
6. **Export actions and reducer**: Export actions and default export the reducer

**Example Structure** (for reference):

```typescript
// store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return response.json();
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

**What to Do Next**:

- Add the slice to your store configuration
- Use typed hooks from `store/hooks.ts` in your components
- Dispatch actions and select state as needed

---

## Database & API Rules

### MongoDB Connection

- **Connection Caching**: Use connection caching pattern (see `lib/db.ts`)
- **Environment Variables**: Always use environment variables for connection strings
- **Error Handling**: Handle connection errors gracefully

### Mongoose Models

- **Schema Definition**: Define schemas with TypeScript interfaces
- **Indexes**: Add indexes for frequently queried fields
- **Virtuals**: Use virtuals for computed properties
- **Methods**: Add instance methods for model-specific logic
- **Pre/Post Hooks**: Use for password hashing, timestamps, etc.

### API Route Patterns

- **Connect DB**: Always call `await connectDB()` at the start
- **Validate Input**: Use Zod schemas for validation
- **Error Handling**: Return appropriate status codes
- **Response Format**: Consistent JSON response format

```typescript
// Success response
return NextResponse.json({ data, message: "Success" }, { status: 200 });

// Error response
return NextResponse.json(
  { error: "Error message", details: any },
  { status: 400 | 401 | 403 | 404 | 500 }
);
```

---

## Validation Rules

### Zod Schemas

- **All Inputs**: Validate all API inputs with Zod
- **Schema Location**: Store schemas in `lib/validations/`
- **Error Messages**: Provide clear, user-friendly error messages
- **Reuse**: Create reusable schema parts

### How to Create Validation Schemas

**Step-by-Step Guide**:

1. **Create schema file**: Create `lib/validations/[feature].schema.ts`
2. **Import Zod**: Import `z` from `zod`
3. **Define schema**: Use `z.object()` to define your validation schema
4. **Add validation rules**: Use Zod methods (`.min()`, `.email()`, `.string()`, etc.)
5. **Export schema and type**: Export the schema and infer TypeScript type from it
6. **Use in API routes**: Import and use `schema.parse()` to validate input

**Example Structure** (for reference):

```typescript
// lib/validations/auth.schema.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

---

## Styling Rules

### Tailwind CSS

- **Utility Classes**: Use Tailwind utility classes, avoid custom CSS
- **Responsive Design**: Mobile-first approach with `md:`, `lg:`, `xl:` breakpoints
- **Dark Mode**: Support dark mode using `dark:` variant (if implemented)
- **Custom Colors**: Use CSS variables for theme colors

### shadcn/ui Styling

- **Variants**: Use component variants (e.g., Button variants)
- **CSS Variables**: Use CSS variables for theming
- **Customization**: Customize components in `components/ui/` directory

### Class Organization

- **Order**: Layout → Spacing → Typography → Colors → Effects
- **Grouping**: Group related classes together
- **Readability**: Use line breaks for long class lists

```typescript
<Button
  className="
    w-full
    px-4 py-2
    text-sm font-medium
    bg-primary text-primary-foreground
    rounded-md
    hover:bg-primary/90
  "
>
  Submit
</Button>
```

---

## Authentication Rules

### JWT Implementation

- **Token Storage**: Use HTTP-only cookies for token storage
- **Token Verification**: Verify tokens in middleware
- **Role-Based Access**: Check user roles in middleware
- **Protected Routes**: Use middleware to protect routes

### How to Implement Middleware

**Step-by-Step Guide**:

1. **Create middleware file**: Create `middleware.ts` in the root directory
2. **Import required utilities**: Import `NextRequest`, `NextResponse`, and auth utilities
3. **Define public routes**: Create an array of public route patterns
4. **Get token from request**: Use `getTokenFromRequest()` helper
5. **Check route protection**:
   - If route is public, allow access
   - If route is protected and no token, redirect to login
6. **Check role-based access**: Verify token and check user role for admin/student routes
7. **Export middleware function**: Export the middleware function
8. **Configure matcher**: Export config with matcher pattern

**Example Structure** (for reference):

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const { pathname } = request.nextUrl;

  // Public routes
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Protected routes
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access
  if (token) {
    const payload = verifyToken(token);
    // Check role and redirect if needed
  }

  return NextResponse.next();
}
```

---

## Error Handling Rules

### API Error Handling

- **Try-Catch**: Always wrap API route logic in try-catch
- **Error Types**: Distinguish between validation errors, auth errors, and server errors
- **Status Codes**: Use appropriate HTTP status codes
- **Error Messages**: Provide clear, actionable error messages

### Client Error Handling

- **Error Boundaries**: Use React Error Boundaries for component errors
- **User Feedback**: Show user-friendly error messages
- **Loading States**: Show loading states during async operations
- **Empty States**: Handle empty data states gracefully

---

## Performance Rules

### Optimization

- **Server Components**: Use Server Components for data fetching
- **Pagination**: Implement pagination for large lists
- **Database Indexes**: Add indexes for frequently queried fields
- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Leverage Next.js automatic code splitting
- **Suspense**: Use Suspense for loading states

### Database Optimization

- **Avoid N+1**: Use `.populate()` efficiently, avoid nested populates
- **Selective Fields**: Use `.select()` to fetch only needed fields
- **Lean Queries**: Use `.lean()` for read-only queries
- **Aggregation**: Use aggregation pipeline for complex queries

---

## Testing & Quality Rules

### Code Quality

- **ESLint**: Use flat config with Next.js, Prettier, Perfectionist, and Unused Imports plugins
- **TypeScript**: No `any` types, strict mode enabled
- **Formatting**: Use Prettier (integrated with ESLint)
- **Comments**: Add comments for complex logic only

### ESLint Configuration

**Step-by-Step Setup**:

1. **Install Required Dependencies**:

   ```bash
   pnpm add -D eslint-config-prettier eslint-plugin-perfectionist eslint-plugin-unused-imports @eslint/eslintrc
   ```

2. **Create ESLint Config File** (`eslint.config.js`):

   Create this file in the root directory with the following structure:

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import unusedImportsPlugin from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const invalidLiteralSelector = "Literal[value=/bg" + "-linear-/]";
const invalidGradientMessage = [
  "Use 'bg-gradient-*' instead of '",
  "bg",
  "-linear-",
  "*'. bg-linear is not a valid Tailwind CSS class.",
].join("");

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  eslintConfigPrettier,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    plugins: {
      perfectionist: perfectionistPlugin,
      "unused-imports": unusedImportsPlugin,
    },
    rules: {
      // Prevent using incorrect bg-linear classes (should be bg-gradient)
      "no-restricted-syntax": [
        "warn",
        {
          selector: invalidLiteralSelector,
          message: invalidGradientMessage,
        },
      ],
    },
  },
  // File-specific rules for React/TypeScript files
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      perfectionist: perfectionistPlugin,
      "unused-imports": unusedImportsPlugin,
    },
    rules: {
      // Warn about common mistakes
      "no-template-curly-in-string": "warn",
      // Import ordering with pyramid structure
      "perfectionist/sort-imports": [
        2, // error level
        {
          order: "asc",
          ignoreCase: true,
          type: "line-length", // creates pyramid structure
          newlinesBetween: "always", // blank lines between groups
          internalPattern: ["^@/.+"],
          groups: [
            "style",
            "side-effect",
            "type",
            ["builtin", "external"],
            "custom-components",
            "custom-lib",
            "custom-models",
            "custom-store",
            "custom-types",
            "internal",
            ["parent", "sibling", "index"],
            ["parent-type", "sibling-type", "index-type"],
            "object",
            "unknown",
          ],
          customGroups: {
            value: {
              "custom-components": ["^@/components/.+"],
              "custom-lib": ["^@/lib/.+"],
              "custom-models": ["^@/models/.+"],
              "custom-store": ["^@/store/.+"],
              "custom-types": ["^@/types/.+"],
            },
          },
        },
      ],
      // Require newline after imports
      "import/newline-after-import": 2,
      // Warn about unused imports
      "unused-imports/no-unused-imports": 1,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
  },
];

export default eslintConfig;
```

3. **Verify ESLint Configuration**:
   - Run `pnpm lint` to check if ESLint is working
   - Fix any configuration errors that appear
   - Ensure imports are automatically sorted according to the pyramid structure

**ESLint Rules Summary**:

- **Import Sorting**: Uses `perfectionist/sort-imports` with pyramid structure (line-length based)
- **Unused Imports**: Automatically warns about unused imports
- **Tailwind Validation**: Prevents incorrect `bg-linear-*` classes (should be `bg-gradient-*`)
- **Prettier Integration**: Disables conflicting ESLint rules
- **Next.js Integration**: Extends Next.js core-web-vitals and TypeScript rules

**What This Does**:

- Automatically sorts your imports in a pyramid structure
- Warns you about unused imports
- Validates Tailwind CSS class usage
- Integrates with Prettier to avoid conflicts

### Prettier Configuration

**Step-by-Step Setup**:

1. **Install Prettier**:

   ```bash
   pnpm add -D prettier
   ```

2. **Create Prettier Config File** (`.prettierrc.json`):

   Create this file in the root directory with the following configuration:

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "jsxSingleQuote": false,
  "bracketSameLine": false,
  "proseWrap": "preserve",
  "endOfLine": "lf",
  "htmlWhitespaceSensitivity": "css",
  "embeddedLanguageFormatting": "auto",
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "printWidth": 80
      }
    },
    {
      "files": "*.md",
      "options": {
        "proseWrap": "always",
        "printWidth": 80
      }
    }
  ]
}
```

3. **Create Prettier Ignore File** (`.prettierignore`):

   Create this file in the root directory:

```
node_modules
.next
out
build
.next-env.d.ts
*.min.js
*.min.css
package-lock.json
pnpm-lock.yaml
yarn.lock
```

4. **Verify Prettier Configuration**:
   - Run `pnpm prettier --check .` to see what files need formatting
   - Run `pnpm prettier --write .` to format all files
   - Ensure your editor is configured to format on save

**Prettier Configuration Summary**:

- **Print Width**: 100 characters (80 for JSON and Markdown)
- **Tab Width**: 2 spaces
- **Semicolons**: Enabled
- **Single Quotes**: Enabled for JavaScript/TypeScript
- **JSX Quotes**: Double quotes for JSX attributes
- **Trailing Commas**: ES5 style
- **Arrow Parens**: Avoid parentheses when possible
- **Line Endings**: LF (Unix-style)
- **File Overrides**:
  - JSON files: 80 character width
  - Markdown files: 80 character width with always wrap

**What This Does**:

- Automatically formats your code according to consistent style rules
- Ensures all team members use the same formatting
- Integrates with ESLint to avoid conflicts

### Testing Checklist

- [ ] Authentication flow works
- [ ] Protected routes redirect correctly
- [ ] API routes return correct status codes
- [ ] Forms validate correctly
- [ ] Database queries are optimized
- [ ] Responsive design works on all devices
- [ ] Error states are handled
- [ ] Loading states are shown

---

## Git & Deployment Rules

### Git Workflow

- **Commits**: Write clear, descriptive commit messages
- **Branches**: Use feature branches for new features
- **PRs**: Create pull requests for code review

### Environment Variables

- **`.env.example`**: Include all required variables
- **`.env.local`**: Never commit `.env.local`
- **Documentation**: Document all environment variables in README

### Deployment

- **Vercel**: Deploy to Vercel (recommended for Next.js)
- **Environment Variables**: Set all environment variables in Vercel
- **MongoDB Atlas**: Use MongoDB Atlas for production database
- **Build Checks**: Ensure build passes before deploying

---

## Code Review Checklist

When reviewing or writing code, ensure:

- [ ] TypeScript types are properly defined
- [ ] Components are Server Components by default
- [ ] Client Components are marked with `'use client'`
- [ ] API routes have proper error handling
- [ ] Database queries are optimized
- [ ] Input validation is implemented
- [ ] Authentication is properly implemented
- [ ] Responsive design is considered
- [ ] Error states are handled
- [ ] Loading states are shown
- [ ] Code follows project structure
- [ ] shadcn/ui components are used correctly
- [ ] Tailwind classes are used (not inline styles)
- [ ] No `any` types are used
- [ ] Environment variables are used (not hardcoded)

---

## Common Patterns

### How to Fetch Data in Server Components

**Step-by-Step Guide**:

1. **Make component async**: Export default async function
2. **Connect to database**: Call `await connectDB()` at the start
3. **Fetch data**: Use Mongoose models or direct database queries
4. **Use `.lean()`**: For read-only queries, use `.lean()` for better performance
5. **Pass data to components**: Pass fetched data as props to child components

**Example Structure** (for reference):

```typescript
// Server Component
export default async function Page() {
  await connectDB();
  const data = await Model.find().lean();
  return <Component data={data} />;
}
```

### How to Create Client Components

**Step-by-Step Guide**:

1. **Add 'use client' directive**: Must be the first line in the file
2. **Import React hooks**: Import `useState`, `useEffect`, etc. as needed
3. **Manage state**: Use `useState` for component state
4. **Fetch data**: Use `useEffect` to fetch data from API routes
5. **Handle loading/error states**: Show loading and error states appropriately

**Example Structure** (for reference):

```typescript
"use client";

import { useState, useEffect } from "react";

export function ClientComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{/* Render */}</div>;
}
```

### How to Create Forms

**Step-by-Step Guide**:

1. **Mark as client component**: Add `'use client'` directive
2. **Install dependencies**: Ensure `react-hook-form` and `@hookform/resolvers` are installed
3. **Import form utilities**: Import `useForm`, `zodResolver`, and your validation schema
4. **Set up form**: Use `useForm` with `zodResolver` and your Zod schema
5. **Create submit handler**: Create async function to handle form submission
6. **Use shadcn Form components**: Use shadcn Form, FormField, FormItem, etc.
7. **Handle response**: Process API response and show success/error messages

**Example Structure** (for reference):

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "@/lib/validations";

export function FormComponent() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    const res = await fetch("/api/endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // Handle response
  };

  return <Form {...form}>{/* Form fields */}</Form>;
}
```

---

## Important Reminders

1. **Always use pnpm**, never npm or yarn
2. **Server Components by default**, Client Components only when needed
3. **TypeScript strict mode**, no `any` types
4. **Validate all inputs** with Zod
5. **Handle errors** gracefully with try-catch
6. **Use shadcn/ui components** from `@/components/ui`
7. **Follow project structure** strictly
8. **Optimize database queries** with indexes and lean()
9. **Use environment variables** for all configuration
10. **Test thoroughly** before moving to next feature

---

This command file guides all development decisions and code generation for the CourseMaster project. Follow these rules consistently to ensure code quality, maintainability, and scalability.
