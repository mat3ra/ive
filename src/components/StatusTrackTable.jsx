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
        return (
            <TableContainer
                data-tid="status-track-table"
                component={Paper}
                className="status-track">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {tableHeaders.map((key, idx) => (
                                <TableCell key={idx}>{capitalize(key)}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.statusTrackWithTimeDelta.map((entry, idx) => {
                            return (
                                <TableRow
                                    key={idx}
                                    sx={{
                                        backgroundColor:
                                            idx % 2 ? "background.paper" : "background.default",
                                    }}>
                                    {Object.values(entry).map((value, idx) => (
                                        <TableCell key={idx}>
                                            {tableHeaders[idx] === "trackedAt"
                                                ? moment(value).format(
                                                      "dddd, MMMM Do YYYY, h:mm:ss a",
                                                  )
                                                : value}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
}

StatusTrackTable.propTypes = {
    // eslint-disable-next-line react/require-default-props
    entity: PropTypes.object,
};

StatusTrackTable.defaultProps = {};
