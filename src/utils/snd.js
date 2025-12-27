import Snd from 'snd-lib';

// Centralized sound engine (SND01 "sine" kit).
// We keep one instance and lazy-load the kit once.
const snd = new Snd({
  easySetup: false,
  // Prevent sounds from fading out unexpectedly when window/tab focus changes.
  muteOnWindowBlur: false,
  // We'll load manually.
  preloadSoundKit: null,
});

let loadPromise = null;
export function ensureSndLoaded() {
  if (!loadPromise) {
    loadPromise = snd.load(Snd.KITS.SND01).catch(() => null);
  }
  return loadPromise;
}

function safePlay(fn) {
  void ensureSndLoaded().then(() => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

export const uiSfx = {
  tap: (options) => safePlay(() => snd.playTap(options)),
  caution: (options) => safePlay(() => snd.playCaution(options)),
  celebration: (options) => safePlay(() => snd.playCelebration(options)),
  notification: (options) => safePlay(() => snd.playNotification(options)),
  disabled: (options) => safePlay(() => snd.playDisabled(options)),
  transitionUp: (options) => safePlay(() => snd.playTransitionUp(options)),
  transitionDown: (options) => safePlay(() => snd.playTransitionDown(options)),
  stop: (soundKey) => safePlay(() => snd.stop(soundKey)),
  stopCountdown: () =>
    safePlay(() => {
      // Defensive: stop any looping/overlapping "countdown-ish" sounds.
      snd.stop(Snd.SOUNDS.caution);
      snd.stop(Snd.SOUNDS.progress_loop);
      snd.stop(Snd.SOUNDS.ringtone_loop);
    }),
};


