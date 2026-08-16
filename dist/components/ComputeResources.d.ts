import React from "react";
import type { ClusterLimits, ComputeConfiguration } from "../utils/computeEstimate";
export interface ComputeResourcesProps {
    compute?: ComputeConfiguration | null;
    /** Queues the selected cluster offers. Empty until a cluster is chosen. */
    queues?: Array<Record<string, any>>;
    /** Limits for the selected cluster. Absent when the host published none. */
    limits?: ClusterLimits;
    onChange: (patch: Partial<ComputeConfiguration>) => void;
    disabled?: boolean;
    /** Reveal limit violations for fields the reader has not touched yet. */
    showAllErrors?: boolean;
    id?: string;
}
/**
 * How much of the cluster this job wants.
 *
 * The three numbers that decide what a job costs used to be plain required text
 * fields: empty on arrival, red on first paint, and silent about the limits they
 * had to respect. Here the bounds live on the steppers, so nudging cannot
 * produce a configuration the queue would reject, and the presets give a reader
 * who does not know how many nodes a relaxation wants something defensible to
 * start from.
 *
 * Typed values are still allowed past the bounds and reported inline — but only
 * once the reader has been to the field, on the same rule as the rest of the
 * form (see `utils/touchedFields`).
 */
export default function ComputeResources({ compute, queues, limits, onChange, disabled, showAllErrors, id, }: ComputeResourcesProps): React.JSX.Element;
