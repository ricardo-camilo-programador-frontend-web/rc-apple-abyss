#!/usr/bin/env node
// Lint wrapper: patches @rushstack/eslint-patch before running ESLint.
// eslint-config-next requires @rushstack/eslint-patch which crashes with
// ESLint 9 flat config. We stub the require so eslint-config-next loads harmlessly.

const path = require("path");
const Module = require("module");

const projectRoot = path.dirname(__filename);
const stubPath = path.join(projectRoot, "eslint-patch-stub.cjs");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
  if (typeof request === "string" && request.startsWith("@rushstack/eslint-patch")) {
    return stubPath;
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// Now require and run eslint with CLI arguments
require(path.join(projectRoot, "node_modules", "eslint", "bin", "eslint.js"));
