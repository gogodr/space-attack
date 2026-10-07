import type { Vec } from '../types';

export const EPS = 1e-8;

export const copy = (value: Vec): Vec => ({ x: value.x, y: value.y });

export const clamp = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(high, value));
