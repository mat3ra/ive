import { StatefulEntityMixin } from "@mat3ra/cove.js/dist/mixins/statefulEntityMixin";

export const ComputeHandlerForStatefulEntityMixin = (superclass) =>
    class extends StatefulEntityMixin(superclass) {
        constructor(props) {
            super(props);
            this.onComputeUpdate = this.onComputeUpdate.bind(this);
            this.onComputeToggle = this.onComputeToggle.bind(this);
        }

        onComputeUpdate(compute) {
            this.state.entity.setCompute(compute);
            this._resetStateEntityAndUpdateParents(this.state.entity);
        }

        onComputeToggle(checked) {
            if (checked) {
                this.state.entity.setCompute(this.constructor.getDefaultComputeConfig());
            } else {
                this.state.entity.unsetCompute();
            }
            this._resetStateEntityAndUpdateParents(this.state.entity);
        }
    };
