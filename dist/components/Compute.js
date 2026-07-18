import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/prop-types */
import Dropdown from "@mat3ra/cove/dist/mui/components/dropdown";
import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import { showWarningAlert } from "@mat3ra/cove/dist/other/alerts";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import setClass from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { ComputeForm } from "./ComputeForm";
import { StatusTrackTable } from "./StatusTrackTable";
import EntityHeader from "@mat3ra/cove/dist/mui-composed/components/entity-header/EntityHeader";
const DropdownButton = styled("div")(({ theme }) => {
    var _a, _b;
    return ({
        border: `1px solid ${(_b = (_a = theme.palette.border) === null || _a === void 0 ? void 0 : _a.dark) !== null && _b !== void 0 ? _b : theme.palette.divider}`,
        borderRadius: "4px",
        padding: theme.spacing(1),
        width: "40px",
        height: "40px",
        display: "flex",
        justifyContent: "center",
    });
});
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
        this.handleAutoSetAction = () => {
            const { isAutoSet } = this.state;
            console.log("Placeholder for automatic compute setup");
            showWarningAlert("Coming soon. Contact us if interested in this feature.");
            this.setState({ isAutoSet: !isAutoSet });
        };
        this.getDropdownAction = () => {
            return [
                {
                    isShown: true,
                    icon: _jsx(IconByName, { name: "shapes.check" }),
                    content: "Auto set",
                    onClick: this.handleAutoSetAction,
                    id: "auto-set",
                },
            ];
        };
        this.state = {
            isAutoSet: false,
        };
    }
    get showStatusTrack() {
        const { showStatusTrack, job } = this.props;
        return Boolean(showStatusTrack && job.statusTrack && job.statusTrack.length);
    }
    render() {
        const { className, showHeader, isLoading, adjustable, editable, showComputeForm, compute, user, account, clusters, onUpdate, job, showAdvancedOptions, accountUsers, isAccountUsersLoading, } = this.props;
        return (_jsxs("div", { className: setClass(className, "wizard-step", "compute-step"), children: [showHeader ? (_jsxs(EntityHeaderContainer, { children: [_jsx(EntityHeader, { name: "Compute", subtitle: "Runtime configuration parameters", icon: "pages.compute", isLoading: isLoading, editable: false, adjustable: true, isDescriptionEditorHidden: true }), adjustable || editable ? (_jsx(AutoSetActionContainer, { children: _jsx(Dropdown, { className: "pull-right", actions: this.getDropdownAction(), children: _jsx(DropdownButton, { children: _jsx(IconByName, { name: "shapes.dots.vertical" }) }) }) })) : null] })) : null, showComputeForm && (_jsx(ComputeForm, { editable: editable, compute: compute, user: user, account: account, clusters: clusters, onUpdate: onUpdate, appName: job.workflow.usedApplicationNames[0], showAdvancedOptions: showAdvancedOptions, accountUsers: accountUsers, isAccountUsersLoading: isAccountUsersLoading })), this.showStatusTrack && (_jsx(Box, { p: 2, children: _jsx(StatusTrackTable, { entity: job }) }))] }));
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
