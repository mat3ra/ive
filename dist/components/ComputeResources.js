import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import NumericStepperInput from "@mat3ra/cove/dist/mui/components/numeric-stepper/NumericStepperInput";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React from "react";
import { parseWalltimeHours } from "../utils/computeEstimate";
import { COMPUTE_PRESETS, findMatchingPreset, presetToCompute, resolvePreset, } from "../utils/computePresets";
/**
 * How much of the cluster this job wants.
 *
 * The three numbers that decide what a job costs used to be plain required text
 * fields: empty on arrival, red on first paint, and silent about the limits they
 * had to respect. Here the bounds live on the steppers, so nudging cannot
 * produce a configuration the queue would reject, and the presets give a reader
 * who does not know how many nodes a relaxation wants something defensible to
 * start from.
 *
 * Typed values are still allowed past the bounds and reported inline — but only
 * once the reader has been to the field, on the same rule as the rest of the
 * form (see `utils/touchedFields`).
 */
export default function ComputeResources({ compute, queues = [], limits, onChange, disabled = false, showAllErrors = false, id = "compute-resources", }) {
    var _a, _b, _c, _d;
    const [touched, setTouched] = React.useState({});
    const walltimeHours = parseWalltimeHours(compute === null || compute === void 0 ? void 0 : compute.timeLimit);
    const activePreset = findMatchingPreset(compute, limits);
    const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
    const shouldShow = (field) => showAllErrors || touched[field];
    const applyPreset = (preset) => {
        setTouched({ nodes: true, ppn: true, timeLimit: true });
        onChange(presetToCompute(preset, limits));
    };
    const nodesError = shouldShow("nodes") &&
        (limits === null || limits === void 0 ? void 0 : limits.maxNodes) !== undefined &&
        ((_a = compute === null || compute === void 0 ? void 0 : compute.nodes) !== null && _a !== void 0 ? _a : 0) > limits.maxNodes;
    const ppnError = shouldShow("ppn") && (limits === null || limits === void 0 ? void 0 : limits.maxPpn) !== undefined && ((_b = compute === null || compute === void 0 ? void 0 : compute.ppn) !== null && _b !== void 0 ? _b : 0) > limits.maxPpn;
    const walltimeError = shouldShow("timeLimit") &&
        (limits === null || limits === void 0 ? void 0 : limits.maxWalltimeHours) !== undefined &&
        walltimeHours !== undefined &&
        walltimeHours > limits.maxWalltimeHours;
    return (_jsxs(Stack, { spacing: 2, id: id, children: [_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", flexWrap: "wrap", useFlexGap: true, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Start from" }), COMPUTE_PRESETS.map((preset) => {
                        const resolved = resolvePreset(preset, limits);
                        const isActive = (activePreset === null || activePreset === void 0 ? void 0 : activePreset.id) === preset.id;
                        return (_jsx(Button, { id: `compute-preset-${preset.id}`, size: "small", variant: isActive ? "contained" : "outlined", disabled: disabled, onClick: () => applyPreset(preset), title: `${preset.description} — ${resolved.nodes} × ${resolved.ppn}, ${resolved.walltimeHours} h`, children: preset.label }, preset.id));
                    })] }), _jsxs(Stack, { direction: "row", spacing: 2, flexWrap: "wrap", useFlexGap: true, children: [queues.length ? (_jsx(TextField, { id: "compute-queue", select: true, label: "Queue", size: "small", sx: { minWidth: 200 }, value: (_c = compute === null || compute === void 0 ? void 0 : compute.queue) !== null && _c !== void 0 ? _c : "", disabled: disabled, helperText: "Determines the walltime cap and the wait", onChange: (event) => {
                            markTouched("queue");
                            onChange({ queue: event.target.value });
                        }, children: queues.map((queue) => {
                            var _a;
                            return (_jsx(MenuItem, { value: queue.name, children: (_a = queue.displayName) !== null && _a !== void 0 ? _a : queue.name }, queue.name));
                        }) })) : null, _jsx(NumericStepperInput, { id: "compute-nodes", label: "Nodes", value: compute === null || compute === void 0 ? void 0 : compute.nodes, min: 1, max: limits === null || limits === void 0 ? void 0 : limits.maxNodes, disabled: disabled, error: Boolean(nodesError), helperText: nodesError
                            ? `Over the ${limits === null || limits === void 0 ? void 0 : limits.maxNodes}-node limit`
                            : describeRange(1, limits === null || limits === void 0 ? void 0 : limits.maxNodes), onChange: (nodes) => {
                            markTouched("nodes");
                            onChange({ nodes });
                        } }), _jsx(NumericStepperInput, { id: "compute-ppn", label: "Cores per node", value: compute === null || compute === void 0 ? void 0 : compute.ppn, min: 1, max: limits === null || limits === void 0 ? void 0 : limits.maxPpn, unit: "cores", disabled: disabled, error: Boolean(ppnError), helperText: ppnError
                            ? `Over the ${limits === null || limits === void 0 ? void 0 : limits.maxPpn}-core limit`
                            : describeRange(1, limits === null || limits === void 0 ? void 0 : limits.maxPpn), onChange: (ppn) => {
                            markTouched("ppn");
                            onChange({ ppn });
                        } }), _jsx(TextField, { id: "compute-walltime", label: "Walltime", size: "small", 
                        // Free text rather than a stepper: HH:MM:SS is what the queue
                        // takes and what the reader recognises from the scheduler.
                        value: (_d = compute === null || compute === void 0 ? void 0 : compute.timeLimit) !== null && _d !== void 0 ? _d : "", placeholder: "HH:MM:SS", disabled: disabled, error: Boolean(walltimeError), helperText: walltimeError
                            ? `Over the ${limits === null || limits === void 0 ? void 0 : limits.maxWalltimeHours} h queue limit`
                            : (limits === null || limits === void 0 ? void 0 : limits.maxWalltimeHours)
                                ? `up to ${limits.maxWalltimeHours} h`
                                : "HH:MM:SS", onChange: (event) => {
                            markTouched("timeLimit");
                            onChange({ timeLimit: event.target.value });
                        } })] })] }));
}
function describeRange(min, max) {
    return max === undefined ? `${min} or more` : `${min} to ${max}`;
}
