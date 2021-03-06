import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import type webpack from 'webpack';
import { SOURCE_PATH } from '../common/paths';

function getCssLoaders(
  isDevelopment: boolean,
  isLibrary: boolean,
): (string | webpack.RuleSetLoader)[] {
  const styleLoader = 'style-loader';
  const miniCssExtractPluginLoader = MiniCssExtractPlugin.loader;
  const typingsCssModulesLoader = {
    loader: '@teamsupercell/typings-for-css-modules-loader',
    options: {
      banner: '/* autogenerated by typings-for-css-modules-loader. Please do not change this file! */',
      formatter: 'prettier',
    },
  };
  const cssLoader = {
    loader: 'css-loader',
    options: {
      importLoaders: 1,
      // Class names will be camelized, the original class name will be removed from the locals
      // For more info, see https://github.com/webpack-contrib/css-loader#localsconvention
      localsConvention: 'camelCaseOnly',
      modules: {
        mode: 'local',
        localIdentName: '[name]__[local]--[hash:base64:5]',
        context: SOURCE_PATH,
      },
    },
  };

  if (isDevelopment) {
    return [styleLoader, typingsCssModulesLoader, cssLoader];
  }

  if (isLibrary) {
    return [styleLoader, cssLoader];
  }

  return [miniCssExtractPluginLoader, cssLoader];
}

export default (isDevelopment: boolean, isLibrary: boolean): webpack.RuleSetRule[] => [
  // All .ts and .tsx files will be loaded with ts-loader
  {
    test: /\.ts(x?)$/,
    include: SOURCE_PATH,
    use: [{ loader: 'ts-loader' }],
  },
  // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
  {
    enforce: 'pre',
    test: /\.js$/,
    loader: 'source-map-loader',
  },
  {
    test: /\.scss$/,
    use: [
      ...getCssLoaders(isDevelopment, isLibrary),
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
        },
      },
    ],
  },
  {
    test: /\.css$/,
    use: [...getCssLoaders(isDevelopment, isLibrary)],
  },
  {
    test: /\.svg$/,
    use: ['@svgr/webpack', 'url-loader'],
  },
];
