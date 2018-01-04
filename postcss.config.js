let px2rem = require('postcss-px2rem');
let autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    px2rem({
      remUnit: 100
    }),
    autoprefixer({
      browsers: ['iOS >= 7', 'Android >= 4',
        'last 10 Chrome versions', 'last 10 Firefox versions',
        'Safari >= 6', 'ie > 8', 'last 5 versions']
    })
  ]
}
