/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

/**
 * Smoke tests for @mat3ra/ive exports.
 *
 * Rather than actually importing the React components (which require a DOM,
 * Meteor paths, and a full React environment), we verify the dist/exports.js
 * and dist/exports.d.ts files declare the expected named exports.
 * This catches accidental deletion or renaming of public API symbols.
 */

const distDirectory = path.resolve(import.meta.dirname, "..", "dist");
const exportsJsPath = path.join(distDirectory, "exports.js");
const exportsDtsPath = path.join(distDirectory, "exports.d.ts");

test("dist/exports.js exists and is non-empty", () => {
    const stat = fs.statSync(exportsJsPath);
    assert.ok(stat.size > 0, "exports.js should not be empty");
});

test("dist/exports.d.ts exists and is non-empty", () => {
    const stat = fs.statSync(exportsDtsPath);
    assert.ok(stat.size > 0, "exports.d.ts should not be empty");
});

test("dist/exports.js declares QueuesTable export", () => {
    const content = fs.readFileSync(exportsJsPath, "utf-8");
    assert.ok(content.includes("QueuesTable"), "exports.js should reference QueuesTable");
});

test("dist/exports.js declares Compute export", () => {
    const content = fs.readFileSync(exportsJsPath, "utf-8");
    assert.ok(content.includes("Compute"), "exports.js should reference Compute");
});

test("dist/exports.js declares ComputableEntityMixin export", () => {
    const content = fs.readFileSync(exportsJsPath, "utf-8");
    assert.ok(content.includes("ComputableEntityMixin"), "exports.js should reference ComputableEntityMixin");
});

test("dist/exports.js declares ComputeForm export", () => {
    const content = fs.readFileSync(exportsJsPath, "utf-8");
    assert.ok(content.includes("ComputeForm"), "exports.js should reference ComputeForm");
});

test("dist/exports.d.ts declares QueuesTable type export", () => {
    const content = fs.readFileSync(exportsDtsPath, "utf-8");
    assert.ok(content.includes("QueuesTable"), "exports.d.ts should reference QueuesTable");
});
