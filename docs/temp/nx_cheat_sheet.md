## Nx Post-Generation Checklist: Apps & Libs

After generating an **Nx app** or **lib**, follow these steps to ensure your project is well-structured, maintainable, and ready for development:

### 1. Review and Organize Directory Structure

- Ensure the generated files are in the correct location (e.g., `apps/your-app/`, `libs/your-lib/`).
- For apps, keep the app as lightweight as possible—move reusable logic to libs.
- For libs, group related code together for easier maintenance.

### 2. Update `project.json`

- **Apps:**
  - Add or adjust `build`, `serve`, `test`, `lint`, and custom targets as needed.
  - Example (for a Node/Edge app):
    ```json
    {
      "targets": {
        "build": {
          "executor": "@nx/node:build",
          "options": {
            "outputPath": "dist/apps/api",
            "main": "apps/api/src/main.ts",
            "tsConfig": "apps/api/tsconfig.app.json"
          }
        },
        "serve": {
          "executor": "@nx/node:execute",
          "options": {
            "buildTarget": "api:build"
          }
        }
      },
      "tags": ["type:app", "scope:api", "domain:edge-functions"]
    }
    ```
- **Libs:**
  - Ensure the output path and entry points are correct.
  - Example:
    ```json
    {
      "targets": {
        "build": {
          "executor": "@nx/js:build",
          "options": {
            "outputPath": "dist/libs/shared/data-access",
            "main": "libs/shared/data-access/src/index.ts",
            "tsConfig": "libs/shared/data-access/tsconfig.lib.json"
          }
        }
      },
      "tags": ["type:lib", "scope:shared", "domain:data-access"]
    }
    ```

### 3. Configure TypeScript

- Update or verify `tsconfig.json` and `tsconfig.lib.json`/`tsconfig.app.json` for correct paths and strictness.
- Example (`tsconfig.app.json` for an app):
  ```json
  {
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "outDir": "../../dist/out-tsc",
      "strict": true
    },
    "include": ["src/**/*.ts"]
  }
  ```
- For shared types or utilities, add path aliases in `tsconfig.base.json`:
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@weople/shared/types": ["libs/shared/types/src/index.ts"]
      }
    }
  }
  ```

### 4. Add Documentation

- Create or update a `README.md` in the app/lib root to describe its purpose, usage, and owners.
- Example section:

  ```md
  # @weople/shared/data-access

  Provides API clients and data access utilities for all Weople apps.

  ## Usage

  import { supabaseClient } from '@weople/shared/data-access';
  ```

### 5. Set Up Testing

- Ensure the correct test runner is configured (e.g., Jest, Vitest).
- Example (`jest.config.ts`):
  ```ts
  export default {
    displayName: 'shared-data-access',
    preset: '../../jest.preset.cjs',
    testEnvironment: 'node',
    transform: {
      '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/libs/shared/data-access',
  };
  ```
- Add sample or real tests in the `src/` directory.

### 6. Linting & Formatting

- Check that linting is set up (see `eslint.config.mjs` or similar).
- Example (add to `eslint.config.mjs`):
  ```js
  module.exports = {
    extends: ['../../.eslintrc.base.js'],
    rules: {
      // custom rules here
    },
  };
  ```

### 7. Ownership & Access

- Optionally, update or create a `CODEOWNERS` file to define who maintains the project.
- Example:
  ```
  /libs/shared/data-access/ @your-github-username
  ```

### 8. Dependency Management

- Use tags and Nx dependency constraints to control which projects can depend on each other.
- Example (in `nx.json`):
  ```json
  {
    "projects": {
      "shared-data-access": {
        "tags": ["type:lib", "scope:shared", "domain:data-access"]
      }
    },
    "implicitDependencies": {}
  }
  ```
- Keep apps thin; put most logic in libs for better reuse and testability.

### 9. Customization for Special Runtimes (e.g., Supabase Edge Functions)

- For edge/serverless apps, update build targets and directory structure to match your deployment platform (e.g., move functions to `functions/`, adjust output for Deno/Supabase).
- Add any required configuration files for your platform (e.g., `supabase/config.toml`).

### 10. Keep Architecture Up-to-Date

- Use `nx graph` to visualize dependencies and keep your architecture documentation current.

---

**Tip:** Use Nx generators for consistent code structure and automation. Document any manual steps in the project README for future contributors.
