import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';

export default [
  {
    ignores: ['allure-report/**', 'allure-results/**', 'coverage/**']
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    files: ['**/*.test.{js,ts}', '**/__tests__/**/*.{js,ts}'],
    ...jestPlugin.configs['flat/recommended'],
    languageOptions: {
      globals: { ...globals.jest }
    }
  }
];
