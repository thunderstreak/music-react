/**
 * Webpack config for the Tauri renderer build.
 *
 * Key differences from the standard Electron renderer config:
 *  - target is `web` (not electron-renderer)
 *  - HtmlWebpackPlugin generates the index.html Tauri needs
 *  - `electron` module is aliased to the Tauri-compatible shim
 *  - Output goes to <root>/dist/ which matches tauri.conf.json distDir
 */

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

CheckNodeEnv('production');

export default merge(
  {
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
      modules: [path.join(__dirname, '..', 'app'), 'node_modules'],
    },
    optimization: {
      namedModules: true,
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
      }),
    ],
  },
  {
    devtool: 'none',
    mode: 'production',
    // Target the browser – Tauri's renderer is a real web view, not electron
    target: 'web',

    entry: [
      'core-js',
      'regenerator-runtime/runtime',
      path.join(__dirname, '..', 'app/index.tsx'),
    ],

    output: {
      path: path.join(__dirname, '..', 'dist'),
      publicPath: './',
      filename: 'renderer.js',
    },

    resolve: {
      extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
      modules: [path.join(__dirname, '..', 'app'), 'node_modules'],
      // Replace `electron` with the Tauri-compatible shim
      alias: {
        electron: path.join(__dirname, '..', 'app/bridge/electron-shim.ts'),
      },
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
        },
        // Extract all .global.css to style.css as is
        {
          test: /\.global\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: { publicPath: './' },
            },
            { loader: 'css-loader', options: { sourceMap: true } },
          ],
        },
        // Pipe other styles through css modules and append to style.css
        {
          test: /^((?!\.global).)*\.css$/,
          use: [
            { loader: MiniCssExtractPlugin.loader },
            {
              loader: 'css-loader',
              options: {
                modules: { localIdentName: '[name]__[local]__[hash:base64:5]' },
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.less$/,
          use: [
            'style-loader',
            { loader: 'css-loader', options: { importLoaders: 1 } },
            'less-loader',
          ],
        },
        // SASS – global
        {
          test: /\.global\.(scss|sass)$/,
          use: [
            { loader: MiniCssExtractPlugin.loader },
            {
              loader: 'css-loader',
              options: { sourceMap: true, importLoaders: 1 },
            },
            { loader: 'resolve-url-loader' },
            { loader: 'sass-loader', options: { sourceMap: true, implementation: require('sass') } },
          ],
        },
        // SASS – modules
        {
          test: /^((?!\.global).)*\.(scss|sass)$/,
          use: [
            { loader: MiniCssExtractPlugin.loader },
            {
              loader: 'css-loader',
              options: {
                modules: { localIdentName: '[name]__[local]__[hash:base64:5]' },
                importLoaders: 1,
                sourceMap: true,
              },
            },
            { loader: 'resolve-url-loader' },
            { loader: 'sass-loader', options: { sourceMap: true, implementation: require('sass') } },
          ],
        },
        // Fonts
        {
          test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: 'url-loader',
            options: { limit: 10000, mimetype: 'application/font-woff' },
          },
        },
        {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: 'url-loader',
            options: { limit: 10000, mimetype: 'application/font-woff' },
          },
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/octet-stream',
            },
          },
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          use: 'file-loader',
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          use: {
            loader: 'url-loader',
            options: { limit: 10000, mimetype: 'image/svg+xml' },
          },
        },
        // Images
        {
          test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
          use: 'url-loader',
        },
      ],
    },

    optimization: {
      minimizer: [
        new TerserPlugin({ parallel: true, sourceMap: false, cache: true }),
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            map: { inline: false, annotation: true },
          },
        }),
      ],
    },

    plugins: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
        DEBUG_PROD: false,
      }),

      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(__dirname, '..', 'app/app.tauri.html'),
        inject: 'body',
        minify: {
          collapseWhitespace: true,
          removeComments: true,
        },
      }),

      new MiniCssExtractPlugin({ filename: 'style.css' }),

      new BundleAnalyzerPlugin({
        analyzerMode:
          process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
        openAnalyzer: process.env.OPEN_ANALYZER === 'true',
      }),
    ],
  }
);
