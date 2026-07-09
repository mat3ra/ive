/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/prop-types */
import InfoPopover from "@exabyte-io/cove.js/dist/mui/components/popover/info-popover";
import RJSForm from "@exabyte-io/cove.js/dist/other/rjsf/RJSForm";
import CustomObjectFieldTemplate from "@exabyte-io/cove.js/dist/other/rjsf/templates/CustomObjectFieldTemplate";
import InputWithInfoPopover from "@exabyte-io/cove.js/dist/other/rjsf/widgets/InputWithInfoPopover";
import { PositionInfoPopover } from "@exabyte-io/cove.js/dist/other/rjsf/widgets/PositionInfoPopover.styled";
import SelectWithInfoPopover from "@exabyte-io/cove.js/dist/other/rjsf/widgets/SelectWithInfoPopover";
import TimePicker from "@exabyte-io/cove.js/dist/other/rjsf/widgets/TimePicker";
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
import { JSONSchema7 } from "json-schema";
import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import omitBy from "lodash/omitBy";
import React from "react";

import { getComputeSchema, getComputeValidator } from "../validators";
import Notify from "./Notify";
import QueuesTable from "./QueuesTable";

import { LoadingIndicator } from "@exabyte-io/cove.js/dist/mui-composed/components/loading/LoadingIndicator";
import { resolveUISchema, UISchema } from "../utils/schemas";

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

function RJSFPopover({ infoPopover }) {
    return (
        <PositionInfoPopover>
            <InfoPopover title={infoPopover?.title} iconSize="small">
                <Typography
                    variant="body2"
                    pb={2}
                    dangerouslySetInnerHTML={{ __html: infoPopover?.content || "" }}
                />
            </InfoPopover>
        </PositionInfoPopover>
    );
}

function TitleField({ title, id }) {
    return (
        <Typography id={id} variant="h6" mb={2}>
            {title}
        </Typography>
    );
}

function LinkWidget(props) {
    const { id, value, uiSchema, label } = props;
    const infoPopover = uiSchema["ui:options"]?.infoPopover;

    return (
        <Box sx={{ height: "3em" }} data-test={id}>
            <Link href={value} target="_blank">
                {label}&nbsp;
            </Link>
            {infoPopover ? <RJSFPopover infoPopover={infoPopover} /> : null}
        </Box>
    );
}

function getDefaultCluster(clusters: ClusterNode[]) {
    return clusters.find((x) => x.isDefault) || clusters[0];
}

function QueueSelectWidget(props) {
    const { id, value, uiSchema, label, onChange } = props;
    const queues = uiSchema["ui:options"].queues ?? [];
    const infoPopover = uiSchema["ui:options"]?.infoPopover;
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

    return (
        <>
            <TextField
                id={id}
                label={label}
                size="small"
                variant="outlined"
                onClick={handleOpen}
                value={selectedValue?.displayName}
            />
            {infoPopover ? (
                <PositionInfoPopover>
                    <InfoPopover title={infoPopover?.title} iconSize="small">
                        <Typography
                            variant="body2"
                            pb={2}
                            dangerouslySetInnerHTML={{ __html: infoPopover?.content || "" }}
                        />
                    </InfoPopover>
                </PositionInfoPopover>
            ) : null}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}>
                <QueuesTable queues={queues} onQueueClick={handleSelect} />
            </Popover>
        </>
    );
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
        properties: props.properties.filter(
            (p) => group.fields.some((f) => new RegExp(f).test(p.name)) && !p.hidden,
        ),
    };
};

function ObjectFieldTemplateWrapper(props) {
    return (
        <>
            {GROUPS.map((group, index) => {
                const childProps = getPropsForGroup(group, props);

                if (!childProps.properties.length) return null;

                return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Paper key={`${group.title}-${index}`} sx={{ mb: 3, p: 3 }}>
                        <CustomObjectFieldTemplate {...childProps} title={group.title} />
                    </Paper>
                );
            })}
        </>
    );
}

