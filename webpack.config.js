const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const crypto = require("crypto");
const crypto_orig_createHash = crypto.createHash;
crypto.createHash = (algorithm) =>
  crypto_orig_createHash(algorithm == "md4" ? "sha256" : algorithm);

const config = {
  mode: "production",
  entry: "./src/extension.ts",
  externals: {
    vscode: "commonjs vscode"
  },
  resolve: {
    extensions: [".ts", ".js", ".json"]
  },
  node: {
    __filename: false,
    __dirname: false
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader"
          }
        ]
      }
    ]
  }
};

const nodeConfig = {
  ...config,
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  resolve: {
    ...config.resolve,
    alias: {
      "@abstractions": path.join(__dirname, "./src/abstractions/node")
    }
  },
  devtool: "source-map",
  plugins: [
    new CopyPlugin([
      {
        from: path.resolve(
          __dirname,
          "./src/abstractions/node/images/scripts/*"
        ),
        to: path.resolve(__dirname, "./dist/scripts/"),
        flatten: true
      }
    ])
  ]
};

const webConfig = {
  ...config,
  target: "webworker",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "extension-web.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  devtool: 'source-map',
  resolve: {
    ...config.resolve,
    alias: {
      "@abstractions": path.join(__dirname, "./src/abstractions/browser")
    }
  },
  node: {
    util: true,
    fs: "empty",
    readline: "empty",
    child_process: "empty"
  }
};

module.exports = [nodeConfig, webConfig];
