import nextConfig from 'eslint-config-next';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

const invalidLiteralSelector = 'Literal[value=/bg' + '-linear-/]';
const invalidGradientMessage = [
  "Use 'bg-gradient-*' instead of '",
  'bg',
  '-linear-',
  "*'. bg-linear is not a valid Tailwind CSS class.",
].join('');

const eslintConfig = defineConfig([
  ...nextConfig,
  eslintConfigPrettier,
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  {
    plugins: {
      perfectionist: perfectionistPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    rules: {
      // Prevent using incorrect bg-linear classes (should be bg-gradient)
      'no-restricted-syntax': [
        'warn',
        {
          selector: invalidLiteralSelector,
          message: invalidGradientMessage,
        },
      ],
    },
  },
  // File-specific rules for React/TypeScript files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      perfectionist: perfectionistPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    rules: {
      // Warn about common mistakes
      'no-template-curly-in-string': 'warn',
      // Import ordering with pyramid structure
      'perfectionist/sort-imports': [
        2, // error level
        {
          order: 'asc',
          ignoreCase: true,
          type: 'line-length', // creates pyramid structure
          newlinesBetween: 'always', // blank lines between groups
          internalPattern: ['^@/.+'],
          groups: [
            'style',
            'side-effect',
            'type',
            ['builtin', 'external'],
            'custom-components',
            'custom-lib',
            'custom-models',
            'custom-store',
            'custom-types',
            'internal',
            ['parent', 'sibling', 'index'],
            ['parent-type', 'sibling-type', 'index-type'],
            'object',
            'unknown',
          ],
          customGroups: {
            value: {
              'custom-components': ['^@/components/.+'],
              'custom-lib': ['^@/lib/.+'],
              'custom-models': ['^@/models/.+'],
              'custom-store': ['^@/store/.+'],
              'custom-types': ['^@/types/.+'],
            },
          },
        },
      ],
      // Require newline after imports
      'import/newline-after-import': 2,
      // Warn about unused imports
      'unused-imports/no-unused-imports': 1,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
]);

export default eslintConfig;
