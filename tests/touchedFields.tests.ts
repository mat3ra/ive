import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    fieldNameFromFieldId,
    shouldShowFieldError,
    withTouchedField,
} from "../src/utils/touchedFields";

describe("fieldNameFromFieldId", () => {
    it("strips RJSF's root prefix", () => {
        assert.equal(fieldNameFromFieldId("root_nodes"), "nodes");
    });

    it("keeps dotted keys intact, since compute form data is flattened", () => {
        assert.equal(fieldNameFromFieldId("root_cluster.fqdn"), "cluster.fqdn");
    });

    it("returns null for the form root, an unprefixed id, or no id at all", () => {
        assert.equal(fieldNameFromFieldId("root_"), null);
        assert.equal(fieldNameFromFieldId("nodes"), null);
        assert.equal(fieldNameFromFieldId(undefined), null);
        assert.equal(fieldNameFromFieldId(null), null);
    });
});

describe("withTouchedField", () => {
    it("adds the field a change came from", () => {
        const touched = withTouchedField(new Set<string>(), "root_ppn");
        assert.deepEqual([...touched], ["ppn"]);
    });

    it("accumulates across changes", () => {
        let touched: ReadonlySet<string> = new Set<string>();
        touched = withTouchedField(touched, "root_nodes");
        touched = withTouchedField(touched, "root_cluster.fqdn");
        assert.deepEqual([...touched].sort(), ["cluster.fqdn", "nodes"]);
    });

    it("returns the same set when nothing new was touched, so callers can skip work", () => {
        const touched = new Set(["nodes"]);
        assert.equal(withTouchedField(touched, "root_nodes"), touched);
        assert.equal(withTouchedField(touched, undefined), touched);
    });

    it("does not mutate the set it was given", () => {
        const touched = new Set(["nodes"]);
        withTouchedField(touched, "root_ppn");
        assert.deepEqual([...touched], ["nodes"]);
    });
});

describe("shouldShowFieldError", () => {
    const touchedFields = new Set(["nodes"]);

    it("hides errors for fields the reader has not been to", () => {
        // The point of the whole module: a new job must not open on a wall of
        // "The field is required".
        assert.equal(
            shouldShowFieldError({ fieldName: "ppn", touchedFields, showAllErrors: false }),
            false,
        );
    });

    it("shows errors once the field has been touched", () => {
        assert.equal(
            shouldShowFieldError({ fieldName: "nodes", touchedFields, showAllErrors: false }),
            true,
        );
    });

    it("shows everything when the whole form has to answer for itself", () => {
        assert.equal(
            shouldShowFieldError({ fieldName: "ppn", touchedFields, showAllErrors: true }),
            true,
        );
        assert.equal(
            shouldShowFieldError({ fieldName: null, touchedFields, showAllErrors: true }),
            true,
        );
    });

    it("stays quiet for errors it cannot attribute to a field", () => {
        assert.equal(
            shouldShowFieldError({ fieldName: undefined, touchedFields, showAllErrors: false }),
            false,
        );
    });
});
