const path = require('path');

// Export a function. Accept the base config as the only param.
module.exports = function (base) {
  const config = base;

  config.module.rules = [
    ...config.module.rules,
    { test: /\.md$/, loader: 'raw-loader' },
    { test: /\.json$/, loader: 'json' },
    {
      test: /\.scss$/,
      loaders: ['style', 'css', 'sass'],
      include: path.resolve(__dirname, '../'),
    },
    { test: /\.css$/, loader: 'style!css' },
  ];

  config.resolve.alias = {
    'meteor/meteor': path.join(__dirname, '../.meteor/mocks/meteor'),
    'meteor/accounts-base': path.join(
      __dirname,
      '../.meteor/mocks/accounts-base'
    ),
    'meteor/ddp': path.join(__dirname, '../.meteor/mocks/ddp'),
  };

  // base.sassLoader = {
  //   importer: function (url, prev, done) {
  //     // XXX quick hack to get root slash working
  //     if (url[0] === '/') {
  //       url = path.resolve(process.cwd(), url.slice(1, url.length));
  //     }
  //     done({ file: url });
  //   },
  // };

  // Return the altered config
  return config;
};
