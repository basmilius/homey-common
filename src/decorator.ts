import type { Constructor } from './types';

/**
 * Class decorator that assigns an action card ID to a {@link FlowActionEntity} subclass.
 *
 * @param id - The Homey flow action card ID.
 *
 * @example
 * ```ts
 * @action('my_action')
 * class MyAction extends FlowActionEntity<MyApp> { ... }
 * ```
 */
export function action(id: string) {
    return <T extends Constructor>(ActionClass: T): T => {
        return class extends ActionClass {
            get actionId(): string {
                return id;
            }
        };
    };
}

/**
 * Class decorator that assigns an autocomplete provider ID to a {@link FlowAutocompleteProvider} subclass.
 *
 * @param id - The autocomplete provider ID, matching the argument name in the flow card manifest.
 *
 * @example
 * ```ts
 * @autocomplete('my_autocomplete')
 * class MyAutocomplete extends FlowAutocompleteProvider<MyApp> { ... }
 * ```
 */
export function autocomplete(id: string) {
    return <T extends Constructor>(AutocompleteClass: T): T => {
        return class extends AutocompleteClass {
            get autocompleteId(): string {
                return id;
            }
        };
    };
}

/**
 * Class decorator that assigns a condition card ID to a {@link FlowConditionEntity} subclass.
 *
 * @param id - The Homey flow condition card ID.
 *
 * @example
 * ```ts
 * @condition('my_condition')
 * class MyCondition extends FlowConditionEntity<MyApp> { ... }
 * ```
 */
export function condition(id: string) {
    return <T extends Constructor>(ConditionClass: T): T => {
        return class extends ConditionClass {
            get conditionId(): string {
                return id;
            }
        };
    };
}

/**
 * Class decorator that assigns a trigger card ID to a {@link FlowTriggerEntity}
 * or {@link FlowDeviceTriggerEntity} subclass.
 *
 * @param id - The Homey flow trigger card ID.
 *
 * @example
 * ```ts
 * @trigger('my_trigger')
 * class MyTrigger extends FlowTriggerEntity<MyApp> { ... }
 * ```
 */
export function trigger(id: string) {
    return <T extends Constructor>(TriggerClass: T): T => {
        return class extends TriggerClass {
            get triggerId(): string {
                return id;
            }
        };
    };
}
