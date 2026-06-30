import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
    plugins: [
        react({
            jsxImportSource: "@emotion/react",
            babel: {
                plugins: ["@emotion/babel-plugin"],
            },
        }),
        nodePolyfills(),
    ],
    define: {
        __dirname: JSON.stringify(__dirname),
    },
    server: {
        port: 3006,
    },
    resolve: {
        dedupe: ["@mat3ra/esse", "@mui/material", "@mui/styles", "@emotion/react", "@emotion/styled"],
        alias: [
            // Resolve node-polyfills shims from local node_modules absolute path
            {
                find: /^vite-plugin-node-polyfills\/shims\/(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/vite-plugin-node-polyfills/shims/$1"),
            },
            // Stub Meteor-only paths
            {
                find: /^\/imports\/(.*)$/,
                replacement: path.resolve(
                    __dirname,
                    "../workflow-designer/src/standalone/stubs/meteor.js",
                ),
            },
            {
                find: /^meteor\/(.*)$/,
                replacement: path.resolve(
                    __dirname,
                    "../workflow-designer/src/standalone/stubs/meteor.js",
                ),
            },
            // Stub moment-duration-format (side-effect-only import in ive)
            {
                find: "moment-duration-format",
                replacement: path.resolve(
                    __dirname,
                    "../workflow-designer/src/standalone/stubs/moment-duration-format.js",
                ),
            },
            // Redirect local source packages to their src/ for live editing
            {
                find: /^@mat3ra\/ave$/,
                replacement: path.resolve(__dirname, "../ave/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/ave\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../ave/src/$1"),
            },
            {
                find: /^@mat3ra\/wove$/,
                replacement: path.resolve(__dirname, "../wove/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/wove\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../wove/src/$1"),
            },
            {
                find: /^@mat3ra\/prove$/,
                replacement: path.resolve(__dirname, "../prove/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/prove\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../prove/src/$1"),
            },
            {
                find: /^@mat3ra\/workflow-designer$/,
                replacement: path.resolve(__dirname, "../workflow-designer/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/workflow-designer\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../workflow-designer/src/$1"),
            },
            // cove.js — point to local build
            {
                find: /^@exabyte-io\/cove\.js\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../cove.js/dist/$1"),
            },
            {
                find: /^@mat3ra\/ive$/,
                replacement: path.resolve(__dirname, "src/exports.ts"),
            },
            {
                find: /^@mat3ra\/ive\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "src/$1"),
            },
            {
                find: /^@mat3ra\/move$/,
                replacement: path.resolve(__dirname, "../move/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/move\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../move/src/$1"),
            },
            {
                find: /^@mat3ra\/jove$/,
                replacement: path.resolve(__dirname, "../jove/src/exports.ts"),
            },
            {
                find: /^@mat3ra\/jove\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../jove/src/$1"),
            },
            {
                find: /^@mat3ra\/jode$/,
                replacement: path.resolve(__dirname, "../jode/src/js/index.ts"),
            },
            {
                find: /^@mat3ra\/jode\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "../jode/src/$1"),
            },
            // MUI ESM fixes
            {
                find: /^@mui\/system\/(?!esm\/)(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/@mui/system/esm/$1"),
            },
            {
                find: /^@mui\/icons-material\/(?!esm\/)(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/@mui/icons-material/esm/$1"),
            },
            {
                find: /^lodash\/(?!es\/)(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/lodash-es/$1.js"),
            },
        ],
    },
    optimizeDeps: {
        exclude: [
            "@mat3ra/ave",
            "@mat3ra/wove",
            "@mat3ra/ive",
            "@mat3ra/move",
            "@mat3ra/jove",
            "@mat3ra/jode",
            "@mat3ra/prove",
            "@mat3ra/workflow-designer",
            "moment-duration-format",
        ],
        include: [
            "react",
            "react-dom",
            "prop-types",
            "lodash",
            "underscore",
            "underscore.string",
            "mixwith",
            "flat",
            "simpl-schema",
            "@mui/material",
            "@mui/system",
            "@mui/lab",
            "@mui/icons-material",
            "@mui/styles",
            "@emotion/react",
            "@emotion/styled",
            "@emotion/cache",
            "react-is",
            "hoist-non-react-statics",
            "ajv",
            "@mat3ra/code/dist/js/utils",
            "@mat3ra/prode",
            "@mat3ra/ide",
            "@mat3ra/made",
            "@mat3ra/utils",
            "@mat3ra/standata",
            "@mat3ra/esse/dist/js/esse/JSONSchemasInterface",
            "@mat3ra/esse/dist/js/esse/schemaUtils",
            "@mat3ra/mode",
            "@mat3ra/code",
            "@mat3ra/ade",
        ],
    },
    build: {
        outDir: "build",
        rollupOptions: {
            output: {
                entryFileNames: "main.js",
                chunkFileNames: "[name]-[hash].js",
                assetFileNames: "[name]-[hash].[ext]",
            },
        },
    },
});
