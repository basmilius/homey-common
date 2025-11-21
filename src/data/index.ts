import type { Color, Icon } from '../types';
import _colors from './colors.json';
import _icons from './icons.json';

export const colors: Color[] = _colors;

export const icons: Icon[] = _icons.map(icon => ({
    id: icon[0],
    name: icon[1],
    unicode: icon[2]
}));
