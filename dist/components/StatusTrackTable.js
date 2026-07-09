import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable no-shadow */
/* eslint-disable react/no-array-index-key */
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import capitalize from "underscore.string/capitalize";
import "moment-duration-format";
export class StatusTrackTable extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    // adds time delta (duration) for any subsequent status changes
    get statusTrackWithTimeDelta() {
        const { entity } = this.props;
        return entity.statusTrackSorted.map((entry, index, array) => {
            let duration = "-";
            const nextEntry = array[index + 1];
            if (nextEntry) {
                duration = moment
                    .duration(nextEntry.trackedAt - entry.trackedAt, "milliseconds")
                    .format("h[h] m[m] s[s]");
            }
            return { ...entry, duration };
        });
    }
    render() {
        const tableHeaders = Object.keys(this.statusTrackWithTimeDelta[0] || {});
        return (_jsx(TableContainer, { "data-tid": "status-track-table", component: Paper, className: "status-track", children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsx(TableRow, { children: tableHeaders.map((key, idx) => (_jsx(TableCell, { children: capitalize(key) }, idx))) }) }), _jsx(TableBody, { children: this.statusTrackWithTimeDelta.map((entry, idx) => {
                            return (_jsx(TableRow, { sx: {
                                    backgroundColor: idx % 2 ? "background.paper" : "background.default",
                                }, children: Object.values(entry).map((value, idx) => (_jsx(TableCell, { children: tableHeaders[idx] === "trackedAt"
                                        ? moment(value).format("dddd, MMMM Do YYYY, h:mm:ss a")
                                        : value }, idx))) }, idx));
                        }) })] }) }));
    }
}
StatusTrackTable.propTypes = {
    // eslint-disable-next-line react/require-default-props
    entity: PropTypes.object,
};
StatusTrackTable.defaultProps = {};
