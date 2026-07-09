import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import esseSchemas from "@mat3ra/esse/dist/js/schemas.json";
import type { JSONSchema7 } from "json-schema";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import React, { useCallback, useMemo, useState } from "react";
import ReactDOM from "react-dom";

import Compute from "../components/Compute";
import ThemeProvider from "@exabyte-io/cove.js/dist/theme/provider/ThemeProvider";

// Register all ESSE schemas
JSONSchemasInterface.setSchemas(esseSchemas as unknown as JSONSchema7[]);

console.log("IVE standalone: mounting React app, schemas registered:", esseSchemas.length);

// --- Mock Data ---

const mockClusters = [
    {
        hostname: "cluster-1.mat3ra.com",
        displayName: "Azure HPC Cluster 1 (Default)",
        isDefault: true,
        queues: [
            {
                name: "D",
                value: "D",
                displayName: "debug (D)",
                nodeLimit: 1,
                maxPPN: 16,
                capacity: "FULL",
                load: 20,
                maxAvailableNodect: 1,
                getETAClient() {
                    return { display: "0s" };
                },
            },
            {
                name: "OR",
                value: "OR",
                displayName: "ordinary regular (OR)",
                nodeLimit: 1,
                maxPPN: 32,
                capacity: "FULL",
                load: 50,
                maxAvailableNodect: 10,
                getETAClient() {
                    return { display: "2m" };
                },
            },
            {
                name: "OF",
                value: "OF",
                displayName: "ordinary fast (OF)",
                nodeLimit: 10,
                maxPPN: 64,
                capacity: "DEGRADED",
                load: 85,
                maxAvailableNodect: 5,
                getETAClient() {
                    return { display: "15m" };
                },
            },
        ],
    },
    {
        hostname: "cluster-2.mat3ra.com",
        displayName: "AWS HPC Cluster 2",
        isDefault: false,
        queues: [
            {
                name: "D",
                value: "D",
                displayName: "debug (D)",
                nodeLimit: 1,
                maxPPN: 8,
                capacity: "FULL",
                load: 10,
                maxAvailableNodect: 1,
                getETAClient() {
                    return { display: "0s" };
                },
            },
            {
                name: "GOF",
                value: "GOF",
                displayName: "1 GPU ordinary fast (GOF)",
                nodeLimit: 5,
                maxPPN: 16,
                capacity: "UNAVAILABLE",
                load: 99,
                maxAvailableNodect: 0,
                getETAClient() {
                    return { display: "unknown" };
                },
            },
        ],
    },
];

const mockAccountUsers = [
    {
        email: "timur@exabyte.io",
        entity: {
            id: "user-1",
            email: "timur@exabyte.io",
        },
        account: {
            entity: {
                name: "Timur (Owner)",
                slug: "timur",
            },
        },
    },
    {
        email: "collaborator@exabyte.io",
        entity: {
            id: "user-2",
            email: "collaborator@exabyte.io",
        },
        account: {
            entity: {
                name: "Collaborator One",
                slug: "collaborator-one",
            },
        },
    },
];

const mockUser = {
    id: "user-1",
    email: "timur@exabyte.io",
};

const mockAccount = {
    slug: "timur",
    name: "Timur (Owner)",
};

const defaultComputeConfig = {
    timeLimit: "01:00:00",
    timeLimitType: "per single attempt",
    isRestartable: true,
    cluster: {
        fqdn: "cluster-1.mat3ra.com",
        jid: "12345",
    },
    queue: "D",
    nodes: 1,
    ppn: 4,
    notify: "a",
    email: "timur@exabyte.io",
    arguments: {
        nimage: 1,
        npools: 1,
        nband: 1,
        ntg: 1,
        ndiag: 1,
    },
};

function App() {
    const [appName, setAppName] = useState("espresso");
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(true);
    const [editable, setEditable] = useState(true);
    const [compute, setCompute] = useState(defaultComputeConfig);
    const [jsonInput, setJsonInput] = useState(JSON.stringify(defaultComputeConfig, null, 2));
    const [jsonError, setJsonError] = useState("");

    const mockJob = useMemo(() => {
        return {
            workflow: {
                usedApplicationNames: [appName],
            },
            statusTrack: [
                { status: "submitted", trackedAt: Date.now() - 3600000 },
                { status: "running", trackedAt: Date.now() - 1800000 },
                { status: "finished", trackedAt: Date.now() },
            ],
            get statusTrackSorted() {
                return this.statusTrack;
            },
        };
    }, [appName]);

    const handleUpdate = (updatedCompute: any) => {
        setCompute(updatedCompute);
        setJsonInput(JSON.stringify(updatedCompute, null, 2));
        setJsonError("");
    };

    const handleLoadJson = useCallback(() => {
        try {
            const parsed = JSON.parse(jsonInput);
            setCompute(parsed);
            setJsonError("");
        } catch (e: any) {
            setJsonError(e.message);
        }
    }, [jsonInput]);

    return (
        <ThemeProvider>
            <Stack spacing={0} sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
                {/* Top bar */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ px: 3, py: 1.5, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
                    spacing={2}>
                    <Typography variant="subtitle1" fontWeight={700}>
                        IVE — Infrastructure Viewer/Editor
                    </Typography>

                    {/* App selector */}
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Application</InputLabel>
                        <Select
                            value={appName}
                            label="Application"
                            onChange={(e) => setAppName(e.target.value)}>
                            <MenuItem value="espresso">Quantum ESPRESSO</MenuItem>
                            <MenuItem value="vasp">VASP (Base Compute)</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Toggles */}
                    <Stack direction="row" spacing={2}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showAdvancedOptions}
                                    onChange={(e) => setShowAdvancedOptions(e.target.checked)}
                                />
                            }
                            label="Advanced Options"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={editable}
                                    onChange={(e) => setEditable(e.target.checked)}
                                />
                            }
                            label="Editable"
                        />
                    </Stack>
                </Stack>

                {/* Main Content Area */}
                <Stack direction="row" sx={{ flexGrow: 1 }} spacing={0}>
                    {/* Left Pane: Interactive Form */}
                    <Box sx={{ flexGrow: 1, p: 3, maxWidth: "65%", overflowY: "auto" }}>
                        <Compute
                            compute={compute}
                            user={mockUser}
                            account={mockAccount}
                            clusters={mockClusters}
                            onUpdate={handleUpdate}
                            job={mockJob}
                            showAdvancedOptions={showAdvancedOptions}
                            editable={editable}
                            accountUsers={mockAccountUsers}
                            isAccountUsersLoading={false}
                            showHeader
                        />
                    </Box>

                    {/* Right Pane: Live JSON View & Editor */}
                    <Box
                        sx={{
                            width: "35%",
                            borderLeft: 1,
                            borderColor: "divider",
                            p: 3,
                            bgcolor: "background.paper",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Live Serialized Compute State (JSON)
                        </Typography>
                        <TextField
                            multiline
                            rows={25}
                            fullWidth
                            variant="outlined"
                            value={jsonInput}
                            onChange={(e) => {
                                setJsonInput(e.target.value);
                                setJsonError("");
                            }}
                            error={!!jsonError}
                            helperText={jsonError || "You can edit this JSON and click 'LOAD JSON' to update the form."}
                            inputProps={{
                                style: {
                                    fontFamily: "monospace",
                                    fontSize: "0.85rem",
                                },
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleLoadJson}
                            disabled={!jsonInput}
                            fullWidth>
                            LOAD JSON
                        </Button>
                    </Box>
                </Stack>
            </Stack>
        </ThemeProvider>
    );
}

ReactDOM.render(<App />, document.getElementById("root"));
