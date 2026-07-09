export declare const ClustersLoadHandler: {
    queueStatus(load: number, capacity: string): {
        load: string;
        led: "success";
    } | {
        load: string;
        led: "error";
    } | {
        load: string;
        led: "warning";
    };
    statusByLoad(load: number): {
        load: string;
        led: "success";
    } | {
        load: string;
        led: "error";
    } | {
        load: string;
        led: "warning";
    };
};
export default ClustersLoadHandler;
