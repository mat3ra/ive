import { StatefulEntityMixin } from "@mat3ra/cove/dist/mixins/statefulEntityMixin";
import React from "react";

/** Minimal shape `ComputeHandlerForStatefulEntityMixin` needs off `state.entity`. */
export interface ComputeHandlerEntity {
    setCompute(compute: unknown): void;
    unsetCompute(): void;
}

type Constructor<T> = new (...args: any[]) => T;

export const ComputeHandlerForStatefulEntityMixin = <TBase extends Constructor<React.Component>>(
    superclass: TBase,
) =>
    class extends StatefulEntityMixin(superclass) {
        constructor(props: any) {
            super(props);
            this.onComputeUpdate = this.onComputeUpdate.bind(this);
            this.onComputeToggle = this.onComputeToggle.bind(this);
        }

        onComputeUpdate(compute: unknown) {
            const { entity } = this.state;
            (entity as ComputeHandlerEntity).setCompute(compute);
            // cove's own .d.ts declares a required (mistyped `never`) second `callback` param
            // that the real implementation treats as optional - see StatefulEntityMixin.js.
            this._resetStateEntityAndUpdateParents(entity, undefined as never);
        }

        onComputeToggle(checked: boolean) {
            const { entity } = this.state;
            if (checked) {
                const staticThis = this.constructor as unknown as { getDefaultComputeConfig(): unknown };
                (entity as ComputeHandlerEntity).setCompute(staticThis.getDefaultComputeConfig());
            } else {
                (entity as ComputeHandlerEntity).unsetCompute();
            }
            this._resetStateEntityAndUpdateParents(entity, undefined as never);
        }
    };
