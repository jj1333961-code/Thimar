# Tech Stack & Library Rules

## Tech Stack
- **Framework**: React with TypeScript
- **Routing**: React Router (routes kept in `src/App.tsx`)
- **Styling**: Tailwind CSS for all layout, spacing, colors, and design
- **Component library**: shadcn/ui (prebuilt components — import and use as-is, do not edit)
- **Icons**: `lucide-react`
- **Build tool**: Vite
- **Language**: TypeScript (strict)

## File Organization
- All source code lives in `src/`
- Pages go in `src/pages/`
- Reusable components go in `src/components/`
- The default page is `src/pages/Index.tsx` — **always update it when adding new components** so they are visible in the app

## Library Rules — What to Use for What

### UI Components
- **Always prefer shadcn/ui** for buttons, dialogs, forms, tables, dropdowns, tooltips, cards, etc.
- shadcn/ui files are preinstalled — do **not** reinstall them and do **not** edit their source. If you need to change behavior, wrap or compose them in a new component.

### Icons
- Use `lucide-react` for all icons. No other icon library.

### Styling
- Use **Tailwind utility classes** for everything visual.
- Avoid inline styles and CSS modules unless Tailwind genuinely cannot express the value.
- Use the shadcn/ui theme tokens (CSS variables) for colors so light/dark modes stay consistent.

### Routing
- Define and update routes in `src/App.tsx` using React Router.
- Add a new page under `src/pages/` and wire it up in `App.tsx`.

### Forms & Validation
- Use shadcn/ui form primitives together with `react-hook-form` and `zod` for schema validation.

### State & Data Fetching
- Local UI state: React `useState` / `useReducer`.
- Server state and caching: TanStack Query (`@tanstack/react-query`).
- Avoid introducing other state libraries (Redux, Zustand, MobX) unless explicitly requested.

### Dates, Numbers, Utilities
- Dates: `date-fns`.
- Class name composition: `clsx` + `tailwind-merge` (via the `cn` helper).
- Avoid pulling in lodash for single-use helpers — use native JS instead.

### Underlying Radix Primitives
- shadcn/ui already wraps Radix. **Do not add Radix UI packages directly** — go through shadcn/ui components so styling and accessibility stay consistent.

## General Rules
- Do not add features, refactors, or "improvements" beyond what was asked.
- Keep components small, focused, and reusable.
- Trust internal code; only validate at system boundaries (user input, external APIs).
- Never use placeholders, TODOs, or partial implementations — every feature must be fully functional.