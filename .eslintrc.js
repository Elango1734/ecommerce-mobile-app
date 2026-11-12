module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['import'],
  rules: {
    // Redefining a component inside another component's render recreates its
    // type every render, which unmounts and remounts the whole subtree (lost
    // state, wasted work). The base config only warns; this is a correctness
    // bug as much as a perf one, so it's an error here.
    'react/no-unstable-nested-components': 'error',
    complexity: ['warn', 20],
    'max-lines': ['warn', { max: 700, skipBlankLines: false, skipComments: false }],
    'max-lines-per-function': ['warn', { max: 300, skipBlankLines: false, skipComments: false }],
    'import/order': [
      'warn',
      { groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']], 'newlines-between': 'always' }
    ],
    'import/no-cycle': ['error', { ignoreExternal: true }],
    'import/no-duplicates': 'error'
  }
};
