import type { ClusterLimits, ComputeConfiguration } from "./computeEstimate";

/**
 * Starting points for a compute configuration.
 *
 * Most readers do not know how many nodes a relaxation wants; today the form
 * asks anyway, with empty fields and a required-field error apiece. A preset is
 * a defensible answer to "just give me something that runs" that the reader can
 * then adjust — and, unlike a hidden default, it says what it assumes.
 *
 * Presets are proposals, not policy: each is clamped to the cluster's published
 * limits, so picking one can never produce a configuration the queue would
 * reject.
 */

export interface ComputePreset {
    id: string;
    label: string;
    /** What this preset is for, in one line. */
    description: string;
    nodes: number;
    ppn: number;
    /** Hours; formatted to `HH:MM:SS` when applied. */
    walltimeHours: number;
}

export const COMPUTE_PRESETS: ComputePreset[] = [
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

export function formatWalltime(hours: number): string {
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
export function resolvePreset(preset: ComputePreset, limits?: ClusterLimits): ComputePreset {
    if (!limits) return preset;

    return {
        ...preset,
        nodes: Math.min(preset.nodes, limits.maxNodes ?? preset.nodes),
        ppn: Math.min(preset.ppn, limits.maxPpn ?? preset.ppn),
        walltimeHours: Math.min(
            preset.walltimeHours,
            limits.maxWalltimeHours ?? preset.walltimeHours,
        ),
    };
}

/** The compute fields a preset sets. Everything else — cluster, queue — is left alone. */
export function presetToCompute(
    preset: ComputePreset,
    limits?: ClusterLimits,
): Pick<ComputeConfiguration, "nodes" | "ppn" | "timeLimit"> {
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
export function findMatchingPreset(
    compute: ComputeConfiguration | null | undefined,
    limits?: ClusterLimits,
): ComputePreset | undefined {
    if (!compute?.nodes || !compute?.ppn || !compute?.timeLimit) return undefined;

    return COMPUTE_PRESETS.find((preset) => {
        const applied = presetToCompute(preset, limits);

        return (
            applied.nodes === compute.nodes &&
            applied.ppn === compute.ppn &&
            applied.timeLimit === compute.timeLimit
        );
    });
}
