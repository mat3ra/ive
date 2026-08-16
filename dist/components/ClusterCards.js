import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import MetricTile from "@mat3ra/cove/dist/mui/components/metric/MetricTile";
import SelectableCard, { SelectableCardGroup, } from "@mat3ra/cove/dist/mui/components/selectable-card/SelectableCard";
import StatusChip from "@mat3ra/cove/dist/mui/components/status/StatusChip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatCost } from "../utils/computeEstimate";
/** How busy a queue is, as words rather than a bare number. */
function queueBadge(metadata) {
    const wait = metadata === null || metadata === void 0 ? void 0 : metadata.queueWaitMinutes;
    if (wait === undefined)
        return null;
    const tone = wait <= 10 ? "success" : wait <= 30 ? "warning" : "neutral";
    return (_jsx(StatusChip, { tone: tone, iconName: wait <= 10 ? "shapes.check" : "shapes.loop", label: `~${wait} min`, title: "Typical wait before the job starts" }));
}
function describeCapacity(cluster, metadata) {
    var _a;
    const queues = (_a = cluster.queues) !== null && _a !== void 0 ? _a : [];
    const queueNames = queues.map((queue) => queue.name).join(", ");
    const limits = metadata === null || metadata === void 0 ? void 0 : metadata.limits;
    const capacity = (limits === null || limits === void 0 ? void 0 : limits.maxNodes) && (limits === null || limits === void 0 ? void 0 : limits.maxPpn)
        ? `up to ${limits.maxNodes} nodes × ${limits.maxPpn} cores`
        : undefined;
    return [queueNames && `queue ${queueNames}`, capacity].filter(Boolean).join(" · ");
}
/**
 * The cluster choice, as cards.
 *
 * It used to be a `select`: one line of text per cluster, and everything a
 * reader would actually choose on — what it costs, how long the queue is, how
 * big a job it will take — either absent or a click away in a popover table.
 * The card carries those facts next to the name, which is the only arrangement
 * that makes the choice a comparison rather than a guess.
 */
export default function ClusterCards({ clusters, clusterMetadata = [], selectedHostname, onSelect, disabled = false, id, }) {
    if (!clusters.length) {
        return (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "No clusters are available on this account." }));
    }
    return (_jsx(SelectableCardGroup, { label: "Cluster", id: id, children: clusters.map((cluster) => {
            var _a, _b;
            const metadata = clusterMetadata.find((entry) => entry.fqdn === cluster.hostname);
            const price = formatCost(metadata === null || metadata === void 0 ? void 0 : metadata.pricePerCoreHour, metadata === null || metadata === void 0 ? void 0 : metadata.currency);
            return (_jsx(SelectableCard, { id: `cluster-card-${cluster.hostname}`, title: (_a = cluster.displayName) !== null && _a !== void 0 ? _a : cluster.hostname, subtitle: describeCapacity(cluster, metadata), selected: cluster.hostname === selectedHostname, disabled: disabled, onSelect: () => onSelect(cluster.hostname), badge: queueBadge(metadata), children: _jsxs(Stack, { direction: "row", spacing: 3, children: [_jsx(MetricTile, { size: "small", label: "Price", value: price, unit: price ? "/ core·h" : undefined, caption: price ? undefined : "not published" }), _jsx(MetricTile, { size: "small", label: "Max walltime", value: (_b = metadata === null || metadata === void 0 ? void 0 : metadata.limits) === null || _b === void 0 ? void 0 : _b.maxWalltimeHours, unit: "h" })] }) }, cluster.hostname));
        }) }));
}
