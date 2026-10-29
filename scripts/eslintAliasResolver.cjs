// Minimal eslint-plugin-import resolver for the `@/` -> `src/` alias (see tsconfig.json),
// so import/no-restricted-paths can see alias imports. Delegates file lookup to the node resolver.
const path = require('node:path');
const nodeResolver = require('eslint-import-resolver-node');

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json'];

module.exports = {
  interfaceVersion: 2,
  resolve(source, file) {
    if (!source.startsWith('@/')) {
      return { found: false };
    }
    const target = path.resolve(__dirname, '..', 'src', source.slice(2));
    return nodeResolver.resolve(target, file, { extensions: EXTENSIONS });
  },
};
