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
import type { ClusterMetadata, ComputeQuota } from "../utils/computeEstimate";
import { findClusterMetadata } from "../utils/computeEstimate";
import { shouldShowFieldError, withTouchedField } from "../utils/touchedFields";
import ClusterCards from "./ClusterCards";
import ComputeEstimatePanel from "./ComputeEstimatePanel";
import ComputeResources from "./ComputeResources";
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
                }}
            >
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
            (p: Record<string, any>) =>
                group.fields.some((f: string) => new RegExp(f).test(p.name)) && !p.hidden,
        ),
    };
};

function ObjectFieldTemplateWrapper(props: Record<string, any>) {
    // With the cards surface on, the cluster, queue and resource fields are
    // rendered above and hidden here — so the group that used to be the cluster
    // choice is now two documentation links, and calling it "Cluster" would send
    // the reader looking for a picker that has moved.
    const useComputeCards = Boolean(props.registry?.formContext?.useComputeCards);

    return (
        <>
            {GROUPS.map((group, index) => {
                const childProps = getPropsForGroup(group, props);

                if (!childProps.properties.length) return null;

                const title =
                    useComputeCards && group.title === "Cluster" ? "Documentation" : group.title;

                return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Paper key={`${group.title}-${index}`} sx={{ mb: 3, p: 3 }}>
                        <CustomObjectFieldTemplate {...(childProps as any)} title={title} />
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
    /**
     * Renders the cluster choice, the resource fields and the estimate as their
     * own surface above the schema form, hiding those fields from it.
     *
     * Opt-in per host, like job-designer's guided layout: the fields move, so a
     * host with its own tests or documentation against the schema form should
     * flip this when it is ready rather than find it flipped for it.
     */
    useComputeCards?: boolean;
    /** Pricing, limits and queue waits per cluster. Only used with `useComputeCards`. */
    clusterMetadata?: ClusterMetadata[];
    /** Remaining allowance for the paying account, when the host tracks one. */
    computeQuota?: ComputeQuota | null;
    /** Multi-material jobs run once per material; the estimate covers all of them. */
    runs?: number;
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
        const queues = cluster
            ? cluster.queues.filter((q: Record<string, any>) => q.nodeLimit)
            : [];

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

    /** Limits and pricing for the cluster currently chosen, if the host published any. */
    get selectedClusterMetadata(): ClusterMetadata | undefined {
        const { clusterMetadata = [] } = this.props;
        const { formData } = this.state;

        return findClusterMetadata(
            { cluster: { fqdn: formData["cluster.fqdn"] } },
            clusterMetadata,
        );
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

    /**
     * Writes from the cards surface go through the same path as a keystroke in
     * the schema form — same touched-field bookkeeping, same validate-then-
     * `onUpdate` gate — so the two cannot get out of step.
     */
    applyComputePatch = (patch: Record<string, any>) => {
        const { formData } = this.state;
        const flatPatch: Record<string, any> = { ...patch };

        if (Object.prototype.hasOwnProperty.call(patch, "cluster")) {
            delete flatPatch.cluster;
            flatPatch["cluster.fqdn"] = patch.cluster?.fqdn;
        }

        const fieldId = `root_${Object.keys(flatPatch)[0] ?? ""}`;
        this.handleFormUpdate({ formData: { ...formData, ...flatPatch } }, fieldId);
    };

    onClusterSelect = (hostname: string) => {
        const { clusters } = this.props;
        const cluster = clusters.find((entry) => entry.hostname === hostname);
        const [firstQueue] = (cluster?.queues ?? []).filter(
            (queue: Record<string, any>) => queue.nodeLimit,
        );

        // Queues belong to a cluster, so a queue chosen on the previous one is
        // meaningless here; default to the first this cluster actually offers.
        this.applyComputePatch({ "cluster.fqdn": hostname, queue: firstQueue?.name });
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
            useComputeCards = false,
            clusters,
            clusterMetadata,
            computeQuota,
            runs = 1,
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

        return (
            <Box sx={{ display: "flex" }} id="compute-step-form">
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container>
                        {useComputeCards ? (
                            <Grid item xs={12} p={2}>
                                <Paper sx={{ p: 3, mb: 3 }} id="compute-cards">
                                    <Typography variant="subtitle2" gutterBottom>
                                        Cluster
                                    </Typography>
                                    <ClusterCards
                                        clusters={clusters}
                                        clusterMetadata={clusterMetadata}
                                        selectedHostname={formData["cluster.fqdn"]}
                                        onSelect={this.onClusterSelect}
                                        disabled={disableFields}
                                    />
                                    <Box sx={{ mt: 3 }}>
                                        <ComputeResources
                                            compute={this.computeFromFormData}
                                            queues={this.getClusterQueues()}
                                            limits={this.selectedClusterMetadata?.limits}
                                            onChange={this.applyComputePatch}
                                            disabled={disableFields}
                                            showAllErrors={showAllErrors}
                                        />
                                    </Box>
                                    <Box sx={{ mt: 3 }}>
                                        <ComputeEstimatePanel
                                            compute={this.computeFromFormData}
                                            clusterMetadata={clusterMetadata}
                                            quota={computeQuota}
                                            runs={runs}
                                        />
                                    </Box>
                                </Paper>
                            </Grid>
                        ) : null}
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
                                formContext={{ useComputeCards }}
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
