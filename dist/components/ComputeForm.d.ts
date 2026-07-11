import { JSONSchema7 } from "json-schema";
import React from "react";
import { UISchema } from "../utils/schemas";
/** Minimal interface for cluster node objects passed from the host application. */
export interface ClusterNode {
    isDefault?: boolean;
    [key: string]: any;
}
/** Minimal interface for user objects passed from the host application. */
export interface CoreUser {
    [key: string]: any;
}
/** Minimal interface for account objects passed from the host application. */
export interface Account {
    [key: string]: any;
}
interface ComputeFormProps {
    user: CoreUser;
    account: Account;
    accountUsers: CoreUser[];
    clusters: ClusterNode[];
    isAccountUsersLoading: boolean;
    showAdvancedOptions: boolean;
    editable: boolean;
    compute: any;
    gridParams?: any;
    onUpdate: (s: string) => void;
    appName?: string;
    pathForClusters?: string;
}
interface ComputeFormState {
    formData: any;
}
export declare class ComputeForm extends React.Component<ComputeFormProps, ComputeFormState> {
    computeUiSchema: UISchema;
    schema: JSONSchema7;
    validator: any;
    getErrorMessage: any;
    constructor(props: ComputeFormProps);
    handleFormUpdate({ formData }: {
        formData: Record<string, any>;
    }): void;
    onNotifyUpdate(notify: Record<string, any>): void;
    getURLForChargesPerJodID(jid: string): any;
    getNode: () => ClusterNode | undefined;
    getClusterQueues(): any;
    customValidate: (data: Record<string, any>, errors: any) => any;
    clusterOptions(): {
        label: any;
        value: any;
    }[];
    queueOptions(): any;
    updateForm(): void;
    render(): React.JSX.Element;
}
export {};
