const WCS = {
    sourceMap: true,
    minifyCSS: false
};
const path = require('path');
const fs = require("fs");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
    mode: 'development',
    entry: ['./src/js/index.js', './src/scss/index.scss'],
    output: {
        filename: './js/bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: WCS.sourceMap ? "source-map" : false,
    devServer: {
        contentBase: './dist',
        host: 'localhost',
        port: 8080,
        hot: true
    },
    plugins: [
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
                            hmr: true
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