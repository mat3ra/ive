const LOW_LIMIT = 33;
const MEDIUM_LIMIT = 66;
const LOAD_STATUSES = {
    low: {
        load: "Low",
        led: "success",
    },
    high: {
        load: "High",
        led: "error",
    },
    medium: {
        load: "Medium",
        led: "warning",
    },
};
function calculateLoad(load) {
    if (load < LOW_LIMIT) {
        return "low";
    }
    if (load < MEDIUM_LIMIT) {
        return "medium";
    }
    return "high";
}
function getStatus(load, capacity) {
    switch (`${load}/${capacity}`) {
        case "low/FULL":
            return LOAD_STATUSES.low;
        case "medium/FULL":
            return LOAD_STATUSES.medium;
        case "high/FULL":
            return LOAD_STATUSES.high;
        case "low/DEGRADED":
            return LOAD_STATUSES.medium;
        case "medium/DEGRADED":
            return LOAD_STATUSES.medium;
        case "high/DEGRADED":
            return LOAD_STATUSES.high;
        case "low/UNAVAILABLE":
            return LOAD_STATUSES.high;
        case "medium/UNAVAILABLE":
            return LOAD_STATUSES.high;
        case "high/UNAVAILABLE":
            return LOAD_STATUSES.high;
        default:
            console.error({ load, capacity, message: "Unknown load/capacity pair" });
            return LOAD_STATUSES.high;
    }
}
export const ClustersLoadHandler = {
    queueStatus(load, capacity) {
        const calculatedLoad = calculateLoad(load);
        return getStatus(calculatedLoad, capacity);
    },
    statusByLoad(load) {
        return LOAD_STATUSES[calculateLoad(load)];
    },
};
export default ClustersLoadHandler;
