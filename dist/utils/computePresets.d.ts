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
export declare const COMPUTE_PRESETS: ComputePreset[];
export declare function formatWalltime(hours: number): string;
/**
 * The preset as it would actually be applied on this cluster. A "Production"
 * preset asking for 4 nodes on a 2-node cluster becomes 2 nodes rather than a
 * configuration that fails validation the moment it is applied.
 */
export declare function resolvePreset(preset: ComputePreset, limits?: ClusterLimits): ComputePreset;
/** The compute fields a preset sets. Everything else — cluster, queue — is left alone. */
export declare function presetToCompute(preset: ComputePreset, limits?: ClusterLimits): Pick<ComputeConfiguration, "nodes" | "ppn" | "timeLimit">;
/**
 * Which preset the current configuration matches, if any. Used to show the
 * chosen preset as selected — and, once the reader edits a field, to stop
 * claiming a preset that no longer describes what is set.
 */
export declare function findMatchingPreset(compute: ComputeConfiguration | null | undefined, limits?: ClusterLimits): ComputePreset | undefined;
