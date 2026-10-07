<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# DevNest App — AI Agent & Developer Guidelines

This document provides mandatory architecture guidelines, directory patterns, conventions, and implementation workflows for AI agents and developers working on `dev-nest-app`.

---

## 1. Tech Stack Overview

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript 5 (Strict Mode enabled)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), Lucide Icons (`lucide-react`)
- **Forms & Validation**: Zod v4 (`zod`)
- **Animations / Visuals**: GSAP (`gsap`), OGL (`ogl`), Sass (`sass`)
- **Routing & Route Protection**: App Router Route Groups + Next.js 16 `proxy.ts` middleware

---

## 2. Architecture & Directory Structure

The project follows a **Feature-Driven Architecture** combined with a **Shared Foundation Layer**:

```
dev-nest-app/
├── app/                          # Next.js App Router (Routing layer only)
│   ├── (administration)/         # Route group for admin pages (e.g. /dashboard)
│   ├── (authentications)/        # Route group for auth pages (e.g. /auth/login)
│   ├── (workspace)/              # Route group for user workspace (e.g. /workspace)
│   ├── globals.css               # Global styles & Tailwind CSS entry
│   ├── layout.tsx                # Root layout with font setup and global providers
│   └── page.tsx                  # Landing / entry page
│
├── features/                     # Feature modules (Domain-driven vertical slices)
│   ├── _template/                # Scaffold template for creating new features
│   │   ├── components/           # Feature-specific components
│   │   ├── hooks/                # Feature-specific custom hooks
│   │   ├── services/             # Feature-specific API services
│   │   ├── index.ts              # Public API barrel export for the feature
│   │   └── types.ts              # Feature TypeScript types & DTOs
│   └── authentication/           # Reference feature implementation (Auth)
│       ├── components/
│       │   └── providers/        # Context providers (e.g. auth-provider.tsx)
│       ├── hooks/                # e.g. use-auth.tsx
│       ├── services/             # e.g. auth.service.ts
│       ├── index.ts              # Public export barrel
│       └── types.ts              # Types matching backend schemas
│
├── shared/                       # Cross-cutting foundational layer (Horizontal slice)
│   ├── components/
│   │   ├── layouts/              # Shared layouts, shells, navbars, sidebars
│   │   └── ui/                   # Reusable primitive UI components (button, input, etc.)
│   │       └── index.ts          # Barrel export for UI primitives
│   ├── data/                     # Static configuration data & constants
│   ├── hooks/                    # Reusable generic hooks (use-debounce, use-media-query)
│   ├── services/                 # Base API client and shared HTTP utilities
│   │   └── api-client.ts         # ApiClient class and apiClient singleton
│   ├── types/                    # Shared core types (api.ts: ApiResponse, ApiError)
│   └── utils/                    # Utility functions (cn.ts)
│
├── proxy.ts                      # Next.js 16 route protection & session redirection
└── tsconfig.json                 # Path alias configured: "@/*" -> "./*"
```

---

## 3. Strict Naming Conventions

All files, directories, and code symbols **must** adhere strictly to the following naming conventions:

### 3.1 File & Directory Naming: `first-second-third.format` (Strict Kebab-Case)

Every file and directory in this repository uses **kebab-case** (`first-second-third.format`). Do **not** use PascalCase or camelCase for file names.

| Artifact Type             | File Naming Pattern            | Example                                                                      |
| :------------------------ | :----------------------------- | :--------------------------------------------------------------------------- |
| **Feature Directory**     | `features/<feature-name>/`     | `features/team-management/`                                                  |
| **Feature Component**     | `<first>-<second>.tsx`         | `features/authentication/components/providers/auth-provider.tsx`             |
| **Reusable UI Component** | `<component-name>.tsx`         | `shared/components/ui/button.tsx`, `shared/components/ui/otp-input.tsx`      |
| **Layout Component**      | `<layout-name>-layout.tsx`     | `shared/components/layouts/dashboard-layout.tsx`                             |
| **Custom Hook**           | `use-<hook-name>.ts` or `.tsx` | `features/authentication/hooks/use-auth.tsx`, `shared/hooks/use-debounce.ts` |
| **Service File**          | `<entity>.service.ts`          | `features/authentication/services/auth.service.ts`                           |
| **Type Definition File**  | `types.ts` or `<domain>.ts`    | `features/<feature>/types.ts`, `shared/types/api.ts`                         |
| **Utility File**          | `<utility-name>.ts`            | `shared/utils/cn.ts`, `shared/utils/date-format.ts`                          |
| **Barrel Export**         | `index.ts`                     | `features/<feature>/index.ts`, `shared/components/ui/index.ts`               |
| **App Route Page**        | `page.tsx`                     | `app/(workspace)/workspace/page.tsx`                                         |
| **App Route Layout**      | `layout.tsx`                   | `app/(authentications)/layout.tsx`                                           |
| **App Route Groups**      | `(<group-name>)`               | `app/(authentications)`, `app/(workspace)`, `app/(administration)`           |

