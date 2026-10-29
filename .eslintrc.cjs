const fs = require('node:fs');

// Feature modules are discovered from disk so renames in later milestones need no config edit.
const features = fs
  .readdirSync('src/module', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

// A feature may import another feature only through its public index.ts.
const crossFeatureZones = features.flatMap((target) =>
  features
    .filter((from) => from !== target)
    .map((from) => ({
      target: `./src/module/${target}`,
      from: `./src/module/${from}`,
      except: ['./index.ts'],
      message: `Import ${from} through its public index.ts, not its internals.`,
    }))
);

// Domain code must not reach into its own feature's presentation or infrastructure layers.
const domainLayerZones = features.map((feature) => ({
  target: `./src/module/${feature}/domain`,
  from: [`./src/module/${feature}/presentation`, `./src/module/${feature}/infrastructure`],
  message: 'Domain code must not depend on presentation or infrastructure.',
}));

const relativeChainPattern = {
  group: ['../../../*'],
  message: 'Use the @/ alias instead of long relative import chains.',
};

module.exports = {
  extends: ['mantine'],
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      [require('node:path').resolve(__dirname, 'scripts/eslintAliasResolver.cjs')]: {},
      node: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    // 'import/extensions': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',

    // Formatting is owned by Prettier (.prettierrc.cjs). These rules duplicate it and
    // disagree with it, so they are off; semantic rules stay on.
    'react/jsx-indent-props': 'off',
    '@typescript-eslint/quotes': 'off',
    'linebreak-style': 'off',
    'max-len': 'off',
    'jsx-quotes': 'off',
    'no-multiple-empty-lines': 'off',
    '@typescript-eslint/semi': 'off',
    'react/jsx-tag-spacing': 'off',
    'comma-dangle': 'off',
    'eol-last': 'off',
    'no-trailing-spaces': 'off',
    'react/jsx-closing-tag-location': 'off',
    'padded-blocks': 'off',
    'react/jsx-first-prop-new-line': 'off',
    'react/jsx-max-props-per-line': 'off',
    '@typescript-eslint/no-extra-semi': 'off',
    'no-multi-spaces': 'off',
    'react/jsx-props-no-multi-spaces': 'off',
    'quote-props': 'off',
    'nonblock-statement-body-position': 'off',

    // Architecture guardrails (see docs/architecture.md). Existing violations are recorded in
    // docs/migration/eslint-baseline.json and may only decrease (npm run lint:ratchet).
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/components',
            from: './src/module',
            message: 'Shared components must not depend on feature modules.',
          },
          ...domainLayerZones,
          ...crossFeatureZones,
        ],
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'axios',
            message: 'Use the shared client from @/lib/http/apiClient inside infrastructure code.',
          },
        ],
        patterns: [relativeChainPattern],
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
  },
  overrides: [
    {
      // Infrastructure code is where HTTP lives.
      files: [
        'src/lib/**',
        'src/services/**',
        'src/module/**/infrastructure/**',
        'src/module/**/services/**',
        'src/module/**/service/**',
      ],
      rules: {
        'no-restricted-imports': ['error', { patterns: [relativeChainPattern] }],
      },
    },
  ],
};
