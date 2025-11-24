import Homey from 'homey';
import type HomeyNS from 'homey/lib/Homey';
import type { App } from './app';
import type { Language } from './types';

export class Device<TApp extends App<TApp>> extends Homey.Device {

    get app(): TApp {
        return this.homey.app as TApp;
    }

    get id(): string {
        return this.getId();
    }

    get dashboards(): HomeyNS['dashboards'] {
        return this.homey.dashboards;
    }

    get flow(): HomeyNS['flow'] {
        return this.homey.flow;
    }

    get language(): Language {
        return this.homey.i18n.getLanguage() as Language;
    }

}

export class Driver<TApp extends App<TApp>> extends Homey.Driver {

    get app(): TApp {
        return this.homey.app as TApp;
    }

    get dashboards(): HomeyNS['dashboards'] {
        return this.homey.dashboards;
    }

    get flow(): HomeyNS['flow'] {
        return this.homey.flow;
    }

    get language(): Language {
        return this.homey.i18n.getLanguage() as Language;
    }

}
