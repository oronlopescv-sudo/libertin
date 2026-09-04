module.exports = {
  semi: true,
  trailingComma: "all",
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  endOfLine: "lf",
  overrides: [
    {
      files: "*.tsx",
      options: {
        parser: "babel-ts",
      },
    },
  ],
};
