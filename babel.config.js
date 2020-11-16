module.exports = {
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          node: '12',
        },
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    'babel-plugin-transform-typescript-metadata',
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    ['@babel/plugin-proposal-class-properties'],
  ],
};
