import NumericStepperInput from "@mat3ra/cove/dist/mui/components/numeric-stepper/NumericStepperInput";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React from "react";

import type { ClusterLimits, ComputeConfiguration } from "../utils/computeEstimate";
import { parseWalltimeHours } from "../utils/computeEstimate";
import type { ComputePreset } from "../utils/computePresets";
import {
    COMPUTE_PRESETS,
    findMatchingPreset,
    presetToCompute,
    resolvePreset,
} from "../utils/computePresets";

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
export default function ComputeResources({
    compute,
    queues = [],
    limits,
    onChange,
    disabled = false,
    showAllErrors = false,
    id = "compute-resources",
}: ComputeResourcesProps) {
    const [touched, setTouched] = React.useState<Record<string, boolean>>({});
    const walltimeHours = parseWalltimeHours(compute?.timeLimit);
    const activePreset = findMatchingPreset(compute, limits);

    const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));
    const shouldShow = (field: string) => showAllErrors || touched[field];

    const applyPreset = (preset: ComputePreset) => {
        setTouched({ nodes: true, ppn: true, timeLimit: true });
        onChange(presetToCompute(preset, limits));
    };

    const nodesError =
        shouldShow("nodes") &&
        limits?.maxNodes !== undefined &&
        (compute?.nodes ?? 0) > limits.maxNodes;
    const ppnError =
        shouldShow("ppn") && limits?.maxPpn !== undefined && (compute?.ppn ?? 0) > limits.maxPpn;
    const walltimeError =
        shouldShow("timeLimit") &&
        limits?.maxWalltimeHours !== undefined &&
        walltimeHours !== undefined &&
        walltimeHours > limits.maxWalltimeHours;

    return (
        <Stack spacing={2} id={id}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="caption" color="text.secondary">
                    Start from
                </Typography>
                {COMPUTE_PRESETS.map((preset) => {
                    const resolved = resolvePreset(preset, limits);
                    const isActive = activePreset?.id === preset.id;

                    return (
                        <Button
                            key={preset.id}
                            id={`compute-preset-${preset.id}`}
                            size="small"
                            variant={isActive ? "contained" : "outlined"}
                            disabled={disabled}
                            onClick={() => applyPreset(preset)}
                            title={`${preset.description} — ${resolved.nodes} × ${resolved.ppn}, ${resolved.walltimeHours} h`}
                        >
                            {preset.label}
                        </Button>
                    );
                })}
            </Stack>

            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {queues.length ? (
                    <TextField
                        id="compute-queue"
                        select
                        label="Queue"
                        size="small"
                        sx={{ minWidth: 200 }}
                        value={compute?.queue ?? ""}
                        disabled={disabled}
                        helperText="Determines the walltime cap and the wait"
                        onChange={(event) => {
                            markTouched("queue");
                            onChange({ queue: event.target.value });
                        }}
                    >
                        {queues.map((queue) => (
                            <MenuItem key={queue.name} value={queue.name}>
                                {queue.displayName ?? queue.name}
                            </MenuItem>
                        ))}
                    </TextField>
                ) : null}
                <NumericStepperInput
                    id="compute-nodes"
                    label="Nodes"
                    value={compute?.nodes}
                    min={1}
                    max={limits?.maxNodes}
                    disabled={disabled}
                    error={Boolean(nodesError)}
                    helperText={
                        nodesError
                            ? `Over the ${limits?.maxNodes}-node limit`
                            : describeRange(1, limits?.maxNodes)
                    }
                    onChange={(nodes) => {
                        markTouched("nodes");
                        onChange({ nodes });
                    }}
                />
                <NumericStepperInput
                    id="compute-ppn"
                    label="Cores per node"
                    value={compute?.ppn}
                    min={1}
                    max={limits?.maxPpn}
                    unit="cores"
                    disabled={disabled}
                    error={Boolean(ppnError)}
                    helperText={
                        ppnError
                            ? `Over the ${limits?.maxPpn}-core limit`
                            : describeRange(1, limits?.maxPpn)
                    }
                    onChange={(ppn) => {
                        markTouched("ppn");
                        onChange({ ppn });
                    }}
                />
                <TextField
                    id="compute-walltime"
                    label="Walltime"
                    size="small"
                    // Free text rather than a stepper: HH:MM:SS is what the queue
                    // takes and what the reader recognises from the scheduler.
                    value={compute?.timeLimit ?? ""}
                    placeholder="HH:MM:SS"
                    disabled={disabled}
                    error={Boolean(walltimeError)}
                    helperText={
                        walltimeError
                            ? `Over the ${limits?.maxWalltimeHours} h queue limit`
                            : limits?.maxWalltimeHours
                              ? `up to ${limits.maxWalltimeHours} h`
                              : "HH:MM:SS"
                    }
                    onChange={(event) => {
                        markTouched("timeLimit");
                        onChange({ timeLimit: event.target.value });
                    }}
                />
            </Stack>
        </Stack>
    );
}

function describeRange(min: number, max?: number): string {
    return max === undefined ? `${min} or more` : `${min} to ${max}`;
}
