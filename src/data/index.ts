import type { Color, Icon } from '../types';
import _colors from './colors.json';
import _icons from './icons.json' with { type: 'text' };

export const colors: Color[] = _colors;

export const icons: Icon[] = JSON.parse(_icons as unknown as string).map((icon: [string, string, string]) => ({
    id: icon[0],
    name: icon[1],
    unicode: icon[2]
}));
