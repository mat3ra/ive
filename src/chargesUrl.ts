export type ChargesUrlResolver = (accountSlug: string | undefined, jobId: string) => string;

const defaultChargesUrlResolver: ChargesUrlResolver = (accountSlug, jobId) =>
    `#billing/${accountSlug || "default"}/charges?jid=${jobId}`;

let chargesUrlResolver = defaultChargesUrlResolver;

/**
 * The host app knows its own routes; it sets the resolver for the billing page of a job's charges.
 */
export function setChargesUrlResolver(resolver: ChargesUrlResolver) {
    chargesUrlResolver = resolver;
}

export function getChargesUrl(accountSlug: string | undefined, jobId: string) {
    return chargesUrlResolver(accountSlug, jobId);
}
