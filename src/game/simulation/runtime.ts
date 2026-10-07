export interface FormationRuntime {
  clock: number;
  direction: number;
  boundaryPending: boolean;
}

export interface LaunchRuntime {
  clock: number;
  left: boolean;
}

export interface WeaponRuntime {
  lastShot: number;
}

/** Level-local clocks live outside externally observable run state. */

export function createRuntime() {
  return {
    formation: {
      clock: 0,
      direction: 1,
      boundaryPending: false,
    } as FormationRuntime,
    launch: { clock: 0, left: true } as LaunchRuntime,
    weapon: { lastShot: -Infinity } as WeaponRuntime,
  };
}

export type SimulationRuntime = ReturnType<typeof createRuntime>;
