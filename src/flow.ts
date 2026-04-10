import type Homey from 'homey';
import { type App, Shortcuts } from './app';
import type { Device } from './device';
import type { AutocompleteProvider, FlowCard, FlowCardType } from './types';
import { debounce } from './utils';

/**
 * Abstract base class for all flow card entities.
 *
 * Subclasses must implement {@link resolveCard} to return the correct Homey flow card,
 * and {@link onRun} to handle execution of the card.
 */
export abstract class FlowEntity<TApp extends App<TApp>, TCard extends Homey.FlowCard, TArgs = unknown, TState = unknown, TResult = unknown> extends Shortcuts<TApp> {

    /** The underlying Homey flow card instance. */
    get card(): TCard {
        return this.#card;
    }

    /** The flow card ID. */
    get id(): string {
        return this.#card.id;
    }

    /** The flow card type (action, condition, or trigger). */
    get type(): FlowCardType {
        return this.#card.type;
    }

    readonly #card: TCard;
    #autocompleteProvider?: FlowAutocompleteProvider<TApp>;

    constructor(app: TApp) {
        super(app);

        this.#card = this.resolveCard();

        this.onInit()
            .catch(err => this.log('Failed to initialize.', err));
    }

    /**
     * Resolves the Homey flow card instance for this entity.
     * Called once during construction before {@link onInit}.
     */
    protected abstract resolveCard(): TCard;

    /** Initializes the flow card by registering the run listener and update handler. */
    async onInit(): Promise<void> {
        this.#card.registerRunListener(this.onRun.bind(this));
        this.#card.on('update', this.onUpdate.bind(this));

        this.log('Registered.');
    }

    /** Called when the flow card is executed. Must return the result appropriate for the card type. */
    abstract onRun(args: TArgs, state: TState): Promise<TResult>;

    /** Called when the flow card configuration is updated. Triggers the autocomplete provider if set. */
    async onUpdate(): Promise<void> {
        await this.#autocompleteProvider?.triggerUpdate();
    }

    log(...args: unknown[]): void {
        this.homey.log(`[${this.type}#${this.id}]`, ...args);
    }

    /**
     * Registers an autocomplete listener for the given argument name.
     *
     * @param name - The argument name to register autocomplete for.
     * @param autocompleteProvider - The autocomplete provider class to use.
     */
    registerAutocomplete<TAutocomplete extends FlowAutocompleteProvider<TApp>>(name: string, autocompleteProvider: AutocompleteProvider<TApp, TAutocomplete>): void {
        const provider = this.registry.findAutocompleteProvider(autocompleteProvider);

        if (!provider) {
            throw new Error(`Unable to register autocomplete for ${this.type}#${this.id}. The provider was not registered.`);
        }

        this.#autocompleteProvider = provider;
        this.#card.registerArgumentAutocompleteListener(name, provider.find.bind(provider));
    }

}

/**
 * Abstract base class for flow action entities.
 *
 * Decorated with {@link action} to provide the card ID.
 */
export abstract class FlowActionEntity<TApp extends App<TApp>, TArgs = unknown, TState = unknown, TResult = unknown> extends FlowEntity<TApp, Homey.FlowCardAction, TArgs, TState, TResult> {

    /** The action card ID, injected by the {@link action} decorator. */
    declare readonly actionId: string;

    protected resolveCard(): Homey.FlowCardAction {
        return this.flow.getActionCard(this.actionId);
    }

}

/**
 * Abstract base class for flow condition entities.
 *
 * Decorated with {@link condition} to provide the card ID.
 */
export abstract class FlowConditionEntity<TApp extends App<TApp>, TArgs = unknown, TState = unknown> extends FlowEntity<TApp, Homey.FlowCardCondition, TArgs, TState, boolean> {

    /** The condition card ID, injected by the {@link condition} decorator. */
    declare readonly conditionId: string;

    protected resolveCard(): Homey.FlowCardCondition {
        return this.flow.getConditionCard(this.conditionId);
    }

}

/**
 * Abstract base class for device-specific flow trigger entities.
 *
 * Decorated with {@link trigger} to provide the card ID.
 */
export abstract class FlowDeviceTriggerEntity<TApp extends App<TApp>, TDevice extends Device<TApp, any>, TArgs = unknown, TState = unknown, TTokens = unknown> extends FlowEntity<TApp, Homey.FlowCardTriggerDevice, TArgs, TState, boolean> {

