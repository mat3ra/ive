import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/prop-types */
import { EMAIL_NOTIFICATIONS } from "@mat3ra/ide";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import setClass from "classnames";
import PropTypes from "prop-types";
import React from "react";
import AccountCard from "@mat3ra/cove.js/dist/mui-composed/components/account/AccountCard";
const IS_BEGIN = "isBegin";
const IS_ABORT = "isAbort";
const IS_END = "isEnd";
const MenuProps = {
    id: "users-multiselect-menu",
    PaperProps: {
        style: {
            maxHeight: 224,
            width: 250,
        },
    },
};
class Notify extends React.Component {
    constructor(props) {
        super(props);
        this.selectNotifyAccount = (event) => {
            const { target: { value: selectedUsers }, } = event;
            const { editable, onUpdate } = this.props;
            const { isBegin, isAbort, isEnd } = this.state;
            if (!editable) {
                return; // do nothing if not editable
            }
            if (!selectedUsers.length) {
                this.setState({
                    notify: EMAIL_NOTIFICATIONS.never,
                    selectedUsers: [],
                    isBegin: false,
                    isAbort: false,
                    isEnd: false,
                }, () => {
                    const { notify } = this.state;
                    onUpdate({ notify, email: "" });
                });
            }
            else if (selectedUsers.length && !(isBegin && isAbort && isEnd)) {
                this.setState({
                    notify: EMAIL_NOTIFICATIONS.abe,
                    selectedUsers,
                    isBegin: true,
                    isAbort: true,
                    isEnd: true,
                }, () => {
                    const { notify, selectedUsers: users } = this.state;
                    onUpdate({ notify, email: users.map((user) => user.entity.email).join(",") });
                });
            }
            else {
                let updatedNotify = "";
                if (isAbort)
                    updatedNotify += "a";
                if (isBegin)
                    updatedNotify += "b";
                if (isEnd)
                    updatedNotify += "e";
                this.setState({
                    notify: updatedNotify,
                    selectedUsers,
                    isBegin,
                    isAbort,
                    isEnd,
                }, () => {
                    const { notify, selectedUsers: users } = this.state;
                    onUpdate({ notify, email: users.map((user) => user.email).join(",") });
                });
            }
        };
        const { notify = "", email, accountUsers } = this.props;
        const emails = email ? email.split(",") : [];
        const selectedUsers = (accountUsers !== null && accountUsers !== void 0 ? accountUsers : []).filter((user) => {
            var _a;
            return emails.includes((_a = user === null || user === void 0 ? void 0 : user.entity) === null || _a === void 0 ? void 0 : _a.email);
        });
        this.state = {
            notify,
            isBegin: notify.includes("b"),
            isAbort: notify.includes("a"),
            isEnd: notify.includes("e"),
            selectedUsers,
        };
    }
    toggleOption(optionName) {
        const { onUpdate } = this.props;
        const { selectedUsers } = this.state;
        const isSelectedUsers = !!selectedUsers.length;
        let updatedState;
        if (!isSelectedUsers) {
            return;
        }
        switch (optionName) {
            case IS_BEGIN:
                updatedState = this.toggleBeginOption();
                break;
            case IS_ABORT:
                updatedState = this.toggleAbortOption();
                break;
            case IS_END:
                updatedState = this.toggleEndOption();
                break;
            default:
                throw new Error(`Not supported optionName ${optionName}`);
        }
        this.setState(updatedState, () => {
            const { notify, selectedUsers: users } = this.state;
            onUpdate({
                notify: users.length ? notify : EMAIL_NOTIFICATIONS.never,
                email: users.length ? users.map((user) => user.entity.email).join(",") : "",
            });
        });
    }
    toggleBeginOption() {
        const { isAbort, isBegin, isEnd, selectedUsers } = this.state;
        let updatedUsers = selectedUsers;
        let updatedNotify = "";
        if (!isAbort && !isEnd && isBegin) {
            updatedUsers = [];
            updatedNotify = EMAIL_NOTIFICATIONS.never;
        }
        else {
            if (isAbort)
                updatedNotify += "a";
            if (!isBegin)
                updatedNotify += "b";
            if (isEnd)
                updatedNotify += "e";
        }
        return { notify: updatedNotify, selectedUsers: updatedUsers, isBegin: !isBegin };
    }
    toggleAbortOption() {
        const { isAbort, isBegin, isEnd, selectedUsers } = this.state;
        let updatedUsers = selectedUsers;
        let updatedNotify = "";
        if (isAbort && !isEnd && !isBegin) {
            updatedUsers = [];
            updatedNotify = EMAIL_NOTIFICATIONS.never;
        }
        else {
            if (!isAbort)
                updatedNotify += "a";
            if (isBegin)
                updatedNotify += "b";
            if (isEnd)
                updatedNotify += "e";
        }
        return { notify: updatedNotify, selectedUsers: updatedUsers, isAbort: !isAbort };
    }
    toggleEndOption() {
        const { isAbort, isBegin, isEnd, selectedUsers } = this.state;
        let updatedUsers = selectedUsers;
        let updatedNotify = "";
        if (!isAbort && isEnd && !isBegin) {
            updatedUsers = [];
            updatedNotify = EMAIL_NOTIFICATIONS.never;
        }
        else {
            if (isAbort)
                updatedNotify += "a";
            if (isBegin)
                updatedNotify += "b";
            if (!isEnd)
                updatedNotify += "e";
        }
        return { notify: updatedNotify, selectedUsers: updatedUsers, isEnd: !isEnd };
    }
    render() {
        const { editable, accountUsers } = this.props;
        const { isBegin, isAbort, isEnd, selectedUsers } = this.state;
        const isSelectedUsers = selectedUsers.length;
        return (_jsxs(Paper, { sx: { mb: 3, p: 3 }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", mb: 1, children: "Notifications" }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: "users-label", children: "Select users" }), _jsx(Select, { id: "users-multiselect", labelId: "users-label", multiple: true, value: selectedUsers, onChange: this.selectNotifyAccount, input: _jsx(OutlinedInput, { label: "Select users" }), renderValue: (selected) => {
                                        return selected.map((user) => user.account.entity.name).join(", ");
                                    }, MenuProps: MenuProps, disabled: !editable, children: accountUsers.map((item) => (_jsxs(MenuItem, { value: item, className: "users-multiselect-item", children: [_jsx(Checkbox, { checked: !!selectedUsers.find((user) => user.entity.email === item.entity.email) }), _jsx(AccountCard, { account: item.account.entity, subtitle: item.entity.email })] }, item.entity.id))) })] })] }), _jsxs(Box, { sx: { display: "flex", flexDirection: "column" }, mt: 2, children: [_jsx(Typography, { variant: "subtitle1", children: "Events" }), _jsx(Typography, { variant: "caption", mb: 1, children: "Choose events to trigger notifications" }), _jsxs(ButtonGroup, { size: "small", children: [_jsx(Button, { className: setClass({
                                        unset: !isBegin,
                                        active: isBegin,
                                        disabled: !editable || !isSelectedUsers,
                                    }), variant: isBegin ? "contained" : "outlined", disabled: !editable || !isSelectedUsers, id: "email-opt-b", onClick: () => this.toggleOption(IS_BEGIN), children: "Started" }), _jsx(Button, { className: setClass({
                                        unset: !isAbort,
                                        active: isAbort,
                                        disabled: !editable || !isSelectedUsers,
                                    }), variant: isAbort ? "contained" : "outlined", disabled: !editable || !isSelectedUsers, id: "email-opt-a", onClick: () => this.toggleOption(IS_ABORT), children: "Aborted" }), _jsx(Button, { className: setClass({
                                        unset: !isEnd,
                                        active: isEnd,
                                        disabled: !editable || !isSelectedUsers,
                                    }), variant: isEnd ? "contained" : "outlined", disabled: !editable || !isSelectedUsers, id: "email-opt-e", onClick: () => this.toggleOption(IS_END), children: "Ended" })] })] })] }));
    }
}
Notify.propTypes = {
    onUpdate: PropTypes.func,
    editable: PropTypes.bool,
    email: PropTypes.string,
};
Notify.defaultProps = {
    editable: true,
};
export default Notify;
