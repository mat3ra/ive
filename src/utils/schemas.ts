import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import type { JSONSchema7 } from "json-schema";

import computeBase from "../schemas/ui/compute_base.json";
import computeEspresso from "../schemas/ui/compute_espresso.json";
import espressoArguments from "../schemas/ui/espresso_arguments.json";

const uiSchemas: Record<string, any> = {
    "job/compute/base": computeBase,
    "job/compute/espresso": computeEspresso,
    "software-directory/modeling/espresso/arguments": espressoArguments,
};

function mapObjectDeep(
    object: any,
    mapValue: (prop: any) => any | undefined,
): any {
    if (
        typeof object !== "object" ||
        object === null ||
        (typeof object === "object" && object.constructor !== Object)
    ) {
        return object;
    }

    if (Array.isArray(object)) {
        return object.map((innerValue) => mapObjectDeep(innerValue, mapValue));
    }

    const mappedObject = mapValue(object) || object;

    const entries = Object.entries(mappedObject).map(([key, value]) => {
        return [key, mapObjectDeep(value, mapValue)];
    });

    return Object.fromEntries(entries);
}

export class UISchema {
    private schema: any;
    private resolvedSchema: any = {};

    constructor(schema: any) {
        this.schema = schema;
        this.resolveSchema();
    }

    resolveSchemaValues(schemaValues: any) {
        return mapObjectDeep(this.resolvedSchema, (nestedObject: any) => {
            const entries = Object.entries(nestedObject).map(([key, value]) => {
                if (typeof value === "string") {
                    const matched = value.match(/^\$val\.(.+)$/);

                    if (matched) {
                        if (schemaValues[matched[1]] !== undefined) {
                            return [key, schemaValues[matched[1]]];
                        }

                        console.warn(`Schema ${this.schema.$id} variable ${matched[1]} not found`);
                    }
                }

                return [key, value];
            });

            return Object.fromEntries(entries);
        });
    }

    resolveSchema() {
        if (this.schema.allOf) {
            this.schema.allOf.forEach(({ $ref }: any) => {
                if ($ref) {
                    const schema = uiSchemas[$ref];
                    if (schema) {
                        this.resolvedSchema = {
                            ...this.resolvedSchema,
                            ...schema.properties,
                        };
                    }
                }
            });
        }

        if (Object.entries(this.resolvedSchema).length === 0) {
            this.resolvedSchema = {
                ...this.schema.properties,
            };
        }
    }
}

export function resolveJsonSchema(schemaId: string, removeRequired = false): JSONSchema7 {
    const schema = JSONSchemasInterface.getSchemaById(schemaId);
    if (!schema) {
        console.warn("Schema not found in ESSE:", schemaId);
        return {} as JSONSchema7;
    }
    if (removeRequired) {
        const { required, ...optionalSchema } = schema as any;
        return optionalSchema as JSONSchema7;
    }
    return schema as JSONSchema7;
}

export function resolveUISchema(schemaId: string): UISchema {
    const schema = uiSchemas[schemaId];
    if (!schema) {
        throw new Error(`UI Schema is not found for ID: ${schemaId}`);
    }
    return new UISchema(schema);
}
