import type Homey from 'homey';

declare module 'homey' {
    declare interface Device {
        getId(): string;
    }
}
