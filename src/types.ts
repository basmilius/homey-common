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

export type ApiRequest<TApp, TBody = never, TParams = never, TQuery = never> = {
    readonly homey: Homey & {
        readonly app: TApp;
    };
    readonly body: TBody;
    readonly params: TParams;
    readonly query: TQuery;
};

export type WidgetApiRequest<TApp, TBody = never, TParams = never, TQuery = never> = ApiRequest<TApp, TBody, TParams, TQuery> & {
    readonly widgetInstanceId: string;
};
