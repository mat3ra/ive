import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

/**
 * Vite config for the ive standalone demo app.
 *
 * This is ONLY used for local development (`npm run dev`).
 * The library build (tsc) ignores this file entirely.
 */
export default defineConfig({
    base: "/ive/",
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
            {
                find: /^vite-plugin-node-polyfills\/shims\/(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/vite-plugin-node-polyfills/shims/$1"),
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
                find: "moment-duration-format",
                replacement: path.resolve(__dirname, "src/standalone/stubs/moment-duration-format.js"),
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
