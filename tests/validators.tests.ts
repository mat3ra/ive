/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { getComputeValidator } from "../src/validators";

/**
 * Regression test: esse schemas carry json-schema-to-typescript hints (`tsType`, `tsEnumNames`).
 * `getComputeValidator` builds its own Ajv instance, and Ajv's default strict mode threw
 * `strict mode: unknown keyword: "tsType"` while compiling esse's `job/compute` schema,
 * crashing ComputeForm as soon as it mounted.
 */
const computeSchemaPath = path.resolve(
    import.meta.dirname,
    "..",
    "node_modules",
    "@mat3ra",
    "esse",
    "dist",
    "js",
    "schema",
    "job",
    "compute.json",
);

test("getComputeValidator compiles the esse job/compute schema", () => {
    const computeSchema = JSON.parse(fs.readFileSync(computeSchemaPath, "utf-8"));
    assert.doesNotThrow(() => getComputeValidator(computeSchema));
});

test("getComputeValidator accepts typescript hint keywords on a schema property", () => {
    const schemaWithTypescriptHints = {
        type: "object",
        properties: {
            queue: { type: "string", tsType: "QueueNameEnum" },
            mode: { type: "string", enum: ["a", "b"], tsEnumNames: ["A", "B"] },
        },
    };
    const { validator } = getComputeValidator(schemaWithTypescriptHints);
    assert.strictEqual(validator({ queue: "D", mode: "a" }), true);
    assert.strictEqual(validator({ queue: "D", mode: "c" }), false);
});