    /** The trigger card ID, injected by the {@link trigger} decorator. */
    declare readonly triggerId: string;

    protected resolveCard(): Homey.FlowCardTriggerDevice {
        return this.flow.getDeviceTriggerCard(this.triggerId);
    }

    /**
     * Triggers the device flow card.
     *
     * @param device - The device instance that triggered the flow.
     * @param state - The state to pass to condition cards.
     * @param tokens - Optional token values to pass to the flow.
     */
    async trigger(device: TDevice, state: TState, tokens?: TTokens): Promise<void> {
        return this.card.trigger(device, tokens as object, state as object);
    }

}

/**
 * Abstract base class for global flow trigger entities.
 *
 * Decorated with {@link trigger} to provide the card ID.
 */
export abstract class FlowTriggerEntity<TApp extends App<TApp>, TArgs = unknown, TState = unknown, TTokens = unknown> extends FlowEntity<TApp, Homey.FlowCardTrigger, TArgs, TState, boolean> {

    /** The trigger card ID, injected by the {@link trigger} decorator. */
    declare readonly triggerId: string;

    protected resolveCard(): Homey.FlowCardTrigger {
        return this.flow.getTriggerCard(this.triggerId);
    }

    /**
     * Triggers the global flow card.
     *
     * @param state - The state to pass to condition cards.
     * @param tokens - Optional token values to pass to the flow.
     */
    async trigger(state: TState, tokens?: TTokens): Promise<void> {
        return this.card.trigger(tokens as object, state as object);
    }

}

/**
 * Abstract base class for flow autocomplete providers.
 *
 * Decorated with {@link autocomplete} to provide the provider ID.
 * The {@link update} method is called on init and debounced on subsequent updates.
 */
export abstract class FlowAutocompleteProvider<TApp extends App<TApp>> extends Shortcuts<TApp> {

    /** The autocomplete provider ID, injected by the {@link autocomplete} decorator. */
    declare readonly autocompleteId: string;

    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(app: TApp) {
        super(app);

        this.triggerUpdate = debounce(this.triggerUpdate, 300, this) as typeof this.triggerUpdate;
    }

    /** Initializes the provider by running an initial update. */
    async onInit(): Promise<void> {
        await this.update();
        this.log('Registered.');
    }

    /** Returns autocomplete results for the given query and current argument values. */
    abstract find(query: string, args: Record<string, unknown>): Promise<Homey.FlowCard.ArgumentAutocompleteResults>;

    /** Triggers a debounced call to {@link update}. */
    async triggerUpdate(): Promise<void> {
        await this.update();
    }

    /**
     * Fetches or recomputes the autocomplete data.
     * Override this method in subclasses to populate the data source.
     */
    async update(): Promise<void> {
    }

    log(...args: unknown[]): void {
        this.homey.log(`[autocomplete#${this.autocompleteId}]`, ...args);
    }

}

/**
 * Abstract base class for autocomplete providers that collect argument values from flow cards.
 *
 * Gathers all values that users have entered for a specific argument across all registered cards,
 * deduplicates them, and exposes them via {@link values}.
 */
export abstract class FlowAutocompleteArgumentProvider<TApp extends App<TApp>, TValue = string> extends FlowAutocompleteProvider<TApp> {

    /** The deduplicated list of collected argument values. */
    get values(): TValue[] {
        return this.#values;
    }

    #cards: FlowCard[] = [];
    #values: TValue[] = [];

    /** Returns the flow cards whose argument values should be collected. */
    abstract getCards(): FlowCard[];

    /** Maps a raw argument value to the desired output type. */
    abstract mapArgument(value: unknown): TValue;

    /**
     * Determines whether two values are considered duplicates.
     * Override this method to provide custom comparison logic for non-primitive values.
     */
    protected isDuplicate(a: TValue, b: TValue): boolean {
        return a === b;
    }

    async onInit(): Promise<void> {
        this.#cards = this.getCards();

        await super.onInit();
    }

    async update(): Promise<void> {
        const results = await Promise.allSettled(this.#cards.map(card => card.getArgumentValues()));

        this.#values = results
            .filter((result): result is PromiseFulfilledResult<any[]> => result.status === 'fulfilled')
            .flatMap(result => result.value)
            .map(value => this.mapArgument(value))
            .filter((value, index, arr) => arr.findIndex(v => this.isDuplicate(v, value)) === index);
    }

}
