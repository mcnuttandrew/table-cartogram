module.exports = {

  entry: {index: './index'},

  devtool: 'source-maps',

  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: [/node_modules/]
    }]
  },
  node: {
    fs: 'empty'
  },
  output: {
    filename: './index.js',
    libraryTarget: 'umd',
    publicPath: '/'
  },
  mode: 'production'
};
