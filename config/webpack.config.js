'use strict';

const fs = require('fs');
const isWsl = require('is-wsl');
const path = require('path');
const webpack = require('webpack');
const resolve = require('resolve');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const paths = require('./paths');
const modules = require('./modules');
const getClientEnvironment = require('./env');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const postcssNormalize = require('postcss-normalize');

const pkg = require('../package.json');
const outputPrefix = `public/${pkg.version}`;

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';
const useTypeScript = fs.existsSync(paths.appTsConfig);

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

module.exports = function (webpackEnv) {
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';

    const publicPath = isEnvProduction ? paths.servedPath : (isEnvDevelopment && '/');
    const shouldUseRelativeAssetPaths = publicPath === './';
    const publicUrl = isEnvProduction ? publicPath.slice(0, -1) : (isEnvDevelopment && '');
    const env = getClientEnvironment(publicUrl);

    const getStyleLoaders = (cssOptions, preProcessor) => {
        const loaders = [
            isEnvDevelopment && require.resolve('style-loader'),
            isEnvProduction && {
                loader: MiniCssExtractPlugin.loader,
                options: shouldUseRelativeAssetPaths ? { publicPath: '../../' } : {},
            },
            {
                loader: require.resolve('css-loader'),
                options: cssOptions,
            },
            {
                loader: require.resolve('postcss-loader'),
                options: {
                    ident: 'postcss',
                    plugins: () => [
                        require('postcss-flexbugs-fixes'),
                        require('postcss-preset-env')({
                            autoprefixer: {
                                flexbox: 'no-2009',
                            },
                            stage: 3,
                        }),
                        postcssNormalize(),
                    ],
                    sourceMap: isEnvProduction && shouldUseSourceMap,
                },
            },
        ].filter(Boolean);

        if (preProcessor) {
            loaders.push({
                loader: require.resolve(preProcessor),
                options: {
                    sourceMap: isEnvProduction && shouldUseSourceMap,
                },
            });
        }

        return loaders;
    };
    const webConfig = {
        mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
        bail: isEnvProduction,
        devtool: isEnvProduction ?
            shouldUseSourceMap ?
                'source-map' :
                false : (isEnvDevelopment && 'cheap-module-source-map'),
        entry: [
            isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient'),
            paths.appIndexJs,
        ].filter(Boolean),
        output: {
            path: isEnvProduction ? paths.appBuild : undefined,
            pathinfo: isEnvDevelopment,
            filename: `${outputPrefix}/index.js`,
            futureEmitAssets: true,
            chunkFilename: isEnvProduction ?
                `${outputPrefix}/js/[name].chunk.js` : (isEnvDevelopment && `${outputPrefix}/js/[name].chunk.js`),
            publicPath: publicPath,
            devtoolModuleFilenameTemplate: isEnvProduction ?
                (info => path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, '/')):
                (isEnvDevelopment && (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'))),
        },
        optimization: {
            minimize: isEnvProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        parse: { ecma: 8 },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            comparisons: false,
                            inline: 2,
                        },
                        mangle: {
                            safari10: true,
                        },
                        output: {
                            ecma: 5,
                            comments: false,
                            ascii_only: true,
                        },
                    },
                    parallel: !isWsl,
                    cache: true,
                    sourceMap: shouldUseSourceMap,
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: {
                        parser: safePostCssParser,
                        map: shouldUseSourceMap ? {
                            inline: false,
                            annotation: true,
                        } : false,
                    },
                }),
            ],
            runtimeChunk: false,
        },
        resolve: {
            modules: ['node_modules', paths.appNodeModules].concat(
                modules.additionalModulePaths || []
            ),
            extensions: paths.moduleFileExtensions.map(ext => `.${ext}`).filter(ext => useTypeScript || !ext.includes('ts')),
            plugins: [
                PnpWebpackPlugin,
                new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
            ],
            alias: {
                'actions': path.resolve(process.cwd(), 'src/actions'),
                'components': path.resolve(process.cwd(), 'src/components'),
                'containers': path.resolve(process.cwd(), 'src/containers'),
                'lib': path.resolve(process.cwd(), 'src/lib'),
                'plugins': path.resolve(process.cwd(), 'src/plugins'),
                'reducers': path.resolve(process.cwd(), 'src/reducers'),
                'style': path.resolve(process.cwd(), 'src/style'),
                'config': path.resolve(process.cwd(), 'src/config.js'),
            }
        },
        resolveLoader: {
            plugins: [
                PnpWebpackPlugin.moduleLoader(module),
            ],
        },
        module: {
            strictExportPresence: true,
            rules: [
                {
                    parser: {
                        requireEnsure: false
                    }
                },
                {
                    oneOf: [
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/, /\.(eot|woff|otf)$/],
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: 10000,
                                name: `${outputPrefix}/media/[name].[hash].[ext]`,
                            },
                        },
                        {
                            test: /\.(js|mjs|jsx|ts|tsx)$/,
                            include: paths.appSrc,
                            loader: require.resolve('babel-loader'),
                            options: {
                                customize: require.resolve('babel-preset-react-app/webpack-overrides'),
                                plugins: [
                                    [
                                        require.resolve('babel-plugin-named-asset-import'),
                                        {
                                            loaderMap: {
                                                svg: {
                                                    ReactComponent: '@svgr/webpack?-svgo,+ref![path]',
                                                },
                                            },
                                        },
                                    ],
                                ],
                                cacheDirectory: true,
                                cacheCompression: isEnvProduction,
                                compact: isEnvProduction,
                            },
                        },
                        {
                            test: /\.(js|mjs)$/,
                            exclude: /@babel(?:\/|\\{1,2})runtime/,
                            loader: require.resolve('babel-loader'),
                            options: {
                                babelrc: false,
                                configFile: false,
                                compact: false,
                                presets: [
                                    [
                                        require.resolve('babel-preset-react-app/dependencies'),
                                        {
                                            helpers: true
                                        },
                                    ],
                                ],
                                cacheDirectory: true,
                                cacheCompression: isEnvProduction,
                                sourceMaps: false,
                            },
                        },
                        {
                            test: cssRegex,
                            exclude: cssModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: isEnvProduction && shouldUseSourceMap,
                            }),
                            sideEffects: true,
                        },
                        {
                            test: cssModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: isEnvProduction && shouldUseSourceMap,
                                modules: true,
                                getLocalIdent: getCSSModuleLocalIdent,
                            }),
                        },
                        {
                            test: sassRegex,
                            exclude: sassModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 2,
                                sourceMap: isEnvProduction && shouldUseSourceMap,
                            },
                            'sass-loader'
                            ),
                            sideEffects: true,
                        },
                        {
                            test: sassModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 2,
                                sourceMap: isEnvProduction && shouldUseSourceMap,
                                modules: true,
                                getLocalIdent: getCSSModuleLocalIdent,
                            },
                            'sass-loader'
                            ),
                        },
                        {
                            loader: require.resolve('file-loader'),
                            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/, /\.(sass|scss)/],
                            options: {
                                name: `${outputPrefix}/media/[name].[hash].[ext]`,
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            isEnvDevelopment && new HtmlWebpackPlugin(
                Object.assign({}, {
                    inject: true,
                    template: paths.appHtml,
                },
                isEnvProduction ? {
                    minify: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeRedundantAttributes: true,
                        useShortDoctype: true,
                        removeEmptyAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                        keepClosingSlash: true,
                        minifyJS: true,
                        minifyCSS: true,
                        minifyURLs: true,
                    },
                } : undefined
                )
            ),
            isEnvProduction && shouldInlineRuntimeChunk && new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime~.+[.]js/]),
            new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
            new ModuleNotFoundPlugin(paths.appPath),
            new webpack.DefinePlugin(env.stringified),
            isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
            isEnvDevelopment && new CaseSensitivePathsPlugin(),
            isEnvDevelopment && new WatchMissingNodeModulesPlugin(paths.appNodeModules),
            isEnvProduction && new MiniCssExtractPlugin({
                filename: `${outputPrefix}/index.css`,
                chunkFilename: `${outputPrefix}/css/[name].chunk.css`,
            }),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            // Generate a service worker script that will precache, and keep up to date,
            // the HTML & assets that are part of the Webpack build.
            // isEnvProduction && new WorkboxWebpackPlugin.GenerateSW({
            //     clientsClaim: true,
            //     exclude: [/\.map$/, /asset-manifest\.json$/],
            //     importWorkboxFrom: 'cdn',
            //     navigateFallback: publicUrl + '/index.html',
            //     navigateFallbackBlacklist: [
            //         // Exclude URLs starting with /_, as they're likely an API call
            //         new RegExp('^/_'),
            //         // Exclude URLs containing a dot, as they're likely a resource in
            //         // public/ and not a SPA route
            //         new RegExp('/[^/]+\\.[^/]+$'),
            //     ],
            // }),
            // TypeScript type checking
            useTypeScript && new ForkTsCheckerWebpackPlugin({
                typescript: resolve.sync('typescript', {
                    basedir: paths.appNodeModules,
                }),
                async: isEnvDevelopment,
                useTypescriptIncrementalApi: true,
                checkSyntacticErrors: true,
                resolveModuleNameModule: process.versions.pnp ? `${__dirname}/pnpTs.js` : undefined,
                resolveTypeReferenceDirectiveModule: process.versions.pnp ? `${__dirname}/pnpTs.js` : undefined,
                tsconfig: paths.appTsConfig,
                reportFiles: [
                    '**',
                    '!**/__tests__/**',
                    '!**/?(*.)(spec|test).*',
                    '!**/src/setupProxy.*',
                    '!**/src/setupTests.*',
                ],
                watch: paths.appSrc,
                silent: true,
                formatter: isEnvProduction ? typescriptFormatter : undefined,
            }),
        ].filter(Boolean),
        node: {
            module: 'empty',
            dgram: 'empty',
            dns: 'mock',
            fs: 'empty',
            http2: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty',
        },
        performance: false,
    };

    return webConfig;
};