#!/bin/bash

# Install required plugins if missing
if ! npm list @nx/react-native &> /dev/null; then
  npm install -D @nx/react-native
fi

# Generate web feature libraries using @nx/js:library with Vite bundler
npx nx g @nx/js:lib apps/web/feature-interactions --name=web-feature-interactions --importPath=@weople/web/feature-interactions --bundler=vite --unitTestRunner=vitest --strict --tags=type:feature,scope:web,domain:interactions --projectNameAndRootFormat=as-provided
npx nx g @nx/js:lib apps/web/feature-followups --name=web-feature-followups --importPath=@weople/web/feature-followups --bundler=vite --unitTestRunner=vitest --strict --tags=type:feature,scope:web,domain:followups --projectNameAndRootFormat=as-provided
npx nx g @nx/js:lib apps/web/feature-opportunities --name=web-feature-opportunities --importPath=@weople/web/feature-opportunities --bundler=vite --unitTestRunner=vitest --strict --tags=type:feature,scope:web,domain:opportunities --projectNameAndRootFormat=as-provided
npx nx g @nx/js:lib apps/web/feature-analytics --name=web-feature-analytics --importPath=@weople/web/feature-analytics --bundler=vite --unitTestRunner=vitest --strict --tags=type:feature,scope:web,domain:analytics --projectNameAndRootFormat=as-provided
npx nx g @nx/js:lib apps/web/feature-generosity --name=web-feature-generosity --importPath=@weople/web/feature-generosity --bundler=vite --unitTestRunner=vitest --strict --tags=type:feature,scope:web,domain:generosity --projectNameAndRootFormat=as-provided
npx nx g @nx/js:lib apps/web/feature-tags --name=web-feature-tags --importPath=@weople/web/feature-tags --bundler=vite --unitTestRunner=vitest --strict --tags=type:feature,scope:web,domain:tags --projectNameAndRootFormat=as-provided
npx nx g @nx/js:lib apps/web/feature-health --name=web-feature-health --importPath=@weople/web/feature-health --bundler=vite --unitTestRunner=vitest --strict --tags=type:feature,scope:web,domain:health --projectNameAndRootFormat=as-provided
npx nx g @nx/js:lib apps/web/feature-social --name=web-feature-social --importPath=@weople/web/feature-social --bundler=vite --unitTestRunner=vitest --strict --tags=type:feature,scope:web,domain:social --projectNameAndRootFormat=as-provided
npx nx g @nx/js:lib apps/web/feature-ai --name=web-feature-ai --importPath=@weople/web/feature-ai --bundler=vite --unitTestRunner=vitest --strict --tags=type:feature,scope:web,domain:ai --projectNameAndRootFormat=as-provided
npx nx g @nx/js:lib apps/web/feature-network --name=web-feature-network --importPath=@weople/web/feature-network --bundler=vite --unitTestRunner=vitest --strict --tags=type:feature,scope:web,domain:network --projectNameAndRootFormat=as-provided
npx nx g @nx/js:lib apps/web/feature-settings --name=web-feature-settings --importPath=@weople/web/feature-settings --bundler=vite --unitTestRunner=vitest --strict --tags=type:feature,scope:web,domain:settings --projectNameAndRootFormat=as-provided
npx nx g @nx/js:lib apps/web/feature-offline --name=web-feature-offline --importPath=@weople/web/feature-offline --bundler=vite --unitTestRunner=vitest --strict --tags=type:feature,scope:web,domain:offline --projectNameAndRootFormat=as-provided

# Generate mobile feature libraries
npx nx g @nx/react-native:lib apps/mobile/feature-auth --name=mobile-feature-auth --importPath=@weople/mobile/feature-auth --buildable --unitTestRunner=jest --strict --tags=type:feature,scope:mobile,domain:auth --projectNameAndRootFormat=as-provided
npx nx g @nx/react-native:lib apps/mobile/feature-contacts --name=mobile-feature-contacts --importPath=@weople/mobile/feature-contacts --buildable --unitTestRunner=jest --strict --tags=type:feature,scope:mobile,domain:contacts --projectNameAndRootFormat=as-provided
npx nx g @nx/react-native:lib apps/mobile/feature-interactions --name=mobile-feature-interactions --importPath=@weople/mobile/feature-interactions --buildable --unitTestRunner=jest --strict --tags=type:feature,scope:mobile,domain:interactions --projectNameAndRootFormat=as-provided
npx nx g @nx/react-native:lib apps/mobile/feature-followups --name=mobile-feature-followups --importPath=@weople/mobile/feature-followups --buildable --unitTestRunner=jest --strict --tags=type:feature,scope:mobile,domain:followups --projectNameAndRootFormat=as-provided
npx nx g @nx/react-native:lib apps/mobile/feature-opportunities --name=mobile-feature-opportunities --importPath=@weople/mobile/feature-opportunities --buildable --unitTestRunner=jest --strict --tags=type:feature,scope:mobile,domain:opportunities --projectNameAndRootFormat=as-provided
npx nx g @nx/react-native:lib apps/mobile/feature-analytics --name=mobile-feature-analytics --importPath=@weople/mobile/feature-analytics --buildable --unitTestRunner=jest --strict --tags=type:feature,scope:mobile,domain:analytics --projectNameAndRootFormat=as-provided



echo "All libraries generated successfully"
