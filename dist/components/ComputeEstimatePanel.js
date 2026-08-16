import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import MetricTile from "@mat3ra/cove/dist/mui/components/metric/MetricTile";
import SegmentedMeter from "@mat3ra/cove/dist/mui/components/metric/SegmentedMeter";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { estimateComputeUsage, findClusterMetadata, formatCoreHours, formatCost, } from "../utils/computeEstimate";
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
export default function ComputeEstimatePanel({ compute, clusterMetadata = [], quota, runs = 1, id = "compute-estimate-panel", }) {
    var _a, _b, _c;
    const estimate = estimateComputeUsage(compute, clusterMetadata, runs);
    const cluster = findClusterMetadata(compute, clusterMetadata);
    const remaining = quota === null || quota === void 0 ? void 0 : quota.remainingCoreHours;
    const isOverQuota = remaining !== undefined && ((_a = estimate.coreHours) !== null && _a !== void 0 ? _a : 0) > remaining;
    const usedBefore = (quota === null || quota === void 0 ? void 0 : quota.totalCoreHours) !== undefined && remaining !== undefined
        ? Math.max(quota.totalCoreHours - remaining, 0)
        : undefined;
    return (_jsxs(Paper, { id: id, sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Estimate" }), _jsxs(Stack, { direction: "row", spacing: 3, flexWrap: "wrap", useFlexGap: true, children: [_jsx(MetricTile, { id: "estimate-core-hours", label: "Core-hours", value: estimate.coreHours === undefined
                            ? undefined
                            : (_b = formatCoreHours(estimate.coreHours)) === null || _b === void 0 ? void 0 : _b.replace(" core·h", ""), unit: "core\u00B7h", tone: isOverQuota ? "error" : "default", caption: describeDerivation(estimate.nodes, estimate.ppn, estimate.walltimeHours, runs) }), _jsx(MetricTile, { id: "estimate-cost", label: "Cost", value: formatCost(estimate.cost, estimate.currency), caption: (cluster === null || cluster === void 0 ? void 0 : cluster.pricePerCoreHour) === undefined
                            ? "no price published for this cluster"
                            : `at ${formatCost(cluster.pricePerCoreHour, cluster.currency)} / core·h` }), _jsx(MetricTile, { id: "estimate-queue-wait", label: "Queue wait", value: (cluster === null || cluster === void 0 ? void 0 : cluster.queueWaitMinutes) === undefined
                            ? undefined
                            : `~${cluster.queueWaitMinutes}`, unit: "min", caption: "typical, before the job starts" })] }), remaining !== undefined && (quota === null || quota === void 0 ? void 0 : quota.totalCoreHours) !== undefined ? (_jsx(Stack, { sx: { mt: 2 }, children: _jsx(SegmentedMeter, { id: "estimate-quota-meter", label: "Monthly quota", total: quota.totalCoreHours, caption: describeQuota(estimate.coreHours, remaining), segments: [
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
                            value: (_c = estimate.coreHours) !== null && _c !== void 0 ? _c : 0,
                            color: isOverQuota ? "error.main" : "warning.main",
                            isProjected: true,
                        },
                    ] }) })) : null] }));
}
function describeDerivation(nodes, ppn, walltimeHours, runs = 1) {
    if (!nodes || !ppn || walltimeHours === undefined)
        return "set nodes, cores and a walltime";
    const base = `${nodes} × ${ppn} × ${Math.round(walltimeHours * 10) / 10} h`;
    return runs > 1 ? `${base}, ${runs} materials` : base;
}
function describeQuota(coreHours, remaining) {
    if (coreHours === undefined)
        return `${formatCoreHours(remaining)} left this month`;
    if (coreHours > remaining) {
        return `over by ${formatCoreHours(coreHours - remaining)}`;
    }
    return `${formatCoreHours(remaining - coreHours)} would remain`;
}
