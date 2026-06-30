/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/prop-types */
import Dropdown from "@exabyte-io/cove.js/dist/mui/components/dropdown";
import IconByName from "@exabyte-io/cove.js/dist/mui/components/icon/IconByName";
import { showWarningAlert } from "@exabyte-io/cove.js/dist/other/alerts";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import setClass from "classnames";
import PropTypes from "prop-types";
import React from "react";

import { ComputeForm } from "./ComputeForm";
import { StatusTrackTable } from "./StatusTrackTable";

import EntityHeader from "@exabyte-io/cove.js/dist/mui-composed/components/entity-header/EntityHeader";

const DropdownButton = styled("div")(({ theme }) => ({
    border: `1px solid ${theme.palette.border.dark}`,
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

class Compute extends React.Component {
    constructor(props) {
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
                            adjustable
                            isDescriptionEditorHidden
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
                        editable={editable}
                        compute={compute}
                        user={user}
                        account={account}
                        clusters={clusters}
                        onUpdate={onUpdate}
                        appName={job.workflow.usedApplicationNames[0]}
                        showAdvancedOptions={showAdvancedOptions}
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

Compute.propTypes = {
    editable: PropTypes.bool,
    compute: PropTypes.object,
    job: PropTypes.object,
    user: PropTypes.object,
    account: PropTypes.object,
    clusters: PropTypes.array,
    onUpdate: PropTypes.func,
    showComputeForm: PropTypes.bool,
    showStatusTrack: PropTypes.bool,
    showAdvancedOptions: PropTypes.bool,
    accountUsers: PropTypes.array,
};

Compute.defaultProps = {
    editable: true,
    // eslint-disable-next-line react/default-props-match-prop-types
    showHeader: true,
    clusters: [],
    showComputeForm: true,
    showStatusTrack: true,
};

export default Compute;
