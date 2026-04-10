import type { App } from './app';
import type { Device } from './device';
import type { FlowActionEntity, FlowAutocompleteProvider, FlowConditionEntity, FlowDeviceTriggerEntity, FlowTriggerEntity } from './flow';
import type { Action, AutocompleteProvider, Condition, DeviceTrigger, Trigger } from './types';

/**
 * Central registry for all flow card entities in a Homey app.
 *
 * Instantiated automatically by {@link App} and accessible via `app.registry`.
 * Use the registration methods to wire up flow cards at app startup.
 */
export class Registry<TApp extends App<TApp>> {

    /** All registered action entities. */
    get actions(): readonly FlowActionEntity<TApp>[] {
        return this.#actions;
    }

    /** All registered autocomplete providers. */
    get autocompleteProviders(): readonly FlowAutocompleteProvider<TApp>[] {
        return this.#autocompleteProviders;
    }

    /** All registered condition entities. */
    get conditions(): readonly FlowConditionEntity<TApp>[] {
        return this.#conditions;
    }

    /** All registered device trigger entities. */
    get deviceTriggers(): readonly FlowDeviceTriggerEntity<TApp, any>[] {
        return this.#deviceTriggers;
    }

    /** All registered global trigger entities. */
    get triggers(): readonly FlowTriggerEntity<TApp>[] {
        return this.#triggers;
    }

    readonly #app: TApp;
    readonly #actions: FlowActionEntity<TApp>[] = [];
    readonly #autocompleteProviders: FlowAutocompleteProvider<TApp>[] = [];
    readonly #conditions: FlowConditionEntity<TApp>[] = [];
    readonly #deviceTriggers: FlowDeviceTriggerEntity<TApp, any>[] = [];
    readonly #triggers: FlowTriggerEntity<TApp>[] = [];

    constructor(app: TApp) {
        this.#app = app;
    }

    /**
     * Registers a flow action entity class.
     *
     * @param action - The action entity constructor to instantiate and register.
     */
    action<TEntity extends FlowActionEntity<TApp>>(action: Action<TApp, TEntity>): void {
        this.#actions.push(new action(this.#app));
    }

    /**
     * Registers a flow action directly using a run listener function, without a class.
     *
     * @param id - The flow card ID.
     * @param onRun - The function to call when the action is executed.
     */
    actionFunction<TArgs = unknown, TResult = unknown>(id: string, onRun: (args: TArgs) => TResult): void {
        const action = this.#app.homey.flow.getActionCard(id);
        action.registerRunListener(onRun);

        this.#app.homey.log(`[actionFunction#${id}] Registered.`);
    }

    /**
     * Registers a flow condition directly using a run listener function, without a class.
     *
     * @param id - The flow card ID.
     * @param onRun - The function to call when the condition is evaluated.
     */
    conditionFunction<TArgs = unknown>(id: string, onRun: (args: TArgs) => boolean | Promise<boolean>): void {
        const condition = this.#app.homey.flow.getConditionCard(id);
        condition.registerRunListener(onRun);

        this.#app.homey.log(`[conditionFunction#${id}] Registered.`);
    }

    /**
     * Registers an autocomplete provider class.
     *
     * @param autocompleteProvider - The provider constructor to instantiate and register.
     */
    autocompleteProvider<TEntity extends FlowAutocompleteProvider<TApp>>(autocompleteProvider: AutocompleteProvider<TApp, TEntity>): void {
        this.#autocompleteProviders.push(new autocompleteProvider(this.#app));
    }

    /**
     * Registers a flow condition entity class.
     *
     * @param condition - The condition entity constructor to instantiate and register.
     */
    condition<TEntity extends FlowConditionEntity<TApp>>(condition: Condition<TApp, TEntity>): void {
        this.#conditions.push(new condition(this.#app));
    }

