import React from "react";
import type { ClusterMetadata } from "../utils/computeEstimate";
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
/**
 * The cluster choice, as cards.
 *
 * It used to be a `select`: one line of text per cluster, and everything a
 * reader would actually choose on — what it costs, how long the queue is, how
 * big a job it will take — either absent or a click away in a popover table.
 * The card carries those facts next to the name, which is the only arrangement
 * that makes the choice a comparison rather than a guess.
 */
export default function ClusterCards({ clusters, clusterMetadata, selectedHostname, onSelect, disabled, id, }: ClusterCardsProps): React.JSX.Element;
