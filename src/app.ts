import Homey from 'homey';
import type HomeyNS from 'homey/lib/Homey';
import { Registry } from './registry';
import type { Language } from './types';

export class App<TApp extends App<any>> extends Homey.App {
    get registry(): Registry<TApp> {
        return this.#registry;
    }

    readonly #registry: Registry<TApp>;

    constructor(...args: any[]) {
        super(...args);

        this.#registry = new Registry<TApp>(this as unknown as TApp);
    }
}

export class Shortcuts<TApp extends App<TApp>> {
    get app(): TApp {
        return this.#app;
    }

    get homey(): HomeyNS {
        return this.app.homey;
    }

    get registry(): Registry<TApp> {
        return this.app.registry;
    }

    get dashboards(): HomeyNS['dashboards'] {
        return this.homey.dashboards;
    }

    get flow(): HomeyNS['flow'] {
        return this.homey.flow;
    }

    get settings(): HomeyNS['settings'] {
        return this.homey.settings;
    }

    get language(): Language {
        return this.homey.i18n.getLanguage() as Language;
    }

    readonly #app: TApp;

    constructor(app: TApp) {
        this.#app = app;
    }

    async notify(message: string): Promise<void> {
        await this.homey.notifications.createNotification({
            excerpt: message
        });
    }

    log(...args: any[]): void {
        this.homey.log(...args);
    }

    realtime(event: string, data: any = undefined): void {
        this.homey.api.realtime(event, data);
    }

    translate(key: string, tags?: Record<string, string | number>): string {
        return this.homey.__(key, tags);
    }

    clearInterval(interval: NodeJS.Timeout): void {
        this.homey.clearInterval(interval);
    }

    setInterval(callback: Function, ms: number): NodeJS.Timeout {
        return this.homey.setInterval(callback, ms);
    }

    clearTimeout(interval: NodeJS.Timeout): void {
        this.homey.clearTimeout(interval);
    }

    setTimeout(callback: Function, ms: number): NodeJS.Timeout {
        return this.homey.setTimeout(callback, ms);
    }
}
