import babel from 'rollup-plugin-babel';

export default {
  input: 'src/webpack-shell-plugin-next.js',
  output: {
    file: 'lib/index.js',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    babel()
  ]
};