function buildComputeFormJsonSchema(
    initialSchema,
    { clusterOptions, queueOptions, costUrl, selectedQueue, clusterStatusUrl },
) {
    // Guard: standalone mode — ESSE schema registry has no 'job/compute' entry,
    // so initialSchema comes back as {}. Return it unchanged to avoid crashes.
    if (!initialSchema?.properties?.cluster) {
        return initialSchema ?? {};
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
                maximum: Number(selectedQueue?.nodeLimit) || undefined,
            },
            ppn: {
                ...initialSchema.properties.ppn,
                maximum: Number(selectedQueue?.maxPPN) || undefined,
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
function resolveComputeUISchema(appName: string): UISchema {
    try {
        return resolveUISchema(`job/compute/${appName}`);
    } catch (e) {
        return resolveUISchema(`job/compute/base`);
    }
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

export class ComputeForm extends React.Component<ComputeFormProps, ComputeFormState> {
    computeUiSchema: UISchema;

    schema: JSONSchema7;

    validator: any;

    getErrorMessage: any;

    constructor(props) {
        super(props);

        const formData = omitBy(flatten(props.compute ?? {}), (value) => {
            // remove empty objects as they lead to invalid flatten formData
            return isObject(value) && isEmpty(value);
        });

        this.state = {
            formData,
        };
        this.handleFormUpdate = this.handleFormUpdate.bind(this);
        this.onNotifyUpdate = this.onNotifyUpdate.bind(this);
        const schema = getComputeSchema(props.appName);
        const { validator, getErrorMessage } = getComputeValidator(schema);
        this.validator = validator;
        this.getErrorMessage = getErrorMessage;
        this.schema = schema;
        this.computeUiSchema = resolveComputeUISchema(props.appName);
    }

    handleFormUpdate({ formData }) {
        this.setState({ formData }, () => {
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
            return Router.url(
                "billing",
                {
                    accountSlug: account?.slug,
                    tab: "charges",
                },
                { query: { jid } },
            );
        }
        return `#billing/${account?.slug || "default"}/charges?jid=${jid}`;
    }

    getNode = () => {
        const { formData } = this.state;
        const { clusters } = this.props;
        const hostname = formData["cluster.fqdn"] || getDefaultCluster(clusters)?.hostname;
        const node = clusters.find((x) => x.hostname === hostname);

        return node;
    };

    getClusterQueues() {
        const { formData } = this.state;
        const { clusters } = this.props;
        const cluster = clusters.find((x) => x.hostname === formData["cluster.fqdn"]);
        const queues = cluster ? cluster.queues.filter((q) => q.nodeLimit) : [];

        return queues;
    }

    customValidate = (data, errors) => {
        const node = this.getNode();

        if (this.validator({ ...data, node })) {
            return {};
        }

        this.validator.errors.forEach((obj) => {
            const { params } = obj;
            const { name, message } = this.getErrorMessage(obj);

            if (params.missingProperty) {
                errors[params.missingProperty]?.addError("The field is required");
            } else {
                errors[name]?.addError(message);
            }
        });

        return errors;
    };

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
        const {
            editable,
            showAdvancedOptions,
            user,
            accountUsers,
            isAccountUsersLoading,
            compute,
            gridParams,
            pathForClusters,
        } = this.props;
        const { formData } = this.state;
        const disableFields = !editable;

        const costUrl = this.getURLForChargesPerJodID(compute?.cluster?.jid);

        const selectedQueue = this.getClusterQueues().find(
            (queue) => queue.name === formData.queue,
        );

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
            CLUSTER_FQDN_WIDGET: disableFields ? "hidden" : "select",
            CLUSTER_JID_WIDGET: disableFields ? "text" : "hidden",
            CLUSTER_COST_WIDGET: disableFields ? LinkWidget : "hidden",
            CLUSTER_STATUS_DOC_WIDGET: disableFields ? "hidden" : LinkWidget,
            QUEUES_OPTIONS: this.queueOptions(),
        });

        return (
            <Box sx={{ display: "flex" }} id="compute-step-form">
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container>
                        <Grid item p={2} {...(gridParams?.left || DEFAULT_GRID_PARAMS.left)}>
                            <RJSForm
                                schema={finalSchema as any}
                                uiSchema={uiSchema}
                                validator={rjsfValidator}
                                formData={formData}
                                onChange={(event: any) => this.handleFormUpdate(event)}
                                showErrorList={false}
                                customValidate={this.customValidate}
                                liveValidate
                                widgets={WIDGETS}
                                templates={TEMPLATES}
                            />
                        </Grid>
                        <Grid item p={2} {...(gridParams?.right || DEFAULT_GRID_PARAMS.right)}>
                            {isAccountUsersLoading ? (
                                <LoadingIndicator key="loading-indicator" size="small" included />
                            ) : (
                                <Notify
                                    user={user}
                                    accountUsers={accountUsers}
                                    editable={editable}
                                    onUpdate={this.onNotifyUpdate}
                                    notify={formData.notify}
                                    email={formData.email}
                                />
                            )}
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        );
    }
}
