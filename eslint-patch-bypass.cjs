// Pre-load stub: hijacks Module._resolveFilename so that any CJS require()
// for @rushstack/eslint-patch/* resolves to our harmless stub instead.
// This must run BEFORE eslint-config-next is loaded.
const Module = require("module");
const path = require("path");
const stubPath = path.join(path.dirname(__filename), "eslint-patch-stub.cjs");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
  if (typeof request === "string" && request.startsWith("@rushstack/eslint-patch")) {
    return stubPath;
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};