### 3.2 Code Symbol Naming

| Symbol Type                 | Convention                      | Example                                               |
| :-------------------------- | :------------------------------ | :---------------------------------------------------- |
| **React Component**         | `PascalCase`                    | `Button`, `OtpInput`, `AuthProvider`, `WorkspacePage` |
| **Custom Hook**             | `camelCase` starting with `use` | `useAuth`, `useDebounce`, `useWorkspaceProjects`      |
| **Service Class**           | `PascalCase`                    | `AuthService`, `WorkspaceService`                     |
| **Service Static Methods**  | `camelCase`                     | `AuthService.login()`, `AuthService.getMe()`          |
| **Types & Interfaces**      | `PascalCase`                    | `ApiResponse<T>`, `LoginRequest`, `ButtonProps`       |
| **Constants & Cookie Keys** | `UPPER_SNAKE_CASE`              | `AUTH_COOKIES`, `STORAGE_KEYS`                        |
| **Utility Function**        | `camelCase`                     | `cn()`, `formatDate()`, `getCookie()`                 |

---

## 4. Component Creation Guidelines

Components are classified into four distinct levels. Place each component into its proper location:

```
┌────────────────────────────────────────────────────────┐
│ App Pages (app/**/page.tsx)                            │
└───────────────────────────┬────────────────────────────┘
                            │ composes
┌───────────────────────────▼────────────────────────────┐
│ Feature Components (features/<name>/components/)       │
└───────────────────────────┬────────────────────────────┘
                            │ composes
┌───────────────────────────▼────────────────────────────┐
│ Shared Layouts & Components (shared/components/)       │
└───────────────────────────┬────────────────────────────┘
                            │ composes
┌───────────────────────────▼────────────────────────────┐
│ Reusable UI Primitives (shared/components/ui/)         │
└────────────────────────────────────────────────────────┘
```

### 4.1 Reusable UI Primitives (`shared/components/ui/`)

- **Purpose**: Generic, feature-agnostic atomic design elements (e.g. Button, Input, Checkbox, Dropdown, Modal, Badge).
- **Rules**:
  1. Use `React.forwardRef` where DOM node access is standard (buttons, inputs, select).
  2. Define an explicit `displayName` (e.g. `Button.displayName = "Button"`).
  3. Extend standard HTML attribute interfaces (e.g. `React.ButtonHTMLAttributes<HTMLButtonElement>`).
  4. Encapsulate styling in dictionary objects (`variantClasses`, `sizeClasses`) and merge them via `cn(..., className)`.
  5. Provide `isLoading`, `size`, `variant`, `leftIcon`, and `rightIcon` props when appropriate.
  6. **Always** register and re-export new UI primitives in `shared/components/ui/index.ts`.

#### Boilerplate for a Reusable UI Component:

```tsx
import React, { forwardRef } from "react";
import { cn } from "@/shared/utils/cn";

export type BadgeVariant = "default" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800 border-gray-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { children, variant = "default", size = "md", className, ...props },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border font-medium",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
export default Badge;
```

### 4.2 Shared Layouts (`shared/components/layouts/`)

- **Purpose**: Page shells, responsive containers, persistent sidebars, and top navigation bars shared across multiple routes or features.
- **Rules**:
  - Accept `children: React.ReactNode` and slot props (e.g. `headerActions?: React.ReactNode`).
  - Do not tightly bind to specific feature business logic; inject user profile or navigation items via props or general hooks.