    /**
     * Registers a device-specific flow trigger entity class.
     *
     * @param trigger - The trigger entity constructor to instantiate and register.
     */
    deviceTrigger<TDevice extends Device<TApp, any>, TEntity extends FlowDeviceTriggerEntity<TApp, TDevice>>(trigger: DeviceTrigger<TApp, TDevice, TEntity>): void {
        this.#deviceTriggers.push(new trigger(this.#app));
    }

    /**
     * Registers a global flow trigger entity class.
     *
     * @param trigger - The trigger entity constructor to instantiate and register.
     */
    trigger<TEntity extends FlowTriggerEntity<TApp>>(trigger: Trigger<TApp, TEntity>): void {
        this.#triggers.push(new trigger(this.#app));
    }

    /**
     * Finds a registered action entity by its class.
     *
     * @param action - The action entity class to look up.
     * @returns The registered instance, or `undefined` if not found.
     */
    findAction<TEntity extends FlowActionEntity<TApp>>(action: Action<TApp, TEntity>): TEntity | undefined {
        return this.#actions.find(a => a instanceof action) as TEntity;
    }

    /**
     * Finds a registered autocomplete provider by its class.
     *
     * @param autocompleteProvider - The provider class to look up.
     * @returns The registered instance, or `undefined` if not found.
     */
    findAutocompleteProvider<TEntity extends FlowAutocompleteProvider<TApp>>(autocompleteProvider: AutocompleteProvider<TApp, TEntity>): TEntity | undefined {
        return this.#autocompleteProviders.find(a => a instanceof autocompleteProvider) as TEntity;
    }

    /**
     * Finds a registered condition entity by its class.
     *
     * @param condition - The condition entity class to look up.
     * @returns The registered instance, or `undefined` if not found.
     */
    findCondition<TEntity extends FlowConditionEntity<TApp>>(condition: Condition<TApp, TEntity>): TEntity | undefined {
        return this.#conditions.find(a => a instanceof condition) as TEntity;
    }

    /**
     * Finds a registered device trigger entity by its class.
     *
     * @param trigger - The trigger entity class to look up.
     * @returns The registered instance, or `undefined` if not found.
     */
    findDeviceTrigger<TDevice extends Device<TApp, any>, TEntity extends FlowDeviceTriggerEntity<TApp, TDevice>>(trigger: DeviceTrigger<TApp, TDevice, TEntity>): TEntity | undefined {
        return this.#deviceTriggers.find(a => a instanceof trigger) as TEntity;
    }

    /**
     * Finds a registered global trigger entity by its class.
     *
     * @param trigger - The trigger entity class to look up.
     * @returns The registered instance, or `undefined` if not found.
     */
    findTrigger<TEntity extends FlowTriggerEntity<TApp>>(trigger: Trigger<TApp, TEntity>): TEntity | undefined {
        return this.#triggers.find(a => a instanceof trigger) as TEntity;
    }

    /**
     * Finds and fires a registered global trigger entity.
     *
     * @param trigger - The trigger entity class to look up.
     * @param args - The arguments to pass to the trigger's {@link FlowTriggerEntity.trigger} method.
     */
    async fireTrigger<TEntity extends FlowTriggerEntity<TApp>>(trigger: Trigger<TApp, TEntity>, ...args: Parameters<TEntity['trigger']>): Promise<void> {
        await this.findTrigger(trigger)?.trigger(...(args as [unknown, unknown?]));
    }

    /**
     * Finds and fires a registered device trigger entity.
     *
     * @param trigger - The trigger entity class to look up.
     * @param args - The arguments to pass to the trigger's {@link FlowDeviceTriggerEntity.trigger} method.
     */
    async fireDeviceTrigger<TDevice extends Device<TApp, any>, TEntity extends FlowDeviceTriggerEntity<TApp, TDevice>>(trigger: DeviceTrigger<TApp, TDevice, TEntity>, ...args: Parameters<TEntity['trigger']>): Promise<void> {
        await this.findDeviceTrigger(trigger)?.trigger(...(args as [TDevice, unknown, unknown?]));
    }

}
