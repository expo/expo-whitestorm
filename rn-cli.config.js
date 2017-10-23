module.exports = {
  getTransformModulePath() {
    return require.resolve('./scripts/transformer');
  },

  getEnableBabelRCLookup() {
    return false;
  },
};