### 4.3 Shared Composite Components (`shared/components/`)

- **Purpose**: Cross-feature reusable widgets (e.g. `confirm-dialog.tsx`, `empty-state.tsx`, `page-header.tsx`, `error-boundary.tsx`).
- **Rules**:
  - Use when a pattern is repeated across at least two different features.
  - Rely only on `shared/` dependencies.

### 4.4 Feature Components (`features/<feature-name>/components/`)

- **Purpose**: Domain-specific UI elements that implement specific business requirements (e.g. `login-form.tsx`, `project-card.tsx`, `billing-modal.tsx`).
- **Organization**:
  - `components/providers/`: Context providers that manage feature state (e.g. `auth-provider.tsx`).
  - `components/forms/`: Form assemblies with validation (e.g. `login-form.tsx`).
  - `components/`: Cards, tables, modals, list items.
- **Encapsulation**:
  - Feature components must **never** be imported via relative internal paths by other features. Only import from `@/features/<feature-name>` if exported through the feature's `index.ts`.

---

## 5. API Calling Flow Using Services

All backend API requests follow a unified flow using the centralized `apiClient`.

```
┌────────────────────────────────────────┐
│ UI Component / Page / Hook             │
└───────────────────┬────────────────────┘
                    │ calls
┌───────────────────▼────────────────────┐
│ Feature Service (e.g. auth.service.ts) │
└───────────────────┬────────────────────┘
                    │ calls
┌───────────────────▼────────────────────┐
│ Central ApiClient (api-client.ts)      │
│ - Credentials: "include" (HttpOnly)    │
│ - Auto 401 Session Handling            │
│ - Envelope Parsing (ApiResponse<T>)    │
└───────────────────┬────────────────────┘
                    │ fetch()
┌───────────────────▼────────────────────┐
│ Backend API (FastAPI / dev-nest-api)   │
└────────────────────────────────────────┘
```

### 5.1 Response Envelope & Error Handling

Backend endpoints return the standard envelope defined in `shared/types/api.ts`:

```ts
export interface ApiResponse<T = unknown> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
}
```

The `ApiClient` automatically:

1. Attaches `credentials: "include"` for HttpOnly cookie sessions (`session_id`).
2. Checks HTTP status and `responseData.success`.
3. Throws an `ApiError` instance if the request fails:
   - `error.isUnauthorized()` (401)
   - `error.isForbidden()` (403)
   - `error.isValidationError()` (422)
4. Redirects to `/auth/login` on 401 unless the request was sent with `skipAuthRedirect: true` or is an auth endpoint.

### 5.2 Creating a Feature Service

1. **Define Types** in `features/<feature>/types.ts`.
2. **Implement Service** in `features/<feature>/services/<feature>.service.ts` using static methods.
3. **Unwrap or Validate** `response.data`.

#### Service Implementation Example:

```ts
// features/projects/services/projects.service.ts
import { apiClient } from "@/shared/services/api-client";
import { Project, CreateProjectRequest, UpdateProjectRequest } from "../types";

export class ProjectsService {
  /**
   * Fetch all projects for the current user.
   */
  public static async getProjects(): Promise<Project[]> {
    const response = await apiClient.get<Project[]>("/api/projects");
    return response.data ?? [];
  }

  /**
   * Fetch single project by ID.
   */
  public static async getProjectById(id: string): Promise<Project> {
    const response = await apiClient.get<Project>(`/api/projects/${id}`);
    if (!response.data) {
      throw new Error(response.message || "Project not found");
    }
    return response.data;
  }

  /**
   * Create a new project.
   */
  public static async createProject(
    data: CreateProjectRequest
  ): Promise<Project> {
    const response = await apiClient.post<Project>("/api/projects", data);
    if (!response.data) {
      throw new Error(response.message || "Failed to create project");
    }
    return response.data;
  }

  /**
   * Update an existing project.
   */
  public static async updateProject(
    id: string,
    data: UpdateProjectRequest
  ): Promise<Project> {
    const response = await apiClient.patch<Project>(
      `/api/projects/${id}`,
      data
    );
    if (!response.data) {
      throw new Error(response.message || "Failed to update project");
    }
    return response.data;
  }

  /**
   * Delete a project.
   */
  public static async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/api/projects/${id}`);
  }
}
```

---

## 6. Feature Hooks & State Management

Hooks bridge the UI components with feature services, caching, and state management.

### 6.1 Pattern A: Feature Context Hook (`use-<feature>.tsx`)

Used when state must be globally or sub-tree shared (e.g. `useAuth`).

```tsx
// features/authentication/hooks/use-auth.tsx
"use client";

