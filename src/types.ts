import type Homey from 'homey/lib/Homey';
import type { App } from './app';
import type { FlowActionEntity, FlowAutocompleteProvider, FlowConditionEntity, FlowTriggerEntity } from './flow';

export type Constructor<T = {}> = new (...args: any[]) => T;

export type Action<TApp extends App<TApp>, TEntity extends FlowActionEntity<TApp>> = new (app: TApp) => TEntity;
export type AutocompleteProvider<TApp extends App<TApp>, TEntity extends FlowAutocompleteProvider<TApp>> = new (app: TApp) => TEntity;
export type Condition<TApp extends App<TApp>, TEntity extends FlowConditionEntity<TApp>> = new (app: TApp) => TEntity;
export type Trigger<TApp extends App<TApp>, TEntity extends FlowTriggerEntity<TApp>> = new (app: TApp) => TEntity;

export type FlowCardType =
    | 'action'
    | 'condition'
    | 'trigger';

export type Color = {
    readonly hex: string;
    readonly label: string;
};

export type Icon = {
    readonly id: string;
    readonly name: string;
    readonly unicode: string;
};

export type Language =
    | 'en'
    | 'nl'
    | 'de'
    | 'es'
    | 'fr'
    | 'it'
    | 'ko'
    | 'no'
    | 'pl'
    | 'ru'
    | 'sv';

export type ApiRequest<TApp> = {
    readonly homey: Homey & {
        readonly app: TApp;
    };
    readonly body: any;
    readonly params: Record<string, unknown>;
    readonly query: Record<string, string>;
};

export type WidgetApiRequest<TApp> = ApiRequest<TApp> & {
    readonly widgetInstanceId: string;
};
