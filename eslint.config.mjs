import { createRequire } from "node:module";
import { register } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve the exact path that eslint-config-next will try to require
const patchPath = require.resolve("@rushstack/eslint-patch/modern-module-resolution", {
  paths: [require.resolve("eslint-config-next")],
});

// Register our stub to intercept that require — needs file:// URLs
register(
  pathToFileURL(resolve(__dirname, "eslint-patch-stub.cjs")),
  pathToFileURL(patchPath)
);

// Now safe to import FlatCompat and eslint-config-next
import { defineConfig } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  ...compat.extends("next"),
]);
