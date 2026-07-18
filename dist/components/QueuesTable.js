import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { getNodeNumber } from "../validators";
import { ClustersLoadHandler } from "../utils/clusters_load";
export default function QueuesTable({ queues, onQueueClick }) {
    return (_jsxs(Table, { size: "medium", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Name" }), _jsx(TableCell, { children: "Full name" }), _jsx(TableCell, { children: "Max Nodes" }), _jsx(TableCell, { children: "Nodes/Job" }), _jsx(TableCell, { children: "Capacity" }), _jsx(TableCell, { children: "Load" }), _jsx(TableCell, { children: "Wait Time" }), _jsx(TableCell, { children: "Status" })] }) }), _jsx(TableBody, { children: queues.map((queue) => {
                    const { load, led } = ClustersLoadHandler.queueStatus(queue.load, queue.capacity);
                    return (_jsxs(TableRow, { "data-tid": queue.displayName, onClick: () => (onQueueClick ? onQueueClick(queue.name) : undefined), hover: true, sx: {
                            "&:last-child td, &:last-child th": {
                                border: 0,
                            },
                            cursor: "pointer",
                        }, children: [_jsx(TableCell, { component: "th", scope: "row", children: queue.name }), _jsx(TableCell, { children: queue.displayName }), _jsx(TableCell, { children: queue.maxAvailableNodect }), _jsx(TableCell, { children: getNodeNumber(queue.name) }), _jsx(TableCell, { children: queue.capacity }), _jsx(TableCell, { children: load }), _jsx(TableCell, { children: queue.getETAClient().display }), _jsx(TableCell, { children: _jsx(IconByName, { name: "shapes.circle", color: led }) })] }, queue.name));
                }) })] }));
}
