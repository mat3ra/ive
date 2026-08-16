import MetricTile from "@mat3ra/cove/dist/mui/components/metric/MetricTile";
import SelectableCard, {
    SelectableCardGroup,
} from "@mat3ra/cove/dist/mui/components/selectable-card/SelectableCard";
import StatusChip from "@mat3ra/cove/dist/mui/components/status/StatusChip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";

import type { ClusterMetadata } from "../utils/computeEstimate";
import { formatCost } from "../utils/computeEstimate";

export interface ClusterCardsProps {
    /** The host's cluster list, unchanged — `hostname`, `displayName`, `queues`. */
    clusters: Array<Record<string, any>>;
    /** Pricing, limits and queue waits, keyed by fqdn. Optional. */
    clusterMetadata?: ClusterMetadata[];
    selectedHostname?: string;
    onSelect: (hostname: string) => void;
    disabled?: boolean;
    id?: string;
}

/** How busy a queue is, as words rather than a bare number. */
function queueBadge(metadata?: ClusterMetadata) {
    const wait = metadata?.queueWaitMinutes;
    if (wait === undefined) return null;

    const tone = wait <= 10 ? "success" : wait <= 30 ? "warning" : "neutral";

    return (
        <StatusChip
            tone={tone}
            iconName={wait <= 10 ? "shapes.check" : "shapes.loop"}
            label={`~${wait} min`}
            title="Typical wait before the job starts"
        />
    );
}

function describeCapacity(cluster: Record<string, any>, metadata?: ClusterMetadata): string {
    const queues: Array<Record<string, any>> = cluster.queues ?? [];
    const queueNames = queues.map((queue) => queue.name).join(", ");
    const limits = metadata?.limits;
    const capacity =
        limits?.maxNodes && limits?.maxPpn
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
export default function ClusterCards({
    clusters,
    clusterMetadata = [],
    selectedHostname,
    onSelect,
    disabled = false,
    id,
}: ClusterCardsProps) {
    if (!clusters.length) {
        return (
            <Typography variant="body2" color="text.secondary">
                No clusters are available on this account.
            </Typography>
        );
    }

    return (
        <SelectableCardGroup label="Cluster" id={id}>
            {clusters.map((cluster) => {
                const metadata = clusterMetadata.find((entry) => entry.fqdn === cluster.hostname);
                const price = formatCost(metadata?.pricePerCoreHour, metadata?.currency);

                return (
                    <SelectableCard
                        key={cluster.hostname}
                        id={`cluster-card-${cluster.hostname}`}
                        title={cluster.displayName ?? cluster.hostname}
                        subtitle={describeCapacity(cluster, metadata)}
                        selected={cluster.hostname === selectedHostname}
                        disabled={disabled}
                        onSelect={() => onSelect(cluster.hostname)}
                        badge={queueBadge(metadata)}
                    >
                        <Stack direction="row" spacing={3}>
                            <MetricTile
                                size="small"
                                label="Price"
                                value={price}
                                unit={price ? "/ core·h" : undefined}
                                caption={price ? undefined : "not published"}
                            />
                            <MetricTile
                                size="small"
                                label="Max walltime"
                                value={metadata?.limits?.maxWalltimeHours}
                                unit="h"
                            />
                        </Stack>
                    </SelectableCard>
                );
            })}
        </SelectableCardGroup>
    );
}