import { useContext } from "react";
import { AuthContext } from "../components/providers/auth-provider";
import { AuthContextValue } from "../types";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

### 6.2 Pattern B: Data Fetching / Mutation Hook (`use-<feature>-data.ts`)

Used for encapsulated async data fetching, pagination, and local state mutations.

#### ⚠️ Critical Rule: In-Place State Mutation Over Blanket Refetching

When any action/mutation succeeds (create, update, delete, status toggle), **do NOT trigger a full list re-fetch (`refetch()`) from the API**. Blanket re-fetching causes redundant network round trips, extra server load, and noticeable UI flickering or loading spinners.

Instead, follow this two-part strategy:

1. **Align Backend API Response (`dev-nest-api/app`)**:
   - Backend mutation endpoints in `dev-nest-api/app/modules/<module>` must return the updated or created entity inside the `StandardResponse` data payload (`ok(data=updated_item)` or `created(data=new_item)`).
   - **Instruction for Agents**: If a mutation endpoint currently returns `None` or just a generic status message (`{"message": "Success"}`), **update the backend endpoint/schema in `dev-nest-api/app`** to return the complete entity representation required by the frontend instead of forcing a secondary `GET` request.

2. **Update Local State Directly**:
   - **Insert (Create)**: Prepend or insert the newly returned item into the state array:
     ```ts
     setProjects((prev) => [newProject, ...prev]);
     ```
   - **Update (Edit / Status Change)**: Replace the matching item in-place using its identifier:
     ```ts
     setProjects((prev) =>
       prev.map((item) =>
         item.id === updatedProject.id ? updatedProject : item
       )
     );
     ```
   - **Delete (Remove)**: Filter out the deleted item by ID:
     ```ts
     setProjects((prev) => prev.filter((item) => item.id !== id));
     ```
   - Reserve `refetch()` strictly for manual user refreshes, filter/sort changes, or initial loads.

```ts
// features/projects/hooks/use-projects.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { Project, CreateProjectRequest, UpdateProjectRequest } from "../types";
import { ProjectsService } from "../services/projects.service";
import { ApiError } from "@/shared/types";

export interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load or manual refresh
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ProjectsService.getProjects();
      setProjects(data);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load projects";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // INSERT: Add newly created entity to local state (no refetch)
  const createProject = async (
    data: CreateProjectRequest
  ): Promise<Project> => {
    const newProject = await ProjectsService.createProject(data);
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  // UPDATE: Replace matching item in-place using API response (no refetch)
  const updateProject = async (
    id: string,
    data: UpdateProjectRequest
  ): Promise<Project> => {
    const updatedProject = await ProjectsService.updateProject(id, data);
    setProjects((prev) =>
      prev.map((item) => (item.id === id ? updatedProject : item))
    );
    return updatedProject;
  };

  // DELETE: Filter out deleted item from local state (no refetch)
  const deleteProject = async (id: string): Promise<void> => {
    await ProjectsService.deleteProject(id);
    setProjects((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
```

---

## 7. Scaffolding a New Feature (Step-by-Step Workflow)

When building a new feature in `dev-nest-app`, follow these exact steps:

### Step 1: Copy Scaffold from `features/_template`

Create a new folder: `features/<feature-name>/`:

```
features/<feature-name>/
├── components/
├── hooks/
├── services/
├── index.ts
└── types.ts
```

### Step 2: Define Contracts in `types.ts`

Define request payloads, response entities, and state types matching the backend schemas.

### Step 3: Implement Service in `services/<feature-name>.service.ts`

Create static methods wrapping `apiClient.get()`, `apiClient.post()`, etc.

### Step 4: Create Custom Hooks / Provider

Implement `hooks/use-<feature-name>.ts` or `components/providers/<feature-name>-provider.tsx`.

