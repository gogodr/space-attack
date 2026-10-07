export interface Vec {
  x: number;
  y: number;
}

export interface Enemy extends Vec {
  id: string;
  previous: Vec;
  row: number;
  column: number;
  /** Immutable visual identity, independent of the formation's current row. */
  variant?: 'A' | 'B' | 'C';
  mode: 'formation' | 'launched' | 'reserve';
  direction: number;
  fireTimer: number;
  age: number;
}

export interface Projectile extends Vec {
  id: string;
  previous: Vec;
  side: 'player' | 'enemy';
  vy: number;
}

export interface Effect extends Vec {
  id: string;
  kind: 'kill' | 'cancel' | 'hit' | 'escape';
  remaining: number;
}
