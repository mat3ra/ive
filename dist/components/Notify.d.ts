export default Notify;
declare class Notify extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        notify: any;
        isBegin: any;
        isAbort: any;
        isEnd: any;
        selectedUsers: any;
    };
    selectNotifyAccount: (event: any) => void;
    toggleOption(optionName: any): void;
    toggleBeginOption(): {
        notify: string;
        selectedUsers: any;
        isBegin: boolean;
    };
    toggleAbortOption(): {
        notify: string;
        selectedUsers: any;
        isAbort: boolean;
    };
    toggleEndOption(): {
        notify: string;
        selectedUsers: any;
        isEnd: boolean;
    };
    render(): React.JSX.Element;
}
declare namespace Notify {
    namespace propTypes {
        let onUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        let editable: PropTypes.Requireable<boolean>;
        let email: PropTypes.Requireable<string>;
    }
    namespace defaultProps {
        let editable_1: boolean;
        export { editable_1 as editable };
    }
}
import React from "react";
import PropTypes from "prop-types";
//# sourceMappingURL=Notify.d.ts.map