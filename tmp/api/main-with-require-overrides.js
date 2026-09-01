
/**
 * IMPORTANT: Do not modify this file.
 * This file allows the app to run without bundling in workspace libraries.
 * Must be contained in the ".nx" folder inside the output path.
 */
const Module = require('module');
const path = require('path');
const fs = require('fs');
const originalResolveFilename = Module._resolveFilename;
const distPath = __dirname;
const manifest = [{"module":"@weople/mobile/feature-analytics","exactMatch":"apps/mobile/feature-analytics/src/index.js","pattern":"apps/mobile/feature-analytics/src/index.ts"},{"module":"@weople/mobile/feature-contacts","exactMatch":"apps/mobile/feature-contacts/src/index.js","pattern":"apps/mobile/feature-contacts/src/index.ts"},{"module":"@weople/mobile/feature-generosity","exactMatch":"apps/mobile/feature-generosity/src/index.js","pattern":"apps/mobile/feature-generosity/src/index.ts"},{"module":"@weople/mobile/feature-interactions","exactMatch":"apps/mobile/feature-interactions/src/index.js","pattern":"apps/mobile/feature-interactions/src/index.ts"},{"module":"@weople/mobile/feature-opportunities","exactMatch":"apps/mobile/feature-opportunities/src/index.js","pattern":"apps/mobile/feature-opportunities/src/index.ts"},{"module":"@weople/mobile/testing","exactMatch":"apps/mobile/testing/src/index.js","pattern":"apps/mobile/testing/src/index.ts"},{"module":"@weople/shared/data-access","exactMatch":"libs/shared/data-access/src/index.js","pattern":"libs/shared/data-access/src/index.ts"},{"module":"@weople/shared/dev-tools","exactMatch":"libs/shared/dev-tools/src/index.js","pattern":"libs/shared/dev-tools/src/index.ts"},{"module":"@weople/shared/monitoring","exactMatch":"libs/shared/monitoring/src/index.js","pattern":"libs/shared/monitoring/src/index.ts"},{"module":"@weople/shared/performance","exactMatch":"libs/shared/performance/src/index.js","pattern":"libs/shared/performance/src/index.ts"},{"module":"@weople/shared/testing","exactMatch":"libs/shared/testing/src/index.js","pattern":"libs/shared/testing/src/index.ts"},{"module":"@weople/shared/types","exactMatch":"libs/shared/types/src/index.js","pattern":"libs/shared/types/src/index.ts"},{"module":"@weople/shared/ui","exactMatch":"libs/shared/ui/src/index.js","pattern":"libs/shared/ui/src/index.ts"},{"module":"@weople/shared/utils","exactMatch":"libs/shared/utils/src/index.js","pattern":"libs/shared/utils/src/index.ts"},{"module":"@weople/tools/generators","exactMatch":"libs/tools/generators/src/index.js","pattern":"libs/tools/generators/src/index.ts"},{"module":"@weople/tools/infra","exactMatch":"libs/tools/infra/src/index.js","pattern":"libs/tools/infra/src/index.ts"},{"module":"@weople/web/feature-ai","exactMatch":"apps/web/feature-ai/src/index.js","pattern":"apps/web/feature-ai/src/index.ts"},{"module":"@weople/web/feature-analytics","exactMatch":"apps/web/feature-analytics/src/index.js","pattern":"apps/web/feature-analytics/src/index.ts"},{"module":"@weople/web/feature-auth","exactMatch":"apps/web/feature-auth/src/index.js","pattern":"apps/web/feature-auth/src/index.ts"},{"module":"@weople/web/feature-contacts","exactMatch":"libs/web/feature-contacts/src/index.js","pattern":"libs/web/feature-contacts/src/index.ts"},{"module":"@weople/web/feature-followups","exactMatch":"apps/web/feature-followups/src/index.js","pattern":"apps/web/feature-followups/src/index.ts"},{"module":"@weople/web/feature-generosity","exactMatch":"apps/web/feature-generosity/src/index.js","pattern":"apps/web/feature-generosity/src/index.ts"},{"module":"@weople/web/feature-health","exactMatch":"apps/web/feature-health/src/index.js","pattern":"apps/web/feature-health/src/index.ts"},{"module":"@weople/web/feature-interactions","exactMatch":"apps/web/feature-interactions/src/index.js","pattern":"apps/web/feature-interactions/src/index.ts"},{"module":"@weople/web/feature-network","exactMatch":"apps/web/feature-network/src/index.js","pattern":"apps/web/feature-network/src/index.ts"},{"module":"@weople/web/feature-offline","exactMatch":"apps/web/feature-offline/src/index.js","pattern":"apps/web/feature-offline/src/index.ts"},{"module":"@weople/web/feature-opportunities","exactMatch":"apps/web/feature-opportunities/src/index.js","pattern":"apps/web/feature-opportunities/src/index.ts"},{"module":"@weople/web/feature-settings","exactMatch":"apps/web/feature-settings/src/index.js","pattern":"apps/web/feature-settings/src/index.ts"},{"module":"@weople/web/feature-social","exactMatch":"apps/web/feature-social/src/index.js","pattern":"apps/web/feature-social/src/index.ts"},{"module":"@weople/web/feature-tags","exactMatch":"apps/web/feature-tags/src/index.js","pattern":"apps/web/feature-tags/src/index.ts"},{"module":"@weople/web/testing","exactMatch":"apps/web/testing/src/index.js","pattern":"apps/web/testing/src/index.ts"}];

Module._resolveFilename = function(request, parent) {
  let found;
  for (const entry of manifest) {
    if (request === entry.module && entry.exactMatch) {
      const entry = manifest.find((x) => request === x.module || request.startsWith(x.module + "/"));
      const candidate = path.join(distPath, entry.exactMatch);
      if (isFile(candidate)) {
        found = candidate;
        break;
      }
    } else {
      const re = new RegExp(entry.module.replace(/\*$/, "(?<rest>.*)"));
      const match = request.match(re);

      if (match?.groups) {
        const candidate = path.join(distPath, entry.pattern.replace("*", ""), match.groups.rest);
        if (isFile(candidate)) {
          found = candidate;
        }
      }

    }
  }
  if (found) {
    const modifiedArguments = [found, ...[].slice.call(arguments, 1)];
    return originalResolveFilename.apply(this, modifiedArguments);
  } else {
    return originalResolveFilename.apply(this, arguments);
  }
};

function isFile(s) {
  try {
    require.resolve(s);
    return true;
  } catch (_e) {
    return false;
  }
}

// Call the user-defined main.
module.exports = require('./apps/api/src/main.js');
