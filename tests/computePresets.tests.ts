import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    COMPUTE_PRESETS,
    findMatchingPreset,
    formatWalltime,
    presetToCompute,
    resolvePreset,
} from "../src/utils/computePresets";

const limits = { maxNodes: 2, maxPpn: 16, maxWalltimeHours: 6 };
const production = COMPUTE_PRESETS.find((preset) => preset.id === "production")!;
const debug = COMPUTE_PRESETS.find((preset) => preset.id === "debug")!;

describe("formatWalltime", () => {
    it("writes the HH:MM:SS the scheduler takes", () => {
        assert.equal(formatWalltime(4), "04:00:00");
        assert.equal(formatWalltime(0.5), "00:30:00");
        assert.equal(formatWalltime(24), "24:00:00");
    });

    it("pads hours past a day rather than wrapping", () => {
        // "1-12:00:00" is a different form; the queue takes plain hours here.
        assert.equal(formatWalltime(36), "36:00:00");
    });
});

describe("resolvePreset", () => {
    it("clamps a preset to what the cluster actually allows", () => {
        // Applying Production unclamped would set 4 nodes on a 2-node cluster —
        // an invalid configuration produced by the button meant to avoid one.
        const resolved = resolvePreset(production, limits);
        assert.deepEqual(
            { nodes: resolved.nodes, ppn: resolved.ppn, walltimeHours: resolved.walltimeHours },
            { nodes: 2, ppn: 16, walltimeHours: 6 },
        );
    });

    it("leaves a preset alone where it already fits", () => {
        assert.deepEqual(resolvePreset(debug, limits), debug);
    });

    it("does not invent limits when the host published none", () => {
        assert.deepEqual(resolvePreset(production, undefined), production);
    });

    it("clamps only the dimensions that have a limit", () => {
        const resolved = resolvePreset(production, { maxNodes: 1 });
        assert.equal(resolved.nodes, 1);
        assert.equal(resolved.ppn, production.ppn);
        assert.equal(resolved.walltimeHours, production.walltimeHours);
    });
});

describe("presetToCompute", () => {
    it("sets only the three fields it owns", () => {
        assert.deepEqual(presetToCompute(debug), {
            nodes: 1,
            ppn: 4,
            timeLimit: "01:00:00",
        });
    });

    it("never proposes a configuration over the cluster's limits", () => {
        const applied = presetToCompute(production, limits);
        assert.ok(applied.nodes! <= limits.maxNodes);
        assert.ok(applied.ppn! <= limits.maxPpn);
        assert.equal(applied.timeLimit, "06:00:00");
    });
});

describe("findMatchingPreset", () => {
    it("recognises a configuration a preset produced", () => {
        assert.equal(findMatchingPreset(presetToCompute(debug))?.id, "debug");
    });

    it("matches against the clamped preset, not the nominal one", () => {
        // On a 2-node cluster, Production is 2×16×6h — that is what the button
        // sets, so that is what it must be shown as selected for.
        const applied = presetToCompute(production, limits);
        assert.equal(findMatchingPreset(applied, limits)?.id, "production");
        assert.equal(findMatchingPreset(applied)?.id, undefined);
    });

    it("stops claiming a preset once a field is edited", () => {
        const edited = { ...presetToCompute(debug), ppn: 8 };
        assert.equal(findMatchingPreset(edited), undefined);
    });

    it("claims nothing for a half-filled configuration", () => {
        assert.equal(findMatchingPreset({ nodes: 1, ppn: 4 }), undefined);
        assert.equal(findMatchingPreset(null), undefined);
    });
});
