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
const getNodeByHostname = (hostname) => {
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
 * @param ppn {Number} processors per node
 * @param dataPath {String} dot-delimited path to data in schema
 * @param data {Object} the current "form" state
 * @returns {boolean} successful validation
 */
const validatePpn = (ppn, dataPath, data) => {
    const { queue: queueName, node } = data;
    // mock method doesn't return Queue objects so name -> NAME && maxPPN -> MAX-PPN
    const queue = node
        ? node.queues.find((q) => q.name === queueName || q.NAME === queueName)
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
 * @param nodes {Number} number of nodes
 * @param dataPath {String} dot-delimited path to data in schema
 * @param data {Object} the current "form" state
 * @returns {boolean} successful validation
 */
const validateNodes = (nodes, dataPath, data) => {
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
export const getNodeNumber = (queueName) => {
    if (oneNodeQueueTypeList.includes(queueName)) {
        return 1;
    }

    if (maxTenNodesQueueTypeList.includes(queueName)) {
        return 10;
    }
};

const timeLimitRegex = /^([0-9][0-9])?:?[0-9]?[0-9][0-9]:[0-5][0-9]:[0-5][0-9]$/;
const validateTimeLimit = (timeLimit) => Boolean(timeLimit.match(timeLimitRegex));

/**
 * @summary Helper to merge compute schema with application's advanced compute schema
 * @param schema {Object} compute schema
 * @param appName {String} name of application with advanced compute options
 * @returns {*} updated schema
 */
const updateComputeSchemaWithApplication = (schema, appName) => {
    const schemaIds = {
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
const getComputeSchema = (appName) => {
    let schema = resolveJsonSchema("job/compute");
    schema = updateComputeSchemaWithApplication(schema, appName);
    schema.properties.queue.enum = Object.values(QUEUE_TYPES);
    schema.properties.timeLimitType.enum = ["per single attempt", "compound"];
    return schema;
};

/**
 * @summary Gets compute validator fully customized for compatibility with existing simple schema.
 *          Due to error messages being handled as a function of the internals of the current schema,
 *          the getErrorMessage function is also returned for downstream use.
 * @param schema {Object} the full schema (including advanced compute options if available)
 * @returns {{validator: ajv.ValidateFunction, getErrorMessage: ((function(*): ({name: *, message: string}))|*)}}
 */
const getComputeValidator = (schema) => {
    const errorMessages = {
        timeLimit: "Time, 00:00:00 - 99:59:59",
        ppn: "Max count exceeded",
        nodes: "Max node count for selected queue exceeded",
    };

    const ajv = new Ajv({ allErrors: true, verbose: true });
    ajv.addKeyword("validateTimeLimit", {
        type: "string",
        validate: validateTimeLimit,
        schema: false,
    });
    ajv.addKeyword("validatePpn", { type: "integer", validate: validatePpn, schema: false });
    ajv.addKeyword("validateNodes", { type: "integer", validate: validateNodes, schema: false });

    /**
     * @summary Traverses the returned ajv object to determine which error message to display
     * @param obj {Object} returned object from ajv on validation failure
     * @returns {{name: string, message: string}}
     */
    const getErrorMessage = (obj) => {
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

export { getComputeSchema, getComputeValidator, getNodeByHostname, defaultCluster };
