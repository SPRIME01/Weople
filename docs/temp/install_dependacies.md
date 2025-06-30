Based on the comprehensive technical specification document for Weople, here are all the dependencies converted to pnpm commands:

## Prerequisites (Install First)

1. **Node.js 20.18.0+ LTS** (install from nodejs.org)
2. **pnpm 8.0.0+** (install with `npm install -g pnpm`)
3. **Git** (for version control)
4. **Docker Desktop** (required for Supabase Edge Functions development)

## Setup pnpm Global Directory

```bash
pnpm setup
```

_This fixes the global bin directory error you encountered_

## Global CLI Tools (Install First)

```bash
pnpm add -g @supabase/cli
pnpm add -g vercel
pnpm add -g @expo/eas-cli
```

## Core Framework Dependencies

### Web Application Dependencies

```bash
pnpm add @sveltejs/kit@^2.15.0
pnpm add svelte@^5.28.0
pnpm add @sveltejs/vite-plugin-svelte@^4.0.0
pnpm add vite@^5.4.0
pnpm add typescript@^5.6.0
```

### UI and Styling

```bash
pnpm add tailwindcss@^4.0.0
pnpm add daisyui@^5.0.0
pnpm add @tailwindcss/typography
pnpm add autoprefixer
pnpm add postcss
```

### Backend Integration (Supabase)

```bash
pnpm add @supabase/supabase-js@latest
pnpm add @supabase/auth-js@^2.65.0
pnpm add @supabase/realtime-js@^2.10.0
pnpm add @supabase/postgrest-js@^1.16.0
```

### AI Integration

```bash
pnpm add @openai/api@^4.67.0
pnpm add openai@^4.67.0
```

## Mobile Application Dependencies

```bash
pnpm add expo@~53.0.0
pnpm add react-native@^0.79.0
pnpm add @expo/vector-icons@^14.0.0
pnpm add react-native-elements@latest
```

## Development Dependencies

```bash
pnpm add -D @types/node
pnpm add -D eslint
pnpm add -D eslint-plugin-svelte@^3.0.0
pnpm add -D prettier
pnpm add -D prettier-plugin-svelte
pnpm add -D @typescript-eslint/eslint-plugin
pnpm add -D @typescript-eslint/parser
```

## Testing Dependencies

```bash
pnpm add -D vitest@^3.0.0
pnpm add -D @vitest/coverage-v8
pnpm add -D @testing-library/svelte
pnpm add -D @testing-library/react-native
pnpm add -D @testing-library/jest-dom
pnpm add -D playwright
pnpm add -D jsdom
```

## Installation Order

1. **System Prerequisites**

   ```bash
   # Install Node.js 20.18.0+ LTS from nodejs.org
   # Install pnpm: npm install -g pnpm
   # Install Docker Desktop
   # Install Git
   ```

2. **Setup pnpm**

   ```bash
   pnpm setup
   ```

3. **Global CLI Tools**

   ```bash
   pnpm add -g @supabase/cli
   pnpm add -g vercel
   pnpm add -g @expo/eas-cli
   ```

4. **Initialize Project Structure**

   ```bash
   pnpm create svelte@latest weople-web
   cd weople-web
   pnpm install
   ```

5. **Core Dependencies** (run in project directory)

   ```bash
   # Install all the dependencies listed above in order
   ```

6. **Database Setup**

   ```bash
   supabase init
   supabase start
   # PostgreSQL 17+ with pgvector 0.8.0+ will be set up automatically
   ```

7. **Mobile App Setup** (in separate directory)
   ```bash
   pnpm create expo-app weople-mobile --template
   cd weople-mobile
   # Install React Native and Expo dependencies
   ```

## Special Notes

- **pnpm Workspace Configuration**: Consider setting up a pnpm workspace for the monorepo structure:

**pnpm-workspace.yaml**

```yaml
packages:
  - 'weople-web'
  - 'weople-mobile'
  - 'packages/*'
```

- **Version constraints**: The project requires specific minimum versions:

  - Svelte 5.28.0+ for partial expression evaluation
  - pgvector 0.8.0+ for iterative index scanning
  - OpenAI API 4.67.0+ for o3/o4-mini model support

- **PostgreSQL with pgvector**: Handled automatically by Supabase
- **Docker Desktop**: Required for Supabase Edge Functions development

The dependencies should be installed in the order listed above, as some tools depend on others being available first (e.g., Supabase CLI needs to be installed before initializing the project). Using pnpm will provide faster installs, better disk space efficiency, and strict dependency resolution compared to npm.
