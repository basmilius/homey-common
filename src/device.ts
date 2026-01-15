import Homey from 'homey';
import type HomeyNS from 'homey/lib/Homey';
import type { App } from './app';
import type { Language } from './types';

export class Device<TApp extends App<TApp>, TDriver extends Driver<TApp>> extends Homey.Device {

    get app(): TApp {
        return this.homey.app as TApp;
    }

    get appDriver(): TDriver {
        return this.driver as TDriver;
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
        super.error(`[${this.driver.id} ➔ ${this.name}]`, ...args);
    }

    public log(...args: any) {
        super.log(`[${this.driver.id} ➔ ${this.name}]`, ...args);
    }

}

export class DeviceMDNSSD<TApp extends App<TApp>, TDriver extends Driver<TApp>> extends Device<TApp, TDriver> {
    get discoveryId(): string {
        throw new Error('Not implemented');
    }

    get discoveryStrategies(): string[] {
        throw new Error('Not implemented');
    }

    async onInit(): Promise<void> {
        for (const strategyKey of this.discoveryStrategies) {
            const strategy = this.homey.discovery.getStrategy(strategyKey);
            const results = strategy.getDiscoveryResults();

            for (const [id, result] of Object.entries(results)) {
                if (id !== this.discoveryId) {
                    continue;
                }

                await this.#setDiscoveryResult(strategyKey, result as Homey.DiscoveryResultMDNSSD);
            }

            strategy.on('result', async result => {
                if (result.id !== this.discoveryId) {
                    return;
                }

                await this.#setDiscoveryResult(strategyKey, result);
                this.log(strategyKey, result);
            });
        }

        await super.onInit();
    }

    async onDeviceDiscoveryResult(strategy: string, result: Homey.DiscoveryResultMDNSSD): Promise<void> {
        this.log('Got a discovery update', strategy, result);
    }

    async #setDiscoveryResult(strategy: string, result: Homey.DiscoveryResultMDNSSD): Promise<void> {
        await this.onDeviceDiscoveryResult(strategy, result);
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
