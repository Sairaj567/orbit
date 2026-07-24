export default {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{js,jsx,mjs}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,css,yaml,yml}': ['prettier --write'],
};
