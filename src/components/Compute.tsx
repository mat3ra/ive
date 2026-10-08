/* eslint-disable jsx-a11y/anchor-is-valid */
import Dropdown from "@mat3ra/cove/dist/mui/components/dropdown";
import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import { showWarningAlert } from "@mat3ra/cove/dist/other/alerts";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import setClass from "classnames";
import React from "react";

import { ComputeForm } from "./ComputeForm";
import type { AccountUser } from "./Notify";
import { StatusTrackTable, StatusTrackEntry } from "./StatusTrackTable";

import EntityHeader from "@mat3ra/cove/dist/mui-composed/components/entity-header/EntityHeader";
import type { Account, ClusterNode, CoreUser } from "./ComputeForm";

/** Minimal shape `Compute` needs off the host's job entity. */
export interface ComputeJob {
    statusTrack?: unknown[];
    statusTrackSorted: StatusTrackEntry[];
    usedApplicationNames: string[];
}

interface ComputeProps {
    className?: string;
    showHeader?: boolean;
    isLoading?: boolean;
    adjustable?: boolean;
    editable?: boolean;
    showComputeForm?: boolean;
    showStatusTrack?: boolean;
    compute: any;
    user: CoreUser;
    account: Account;
    clusters: ClusterNode[];
    onUpdate: (s: string) => void;
    job: ComputeJob;
    showAdvancedOptions?: boolean;
    accountUsers: AccountUser[];
    isAccountUsersLoading: boolean;
}

interface ComputeState {
    isAutoSet: boolean;
}

const DropdownButton = styled("div")(({ theme }) => ({
    // `theme.palette.border` is a real @mat3ra/cove theme augmentation (`src/theme/mui.d.ts`),
    // but cove only ships its `dist/` build - the augmentation file itself isn't published, so
    // ive's own compilation can't see it. Cast locally rather than treat it as dead code.
    border: `1px solid ${
        (theme.palette as { border?: { dark?: string } }).border?.dark ?? theme.palette.divider
    }`,
    borderRadius: "4px",
    padding: theme.spacing(1),
    width: "40px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
}));

const AutoSetActionContainer = styled("div")(({ theme }) => ({
    position: "absolute",
    right: theme.spacing(2),
}));

const EntityHeaderContainer = styled("div")(() => ({
    display: "flex",
    alignItems: "center",
    backgroundColor: "background.paper",
    position: "relative",
    width: "100%",
}));

class Compute extends React.Component<ComputeProps, ComputeState> {
    static defaultProps = {
        editable: true,
        showHeader: true,
        clusters: [],
        showComputeForm: true,
        showStatusTrack: true,
    };

    constructor(props: ComputeProps) {
        super(props);
        this.state = {
            isAutoSet: false,
        };
    }

    get showStatusTrack() {
        const { showStatusTrack, job } = this.props;
        return Boolean(showStatusTrack && job.statusTrack && job.statusTrack.length);
    }

    handleAutoSetAction = () => {
        const { isAutoSet } = this.state;

        console.log("Placeholder for automatic compute setup");
        showWarningAlert("Coming soon. Contact us if interested in this feature.");
        this.setState({ isAutoSet: !isAutoSet });
    };

    getDropdownAction = () => {
        return [
            {
                isShown: true,
                icon: <IconByName name="shapes.check" />,
                content: "Auto set",
                onClick: this.handleAutoSetAction,
                id: "auto-set",
            },
        ];
    };

    render() {
        const {
            className,
            showHeader,
            isLoading,
            adjustable,
            editable,
            showComputeForm,
            compute,
            user,
            account,
            clusters,
            onUpdate,
            job,
            showAdvancedOptions,
            accountUsers,
            isAccountUsersLoading,
        } = this.props;

        return (
            <div className={setClass(className, "wizard-step", "compute-step")}>
                {showHeader ? (
                    <EntityHeaderContainer>
                        <EntityHeader
                            name="Compute"
                            subtitle="Runtime configuration parameters"
                            icon="pages.compute"
                            isLoading={isLoading}
                            editable={false}
                        />
                        {adjustable || editable ? (
                            <AutoSetActionContainer>
                                <Dropdown className="pull-right" actions={this.getDropdownAction()}>
                                    <DropdownButton>
                                        <IconByName name="shapes.dots.vertical" />
                                    </DropdownButton>
                                </Dropdown>
                            </AutoSetActionContainer>
                        ) : null}
                    </EntityHeaderContainer>
                ) : null}
                {showComputeForm && (
                    <ComputeForm
                        editable={Boolean(editable)}
                        compute={compute}
                        user={user}
                        account={account}
                        clusters={clusters}
                        onUpdate={onUpdate}
                        appName={job.usedApplicationNames[0]}
                        showAdvancedOptions={Boolean(showAdvancedOptions)}
                        accountUsers={accountUsers}
                        isAccountUsersLoading={isAccountUsersLoading}
                    />
                )}
                {this.showStatusTrack && (
                    <Box p={2}>
                        <StatusTrackTable entity={job} />
                    </Box>
                )}
            </div>
        );
    }
}

export default Compute;
