module.exports = {
  env: {
    browser: false,
    es2021: true,
    'jest/globals': true,
    node: true,
  },
  extends: 'airbnb-base',
  plugins: ['jest'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: "module"
  },
  rules: {
    "valid-jsdoc": ["error", {
      "requireReturn": true,
      "requireReturnType": true,
      "requireParamDescription": true,
      "requireReturnDescription": true,
      "preferType": {
        "String": "string",
        "object": "Object"
      }
    }],
    "require-jsdoc": ["warn", {
      "require": {
        "FunctionDeclaration": true,
        "MethodDefinition": true,
        "ClassDeclaration": true
      }
    }],
    "no-var": 1,
    "no-eval": "error",
    "indent": ["error", 2, { "SwitchCase": 1 }],
    "quotes": ["error", "single", {
      "avoidEscape": true,
      "allowTemplateLiterals": true
    }],
    "semi": ["error", "always"],
    "no-console": "warn",
    "space-before-function-paren": ["error", "always"],
    "padded-blocks": ["error", "never"],
    "prefer-arrow-callback": [0, { "allowNamedFunctions": true }],
    "func-names": ["error", "never"],
    "no-use-before-define": [
      "off", {
        "functions": false,
        "classes": true
      }
    ],
    "max-nested-callbacks": [
      "error",
      5
    ],
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error",
  },
};
