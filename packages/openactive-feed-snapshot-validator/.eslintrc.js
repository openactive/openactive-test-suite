module.exports = {
  extends: 'airbnb-base',
  env: {
    node: true,
  },
  rules: {
    'no-await-in-loop': 'off',
    'no-console': 'off',
    'no-restricted-syntax': 'off',
    'no-use-before-define': ['error', { functions: false, classes: false }],
  },
};
