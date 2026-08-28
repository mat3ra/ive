/* eslint-disable react/no-array-index-key */
import Alert from "@mui/material/Alert";
import React from "react";

/** Shape of a single backend-reported compute error, as rendered by `renderErrors()`. */
export interface ComputeError {
    message: string;
    reason?: string;
    traceback?: string;
}

/** Shape of a single "on-the-fly" warning, as rendered by `renderWarnings()`. */
export interface WarningConfig {
    condition: boolean;
    message: React.ReactNode;
}

/**
 * What `computedEntity` needs to provide. Mirrors `@mat3ra/ide`'s real
 * `ComputedEntityMixin<C>` (`errors`, always populated by the mixin `ide` applies to
 * jode's `Job.prototype`) - but `warnings` is optional, matching reality: `ide` dropped
 * its `warnings` fallback (nothing replaced it - the intended web-app follow-up never
 * landed, and the file it would have landed in was later deleted entirely), so no
 * producer of `.warnings` exists anywhere in the stack today.
 */
export interface ComputableEntity {
    readonly errors: ComputeError[];
    readonly warnings?: WarningConfig[];
}

type Constructor<T = React.Component> = new (...args: any[]) => T;

export const ComputableEntityMixin = <TBase extends Constructor>(superclass: TBase) =>
    class extends superclass {
        state: any;

        constructor(...args: any[]) {
            super(...args);
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

        shouldComponentUpdateFromComputableEntityMixin(nextProps: any, nextState: any) {
            // to calculate the number of (dismissed) alerts in the state
            const { dismissErrorAlerts, dismissWarningAlerts } = this.state;
            const stateObjectToNumber = (object: Record<string, boolean>) =>
                Object.values(object)
                    .map((v): number => (v === true ? 1 : 0))
                    .reduce((a, b) => a + b, 0);
            return !(
                stateObjectToNumber(dismissErrorAlerts) ===
                    stateObjectToNumber(nextState.dismissErrorAlerts) &&
                stateObjectToNumber(dismissWarningAlerts) ===
                    stateObjectToNumber(nextState.dismissWarningAlerts)
            );
        }

        handleWarningAlertDismiss(key: number) {
            this.setState({
                dismissWarningAlerts: {
                    [key]: true,
                },
            });
        }

        handleErrorAlertDismiss(key: number) {
            this.setState({
                dismissErrorAlerts: {
                    [key]: true,
                },
            });
        }

        // override upon mixing
        get computedEntity(): ComputableEntity {
            throw new Error("Not implemented.");
        }

        // errors come from backend
        renderErrors(): React.ReactNode {
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

        // warnings are calculated "on-the-fly" - optional, see `ComputableEntity` above
        renderWarnings(): React.ReactNode {
            const notDismissedWarnings = (this.computedEntity.warnings ?? []).filter(
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
