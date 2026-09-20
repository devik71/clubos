export type Camera = 'A' | 'B' | 'C';
export type EngineState = {
  mode: 'auto' | 'manual'; program: Camera; excluded: Camera[];
  incident: number; failRecovery: boolean; clock: number; shotAge: number;
  running: boolean; logs: string[];
};
export type EngineAction =
  | { type: 'tick' } | { type: 'auto' } | { type: 'force'; camera: Camera }
  | { type: 'exclude'; camera: Camera } | { type: 'fail'; persistent: boolean }
  | { type: 'reset' } | { type: 'pause' } | { type: 'lock' };
export const initialEngine: EngineState = {
  mode: 'auto', program: 'A', excluded: [], incident: -1, failRecovery: false,
  clock: 2833, shotAge: 0, running: true, logs: ['00:47:13 · Director ready. CAM A → program.'],
};
export function formatTime(seconds: number): string {
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(n => String(n).padStart(2, '0')).join(':');
}
export function available(state: EngineState, camera: Camera): boolean {
  return !state.excluded.includes(camera) && !(camera === 'B' && state.incident >= 0 && (state.incident < 8 || state.failRecovery));
}
export const incidentMessages = [
  'CAM B freezes. Safe source → CAM A.',
  'Health Monitor: unchanged frames. CAM B rejected by Director.',
  'CAM B removed from pool. Program safe on CAM A.',
  'Recovery Handler: reconnect attempt 1.',
  'Waiting for capture device…',
  'Recovery Handler: checking device response.',
  'Capture device reconnected.',
  'Signal verification: motion and timestamps valid.',
  'CAM B verified. Available for Director.',
];
function log(state: EngineState, message: string): EngineState {
  return { ...state, logs: [`${formatTime(state.clock)} · ${message}`, ...state.logs].slice(0, 12) };
}
export function engineReducer(state: EngineState, action: EngineAction): EngineState {
  switch (action.type) {
    case 'reset': return { ...initialEngine, logs: [...initialEngine.logs] };
    case 'pause': return { ...state, running: !state.running };
    case 'auto': return log({ ...state, mode: 'auto', shotAge: 0 }, 'Human → returned control to AUTO.');
    case 'lock': return log({ ...state, mode: 'manual' }, `Human → locked CAM ${state.program}.`);
    case 'force':
      if (!available(state, action.camera)) return log(state, `Safety invariant: CAM ${action.camera} unavailable. Request rejected.`);
      return log({ ...state, mode: 'manual', program: action.camera, shotAge: 0 }, `Human override → CAM ${action.camera}.`);
    case 'exclude': {
      const excluded = state.excluded.includes(action.camera) ? state.excluded.filter(c => c !== action.camera) : [...state.excluded, action.camera];
      const next = { ...state, excluded };
      const safe = (['A', 'B', 'C'] as Camera[]).find(c => available(next, c));
      if (!safe) return log(state, 'Cannot remove last safe source. Human intervention required.');
      if (!available(next, next.program)) { next.program = safe; next.shotAge = 0; }
      return log(next, `Human → CAM ${action.camera} ${excluded.includes(action.camera) ? 'excluded; changing battery' : 'returned to pool'}.`);
    }
    case 'fail':
      return log({ ...state, program: 'A', shotAge: 0, incident: 0, failRecovery: action.persistent, running: true }, incidentMessages[0]);
    case 'tick': {
      if (!state.running) return state;
      let next = { ...state, clock: state.clock + 1, shotAge: state.shotAge + 1 };
      if (state.incident >= 0 && state.incident < 8) {
        next.incident += 1;
        const message = state.failRecovery && next.incident >= 6
          ? ['No device response. Retry exhausted.', 'CAM B unavailable. Stream safe.', 'Human notified. CAM B remains outside pool.'][next.incident - 6]
          : next.incident === 8 && state.excluded.includes('B') ? 'CAM B signal verified. Human exclusion preserved.' : incidentMessages[next.incident];
        return log(next, message);
      }
      if (next.mode === 'auto' && next.shotAge >= 5) {
        const pool = (['A', 'C', 'B'] as Camera[]).filter(c => available(next, c));
        next.program = pool[(pool.indexOf(next.program) + 1) % pool.length] ?? next.program;
        next.shotAge = 0;
        next = log(next, `Director → CAM ${next.program}. Musical phrase + shot duration; Judge accepted.`);
      }
      return next;
    }
  }
}
