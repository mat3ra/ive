import { UISchema, resolveJsonSchema, resolveUISchema as coveResolveUISchema, } from "@mat3ra/cove/dist/other/rjsf/schemaUtils";
import computeBase from "../schemas/ui/compute_base.json";
import computeEspresso from "../schemas/ui/compute_espresso.json";
import espressoArguments from "../schemas/ui/espresso_arguments.json";
const uiSchemas = {
    "job/compute/base": computeBase,
    "job/compute/espresso": computeEspresso,
    "software-directory/modeling/espresso/arguments": espressoArguments,
};
/**
 * Resolve a UI schema by ID from this package's local registry.
 */
export function resolveUISchema(schemaId) {
    return coveResolveUISchema(schemaId, uiSchemas);
}
export { UISchema, resolveJsonSchema };
