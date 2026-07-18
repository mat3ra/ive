import IconByName from "@mat3ra/cove.js/dist/mui/components/icon/IconByName";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";

import { getNodeNumber } from "../validators";

import { ClustersLoadHandler } from "../utils/clusters_load";

/** Minimal interface for queue objects passed from the host application. */
export interface Queue {
    name: string;
    displayName: string;
    maxAvailableNodect: number;
    capacity: string;
    load: number;
    getETAClient: () => { display: string };
}

interface QueuesTableProps {
    queues: Queue[];
    onQueueClick?: (name: string) => void;
}

export default function QueuesTable({ queues, onQueueClick }: QueuesTableProps) {
    return (
        <Table size="medium">
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Full name</TableCell>
                    <TableCell>Max Nodes</TableCell>
                    <TableCell>Nodes/Job</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Load</TableCell>
                    <TableCell>Wait Time</TableCell>
                    <TableCell>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {queues.map((queue) => {
                    const { load, led } = ClustersLoadHandler.queueStatus(
                        queue.load,
                        queue.capacity,
                    );

                    return (
                        <TableRow
                            data-tid={queue.displayName}
                            onClick={() => (onQueueClick ? onQueueClick(queue.name) : undefined)}
                            key={queue.name}
                            hover
                            sx={{
                                "&:last-child td, &:last-child th": {
                                    border: 0,
                                },
                                cursor: "pointer",
                            }}>
                            <TableCell component="th" scope="row">
                                {queue.name}
                            </TableCell>
                            <TableCell>{queue.displayName}</TableCell>
                            <TableCell>{queue.maxAvailableNodect}</TableCell>
                            <TableCell>{getNodeNumber(queue.name)}</TableCell>
                            <TableCell>{queue.capacity}</TableCell>
                            <TableCell>{load}</TableCell>
                            <TableCell>{queue.getETAClient().display}</TableCell>
                            <TableCell>
                                <IconByName name="shapes.circle" color={led} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
