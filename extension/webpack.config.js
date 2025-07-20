// This file is a wrapper around webpack.config.ts to maintain compatibility with existing scripts
// that expect a JavaScript webpack configuration file
require("ts-node").register({
  compilerOptions: {
    module: "commonjs",
    target: "es6",
    esModuleInterop: true,
  },
});

module.exports = require("./webpack.config.ts");
