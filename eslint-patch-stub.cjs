// Stub for @rushstack/eslint-patch/modern-module-resolution
// This is needed because eslint-config-next internally requires this module,
// but the patch crashes with ESLint 9 flat config ("calling module not recognized").
// Exporting empty object makes the require succeed harmlessly.
module.exports = {};
