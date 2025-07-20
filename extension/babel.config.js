module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          chrome: "88",
          firefox: "78",
          opera: "74",
          edge: "88",
        },
        useBuiltIns: "usage",
        corejs: 3,
      },
    ],
    "@babel/preset-typescript",
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
  plugins: [
    "@babel/plugin-transform-class-properties",
    "@babel/plugin-transform-object-rest-spread",
    "@babel/plugin-transform-destructuring",
    "@babel/plugin-transform-runtime",
  ],
};
