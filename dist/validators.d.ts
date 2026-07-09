export function getNodeNumber(queueName: any): 1 | 10;
/**
 * @summary Gets a compatible JSON schema for replacing the simple schema
 * @param appName {String} application name with advanced compute options
 * @returns {*} the schema
 */
export function getComputeSchema(appName: string): any;
/**
 * @summary Gets compute validator fully customized for compatibility with existing simple schema.
 *          Due to error messages being handled as a function of the internals of the current schema,
 *          the getErrorMessage function is also returned for downstream use.
 * @param schema {Object} the full schema (including advanced compute options if available)
 * @returns {{validator: ajv.ValidateFunction, getErrorMessage: ((function(*): ({name: *, message: string}))|*)}}
 */
export function getComputeValidator(schema: any): {
    validator: ajv.ValidateFunction;
    getErrorMessage: (((arg0: any) => ({
        name: any;
        message: string;
    })) | any);
};
/**
 * @summary Mock method for BackendManager.getNodeByHostname
 * @param hostname {String} hostname
 * @returns {*} node data
 */
export function getNodeByHostname(hostname: string): any;
export namespace defaultCluster {
    let hostname: string;
}
//# sourceMappingURL=validators.d.ts.map