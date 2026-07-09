export function ComputableEntityMixin(superclass: any): {
    new (props: any): {
        [x: string]: any;
        state: any;
        handleWarningAlertDismiss(key: any): void;
        handleErrorAlertDismiss(key: any): void;
        shouldComponentUpdateFromComputableEntityMixin(nextProps: any, nextState: any): boolean;
        get computedEntity(): void;
        renderErrors(): any;
        renderWarnings(): any;
    };
    [x: string]: any;
};
//# sourceMappingURL=mixins.d.ts.map