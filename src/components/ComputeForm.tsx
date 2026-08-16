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
import { JSONSchema7 } from "json-schema";
import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import omitBy from "lodash/omitBy";
import React from "react";

import { getComputeSchema, getComputeValidator } from "../validators";
import { shouldShowFieldError, withTouchedField } from "../utils/touchedFields";
import Notify from "./Notify";
import QueuesTable from "./QueuesTable";

import { LoadingIndicator } from "@mat3ra/cove/dist/mui-composed/components/loading/LoadingIndicator";
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

function RJSFPopover({ infoPopover }: { infoPopover: { title?: string; content?: string } }) {
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

function TitleField({ title, id }: { title: string; id: string }) {
    return (
        <Typography id={id} variant="h6" mb={2}>
            {title}
        </Typography>
    );
}

function LinkWidget(props: Record<string, any>) {
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

function QueueSelectWidget(props: Record<string, any>) {
    const { id, value, uiSchema, label, onChange } = props;
    const queues = uiSchema["ui:options"].queues ?? [];
    const infoPopover = uiSchema["ui:options"]?.infoPopover;
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [open, setOpen] = React.useState(false);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen((prev) => !prev);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSelect = (name: string) => {
        onChange(name);
        setOpen((prev) => !prev);
    };

    const selectedValue = queues.find((queue: Record<string, any>) => queue.name === value);

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

const getPropsForGroup = (group: { fields: string[] }, props: Record<string, any>) => {
    return {
        ...props,
        properties: props.properties.filter(
            (p: Record<string, any>) => group.fields.some((f: string) => new RegExp(f).test(p.name)) && !p.hidden,
        ),
    };
};

function ObjectFieldTemplateWrapper(props: Record<string, any>) {
    return (
        <>
            {GROUPS.map((group, index) => {
                const childProps = getPropsForGroup(group, props);

                if (!childProps.properties.length) return null;

                return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Paper key={`${group.title}-${index}`} sx={{ mb: 3, p: 3 }}>
                        <CustomObjectFieldTemplate {...(childProps as any)} title={group.title} />
                    </Paper>
                );
            })}
        </>
    );
}

function buildComputeFormJsonSchema(
    initialSchema: Record<string, any>,
    { clusterOptions, queueOptions, costUrl, selectedQueue, clusterStatusUrl }: Record<string, any>,
) {
    // Guard: standalone mode — ESSE schema registry has no 'job/compute' entry,
    // so initialSchema comes back as {}. Return it unchanged to avoid crashes.
    if (!initialSchema?.properties?.cluster) {
        return initialSchema ?? {};
    }
    const { cluster, arguments: args } = initialSchema.properties;
    const flattenCluster = flatten(cluster.properties, {
        maxDepth: 1,
        transformKey: (key: string) => `cluster.${key}`,
    });
    const flattenArguments = args
        ? flatten(args.properties, {
              maxDepth: 1,
              transformKey: (key: string) => `arguments.${key}`,
          })
        : {};

    flattenCluster["cluster.fqdn"] = {
        ...flattenCluster["cluster.fqdn"],
        enum: clusterOptions.map((item: Record<string, any>) => item.value),
        enumNames: clusterOptions.map((item: Record<string, any>) => item.label),
    };

    const schema = {
        type: "object",
        properties: {
            ...initialSchema.properties,
            ...flattenCluster,
            ...flattenArguments,
            queue: {
                ...initialSchema.properties.queue,
                enum: queueOptions.map((item: Record<string, any>) => item.value),
                enumNames: queueOptions.map((item: Record<string, any>) => item.label),
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

export class ComputeForm extends React.Component<ComputeFormProps, ComputeFormState> {
    computeUiSchema: UISchema;

    schema: JSONSchema7;

    validator: any;

    getErrorMessage: any;

    constructor(props: ComputeFormProps) {
        super(props);

        const formData = omitBy(flatten(props.compute ?? {}), (value) => {
            // remove empty objects as they lead to invalid flatten formData
            return isObject(value) && isEmpty(value);
        });

        this.state = {
            formData,
            touchedFields: new Set<string>(),
        };
        this.handleFormUpdate = this.handleFormUpdate.bind(this);
        this.onNotifyUpdate = this.onNotifyUpdate.bind(this);
        this.schema = getComputeSchema(props.appName ?? "");
        const { validator, getErrorMessage } = getComputeValidator(this.schema);
        this.validator = validator;
        this.getErrorMessage = getErrorMessage;
        this.computeUiSchema = resolveComputeUISchema(props.appName ?? "");
    }

    /**
     * `fieldId` is RJSF's id for the field that changed. It is what makes
     * progressive validation possible: errors stay hidden until the reader has
     * been to the field in question.
     */
    handleFormUpdate({ formData }: { formData: Record<string, any> }, fieldId?: string) {
        this.setState(
            (previousState) => ({
                formData,
                touchedFields: withTouchedField(previousState.touchedFields, fieldId),
            }),
            () => {
                this.updateForm();
            },
        );
    }

    onNotifyUpdate(notify: Record<string, any>) {
        const { onUpdate } = this.props;
        const { formData } = this.state;

        const newFormData = { ...formData, ...notify };

        this.setState({ formData: newFormData }, () => {
            onUpdate(unflatten(newFormData));
        });
    }

    getURLForChargesPerJodID(jid: string) {
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
        const queues = cluster ? cluster.queues.filter((q: Record<string, any>) => q.nodeLimit) : [];

        return queues;
    }

    customValidate = (data: Record<string, any>, errors: any) => {
        const node = this.getNode();

        if (this.validator({ ...data, node })) {
            return {};
        }

        const { showAllErrors = false } = this.props;
        const { touchedFields } = this.state;

        this.validator.errors.forEach((obj: Record<string, any>) => {
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
        return queues.sort((a: Record<string, any>, b: Record<string, any>) => {
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
            showAllErrors = false,
        } = this.props;
        const { formData } = this.state;
        const disableFields = !editable;

        const costUrl = this.getURLForChargesPerJodID(compute?.cluster?.jid);

        const selectedQueue = this.getClusterQueues().find(
            (queue: Record<string, any>) => queue.name === formData.queue,
        );

        const schemaParams = {
            clusterOptions: this.clusterOptions(),
            queueOptions: this.queueOptions().map((q: Record<string, any>) => ({
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
                                // RJSF only re-validates when its schema or form data
                                // change, so flipping `showAllErrors` alone would leave
                                // the previous validation result on screen. Remounting
                                // forces a fresh pass; the toggle happens on submit, not
                                // while typing, so the cost is not felt.
                                key={showAllErrors ? "show-all-errors" : "progressive"}
                                schema={finalSchema as any}
                                uiSchema={uiSchema}
                                validator={rjsfValidator}
                                formData={formData}
                                onChange={(event: any, fieldId?: string) =>
                                    this.handleFormUpdate(event, fieldId)
                                }
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
