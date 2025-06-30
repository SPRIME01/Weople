# Nx Feature Library Generation Plan

## 1. Objectives

- Generate 12 Svelte feature libraries for web
- Generate 7 React-Native feature libraries for mobile
- Ensure proper configuration in:
  - `tsconfig.base.json`
  - Nx project configuration
  - Test runners (Vitest/Jest)

## 2. Pre-requisite Checks

- [ ] Verify `@nx/svelte` plugin version
- [ ] Verify `@nx/react-native` plugin version
- [ ] Confirm target directories don't conflict with existing:
  - `apps/web/feature-*`
  - `apps/mobile/feature-*`
- [ ] Check TypeScript path resolution for new scopes:
  - `@weople/web/*`
  - `@weople/mobile/*`

## 3. Generation Commands

### Web Libraries (Svelte)

```bash
npx nx g @nx/svelte:lib feature-contacts --directory=apps/web/feature-contacts --importPath=@weople/web/feature-contacts --buildable --style=css --unitTestRunner=vitest --strict --tags=type:feature,scope:web,domain:contacts
# ... (all 12 commands)
```

### Mobile Libraries (React-Native)

```bash
npx nx g @nx/react-native:lib feature-auth --directory=apps/mobile/feature-auth --importPath=@weople/mobile/feature-auth --buildable --unitTestRunner=jest --strict --tags=type:feature,scope:mobile,domain:auth
# ... (all 7 commands)
```

## 4. Post-Generation Steps

- [ ] Verify `tsconfig.base.json` paths updated:
  ```json
  "paths": {
    "@weople/web/*": ["apps/web/feature-*/src/index.ts"],
    "@weople/mobile/*": ["apps/mobile/feature-*/src/index.ts"]
  }
  ```
- [ ] Confirm buildable configurations in `project.json` files
- [ ] Validate test runners are properly configured

## 5. Risk Mitigation

- **Conflict Resolution**: Skip existing directories
- **Error Handling**: Execute commands sequentially with validation after each
- **Rollback**: Git commit before generation for easy revert

## 6. Verification Checklist

- [ ] All libraries created in correct locations
- [ ] Import paths resolve in sample components
- [ ] All tests pass via `nx affected:test`
