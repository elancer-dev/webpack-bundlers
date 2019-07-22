const WCS = {
    sourceMap: false,
    minifyCSS: true
};
const path = require('path');
const fs = require("fs");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

function generateHtmlPlugins(templateDir) {
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
    return templateFiles.filter(item => /\.html$/.test(item)).map(item => {
        const parts = item.split(".");
        const name = parts[0];
        // const extension = parts[1];
        return new HtmlWebpackPlugin({
            // inject: false,
            template: `src/${name}.html`,
            filename: `${name}.html`,
            minify: {
                // collapseWhitespace: true,
                // removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
                minifyCSS: WCS.minifyCSS,
                // minifyJS: true
            }
        });
    });
}

const htmlPlugins = generateHtmlPlugins("./src");

module.exports = {
    mode: 'production',
    entry: ['./src/js/index.js', './src/scss/index.scss'],
    output: {
        filename: './js/bundle.js',
        path: path.resolve(__dirname, 'build')
    },
    devtool: WCS.sourceMap ? "source-map" : false,
    optimization: {
        minimizer: [
            // new OptimizeCSSAssetsPlugin({}),
            new TerserPlugin({
                sourceMap: WCS.sourceMap,
                extractComments: true
            })
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: './css/style' + (WCS.minifyCSS ? '.min' : '') + '.css'
        }),
        new CopyWebpackPlugin([
            {
                from: "./src/fonts",
                to: "./fonts"
            },
            {
                from: "./src/favicon",
                to: "./favicon"
            },
            {
                from: "./src/images",
                to: "./images"
            },
            {
                from: "./src/uploads",
                to: "./uploads"
            }
        ])
    ].concat(htmlPlugins),
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src/js'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(sass|scss)$/,
                include: path.resolve(__dirname, 'src/scss'),
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: false
                        }
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: WCS.sourceMap,
                            url: false
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            ident: "postcss",
                            sourceMap: WCS.sourceMap,
                            plugins: () => WCS.minifyCSS ? [
                                require("cssnano")({
                                    preset: [
                                        "default",
                                        {
                                            discardComments: {
                                                removeAll: true
                                            }
                                        }
                                    ]
                                })
                            ] : []
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: WCS.sourceMap
                        }
                    }
                ]
            }
        ]
    }
};