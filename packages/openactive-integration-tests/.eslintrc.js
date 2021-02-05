module.exports = {
  "extends": "airbnb-base",
  "env": {
    "node": true,
    "jest": true
  },
  "globals": {
    "expectAsync": true
  },
  // This is unfortunately required in order for eslint to understand class field
  // declarations (like we use in flow-helper and flow-stages, `run = pMemoize(..)`).
  // This is because field declarations are not yet fully accepted into ECMAScript,
  // though they are natively supported in Node v12.
  "parser": "babel-eslint",
  "rules": {
    "object-curly-newline": ["error", {
        "ObjectExpression": { "multiline": true, "minProperties": 3, "consistent": true },
        "ObjectPattern": { "multiline": true, "consistent": true },
        "ImportDeclaration": "never",
        "ExportDeclaration": { "multiline": true, "minProperties": 3, "consistent": true }
    }],
    "max-len": "off",
    "no-await-in-loop": "off",
    "no-console": "off",
    "no-restricted-syntax": "off",
    "func-names": "off",
    "no-return-await": "off",
    "prefer-arrow-callback": "off",
    "class-methods-use-this": [
      "error",
      {
        "exceptMethods": [
        ]
      }
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        "devDependencies": [
          "**/*-test.js"
        ]
      }
    ],
    "no-underscore-dangle": "off"
  }
}