export function ComputeHandlerForStatefulEntityMixin(superclass: any): {
    new (props: any): {
        [x: string]: any;
        onComputeUpdate(compute: any): void;
        onComputeToggle(checked: any): void;
        _resetStateEntityAndUpdateParents(entity: import("@mat3ra/code/dist/js/entity").InMemoryEntity, callback: never): void;
        onEntityUpdate: (entity: never) => void;
        _propagateChangesToParents(): void;
        _resetStateEntity(entity: import("@mat3ra/code/dist/js/entity").InMemoryEntity, callback: never): void;
    };
};
