import React from "react";
/** Minimal interface for queue objects passed from the host application. */
export interface Queue {
    name: string;
    displayName: string;
    maxAvailableNodect: number;
    capacity: string;
    load: number;
    getETAClient: () => {
        display: string;
    };
}
interface QueuesTableProps {
    queues: Queue[];
    onQueueClick?: (name: string) => void;
}
export default function QueuesTable({ queues, onQueueClick }: QueuesTableProps): React.JSX.Element;
export {};
//# sourceMappingURL=QueuesTable.d.ts.map