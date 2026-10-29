module.exports = {
  extends: ['mantine'],
  parserOptions: {
    project: './tsconfig.json',
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
  },
};
