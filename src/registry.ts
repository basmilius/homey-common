import type { App } from './app';
import type { FlowActionEntity, FlowAutocompleteProvider, FlowConditionEntity, FlowTriggerEntity } from './flow';
import type { Action, AutocompleteProvider, Condition, Trigger } from './types';

export class Registry<TApp extends App<TApp>> {
    get actions(): FlowActionEntity<TApp>[] {
        return this.#actions;
    }

    get autocompleteProviders(): FlowAutocompleteProvider<TApp>[] {
        return this.#autocompleteProviders;
    }

    get conditions(): FlowConditionEntity<TApp>[] {
        return this.#conditions;
    }

    get triggers(): FlowTriggerEntity<TApp>[] {
        return this.#triggers;
    }

    readonly #app: TApp;
    readonly #actions: FlowActionEntity<TApp>[] = [];
    readonly #autocompleteProviders: FlowAutocompleteProvider<TApp>[] = [];
    readonly #conditions: FlowConditionEntity<TApp>[] = [];
    readonly #triggers: FlowTriggerEntity<TApp>[] = [];

    constructor(app: TApp) {
        this.#app = app;
    }

    action<TEntity extends FlowActionEntity<TApp>>(action: Action<TApp, TEntity>): void {
        this.#actions.push(new action(this.#app));
    }

    actionFunction<TArgs = any, TResult = any>(id: string, onRun: (args: TArgs) => TResult): void {
        const action = this.#app.homey.flow.getActionCard(id);
        action.registerRunListener(onRun);

        this.#app.homey.log(`Flow card actionFunction#${id} has been registered.`);
    }

    autocompleteProvider<TEntity extends FlowAutocompleteProvider<TApp>>(autocompleteProvider: AutocompleteProvider<TApp, TEntity>): void {
        this.#autocompleteProviders.push(new autocompleteProvider(this.#app));
    }

    condition<TEntity extends FlowConditionEntity<TApp>>(condition: Condition<TApp, TEntity>): void {
        this.#conditions.push(new condition(this.#app));
    }

    trigger<TEntity extends FlowTriggerEntity<TApp>>(trigger: Trigger<TApp, TEntity>): void {
        this.#triggers.push(new trigger(this.#app));
    }

    findAction<TEntity extends FlowActionEntity<TApp>>(action: Action<TApp, TEntity>): TEntity | undefined {
        return this.#actions.find(a => a instanceof action) as TEntity;
    }

    findAutocompleteProvider<TEntity extends FlowAutocompleteProvider<TApp>>(autocompleteProvider: AutocompleteProvider<TApp, TEntity>): TEntity | undefined {
        return this.#autocompleteProviders.find(a => a instanceof autocompleteProvider) as TEntity;
    }

    findCondition<TEntity extends FlowConditionEntity<TApp>>(condition: Condition<TApp, TEntity>): TEntity | undefined {
        return this.#conditions.find(a => a instanceof condition) as TEntity;
    }

    findTrigger<TEntity extends FlowTriggerEntity<TApp>>(trigger: Trigger<TApp, TEntity>): TEntity | undefined {
        return this.#triggers.find(a => a instanceof trigger) as TEntity;
    }
}
