import React from "react";
import type { ClusterMetadata, ComputeConfiguration, ComputeQuota } from "../utils/computeEstimate";
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
export default function ComputeEstimatePanel({ compute, clusterMetadata, quota, runs, id, }: ComputeEstimatePanelProps): React.JSX.Element;
