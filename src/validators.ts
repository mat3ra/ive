import { QUEUE_TYPES } from "@mat3ra/ide";
import Ajv from "ajv";
import s from "underscore.string";

import { resolveJsonSchema } from "./utils/schemas";

// TODO : should this move to infrastructure_ide

const defaultCluster = { hostname: "localhost" };

/**
 * @summary Mock method for BackendManager.getNodeByHostname
 * @param hostname {String} hostname
 * @returns {*} node data
 */
const getNodeByHostname = (hostname: string) => {
    return {
        hostname,
        queues: [
            {
                "CURRENT-NODECT": 1,
                "MAX-AVAILABLE-NODECT": 9,
                "MAX-PPN": 2,
                NAME: "D",
                "NODE-LIMIT": 10,
            },
        ],
    };
};

/**
 * @summary Custom PPN validator
 *
 * Registered on the `validatePpn` ajv keyword below, but that keyword is never referenced
 * by any schema in `src/schemas/ui/` or esse's `compute` schemas - dead code, ajv never
 * actually invokes this. Its 3-arg signature doesn't match ajv v8's real `schema: false`
 * custom-keyword contract either (`(data, dataCxt)` - two args, no third `data` param;
 * see `node_modules/ajv/dist/vocabularies/code.js`'s `callValidateCode`), which is only
 * possible to say for certain because it's unreachable - left as-is rather than guessing
 * at intended behavior for a path nothing exercises.
 */
const validatePpn = (ppn: number, dataPath: unknown, data: Record<string, any> = {}) => {
    const { queue: queueName, node } = data;
    // mock method doesn't return Queue objects so name -> NAME && maxPPN -> MAX-PPN
    const queue = node
        ? node.queues.find((q: Record<string, any>) => q.name === queueName || q.NAME === queueName)
        : undefined;
    const maxPPN = queue ? queue.maxPPN || queue["MAX-PPN"] : 1;
    if (ppn > maxPPN) return false;
    return true;
};

const oneNodeQueueTypeList = [
    QUEUE_TYPES.debug,
    QUEUE_TYPES.ordinaryRegular,
    QUEUE_TYPES.ordinaryRegular4,
    QUEUE_TYPES.ordinaryRegular8,
    QUEUE_TYPES.ordinaryRegular16,
    QUEUE_TYPES.savingRegular,
    QUEUE_TYPES.savingRegular4,
    QUEUE_TYPES.savingRegular8,
    QUEUE_TYPES.savingRegular16,
];

const maxTenNodesQueueTypeList = [
    QUEUE_TYPES.gpuOrdinaryFast,
    QUEUE_TYPES["4gpuOrdinaryFast"],
    QUEUE_TYPES["8gpuOrdinaryFast"],
    QUEUE_TYPES.gpuPOrdinaryFast,
    QUEUE_TYPES.gpuP2OrdinaryFast,
    QUEUE_TYPES.gpuP4OrdinaryFast,
    QUEUE_TYPES.gpuSavingFast,
    QUEUE_TYPES["4gpuSavingFast"],
    QUEUE_TYPES["8gpuSavingFast"],
    QUEUE_TYPES.gpuPSavingFast,
    QUEUE_TYPES.gpuP2SavingFast,
    QUEUE_TYPES.gpuP4SavingFast,
    QUEUE_TYPES.savingFast,
    QUEUE_TYPES.savingFastPlus,
    QUEUE_TYPES.ordinaryFast,
    QUEUE_TYPES.ordinaryFastPlus,
];

/**
 * @summary Custom node validator
 *
 * Same "registered but never referenced by any schema" situation as `validatePpn` above.
 */
const validateNodes = (nodes: number, dataPath: unknown, data: Record<string, any> = {}) => {
    const { queue } = data;

    if (oneNodeQueueTypeList.includes(queue) && nodes !== 1) {
        return false;
    }

    if (maxTenNodesQueueTypeList.includes(queue) && nodes > 10) {
        return false;
    }

    return true;
};

