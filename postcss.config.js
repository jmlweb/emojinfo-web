const postcss_preset_env = require('postcss-preset-env')

module.exports = {
  plugins: [
    postcss_preset_env({
      stage: 0,
      autoprefixer: {
        grid: true,
      },
    }),
  ],
}
