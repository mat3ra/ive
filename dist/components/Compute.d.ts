export default Compute;
declare class Compute extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        isAutoSet: boolean;
    };
    get showStatusTrack(): boolean;
    handleAutoSetAction: () => void;
    getDropdownAction: () => {
        isShown: boolean;
        icon: React.JSX.Element;
        content: string;
        onClick: () => void;
        id: string;
    }[];
    render(): React.JSX.Element;
}
declare namespace Compute {
    namespace propTypes {
        let editable: PropTypes.Requireable<boolean>;
        let compute: PropTypes.Requireable<object>;
        let job: PropTypes.Requireable<object>;
        let user: PropTypes.Requireable<object>;
        let account: PropTypes.Requireable<object>;
        let clusters: PropTypes.Requireable<any[]>;
        let onUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        let showComputeForm: PropTypes.Requireable<boolean>;
        let showStatusTrack: PropTypes.Requireable<boolean>;
        let showAdvancedOptions: PropTypes.Requireable<boolean>;
        let accountUsers: PropTypes.Requireable<any[]>;
    }
    namespace defaultProps {
        let editable_1: boolean;
        export { editable_1 as editable };
        export let showHeader: boolean;
        let clusters_1: never[];
        export { clusters_1 as clusters };
        let showComputeForm_1: boolean;
        export { showComputeForm_1 as showComputeForm };
        let showStatusTrack_1: boolean;
        export { showStatusTrack_1 as showStatusTrack };
    }
}
import React from "react";
import PropTypes from "prop-types";
