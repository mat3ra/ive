/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert";
import test from "node:test";

import React from "react";

import { ComputableEntityMixin } from "../src/components/mixins";

/**
 * Regression test for a crash caught live in production: `renderWarnings()` assumed
 * every `computedEntity` implements `.warnings`, but nothing in the real stack
 * (`@mat3ra/ide`'s `infrastructureMixin`, jode's `Job`, web-app's `CoreJob`) provides it -
 * `ide` dropped its `warnings` fallback, and the web-app file that was meant to supply a
 * real replacement was deleted entirely in an unrelated migration. Calling
 * `.filter(...)` directly on `undefined` threw "Cannot read properties of undefined
 * (reading 'filter')" as soon as any job rendered.
 */
class TestComponent extends ComputableEntityMixin(React.Component) {
    get computedEntity() {
        return { errors: [] };
    }
}

test("renderWarnings does not throw when computedEntity has no .warnings", () => {
    const instance = new TestComponent({});
    assert.doesNotThrow(() => instance.renderWarnings());
});

test("renderErrors does not throw and renders provided errors", () => {
    class WithErrors extends ComputableEntityMixin(React.Component) {
        get computedEntity() {
            return { errors: [{ message: "boom" }] };
        }
    }
    const instance = new WithErrors({});
    let result: React.ReactNode;
    assert.doesNotThrow(() => {
        result = instance.renderErrors();
    });
    assert.ok(Array.isArray(result));
    assert.strictEqual((result as unknown[]).length, 1);
});

test("renderWarnings renders provided warnings", () => {
    class WithWarnings extends ComputableEntityMixin(React.Component) {
        get computedEntity() {
            return {
                errors: [],
                warnings: [{ condition: true, message: "heads up" }],
            };
        }
    }
    const instance = new WithWarnings({});
    const result = instance.renderWarnings() as unknown[];
    assert.strictEqual(result.length, 1);
});
