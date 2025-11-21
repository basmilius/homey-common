import type { Constructor } from './types';

export function action(id: string) {
    return <T extends Constructor>(ActionClass: T): T => {
        return class extends ActionClass {
            get actionId(): string {
                return id;
            }
        };
    };
}

export function autocomplete(id: string) {
    return <T extends Constructor>(AutocompleteClass: T): T => {
        return class extends AutocompleteClass {
            get autocompleteId(): string {
                return id;
            }
        };
    };
}

export function condition(id: string) {
    return <T extends Constructor>(ConditionClass: T): T => {
        return class extends ConditionClass {
            get conditionId(): string {
                return id;
            }
        };
    };
}

export function trigger(id: string) {
    return <T extends Constructor>(TriggerClass: T): T => {
        return class extends TriggerClass {
            get triggerId(): string {
                return id;
            }
        };
    };
}
