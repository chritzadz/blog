let ctx: AudioContext | null = null;
let muted = false;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, delay: number, duration: number, volume: number, type: OscillatorType) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function gate(fn: () => void) {
  return () => {
    if (!muted) fn();
  };
}

export const chessSounds = {
  setMuted(value: boolean) {
    muted = value;
  },
  isMuted() {
    return muted;
  },
  move: gate(() => tone(494, 0, 0.07, 0.045, "triangle")),
  capture: gate(() => {
    tone(370, 0, 0.09, 0.05, "square");
    tone(294, 0.07, 0.1, 0.045, "square");
  }),
  check: gate(() => {
    tone(660, 0, 0.08, 0.05, "sine");
    tone(880, 0.08, 0.12, 0.05, "sine");
  }),
  end: gate(() => {
    [523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.18, 0.05, "triangle"));
  }),
  error: gate(() => tone(160, 0, 0.18, 0.06, "sawtooth")),
};
