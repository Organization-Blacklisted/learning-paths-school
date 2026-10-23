// svgo settings used for the site's SVGs (the header logo went from 219 KB to 130 KB with them, the same drawing: 51.7 dB when both are
// rendered at 4x). Path precision of 2 decimals; the viewBox and the ids are kept (the viewBox is needed to scale, the ids can be
// referenced by the page). Use: npx svgo@3 --config scripts/svgo.config.cjs input.svg -o output.svg
module.exports = {
  multipass: true,
  floatPrecision: 2,
  plugins: [{ name: "preset-default", params: { overrides: { removeViewBox: false, cleanupIds: false } } }],
};
