export type Impact =
  | {
      kind: 'cancel';
      a: string;
      b: string;
      toi: number;
    }
  | {
      kind: 'kill';
      projectile: string;
      enemy: string;
      toi: number;
    }
  | {
      kind: 'hit';
      projectile?: string;
      enemy?: string;
      toi: number;
    };

export type SoundCue =
  | 'shoot'
  | 'enemy-shot'
  | 'kill'
  | 'cancel'
  | 'hit'
  | 'escape'
  | 'level'
  | 'game-over'
  | 'victory';
