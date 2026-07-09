// Stub for moment-duration-format
// The real package extends moment.duration.fn with a .format() method.
// We provide a minimal implementation so that standalone builds don't crash.
import moment from "moment";

if (moment.duration.fn && !moment.duration.fn.format) {
    moment.duration.fn.format = function (template) {
        const totalSeconds = Math.abs(this.asSeconds());
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        if (template === "d[d] hh:mm:ss" || template === "hh:mm:ss") {
            const days = Math.floor(totalSeconds / 86400);
            const remainingHours = Math.floor((totalSeconds % 86400) / 3600);
            if (days > 0) {
                return `${days}d ${String(remainingHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
            }
            return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        }
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };
}
