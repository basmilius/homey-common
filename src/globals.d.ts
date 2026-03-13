export {};

declare module 'homey' {
    interface Device {
        getId(): string;
    }
}
