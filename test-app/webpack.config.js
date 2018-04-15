const entry = {app: './app'};
const jsRule = {
  test: /\.js$/,
  loader: 'babel-loader',
  exclude: [/node_modules/]
};

const config = {

  entry,

  devtool: 'source-maps',

  module: {
    rules: [jsRule, {
      test: /\.(sass|scss)$/,
      use: ['style-loader', 'css-loader', 'sass-loader']
    }]
  },
  node: {
    fs: 'empty'
  }

};

module.exports = config;
