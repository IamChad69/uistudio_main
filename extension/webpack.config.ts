import path from "path";
import webpack from "webpack";
import FilemanagerPlugin from "filemanager-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
// Only importing if needed below
// import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from "clean-webpack-plugin";
// Fix the import by defining a proper type and importing with require()
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import WextManifestWebpackPlugin from "wext-manifest-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

// Remove unused variable
// const viewsPath = path.join(__dirname, 'views');
const sourcePath = path.join(__dirname, "src");
const destPath = path.join(__dirname, "extension");
const nodeEnv = process.env.NODE_ENV || "development";
const targetBrowser = process.env.TARGET_BROWSER;

// Debug environment information
console.log("====== WEBPACK BUILD INFO ======");
console.log("NODE_ENV:", nodeEnv);
console.log("TARGET_BROWSER:", targetBrowser);
console.log("Process env vars:", process.env.NODE_ENV);
console.log("================================");

// Add debugging for environment variables
console.log("\n------- Environment Variables -------");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("TARGET_BROWSER:", process.env.TARGET_BROWSER);
console.log("------------------------------------\n");

// Define environment specific variables
const isDevelopment = process.env.NODE_ENV === "development";
const appUrl = isDevelopment
  ? "http://localhost:3000"
  : "https://uiscraper.com";
const apiUrl = isDevelopment
  ? "http://localhost:3000/api"
  : "https://api.uiscraper.com/api";

console.log("\n------- Build Configuration -------");
console.log("Build Mode:", isDevelopment ? "DEVELOPMENT" : "PRODUCTION");
console.log("APP_URL:", appUrl);
console.log("API_URL:", apiUrl);
console.log("-----------------------------------\n");

// Get package version for extension version
const packageJson = require("./package.json");
const extensionVersion = packageJson.version || "1.0.0";

// Use require() to import ExtensionReloader to avoid TypeScript constructor errors
// This is a workaround for when the module types don't correctly represent the constructor
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ExtensionReloader = require("webpack-ext-reloader");

const extensionReloaderPlugin =
  nodeEnv === "development"
    ? new ExtensionReloader({
        port: 9090, // Which port use to create the server
        reloadPage: true, // Force the reload of the page also
        entries: {
          // TODO: reload manifest on update
          contentScript: "contentScript",
          background: "background",
        },
      })
    : (() => {
        return {
          apply: (): void => {
            // Do nothing
          },
        };
      })();

const getExtensionFileType = (browser: string) => {
  if (browser === "opera") return "crx";
  if (browser === "firefox") return "xpi";
  return "zip";
};

const config: webpack.Configuration = {
  devtool: false, // https://github.com/webpack/webpack/issues/1194#issuecomment-560382342

  stats: {
    all: false,
    builtAt: true,
    errors: true,
    hash: true,
  },

  mode: nodeEnv === "development" ? "development" : "production",

  entry: {
    manifest: path.join(sourcePath, "manifest.json"),
    background: path.join(sourcePath, "Background", "index.ts"),
    contentScript: path.join(sourcePath, "ContentScript", "index.ts"),
  },

  output: {
    path: path.join(destPath, targetBrowser as string),
    filename: "js/[name].bundle.js",
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    alias: {
      "webextension-polyfill-ts": path.resolve(
        path.join(__dirname, "node_modules", "webextension-polyfill-ts")
      ),
    },
  },

  module: {
    rules: [
      {
        type: "javascript/auto", // prevent webpack handling json with its own loaders,
        test: /manifest\.json$/,
        use: {
          loader: "wext-manifest-loader",
          options: {
            usePackageJSONVersion: true, // set to false to not use package.json version for manifest
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(js|ts)x?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader, // It creates a CSS file per JS file which contains CSS
          },
          {
            loader: "css-loader", // Takes the CSS files and returns the CSS with imports and url(...) for Webpack
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                    "autoprefixer",
                    {
                      // Options
                    },
                  ],
                ],
              },
            },
          },
          "resolve-url-loader", // Rewrites relative paths in url() statements
          "sass-loader", // Takes the Sass/SCSS file and compiles to the CSS
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 10kb
          },
        },
        generator: {
          filename: "assets/images/[name][ext]",
        },
      },
    ],
  },

  plugins: [
    // Plugin to not generate js bundle for manifest entry
    new WextManifestWebpackPlugin(),
    // Generate sourcemaps
    new webpack.SourceMapDevToolPlugin({ filename: false }),
    new ForkTsCheckerWebpackPlugin(),
    // environmental variables
    new webpack.EnvironmentPlugin(["NODE_ENV", "TARGET_BROWSER"]),
    // Define custom environment variables as global constants at compile time
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.TARGET_BROWSER": JSON.stringify(process.env.TARGET_BROWSER),
      "process.env.APP_URL": JSON.stringify(appUrl),
      "process.env.API_URL": JSON.stringify(apiUrl),
    }),
    // delete previous build files
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        path.join(process.cwd(), `extension/${targetBrowser}`),
        path.join(
          process.cwd(),
          `extension/${targetBrowser}.${getExtensionFileType(targetBrowser as string)}`
        ),
      ],
      cleanStaleWebpackAssets: false,
      verbose: true,
    }),
    // write css file(s) to build folder
    new MiniCssExtractPlugin({ filename: "css/[name].css" }),
    // copy static assets
    new CopyWebpackPlugin({
      patterns: [{ from: "src/assets", to: "assets" }],
    }),
    // plugin to enable browser reloading in development mode
    extensionReloaderPlugin,
    // Move the FilemanagerPlugin from minimizers to plugins for better compatibility
    ...(nodeEnv === "production"
      ? [
          new FilemanagerPlugin({
            events: {
              onEnd: {
                archive: [
                  {
                    format: "zip",
                    source: path.join(destPath, targetBrowser as string),
                    destination: `${path.join(destPath, targetBrowser as string)}.${getExtensionFileType(targetBrowser as string)}`,
                    options: { zlib: { level: 6 } },
                  },
                ],
              },
            },
          }),
        ]
      : []),
  ],

  optimization: {
    minimize: nodeEnv === "production",
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },
};

// === Sandpack Bundling Best Practice ===
// Sandpack should only be imported in UI-related entry points (e.g., popup, options, or React UI components),
// NOT in background or content scripts. This prevents unnecessary bundle bloat and runtime errors.
// If you need to use Sandpack in a new UI entry (e.g., popup), add it as a separate entry point below.
//
// Example:
// entry: {
//   ...
//   popup: path.join(sourcePath, 'Popup', 'index.tsx'),
// }
//
// If you ever see Sandpack code in background or contentScript bundles, check your imports!

// Optionally, you can add a check to warn if Sandpack is imported in background/contentScript:
const forbiddenSandpackEntries = ["background", "contentScript"];
if (
  config.entry &&
  typeof config.entry === "object" &&
  !Array.isArray(config.entry)
) {
  for (const entryName of forbiddenSandpackEntries) {
    // Only check if entryName exists as a key
    if (Object.prototype.hasOwnProperty.call(config.entry, entryName)) {
      const entryPath = (config.entry as Record<string, unknown>)[entryName];
      if (typeof entryPath === "string" && /sandpack/i.test(entryPath)) {
        console.warn(
          `WARNING: Sandpack should not be imported in ${entryName} entry!`
        );
      }
    }
  }
}

export default config;