// TODO : should get available number of nodes from backend side
export const getNodeNumber = (queueName: string) => {
    if (oneNodeQueueTypeList.includes(queueName as (typeof oneNodeQueueTypeList)[number])) {
        return 1;
    }

    if (maxTenNodesQueueTypeList.includes(queueName as (typeof maxTenNodesQueueTypeList)[number])) {
        return 10;
    }

    return undefined;
};

const timeLimitRegex = /^([0-9][0-9])?:?[0-9]?[0-9][0-9]:[0-5][0-9]:[0-5][0-9]$/;
const validateTimeLimit = (timeLimit: string) => Boolean(timeLimit.match(timeLimitRegex));

/**
 * @summary Helper to merge compute schema with application's advanced compute schema
 * @param schema {Object} compute schema
 * @param appName {String} name of application with advanced compute options
 * @returns {*} updated schema
 */
const updateComputeSchemaWithApplication = (schema: Record<string, any>, appName: string) => {
    // Guard: if schema has no properties (e.g. standalone mode), return as-is.
    if (!schema?.properties) return schema;
    const schemaIds: Record<string, string> = {
        espresso: "software-directory/modeling/espresso/arguments",
    };
    const schemaId = schemaIds[appName];
    if (schemaId) {
        const argSchema = resolveJsonSchema(schemaId);
        schema.properties.arguments.properties = argSchema.properties;
    } else {
        const { arguments: args, ...properties } = schema.properties;
        return {
            ...schema,
            properties: {
                ...properties,
            },
        };
    }
    return schema;
};

/**
 * @summary Gets a compatible JSON schema for replacing the simple schema
 * @param appName {String} application name with advanced compute options
 * @returns {*} the schema
 */
const getComputeSchema = (appName: string) => {
    let schema = resolveJsonSchema("job/compute") as Record<string, any>;
    schema = updateComputeSchemaWithApplication(schema, appName);
    // Guard: schema may be empty ({}) in standalone mode when ESSE registry lacks 'job/compute'
    if (schema?.properties?.queue) {
        schema.properties.queue.enum = Object.values(QUEUE_TYPES);
    }
    if (schema?.properties?.timeLimitType) {
        schema.properties.timeLimitType.enum = ["per single attempt", "compound"];
    }
    return schema;
};

/**
 * @summary Gets compute validator fully customized for compatibility with existing simple schema.
 *          Due to error messages being handled as a function of the internals of the current schema,
 *          the getErrorMessage function is also returned for downstream use.
 * @param schema {Object} the full schema (including advanced compute options if available)
 * @returns {{validator: ajv.ValidateFunction, getErrorMessage: ((function(*): ({name: *, message: string}))|*)}}
 */
const getComputeValidator = (schema: Record<string, any>) => {
    const errorMessages: Record<string, string> = {
        timeLimit: "Time, 00:00:00 - 99:59:59",
        ppn: "Max count exceeded",
        nodes: "Max node count for selected queue exceeded",
    };

    const ajv = new Ajv({ allErrors: true, verbose: true });
    ajv.addKeyword({
        keyword: "validateTimeLimit",
        type: "string",
        validate: validateTimeLimit,
        schema: false,
    });
    ajv.addKeyword({
        keyword: "validatePpn",
        type: "integer",
        validate: validatePpn,
        schema: false,
    });
    ajv.addKeyword({
        keyword: "validateNodes",
        type: "integer",
        validate: validateNodes,
        schema: false,
    });

    /**
     * @summary Traverses the returned ajv object to determine which error message to display
     * @param obj {Object} returned object from ajv on validation failure
     * @returns {{name: string, message: string}}
     */
    const getErrorMessage = (obj: Record<string, any>) => {
        const name = obj.instancePath.slice(1);
        const view = name.split(".").pop();
        const message = `${s.titleize(view)} ${obj.message}.`;
        if (obj.keyword === "type") {
            return { name, message };
        }
        if (errorMessages[name]) {
            return { name, message: errorMessages[name] };
        }
        return { name, message };
    };

    return { validator: ajv.compile(schema), getErrorMessage };
};

export { defaultCluster, getComputeSchema, getComputeValidator, getNodeByHostname };
