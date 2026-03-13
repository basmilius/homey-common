<a href="https://bas.dev" target="_blank" rel="noopener">
	<img src="https://bmcdn.nl/assets/branding/logo.svg" alt="Bas Milius" height="48"/>
</a>

---

# `@basmilius/homey-common`

Shared TypeScript base classes, decorators, and utilities for [Homey](https://homey.app) apps. Provides a typed foundation for apps, devices, drivers, and flow cards so every app starts from a consistent, well-typed base.

## Installation

```bash
bun add @basmilius/homey-common
```

## Prerequisites

- Bun >= 1.3.0
- Node >= 25

## Overview

| Export                                              | Description                                                                  |
|-----------------------------------------------------|------------------------------------------------------------------------------|
| `App`                                               | Base class for Homey apps with a built-in flow card registry                 |
| `Device`                                            | Base class for Homey devices with typed getters and prefixed logging         |
| `Driver`                                            | Base class for Homey drivers                                                 |
| `Registry`                                          | Central registry for registering and looking up flow card entities           |
| `FlowActionEntity`                                  | Base class for flow action cards                                             |
| `FlowConditionEntity`                               | Base class for flow condition cards                                          |
| `FlowTriggerEntity`                                 | Base class for global flow trigger cards                                     |
| `FlowDeviceTriggerEntity`                           | Base class for device-specific flow trigger cards                            |
| `FlowAutocompleteProvider`                          | Base class for flow argument autocomplete providers                          |
| `FlowAutocompleteArgumentProvider`                  | Autocomplete provider that collects values from existing flow card arguments |
| `action` / `condition` / `trigger` / `autocomplete` | Decorators for assigning flow card IDs                                       |
| `DateTime` / `Luxon`                                | Re-exported from [luxon](https://moment.github.io/luxon/)                    |
| `colors` / `icons`                                  | Predefined color palette and Font Awesome icon set                           |

---

## Usage

### App

Extend `App` to get a typed registry for your flow cards:

```typescript
import { App } from '@basmilius/homey-common';

export class MyApp extends App<MyApp> {

    async onInit(): Promise<void> {
        this.registry.action(MyAction);
        this.registry.condition(MyCondition);
        this.registry.trigger(MyTrigger);
        this.registry.autocompleteProvider(MyAutocomplete);
    }

}
```

### Device & Driver

```typescript
import { Device, Driver } from '@basmilius/homey-common';
import type { MyApp } from './app';

export class MyDriver extends Driver<MyApp> {

    async onInit(): Promise<void> {
        // this.app → typed MyApp instance
    }

}

export class MyDevice extends Device<MyApp, MyDriver> {

    async onInit(): Promise<void> {
        // this.app       → typed MyApp instance
        // this.appDriver → typed MyDriver instance
        // this.id        → device ID
        // this.name      → device name

        await this.syncCapabilities(['measure_temperature', 'onoff']);
    }

}
```

### Flow cards

Use the `@action`, `@condition`, `@trigger` decorators to bind a class to a flow card ID, then implement `onRun`:

```typescript
import { FlowActionEntity, action } from '@basmilius/homey-common';
import type { MyApp } from './app';

type Args = { message: string };

@action('send_notification')
export class SendNotificationAction extends FlowActionEntity<MyApp, Args> {

    async onRun(args: Args): Promise<void> {
        await this.notify(args.message);
    }

}
```

```typescript
import { FlowConditionEntity, condition } from '@basmilius/homey-common';
import type { MyApp } from './app';

type Args = { threshold: number };

@condition('temperature_above')
export class TemperatureAboveCondition extends FlowConditionEntity<MyApp, Args> {

    async onRun(args: Args): Promise<boolean> {
        const temp = this.app.getCurrentTemperature();
        return temp > args.threshold;
    }

}
```

```typescript
import { FlowTriggerEntity, trigger } from '@basmilius/homey-common';
import type { MyApp } from './app';

type Tokens = { temperature: number };

@trigger('temperature_changed')
export class TemperatureChangedTrigger extends FlowTriggerEntity<MyApp, unknown, unknown, Tokens> {

    async onRun(): Promise<boolean> {
        return true;
    }

}

// Fire the trigger from elsewhere in your app:
const t = app.registry.findTrigger(TemperatureChangedTrigger)!;
await t.trigger({}, { temperature: 21.5 });
```

#### Device triggers

```typescript
import { FlowDeviceTriggerEntity, trigger } from '@basmilius/homey-common';
import type { MyApp } from './app';
import type { MyDevice } from './device';

@trigger('button_pressed')
export class ButtonPressedTrigger extends FlowDeviceTriggerEntity<MyApp, MyDevice> {

    async onRun(): Promise<boolean> {
        return true;
    }

}

// Fire from the device:
const t = device.app.registry.findDeviceTrigger(ButtonPressedTrigger)!;
await t.trigger(device, {});
```

### Autocomplete

```typescript
import { FlowAutocompleteProvider, autocomplete } from '@basmilius/homey-common';
import type { MyApp } from './app';

@autocomplete('scene')
export class SceneAutocomplete extends FlowAutocompleteProvider<MyApp> {

    async find(query: string): Promise<Homey.FlowCard.ArgumentAutocompleteResults> {
        const scenes = await this.app.getScenes();

        return scenes
            .filter(scene => scene.name.toLowerCase().includes(query.toLowerCase()))
            .map(scene => ({ name: scene.name, id: scene.id }));
    }

}
```

Register the autocomplete provider before the action that uses it, then bind them:

```typescript
this.registry.autocompleteProvider(SceneAutocomplete);
this.registry.action(ActivateSceneAction);

// Inside ActivateSceneAction.onInit:
this.registerAutocomplete('scene', SceneAutocomplete);
```

### Registry

The registry is created automatically by `App`. Use it to register and look up entities:

```typescript
// Register
registry.action(MyAction);
registry.condition(MyCondition);
registry.trigger(MyTrigger);
registry.deviceTrigger(MyDeviceTrigger);
registry.autocompleteProvider(MyAutocomplete);

// Register a simple action without a class
registry.actionFunction<{ value: number }>('set_value', (args) => {
    console.log(args.value);
});

// Look up a registered entity
const trigger = registry.findTrigger(MyTrigger);
```

### Helpers from `Shortcuts`

`App`, `FlowEntity`, `FlowAutocompleteProvider`, and `Shortcuts` all expose the following helpers:

```typescript
this.app           // Typed app instance
this.homey         // Homey instance
this.registry      // Flow card registry
this.flow          // homey.flow
this.settings      // homey.settings
this.discovery     // homey.discovery
this.dashboards    // homey.dashboards
this.language      // Current language code

await this.notify('Hello from the timeline!');
this.translate('my.key', { name: 'World' });
this.realtime('my_event', { data: 123 });

const interval = this.setInterval(() => { ... }, 5000);
this.clearInterval(interval);
```

### Data

```typescript
import { colors, icons } from '@basmilius/homey-common';

// colors: { hex: string; label: string }[]
// icons:  { id: string; name: string; unicode: string }[]
```

### Types

```typescript
import type {
    ApiRequest,        // Typed Homey API request
    WidgetApiRequest,  // Typed Homey widget API request
    Language,          // Supported language codes
    Color,             // Color entry
    Icon,              // Icon entry
    FlowCard,          // Union of all Homey flow card types
    FlowCardType,      // 'action' | 'condition' | 'trigger'
} from '@basmilius/homey-common';

// API handler example
async function onRequest(request: ApiRequest<MyApp, { value: number }>) {
    const app = request.homey.app;
    const value = request.body.value;
}
```

---

## Development

```bash
bun install   # Install dependencies
bun run build # Build to dist/
```

## License

[MIT](./LICENSE) — © [Bas Milius](https://bas.dev)