### Step 5: Build Feature Components

Create presentation and container components in `components/`.

### Step 6: Export Public Interface in `index.ts`

Export all types, services, hooks, and public components:

```ts
// features/<feature-name>/index.ts
export * from "./types";
export * from "./services/<feature-name>.service";
export * from "./hooks/use-<feature-name>";
export * from "./components/<feature-name>-card";
```

### Step 7: Compose in App Router Page

Import from `@/features/<feature-name>` and render in `app/(group)/<route>/page.tsx`.

### Step 8: Update Route Protection in `proxy.ts` (if needed)

If the new feature introduces new protected or guest-only URL paths:

- Add protected paths to `PROTECTED_PREFIXES` in `proxy.ts`.
- Add guest-only paths to `GUEST_ONLY_ROUTES` in `proxy.ts`.

---

## 8. Best Practices & Rules of Engagement

1. **Path Aliases**:
   - Always use `@/` alias (e.g. `@/shared/components/ui`, `@/features/authentication`).
   - Never use deep relative climbing (e.g. `../../../shared/components`).

2. **Server vs. Client Components**:
   - Default to Server Components for static shells and data displays.
   - Add `"use client"` directive **only** when using React hooks (`useState`, `useEffect`, `useContext`), event listeners (`onClick`, `onChange`), or browser APIs.

3. **Form Handling with Unified Object State**:
   - **Do NOT create separate `useState` for each input**: Avoid declaring fragmented state hooks like `const [email, setEmail] = useState("")` and `const [password, setPassword] = useState("")`.
   - **Use a Single `formData` Object**: Group all related form values into a single state object initialized with type-safe defaults matching the feature schema.
   - **Implement Unified `handleInputChange`**: Use a generic change handler that extracts `name`, `value`, `type`, and `checked` from `e.target`, dynamically updates `formData`, and automatically clears existing validation errors as the user edits:
     ```tsx
     const [formData, setFormData] = useState({
       email: "",
       password: "",
       rememberMe: false,
     });

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const { name, value, type, checked } = e.target;
       setFormData((prev) => ({
         ...prev,
         [name]: type === "checkbox" ? checked : value,
       }));

       // Clear specific input validation error
       if (errors[name as keyof typeof errors]) {
         setErrors((prev) => {
           const newErrors = { ...prev };
           delete newErrors[name as keyof typeof errors];
           return newErrors;
         });
       }

       // Clear general form banner error
       if (errors.general) {
         setErrors((prev) => {
           const newErrors = { ...prev };
           delete newErrors.general;
           return newErrors;
         });
       }
     };
     ```

4. **Validation with Zod**:
   - All forms must validate the entire `formData` object using `zod` (`schema.parse(formData)`) inside `handleSubmit` before submitting to API services.
   - Infer types directly using `z.infer<typeof schema>`.

5. **Tailwind CSS v4 & Styling**:
   - Use standard Tailwind utility classes.
   - Combine dynamic classes exclusively via `cn(...)` from `@/shared/utils/cn`.
   - Prefer responsive utilities (`sm:`, `md:`, `lg:`) over custom media queries.
   - **Prefer Standard Classes Over Arbitrary Values**: Always check if a standard Tailwind class exists before using arbitrary value brackets (`[...]`) to avoid lint warnings and keep the bundle consistent:
     - ❌ `text-[12px]` → ✅ `text-xs`
     - ❌ `p-[16px]` → ✅ `p-4`
     - ❌ `w-[100%]` → ✅ `w-full`
     - ❌ `rounded-[8px]` → ✅ `rounded-lg`
     - Only use arbitrary values (`w-[342px]`, `grid-cols-[1fr_200px]`, etc.) when no built-in Tailwind class satisfies the exact design requirement.

6. **Security & Session Management**:
   - Never store access tokens in `localStorage` or `sessionStorage`. All auth cookies are HttpOnly and managed automatically by the backend and `proxy.ts`.
   - Use `AUTH_COOKIES` constants for cookie key names.

7. **Pre-Completion Verification**:
   - Before completing your task, verify the project builds and lints cleanly:
     - Run `npm run lint` or `npm run build` to catch type or lint regressions.
