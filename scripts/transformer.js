const MetroTransformer = require('metro-bundler/src/transformer');

exports.transform = function transform({ src, filename, options }) {
  if (/[\/\\]node_modules[\/\\](ammonext|lodash|three)[\/\\]/.test(filename)) {
    return {
      ast: null,
      code: src,
      filename,
      map: null,
    };
  } else {
    return MetroTransformer.transform({ src, filename, options });
  }
};
