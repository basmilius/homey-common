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

    get name(): string {
        return this.getName();
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

    async removeOldCapabilities(capabilities: string[]): Promise<void> {
        const currentCapabilities = this.getCapabilities();

        for (const capability of capabilities) {
            if (currentCapabilities.includes(capability)) {
                continue;
            }

            await this.addCapability(capability);
        }

        for (const capability of currentCapabilities) {
            if (capabilities.includes(capability)) {
                continue;
            }

            await this.removeCapability(capability);
        }
    }

    public error(...args: any) {
        super.error(`[${this.driver.id}: ${this.name}]`, ...args);
    }

    public log(...args: any) {
        super.log(`[${this.driver.id}: ${this.name}]`, ...args);
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
