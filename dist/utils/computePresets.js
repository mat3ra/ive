export const COMPUTE_PRESETS = [
    {
        id: "debug",
        label: "Debug",
        description: "Smallest run that exercises the workflow",
        nodes: 1,
        ppn: 4,
        walltimeHours: 1,
    },
    {
        id: "standard",
        label: "Standard",
        description: "A single node, most of a day",
        nodes: 1,
        ppn: 16,
        walltimeHours: 8,
    },
    {
        id: "production",
        label: "Production",
        description: "Several nodes for a long run",
        nodes: 4,
        ppn: 32,
        walltimeHours: 24,
    },
];
export function formatWalltime(hours) {
    const totalMinutes = Math.round(hours * 60);
    const hh = Math.floor(totalMinutes / 60);
    const mm = totalMinutes % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`;
}
/**
 * The preset as it would actually be applied on this cluster. A "Production"
 * preset asking for 4 nodes on a 2-node cluster becomes 2 nodes rather than a
 * configuration that fails validation the moment it is applied.
 */
export function resolvePreset(preset, limits) {
    var _a, _b, _c;
    if (!limits)
        return preset;
    return {
        ...preset,
        nodes: Math.min(preset.nodes, (_a = limits.maxNodes) !== null && _a !== void 0 ? _a : preset.nodes),
        ppn: Math.min(preset.ppn, (_b = limits.maxPpn) !== null && _b !== void 0 ? _b : preset.ppn),
        walltimeHours: Math.min(preset.walltimeHours, (_c = limits.maxWalltimeHours) !== null && _c !== void 0 ? _c : preset.walltimeHours),
    };
}
/** The compute fields a preset sets. Everything else — cluster, queue — is left alone. */
export function presetToCompute(preset, limits) {
    const resolved = resolvePreset(preset, limits);
    return {
        nodes: resolved.nodes,
        ppn: resolved.ppn,
        timeLimit: formatWalltime(resolved.walltimeHours),
    };
}
/**
 * Which preset the current configuration matches, if any. Used to show the
 * chosen preset as selected — and, once the reader edits a field, to stop
 * claiming a preset that no longer describes what is set.
 */
export function findMatchingPreset(compute, limits) {
    if (!(compute === null || compute === void 0 ? void 0 : compute.nodes) || !(compute === null || compute === void 0 ? void 0 : compute.ppn) || !(compute === null || compute === void 0 ? void 0 : compute.timeLimit))
        return undefined;
    return COMPUTE_PRESETS.find((preset) => {
        const applied = presetToCompute(preset, limits);
        return (applied.nodes === compute.nodes &&
            applied.ppn === compute.ppn &&
            applied.timeLimit === compute.timeLimit);
    });
}
