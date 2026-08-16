import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/prop-types */
import InfoPopover from "@mat3ra/cove/dist/mui/components/popover/info-popover";
import RJSForm from "@mat3ra/cove/dist/other/rjsf/RJSForm";
import CustomObjectFieldTemplate from "@mat3ra/cove/dist/other/rjsf/templates/CustomObjectFieldTemplate";
import InputWithInfoPopover from "@mat3ra/cove/dist/other/rjsf/widgets/InputWithInfoPopover";
import { PositionInfoPopover } from "@mat3ra/cove/dist/other/rjsf/widgets/PositionInfoPopover.styled";
import SelectWithInfoPopover from "@mat3ra/cove/dist/other/rjsf/widgets/SelectWithInfoPopover";
import TimePicker from "@mat3ra/cove/dist/other/rjsf/widgets/TimePicker";
import { QUEUE_DISPLAY } from "@mat3ra/ide";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import rjsfValidator from "@rjsf/validator-ajv8";
import { flatten, unflatten } from "flat";
import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import omitBy from "lodash/omitBy";
import React from "react";
import { getComputeSchema, getComputeValidator } from "../validators";
import { findClusterMetadata } from "../utils/computeEstimate";
import { shouldShowFieldError, withTouchedField } from "../utils/touchedFields";
import ClusterCards from "./ClusterCards";
import ComputeEstimatePanel from "./ComputeEstimatePanel";
import ComputeResources from "./ComputeResources";
import Notify from "./Notify";
import QueuesTable from "./QueuesTable";
import { LoadingIndicator } from "@mat3ra/cove/dist/mui-composed/components/loading/LoadingIndicator";
import { resolveUISchema } from "../utils/schemas";
function RJSFPopover({ infoPopover }) {
    return (_jsx(PositionInfoPopover, { children: _jsx(InfoPopover, { title: infoPopover === null || infoPopover === void 0 ? void 0 : infoPopover.title, iconSize: "small", children: _jsx(Typography, { variant: "body2", pb: 2, dangerouslySetInnerHTML: { __html: (infoPopover === null || infoPopover === void 0 ? void 0 : infoPopover.content) || "" } }) }) }));
}
function TitleField({ title, id }) {
    return (_jsx(Typography, { id: id, variant: "h6", mb: 2, children: title }));
}
function LinkWidget(props) {
    var _a;
    const { id, value, uiSchema, label } = props;
    const infoPopover = (_a = uiSchema["ui:options"]) === null || _a === void 0 ? void 0 : _a.infoPopover;
    return (_jsxs(Box, { sx: { height: "3em" }, "data-test": id, children: [_jsxs(Link, { href: value, target: "_blank", children: [label, "\u00A0"] }), infoPopover ? _jsx(RJSFPopover, { infoPopover: infoPopover }) : null] }));
}
function getDefaultCluster(clusters) {
    return clusters.find((x) => x.isDefault) || clusters[0];
}
function QueueSelectWidget(props) {
    var _a, _b;
    const { id, value, uiSchema, label, onChange } = props;
    const queues = (_a = uiSchema["ui:options"].queues) !== null && _a !== void 0 ? _a : [];
    const infoPopover = (_b = uiSchema["ui:options"]) === null || _b === void 0 ? void 0 : _b.infoPopover;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
        setOpen((prev) => !prev);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleSelect = (name) => {
        onChange(name);
        setOpen((prev) => !prev);
    };
    const selectedValue = queues.find((queue) => queue.name === value);
    return (_jsxs(_Fragment, { children: [_jsx(TextField, { id: id, label: label, size: "small", variant: "outlined", onClick: handleOpen, value: selectedValue === null || selectedValue === void 0 ? void 0 : selectedValue.displayName }), infoPopover ? (_jsx(PositionInfoPopover, { children: _jsx(InfoPopover, { title: infoPopover === null || infoPopover === void 0 ? void 0 : infoPopover.title, iconSize: "small", children: _jsx(Typography, { variant: "body2", pb: 2, dangerouslySetInnerHTML: { __html: (infoPopover === null || infoPopover === void 0 ? void 0 : infoPopover.content) || "" } }) }) })) : null, _jsx(Popover, { open: open, anchorEl: anchorEl, onClose: handleClose, anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                }, children: _jsx(QueuesTable, { queues: queues, onQueueClick: handleSelect }) })] }));
}
const GROUPS = [
    { title: "", fields: ["timeLimit", "timeLimitType", "isRestartable"] },
    {
        title: "Cluster",
        fields: [
            "cluster.fqdn",
            "cluster.jid",
            "cluster.status",
            "compute.doc",
            "cluster.cost",
            "queue",
            "nodes",
            "ppn",
        ],
    },
    {
        title: "Advanced options",
        fields: ["arguments."],
    },
];
const getPropsForGroup = (group, props) => {
    return {
        ...props,
        properties: props.properties.filter((p) => group.fields.some((f) => new RegExp(f).test(p.name)) && !p.hidden),
    };
};
function ObjectFieldTemplateWrapper(props) {
    var _a, _b;
    // With the cards surface on, the cluster, queue and resource fields are
    // rendered above and hidden here — so the group that used to be the cluster
    // choice is now two documentation links, and calling it "Cluster" would send
    // the reader looking for a picker that has moved.
    const useComputeCards = Boolean((_b = (_a = props.registry) === null || _a === void 0 ? void 0 : _a.formContext) === null || _b === void 0 ? void 0 : _b.useComputeCards);
    return (_jsx(_Fragment, { children: GROUPS.map((group, index) => {
            const childProps = getPropsForGroup(group, props);
            if (!childProps.properties.length)
                return null;
            const title = useComputeCards && group.title === "Cluster" ? "Documentation" : group.title;
            return (
            // eslint-disable-next-line react/no-array-index-key
            _jsx(Paper, { sx: { mb: 3, p: 3 }, children: _jsx(CustomObjectFieldTemplate, { ...childProps, title: title }) }, `${group.title}-${index}`));
        }) }));
}
function buildComputeFormJsonSchema(initialSchema, { clusterOptions, queueOptions, costUrl, selectedQueue, clusterStatusUrl }) {
    var _a;
    // Guard: standalone mode — ESSE schema registry has no 'job/compute' entry,
    // so initialSchema comes back as {}. Return it unchanged to avoid crashes.
    if (!((_a = initialSchema === null || initialSchema === void 0 ? void 0 : initialSchema.properties) === null || _a === void 0 ? void 0 : _a.cluster)) {
        return initialSchema !== null && initialSchema !== void 0 ? initialSchema : {};
    }
    const { cluster, arguments: args } = initialSchema.properties;
    const flattenCluster = flatten(cluster.properties, {
        maxDepth: 1,
        transformKey: (key) => `cluster.${key}`,
    });
    const flattenArguments = args
        ? flatten(args.properties, {
            maxDepth: 1,
            transformKey: (key) => `arguments.${key}`,
        })
        : {};
    flattenCluster["cluster.fqdn"] = {
        ...flattenCluster["cluster.fqdn"],
        enum: clusterOptions.map((item) => item.value),
        enumNames: clusterOptions.map((item) => item.label),
    };
    const schema = {
        type: "object",
        properties: {
            ...initialSchema.properties,
            ...flattenCluster,
            ...flattenArguments,
            queue: {
                ...initialSchema.properties.queue,
                enum: queueOptions.map((item) => item.value),
                enumNames: queueOptions.map((item) => item.label),
            },
            nodes: {
                ...initialSchema.properties.nodes,
                maximum: Number(selectedQueue === null || selectedQueue === void 0 ? void 0 : selectedQueue.nodeLimit) || undefined,
            },
            ppn: {
                ...initialSchema.properties.ppn,
                maximum: Number(selectedQueue === null || selectedQueue === void 0 ? void 0 : selectedQueue.maxPPN) || undefined,
            },
            "cluster.cost": {
                type: "string",
                default: costUrl,
            },
            "cluster.status": {
                type: "string",
                default: clusterStatusUrl,
            },
            "compute.doc": {
                type: "string",
                default: "https://docs.mat3ra.com/infrastructure/clusters/overview/",
            },
        },
    };
    return schema;
}
const WIDGETS = {
    // Note: do not use TimePicker for timeLimit - it's not meant for durations, but static moment of one day only.
    // TB adjusted compute UI schema accordingly on 2023-12-05.
    TimePickerWidget: TimePicker,
    SelectWidget: SelectWithInfoPopover,
    UpDownWidget: InputWithInfoPopover,
    QueueSelectWidget,
};
const TEMPLATES = {
    ObjectFieldTemplate: ObjectFieldTemplateWrapper,
    TitleFieldTemplate: TitleField,
    BaseInputTemplate: InputWithInfoPopover,
};
const DEFAULT_GRID_PARAMS = {
    left: {
        xs: 12,
        md: 8,
    },
    right: {
        xs: 12,
        md: 4,
    },
};
// TODO: figure out how to make this work for multiple apps inside workflow/subworkflow
function resolveComputeUISchema(appName) {
    try {
        return resolveUISchema(`job/compute/${appName}`);
    }
    catch (e) {
        return resolveUISchema(`job/compute/base`);
    }
}
export class ComputeForm extends React.Component {
    constructor(props) {
        var _a, _b, _c;
        super(props);
        this.getNode = () => {
            var _a;
            const { formData } = this.state;
            const { clusters } = this.props;
            const hostname = formData["cluster.fqdn"] || ((_a = getDefaultCluster(clusters)) === null || _a === void 0 ? void 0 : _a.hostname);
            const node = clusters.find((x) => x.hostname === hostname);
            return node;
        };
        this.customValidate = (data, errors) => {
            const node = this.getNode();
            if (this.validator({ ...data, node })) {
                return {};
            }
            const { showAllErrors = false } = this.props;
            const { touchedFields } = this.state;
            this.validator.errors.forEach((obj) => {
                var _a, _b;
                const { params } = obj;
                const { name, message } = this.getErrorMessage(obj);
                const fieldName = params.missingProperty || name;
                // The form validates live, so without this every required field
                // reports itself on first paint — before the reader has had a chance
                // to fill anything in.
                if (!shouldShowFieldError({ fieldName, touchedFields, showAllErrors })) {
                    return;
                }
                if (params.missingProperty) {
                    (_a = errors[params.missingProperty]) === null || _a === void 0 ? void 0 : _a.addError("The field is required");
                }
                else {
                    (_b = errors[name]) === null || _b === void 0 ? void 0 : _b.addError(message);
                }
            });
            return errors;
        };
        /**
         * Writes from the cards surface go through the same path as a keystroke in
         * the schema form — same touched-field bookkeeping, same validate-then-
         * `onUpdate` gate — so the two cannot get out of step.
         */
        this.applyComputePatch = (patch) => {
            var _a, _b;
            const { formData } = this.state;
            const flatPatch = { ...patch };
            if (Object.prototype.hasOwnProperty.call(patch, "cluster")) {
                delete flatPatch.cluster;
                flatPatch["cluster.fqdn"] = (_a = patch.cluster) === null || _a === void 0 ? void 0 : _a.fqdn;
            }
            const fieldId = `root_${(_b = Object.keys(flatPatch)[0]) !== null && _b !== void 0 ? _b : ""}`;
            this.handleFormUpdate({ formData: { ...formData, ...flatPatch } }, fieldId);
        };
        this.onClusterSelect = (hostname) => {
            var _a;
            const { clusters } = this.props;
            const cluster = clusters.find((entry) => entry.hostname === hostname);
            const [firstQueue] = ((_a = cluster === null || cluster === void 0 ? void 0 : cluster.queues) !== null && _a !== void 0 ? _a : []).filter((queue) => queue.nodeLimit);
            // Queues belong to a cluster, so a queue chosen on the previous one is
            // meaningless here; default to the first this cluster actually offers.
            this.applyComputePatch({ "cluster.fqdn": hostname, queue: firstQueue === null || firstQueue === void 0 ? void 0 : firstQueue.name });
        };
        const formData = omitBy(flatten((_a = props.compute) !== null && _a !== void 0 ? _a : {}), (value) => {
            // remove empty objects as they lead to invalid flatten formData
            return isObject(value) && isEmpty(value);
        });
        this.state = {
            formData,
            touchedFields: new Set(),
        };
        this.handleFormUpdate = this.handleFormUpdate.bind(this);
        this.onNotifyUpdate = this.onNotifyUpdate.bind(this);
        this.schema = getComputeSchema((_b = props.appName) !== null && _b !== void 0 ? _b : "");
        const { validator, getErrorMessage } = getComputeValidator(this.schema);
        this.validator = validator;
        this.getErrorMessage = getErrorMessage;
        this.computeUiSchema = resolveComputeUISchema((_c = props.appName) !== null && _c !== void 0 ? _c : "");
    }
    /**
     * `fieldId` is RJSF's id for the field that changed. It is what makes
     * progressive validation possible: errors stay hidden until the reader has
     * been to the field in question.
     */
    handleFormUpdate({ formData }, fieldId) {
        this.setState((previousState) => ({
            formData,
            touchedFields: withTouchedField(previousState.touchedFields, fieldId),
        }), () => {
            this.updateForm();
        });
    }
    onNotifyUpdate(notify) {
        const { onUpdate } = this.props;
        const { formData } = this.state;
        const newFormData = { ...formData, ...notify };
        this.setState({ formData: newFormData }, () => {
            onUpdate(unflatten(newFormData));
        });
    }
    getURLForChargesPerJodID(jid) {
        const { account } = this.props;
        // @ts-ignore
        if (typeof Router !== "undefined") {
            // @ts-ignore
            return Router.url("billing", {
                accountSlug: account === null || account === void 0 ? void 0 : account.slug,
                tab: "charges",
            }, { query: { jid } });
        }
        return `#billing/${(account === null || account === void 0 ? void 0 : account.slug) || "default"}/charges?jid=${jid}`;
    }
    getClusterQueues() {
        const { formData } = this.state;
        const { clusters } = this.props;
        const cluster = clusters.find((x) => x.hostname === formData["cluster.fqdn"]);
        const queues = cluster
            ? cluster.queues.filter((q) => q.nodeLimit)
            : [];
        return queues;
    }
    /** Limits and pricing for the cluster currently chosen, if the host published any. */
    get selectedClusterMetadata() {
        const { clusterMetadata = [] } = this.props;
        const { formData } = this.state;
        return findClusterMetadata({ cluster: { fqdn: formData["cluster.fqdn"] } }, clusterMetadata);
    }
    /**
     * The compute the cards surface is editing, in the unflattened shape the
     * estimate and limit checks expect.
     */
    get computeFromFormData() {
        const { formData } = this.state;
        return {
            cluster: { fqdn: formData["cluster.fqdn"] },
            nodes: formData.nodes,
            ppn: formData.ppn,
            timeLimit: formData.timeLimit,
            queue: formData.queue,
        };
    }
    clusterOptions() {
        const { clusters } = this.props;
        return clusters.map((x) => {
            return {
                label: x.displayName,
                value: x.hostname,
            };
        });
    }
    queueOptions() {
        const queues = this.getClusterQueues();
        // sort queues based on the order in QUEUE_DISPLAY
        return queues.sort((a, b) => {
            const arr = Object.keys(QUEUE_DISPLAY);
            return arr.indexOf(a.value) - arr.indexOf(b.value);
        });
    }
    updateForm() {
        const { onUpdate } = this.props;
        const { formData } = this.state;
        const node = this.getNode();
        if (this.validator({ ...formData, node })) {
            onUpdate(unflatten(formData));
        }
    }
    render() {
        var _a, _b;
        const { editable, showAdvancedOptions, user, accountUsers, isAccountUsersLoading, compute, gridParams, pathForClusters, showAllErrors = false, useComputeCards = false, clusters, clusterMetadata, computeQuota, runs = 1, } = this.props;
        const { formData } = this.state;
        const disableFields = !editable;
        const costUrl = this.getURLForChargesPerJodID((_a = compute === null || compute === void 0 ? void 0 : compute.cluster) === null || _a === void 0 ? void 0 : _a.jid);
        const selectedQueue = this.getClusterQueues().find((queue) => queue.name === formData.queue);
        const schemaParams = {
            clusterOptions: this.clusterOptions(),
            queueOptions: this.queueOptions().map((q) => ({
                label: q.displayName,
                value: q.name,
            })),
            costUrl,
            selectedQueue,
            clusterStatusUrl: pathForClusters || "/clusters",
        };
        const finalSchema = buildComputeFormJsonSchema(this.schema, schemaParams);
        const uiSchema = this.computeUiSchema.resolveSchemaValues({
            DISABLE_FIELDS: disableFields,
            SHOW_ADVANCED_OPTIONS: showAdvancedOptions ? "updown" : "hidden",
            CLUSTER_FQDN_WIDGET: disableFields || useComputeCards ? "hidden" : "select",
            CLUSTER_JID_WIDGET: disableFields ? "text" : "hidden",
            CLUSTER_COST_WIDGET: disableFields ? LinkWidget : "hidden",
            CLUSTER_STATUS_DOC_WIDGET: disableFields ? "hidden" : LinkWidget,
            QUEUES_OPTIONS: this.queueOptions(),
            // With the cards surface on, these four are edited above and hidden
            // here — hidden rather than removed, so the schema still validates
            // them and nothing downstream has to learn a second shape.
            RESOURCE_FIELD_WIDGET: useComputeCards ? "hidden" : "updown",
            WALLTIME_FIELD_WIDGET: useComputeCards ? "hidden" : "text",
            QUEUE_FIELD_WIDGET: useComputeCards ? "hidden" : "QueueSelectWidget",
        });
        return (_jsx(Box, { sx: { display: "flex" }, id: "compute-step-form", children: _jsx(Box, { sx: { flexGrow: 1 }, children: _jsxs(Grid, { container: true, children: [useComputeCards ? (_jsx(Grid, { item: true, xs: 12, p: 2, children: _jsxs(Paper, { sx: { p: 3, mb: 3 }, id: "compute-cards", children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Cluster" }), _jsx(ClusterCards, { clusters: clusters, clusterMetadata: clusterMetadata, selectedHostname: formData["cluster.fqdn"], onSelect: this.onClusterSelect, disabled: disableFields }), _jsx(Box, { sx: { mt: 3 }, children: _jsx(ComputeResources, { compute: this.computeFromFormData, queues: this.getClusterQueues(), limits: (_b = this.selectedClusterMetadata) === null || _b === void 0 ? void 0 : _b.limits, onChange: this.applyComputePatch, disabled: disableFields, showAllErrors: showAllErrors }) }), _jsx(Box, { sx: { mt: 3 }, children: _jsx(ComputeEstimatePanel, { compute: this.computeFromFormData, clusterMetadata: clusterMetadata, quota: computeQuota, runs: runs }) })] }) })) : null, _jsx(Grid, { item: true, p: 2, ...((gridParams === null || gridParams === void 0 ? void 0 : gridParams.left) || DEFAULT_GRID_PARAMS.left), children: _jsx(RJSForm
                            // RJSF only re-validates when its schema or form data
                            // change, so flipping `showAllErrors` alone would leave
                            // the previous validation result on screen. Remounting
                            // forces a fresh pass; the toggle happens on submit, not
                            // while typing, so the cost is not felt.
                            , { schema: finalSchema, uiSchema: uiSchema, formContext: { useComputeCards }, validator: rjsfValidator, formData: formData, onChange: (event, fieldId) => this.handleFormUpdate(event, fieldId), showErrorList: false, customValidate: this.customValidate, liveValidate: true, widgets: WIDGETS, templates: TEMPLATES }, showAllErrors ? "show-all-errors" : "progressive") }), _jsx(Grid, { item: true, p: 2, ...((gridParams === null || gridParams === void 0 ? void 0 : gridParams.right) || DEFAULT_GRID_PARAMS.right), children: isAccountUsersLoading ? (_jsx(LoadingIndicator, { size: "small", included: true }, "loading-indicator")) : (_jsx(Notify, { user: user, accountUsers: accountUsers, editable: editable, onUpdate: this.onNotifyUpdate, notify: formData.notify, email: formData.email })) })] }) }) }));
    }
}
