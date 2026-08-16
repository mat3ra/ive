/**
 * Progressive validation state for the compute form.
 *
 * The form validates live, which used to mean a brand-new job opened on a wall
 * of "The field is required" — an error message about something the reader has
 * not had a chance to do yet. These helpers narrow that to fields the reader has
 * actually interacted with, while still allowing every error to be revealed at
 * once when something downstream (submit preflight) needs the full picture.
 */

/** RJSF prefixes generated field ids with this; `root_nodes` → `nodes`. */
const RJSF_FIELD_ID_PREFIX = "root_";

/**
 * Maps an RJSF field id to the key used in form data and in the validation
 * error object. The compute form flattens its data, so a nested property
 * arrives as a single dotted key (`root_cluster.fqdn` → `cluster.fqdn`).
 *
 * Returns null for ids that are not field ids (the form root itself, or an
 * absent id) — callers treat that as "nothing became touched".
 */
export function fieldNameFromFieldId(fieldId?: string | null): string | null {
    if (!fieldId || !fieldId.startsWith(RJSF_FIELD_ID_PREFIX)) return null;

    return fieldId.slice(RJSF_FIELD_ID_PREFIX.length) || null;
}

/**
 * Returns the touched set including `fieldId`. The same set instance is
 * returned when nothing changed, so callers can skip a re-render.
 */
export function withTouchedField(
    touchedFields: ReadonlySet<string>,
    fieldId?: string | null,
): ReadonlySet<string> {
    const fieldName = fieldNameFromFieldId(fieldId);

    if (!fieldName || touchedFields.has(fieldName)) return touchedFields;

    return new Set(touchedFields).add(fieldName);
}

export interface FieldErrorVisibilityOptions {
    /** Form-data key the error belongs to, e.g. "nodes" or "cluster.fqdn". */
    fieldName?: string | null;
    touchedFields: ReadonlySet<string>;
    /** Set once the whole form must own up — submit, preflight, an explicit check. */
    showAllErrors: boolean;
}

export function shouldShowFieldError({
    fieldName,
    touchedFields,
    showAllErrors,
}: FieldErrorVisibilityOptions): boolean {
    if (showAllErrors) return true;
    if (!fieldName) return false;

    return touchedFields.has(fieldName);
}
