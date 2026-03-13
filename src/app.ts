import Homey from 'homey';
import type HomeyNS from 'homey/lib/Homey';
import type { Device, Driver } from './device';
import { Registry } from './registry';
import type { Language } from './types';

/**
 * Base class for Homey apps.
 *
 * Provides a typed {@link registry} for registering flow cards and helpers for
 * looking up devices and drivers.
 */
export class App<TApp extends App<any>> extends Homey.App {

    /** The flow card registry for this app. */
    get registry(): Registry<TApp> {
        return this.#registry;
    }

    readonly #registry: Registry<TApp>;

    constructor(...args: any[]) {
        super(...args);

        this.#registry = new Registry<TApp>(this as unknown as TApp);
    }

    /**
     * Finds a device by ID across all drivers.
     *
     * @param id - The device ID to look up.
     * @returns The matching device, or `null` if not found.
     */
    async getDevice<TDevice extends Device<TApp, any>>(id: string): Promise<TDevice | null> {
        const drivers = await this.getDrivers();

        for (const driver of drivers) {
            const devices = await this.getDevices<TDevice>(driver.id);

            for (const device of devices ?? []) {
                if (device.id === id) {
                    return device;
                }
            }
        }

        return null;
    }

    /**
     * Returns all devices for a given driver ID.
     *
     * @param driverId - The driver ID to look up devices for.
     * @returns An array of devices, or `null` if the driver was not found.
     */
    async getDevices<TDevice extends Device<TApp, any>>(driverId: string): Promise<TDevice[] | null> {
        const drivers = await this.getDrivers();

        for (const driver of drivers) {
            if (driver.id !== driverId) {
                continue;
            }

            return driver.getDevices() as TDevice[];
        }

        return null;
    }

    /** Returns all registered drivers for this app. */
    async getDrivers(): Promise<Driver<TApp>[]> {
        return Object.values(this.homey.drivers.getDrivers()) as Driver<TApp>[];
    }

}

/**
 * Helper class that provides typed shortcuts to common Homey APIs.
 *
 * Intended to be extended by flow entities and other app-scoped classes that
 * need convenient access to the app, registry, and Homey services.
 */
export class Shortcuts<TApp extends App<TApp>> {

    /** The typed app instance. */
    get app(): TApp {
        return this.#app;
    }

    /** The Homey instance. */
    get homey(): HomeyNS {
        return this.app.homey;
    }

    /** The flow card registry. */
    get registry(): Registry<TApp> {
        return this.app.registry;
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

    readonly #app: TApp;

    constructor(app: TApp) {
        this.#app = app;
    }

    /**
     * Creates a timeline notification with the given message.
     * Silently ignores errors if notifications are disabled.
     *
     * @param message - The notification message to display.
     */
    async notify(message: string): Promise<void> {
        try {
            await this.homey.notifications.createNotification({
                excerpt: message
            });
        } catch (err) {
            this.log('Tried to notify the timeline, but notifications are probably disabled.', err);
        }
    }

    /** Logs a message prefixed with the class name. */
    log(...args: unknown[]): void {
        this.homey.log(`[${this.constructor.name}]`, ...args);
    }

    /**
     * Emits a realtime event to connected API clients.
     *
     * @param event - The event name.
     * @param data - Optional payload to send with the event.
     */
    realtime(event: string, data?: unknown): void {
        this.homey.api.realtime(event, data);
    }

    /**
     * Translates a key using the app's i18n system.
     *
     * @param key - The translation key.
     * @param tags - Optional interpolation variables.
     */
    translate(key: string, tags?: Record<string, string | number>): string {
        return this.homey.__(key, tags);
    }

    /** Clears an interval created with {@link setInterval}. */
    clearInterval(interval: NodeJS.Timeout): void {
        this.homey.clearInterval(interval);
    }

    /**
     * Schedules a callback to run repeatedly at the given interval.
     *
     * @param callback - The function to call on each interval.
     * @param ms - The interval duration in milliseconds.
     */
    setInterval(callback: () => void, ms: number): NodeJS.Timeout {
        return this.homey.setInterval(callback, ms);
    }

    /** Clears a timeout created with {@link setTimeout}. */
    clearTimeout(interval: NodeJS.Timeout): void {
        this.homey.clearTimeout(interval);
    }

    /**
     * Schedules a callback to run once after the given delay.
     *
     * @param callback - The function to call after the delay.
     * @param ms - The delay duration in milliseconds.
     */
    setTimeout(callback: () => void, ms: number): NodeJS.Timeout {
        return this.homey.setTimeout(callback, ms);
    }

}