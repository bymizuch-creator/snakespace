const KEY = 'signal_drift_save';

const DEFAULT = {
  credits: 0,
  totalCredits: 0,
  exploits: [],
  rank: 0,
  stats: {
    bestLength: 0,
    bestTime: 0,
    totalRuns: 0,
    totalPackets: 0,
    huntersKilled: 0,
  },
  settings: { sfx: true, music: true, language: 'ru', skipHowto: false },
  onboardingDone: false,
};

export class SaveManager {
  constructor() {
    this.data = { ...DEFAULT, stats: { ...DEFAULT.stats } };
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = { ...DEFAULT, ...parsed, stats: { ...DEFAULT.stats, ...parsed.stats } };
      }
    } catch {
      this.data = { ...DEFAULT, stats: { ...DEFAULT.stats } };
    }
  }

  save() {
    localStorage.setItem(KEY, JSON.stringify(this.data));
  }

  reset() {
    this.data = { ...DEFAULT, stats: { ...DEFAULT.stats } };
    this.save();
  }
}
