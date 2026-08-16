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
    /**
     * Reveals every validation error at once, including for fields the reader
     * has not touched. Off by default: a form the reader has not filled in yet
     * should not open by listing everything wrong with it. Turn it on when the
     * whole form has to answer for itself — on submit, or from a preflight check.
     */
    showAllErrors?: boolean;
}
interface ComputeFormState {
    formData: any;
    /** Form-data keys the reader has edited; see `utils/touchedFields`. */
    touchedFields: ReadonlySet<string>;
}
export declare class ComputeForm extends React.Component<ComputeFormProps, ComputeFormState> {
    computeUiSchema: UISchema;
    schema: JSONSchema7;
    validator: any;
    getErrorMessage: any;
    constructor(props: ComputeFormProps);
    /**
     * `fieldId` is RJSF's id for the field that changed. It is what makes
     * progressive validation possible: errors stay hidden until the reader has
     * been to the field in question.
     */
    handleFormUpdate({ formData }: {
        formData: Record<string, any>;
    }, fieldId?: string): void;
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
