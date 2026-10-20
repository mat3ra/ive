/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert";
import test from "node:test";

import { getChargesUrl, setChargesUrlResolver } from "../src/chargesUrl.ts";

test("the default resolver points at the billing hash of the account", () => {
    assert.strictEqual(getChargesUrl("acme", "42"), "#billing/acme/charges?jid=42");
    assert.strictEqual(getChargesUrl(undefined, "42"), "#billing/default/charges?jid=42");
});

test("the resolver set by the host builds the URL", () => {
    setChargesUrlResolver((accountSlug, jobId) => `/${accountSlug}/billing/charges?jid=${jobId}`);

    assert.strictEqual(getChargesUrl("acme", "42"), "/acme/billing/charges?jid=42");
});
