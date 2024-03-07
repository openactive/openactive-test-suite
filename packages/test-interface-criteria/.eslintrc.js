module.exports = {
  extends: 'airbnb-base',
  plugins: ['jest'],
  env: {
    node: true,
    'jest/globals': true,
  },
  globals: {
    expectAsync: true,
  },
  rules: {
    'object-curly-newline': ['error', {
      ObjectExpression: {
        multiline: true, minProperties: 3, consistent: true,
      },
      ObjectPattern: { multiline: true, consistent: true },
      ImportDeclaration: 'never',
      ExportDeclaration: {
        multiline: true, minProperties: 3, consistent: true,
      },
    }],
    'no-use-before-define': ['error', { functions: false, classes: false }],
    'max-len': 'off',
    'no-await-in-loop': 0,
    'no-continue': 'off',
    'no-restricted-syntax': 0,
    'func-names': 'off',
    'prefer-arrow-callback': 'off',
    'class-methods-use-this': [
      'error',
      {
        exceptMethods: [
        ],
      },
    ],
  },
  parserOptions: {
    ecmaVersion: '2020',
  },
};
