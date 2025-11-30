import type Homey from 'homey';
import { type App, Shortcuts } from './app';
import type { Device } from './device';
import type { AutocompleteProvider, FlowCardType } from './types';

export abstract class FlowEntity<TApp extends App<TApp>, TCard extends Homey.FlowCard, TArgs = unknown, TState = unknown, TResult = unknown> extends Shortcuts<TApp> {

    get card(): TCard {
        return this.#card;
    }

    get id(): string {
        return this.#card.id;
    }

    get type(): FlowCardType {
        return this.#card.type;
    }

    readonly #card: TCard;

    constructor(app: TApp) {
        super(app);

        this.#card = this.#getCard();

        this.onInit()
            .then()
            .catch(console.error.bind(console));
    }

    async onInit(): Promise<void> {
        this.#card.registerRunListener(this.onRun.bind(this));
        this.#card.on('update', this.onUpdate.bind(this));

        this.log(`onInit() -> Flow card ${this.type}#${this.id} has been registered.`);
    }

    abstract onRun(args: TArgs, state: TState): Promise<TResult>;

    async onUpdate(): Promise<void> {
    }

    registerAutocomplete<TAutocomplete extends FlowAutocompleteProvider<TApp>>(name: string, autocompleteProvider: AutocompleteProvider<TApp, TAutocomplete>): void {
        const provider = this.registry.findAutocompleteProvider(autocompleteProvider);

        if (!provider) {
            throw new Error(`Unable to register autocomplete for ${this.type}#${this.id}. The provider was not registered.`);
        }

        this.#card.registerArgumentAutocompleteListener(name, provider.find.bind(provider));
    }

    #getCard(): TCard {
        if (this instanceof FlowActionEntity) {
            return this.flow.getActionCard((this as any).actionId) as unknown as TCard;
        }

        if (this instanceof FlowConditionEntity) {
            return this.flow.getConditionCard((this as any).conditionId) as unknown as TCard;
        }

        if (this instanceof FlowTriggerEntity) {
            return this.flow.getTriggerCard((this as any).triggerId) as unknown as TCard;
        }

        throw new Error(`Flow card type ${this.constructor.name} not found.`);
    }

}

export abstract class FlowActionEntity<TApp extends App<TApp>, TArgs = unknown, TState = unknown, TResult = unknown> extends FlowEntity<TApp, Homey.FlowCardAction, TArgs, TState, TResult> {
}

export abstract class FlowConditionEntity<TApp extends App<TApp>, TArgs = unknown, TState = unknown> extends FlowEntity<TApp, Homey.FlowCardCondition, TArgs, TState, boolean> {
}

export abstract class FlowDeviceTriggerEntity<TApp extends App<TApp>, TDevice extends Device<TApp>, TArgs = unknown, TState = unknown, TTokens = unknown> extends FlowEntity<TApp, Homey.FlowCardTriggerDevice, TArgs, TState, boolean> {

    async trigger(device: TDevice, state: TState, tokens?: TTokens): Promise<any> {
        return this.card.trigger(device, tokens as object, state as object);
    }

}

export abstract class FlowTriggerEntity<TApp extends App<TApp>, TArgs = unknown, TState = unknown, TTokens = unknown> extends FlowEntity<TApp, Homey.FlowCardTrigger, TArgs, TState, boolean> {

    async trigger(state: TState, tokens?: TTokens): Promise<any> {
        return this.card.trigger(tokens as object, state as object);
    }

}

export abstract class FlowAutocompleteProvider<TApp extends App<TApp>> extends Shortcuts<TApp> {

    abstract find(query: string, args: Record<string, unknown>): Promise<Homey.FlowCard.ArgumentAutocompleteResults>;

    async update(): Promise<void> {
    }

    async onInit(): Promise<void> {
        this.homey.log(`onInit() -> Autocomplete provider ${(this as any).autocompleteId} has been registered.`);
        await this.update();
    }

}
