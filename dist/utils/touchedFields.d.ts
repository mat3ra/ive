/**
 * Progressive validation state for the compute form.
 *
 * The form validates live, which used to mean a brand-new job opened on a wall
 * of "The field is required" — an error message about something the reader has
 * not had a chance to do yet. These helpers narrow that to fields the reader has
 * actually interacted with, while still allowing every error to be revealed at
 * once when something downstream (submit preflight) needs the full picture.
 */
/**
 * Maps an RJSF field id to the key used in form data and in the validation
 * error object. The compute form flattens its data, so a nested property
 * arrives as a single dotted key (`root_cluster.fqdn` → `cluster.fqdn`).
 *
 * Returns null for ids that are not field ids (the form root itself, or an
 * absent id) — callers treat that as "nothing became touched".
 */
export declare function fieldNameFromFieldId(fieldId?: string | null): string | null;
/**
 * Returns the touched set including `fieldId`. The same set instance is
 * returned when nothing changed, so callers can skip a re-render.
 */
export declare function withTouchedField(touchedFields: ReadonlySet<string>, fieldId?: string | null): ReadonlySet<string>;
export interface FieldErrorVisibilityOptions {
    /** Form-data key the error belongs to, e.g. "nodes" or "cluster.fqdn". */
    fieldName?: string | null;
    touchedFields: ReadonlySet<string>;
    /** Set once the whole form must own up — submit, preflight, an explicit check. */
    showAllErrors: boolean;
}
export declare function shouldShowFieldError({ fieldName, touchedFields, showAllErrors, }: FieldErrorVisibilityOptions): boolean;
