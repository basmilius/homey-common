import type Homey from 'homey';
import type HomeyNS from 'homey/lib/Homey';
import type { App } from './app';
import type { Device } from './device';
import type { FlowActionEntity, FlowAutocompleteProvider, FlowConditionEntity, FlowDeviceTriggerEntity, FlowTriggerEntity } from './flow';

/** Generic constructor type. */
export type Constructor<T = {}> = new (...args: any[]) => T;

/** Constructor type for a {@link FlowActionEntity} subclass. */
export type Action<TApp extends App<TApp>, TEntity extends FlowActionEntity<TApp>> = new (app: TApp) => TEntity;

/** Constructor type for a {@link FlowAutocompleteProvider} subclass. */
export type AutocompleteProvider<TApp extends App<TApp>, TEntity extends FlowAutocompleteProvider<TApp>> = new (app: TApp) => TEntity;

/** Constructor type for a {@link FlowConditionEntity} subclass. */
export type Condition<TApp extends App<TApp>, TEntity extends FlowConditionEntity<TApp>> = new (app: TApp) => TEntity;

/** Constructor type for a {@link FlowDeviceTriggerEntity} subclass. */
export type DeviceTrigger<TApp extends App<TApp>, TDevice extends Device<TApp, any>, TEntity extends FlowDeviceTriggerEntity<TApp, TDevice>> = new (app: TApp) => TEntity;

/** Constructor type for a {@link FlowTriggerEntity} subclass. */
export type Trigger<TApp extends App<TApp>, TEntity extends FlowTriggerEntity<TApp>> = new (app: TApp) => TEntity;

/** Union of all Homey flow card types. */
export type FlowCard = Homey.FlowCardAction | Homey.FlowCardCondition | Homey.FlowCardTrigger;

/** The type discriminator for flow cards. */
export type FlowCardType =
    | 'action'
    | 'condition'
    | 'trigger';

/** A predefined color with a label and hex value. */
export type Color = {
    readonly hex: string;
    readonly label: string;
};

/** A Font Awesome icon entry. */
export type Icon = {
    readonly id: string;
    readonly name: string;
    readonly unicode: string;
};

/** A Homey-supported language code. */
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

/**
 * Typed API request object passed to Homey app API handlers.
 *
 * @template TApp - The app type.
 * @template TBody - The request body type.
 * @template TParams - The URL parameters type.
 * @template TQuery - The query string parameters type.
 */
export type ApiRequest<TApp, TBody = never, TParams = never, TQuery = never> = {
    readonly homey: HomeyNS & {
        readonly app: TApp;
    };
    readonly body: TBody;
    readonly params: TParams;
    readonly query: TQuery;
};

/**
 * Typed API request object for Homey widget API handlers.
 * Extends {@link ApiRequest} with a `widgetInstanceId` field.
 */
export type WidgetApiRequest<TApp, TBody = never, TParams = never, TQuery = never> = ApiRequest<TApp, TBody, TParams, TQuery> & {
    readonly widgetInstanceId: string;
};
