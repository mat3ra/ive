export function ComputeHandlerForStatefulEntityMixin(superclass: any): {
    new (props: any): {
        [x: string]: any;
        onComputeUpdate(compute: any): void;
        onComputeToggle(checked: any): void;
        _resetStateEntityAndUpdateParents(entity: InMemoryEntity, callback: never): void;
        onEntityUpdate: (entity: never) => void;
        _propagateChangesToParents(): void;
        _resetStateEntity(entity: InMemoryEntity, callback: never): void;
    };
};
