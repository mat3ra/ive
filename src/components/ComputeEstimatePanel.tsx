import MetricTile from "@mat3ra/cove/dist/mui/components/metric/MetricTile";
import SegmentedMeter from "@mat3ra/cove/dist/mui/components/metric/SegmentedMeter";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";

import type { ClusterMetadata, ComputeConfiguration, ComputeQuota } from "../utils/computeEstimate";
import {
    estimateComputeUsage,
    findClusterMetadata,
    formatCoreHours,
    formatCost,
} from "../utils/computeEstimate";

export interface ComputeEstimatePanelProps {
    compute?: ComputeConfiguration | null;
    clusterMetadata?: ClusterMetadata[];
    quota?: ComputeQuota | null;
    /** Multi-material jobs run once per material; the estimate is for all of them. */
    runs?: number;
    id?: string;
}

/**
 * What this configuration will consume, while it is still being configured.
 *
 * The form's fields are inputs to an arithmetic nobody was doing: 4 nodes × 32
 * cores × 12 hours is 1536 core-hours, which on a 500-hour quota is a
 * conversation the reader should have before submitting, not after. Every tile
 * degrades independently — core-hours need only the job, cost needs a published
 * price, the quota bar needs an injected allowance — and a tile with nothing
 * behind it shows an em dash rather than a zero.
 */
export default function ComputeEstimatePanel({
    compute,
    clusterMetadata = [],
    quota,
    runs = 1,
    id = "compute-estimate-panel",
}: ComputeEstimatePanelProps) {
    const estimate = estimateComputeUsage(compute, clusterMetadata, runs);
    const cluster = findClusterMetadata(compute, clusterMetadata);
    const remaining = quota?.remainingCoreHours;

    const isOverQuota = remaining !== undefined && (estimate.coreHours ?? 0) > remaining;
    const usedBefore =
        quota?.totalCoreHours !== undefined && remaining !== undefined
            ? Math.max(quota.totalCoreHours - remaining, 0)
            : undefined;

    return (
        <Paper id={id} sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                Estimate
            </Typography>

            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                <MetricTile
                    id="estimate-core-hours"
                    label="Core-hours"
                    value={
                        estimate.coreHours === undefined
                            ? undefined
                            : formatCoreHours(estimate.coreHours)?.replace(" core·h", "")
                    }
                    unit="core·h"
                    tone={isOverQuota ? "error" : "default"}
                    caption={describeDerivation(
                        estimate.nodes,
                        estimate.ppn,
                        estimate.walltimeHours,
                        runs,
                    )}
                />
                <MetricTile
                    id="estimate-cost"
                    label="Cost"
                    value={formatCost(estimate.cost, estimate.currency)}
                    caption={
                        cluster?.pricePerCoreHour === undefined
                            ? "no price published for this cluster"
                            : `at ${formatCost(cluster.pricePerCoreHour, cluster.currency)} / core·h`
                    }
                />
                <MetricTile
                    id="estimate-queue-wait"
                    label="Queue wait"
                    value={
                        cluster?.queueWaitMinutes === undefined
                            ? undefined
                            : `~${cluster.queueWaitMinutes}`
                    }
                    unit="min"
                    caption="typical, before the job starts"
                />
            </Stack>

            {remaining !== undefined && quota?.totalCoreHours !== undefined ? (
                <Stack sx={{ mt: 2 }}>
                    <SegmentedMeter
                        id="estimate-quota-meter"
                        label="Monthly quota"
                        total={quota.totalCoreHours}
                        caption={describeQuota(estimate.coreHours, remaining)}
                        segments={[
                            ...(usedBefore
                                ? [
                                      {
                                          label: "Already used",
                                          value: usedBefore,
                                          color: "primary.main",
                                      },
                                  ]
                                : []),
                            {
                                label: "This job",
                                value: estimate.coreHours ?? 0,
                                color: isOverQuota ? "error.main" : "warning.main",
                                isProjected: true,
                            },
                        ]}
                    />
                </Stack>
            ) : null}
        </Paper>
    );
}

function describeDerivation(
    nodes?: number,
    ppn?: number,
    walltimeHours?: number,
    runs = 1,
): string | undefined {
    if (!nodes || !ppn || walltimeHours === undefined) return "set nodes, cores and a walltime";

    const base = `${nodes} × ${ppn} × ${Math.round(walltimeHours * 10) / 10} h`;

    return runs > 1 ? `${base}, ${runs} materials` : base;
}

function describeQuota(coreHours: number | undefined, remaining: number): string {
    if (coreHours === undefined) return `${formatCoreHours(remaining)} left this month`;
    if (coreHours > remaining) {
        return `over by ${formatCoreHours(coreHours - remaining)}`;
    }

    return `${formatCoreHours(remaining - coreHours)} would remain`;
}
