import Homey from 'homey';
import type HomeyNS from 'homey/lib/Homey';
import type { App } from './app';
import type { Language } from './types';

/**
 * Base class for Homey devices.
 *
 * Provides typed access to the app and driver, convenience getters for common
 * Homey APIs, and prefixed logging.
 */
export class Device<TApp extends App<TApp>, TDriver extends Driver<TApp>> extends Homey.Device {

    /** The typed app instance. */
    get app(): TApp {
        return this.homey.app as TApp;
    }

    /** The typed driver instance for this device. */
    get appDriver(): TDriver {
        return this.driver as TDriver;
    }

    /** The device ID. */
    get id(): string {
        return this.getId();
    }

    /** The device name. */
    get name(): string {
        return this.getName();
    }

    /** Shortcut to `homey.dashboards`. */
    get dashboards(): HomeyNS['dashboards'] {
        return this.homey.dashboards;
    }

    /** Shortcut to `homey.discovery`. */
    get discovery(): HomeyNS['discovery'] {
        return this.homey.discovery;
    }

    /** Shortcut to `homey.flow`. */
    get flow(): HomeyNS['flow'] {
        return this.homey.flow;
    }

    /** Shortcut to `homey.settings`. */
    get settings(): HomeyNS['settings'] {
        return this.homey.settings;
    }

    /** The current Homey language. */
    get language(): Language {
        return this.homey.i18n.getLanguage() as Language;
    }

    /**
     * Synchronizes the device's capabilities with the provided list.
     * Adds missing capabilities and removes capabilities that are no longer needed.
     *
     * @param capabilities - The desired list of capability IDs.
     */
    async syncCapabilities(capabilities: string[]): Promise<void> {
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

    public error(...args: unknown[]): void {
        super.error(`[${this.driver.id} ➔ ${this.name}]`, ...args);
    }

    public log(...args: unknown[]): void {
        super.log(`[${this.driver.id} ➔ ${this.name}]`, ...args);
    }

    async setAvailable(): Promise<void> {
        // note: This function is overridden mainly for the Apple TV & HomePod app, sometimes
        //  this function gets called at the same time the device is being deleted.
        try {
            await super.setAvailable();
        } catch (err) {
            this.app.log('Error while setting device available', err);
        }
    }

    async setUnavailable(message?: string | null | undefined): Promise<void> {
        // note: This function is overridden mainly for the Apple TV & HomePod app, sometimes
        //  this function gets called at the same time the device is being deleted.
        try {
            await super.setUnavailable(message);
        } catch (err) {
            this.app.log('Error while setting device unavailable', err);
        }
    }

}

/**
 * Base class for Homey drivers.
 *
 * Provides typed access to the app and convenience getters for common Homey APIs.
 */
export class Driver<TApp extends App<TApp>> extends Homey.Driver {

    /** The typed app instance. */
    get app(): TApp {
        return this.homey.app as TApp;
    }

    /** Shortcut to `homey.dashboards`. */
    get dashboards(): HomeyNS['dashboards'] {
        return this.homey.dashboards;
    }

    /** Shortcut to `homey.discovery`. */
    get discovery(): HomeyNS['discovery'] {
        return this.homey.discovery;
    }

    /** Shortcut to `homey.flow`. */
    get flow(): HomeyNS['flow'] {
        return this.homey.flow;
    }

    /** Shortcut to `homey.settings`. */
    get settings(): HomeyNS['settings'] {
        return this.homey.settings;
    }

    /** The current Homey language. */
    get language(): Language {
        return this.homey.i18n.getLanguage() as Language;
    }

}
