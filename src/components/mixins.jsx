/* eslint-disable react/no-array-index-key */
import Alert from "@mui/material/Alert";
import React from "react";

export const ComputableEntityMixin = (superclass) =>
    class extends superclass {
        constructor(props) {
            super(props);
            this.state = {
                ...this.state,
                dismissWarningAlerts: {
                    // stores alert "key" and boolean as JSON dictionary
                    // 0: true
                },
                dismissErrorAlerts: {},
            };
            this.handleWarningAlertDismiss = this.handleWarningAlertDismiss.bind(this);
            this.handleErrorAlertDismiss = this.handleErrorAlertDismiss.bind(this);
        }

        shouldComponentUpdateFromComputableEntityMixin(nextProps, nextState) {
            // to calculate the number of (dismissed) alerts in the state
            const { dismissErrorAlerts, dismissWarningAlerts } = this.state;
            const stateObjectToNumber = (object) =>
                Object.values(object)
                    .map((v) => (v === true ? 1 : 0))
                    .reduce((a, b) => a + b, 0);
            return !(
                stateObjectToNumber(dismissErrorAlerts) ===
                    stateObjectToNumber(nextState.dismissErrorAlerts) &&
                stateObjectToNumber(dismissWarningAlerts) ===
                    stateObjectToNumber(nextState.dismissWarningAlerts)
            );
        }

        handleWarningAlertDismiss(key) {
            this.setState({
                dismissWarningAlerts: {
                    [key]: true,
                },
            });
        }

        handleErrorAlertDismiss(key) {
            this.setState({
                dismissErrorAlerts: {
                    [key]: true,
                },
            });
        }

        // override upon mixing
        get computedEntity() {
            throw new Error("Not implemented.");
        }

        // errors come from backend
        renderErrors() {
            const notDismissedErrors = this.computedEntity.errors.filter(
                (e, idx) => !this.state.dismissErrorAlerts[idx],
            );
            return notDismissedErrors.length > 0
                ? notDismissedErrors.map((err, idx) => {
                      return (
                          <Alert
                              severity="error"
                              key={idx}
                              onClose={() => this.handleErrorAlertDismiss(idx)}>
                              {err.message}
                              <br />
                              {Boolean(err.traceback) && (
                                  <details>
                                      <summary style={{ cursor: "pointer" }}>{err.reason}</summary>
                                      <code style={{ whiteSpace: "pre" }}>{err.traceback}</code>
                                  </details>
                              )}
                          </Alert>
                      );
                  })
                : null;
        }

        // warnings are calculated "on-the-fly"
        renderWarnings() {
            const notDismissedWarnings = this.computedEntity.warnings.filter(
                (e, idx) => !this.state.dismissWarningAlerts[idx],
            );
            return notDismissedWarnings.map((warningConfig, idx) => {
                return warningConfig.condition ? (
                    <Alert
                        severity="warning"
                        key={idx}
                        onClose={() => this.handleWarningAlertDismiss(idx)}>
                        {warningConfig.message}
                    </Alert>
                ) : null;
            });
        }
    };
