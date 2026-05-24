export const RANKS = [
  { name: 'Novice', threshold: 0 },
  { name: 'Script Kiddie', threshold: 100 },
  { name: 'Hacker', threshold: 500 },
  { name: 'Ghostwriter', threshold: 1500 },
  { name: 'Digital Ghost', threshold: 4000 },
  { name: 'Apocalypse', threshold: 10000 },
];

export const EXPLOITS = [
  { id: 'lightweight', name: 'Lightweight', cost: 50, desc: 'Start with chain length 3', rank: 0 },
  { id: 'compression', name: 'Compression', cost: 100, desc: 'Time dilation burns 50% slower', rank: 0 },
  { id: 'firewall_breach', name: 'Firewall Breach', cost: 150, desc: 'Firewalls last 2s shorter', rank: 1 },
  { id: 'ghost_machine', name: 'Ghost in the Machine', cost: 200, desc: '10% ignore collision once per run', rank: 1 },
  { id: 'data_leech', name: 'Data Leech', cost: 250, desc: 'Every 5th packet +1 credit', rank: 2 },
  { id: 'neural_overclock', name: 'Neural Overclock', cost: 300, desc: '+15% base movement speed', rank: 2 },
  { id: 'time_thief', name: 'Time Thief', cost: 400, desc: '1 credit per second of dilation', rank: 3 },
  { id: 'system_collapse', name: 'System Collapse', cost: 500, desc: 'Death explosion kills nearby hunters', rank: 4 },
];

export const DEATH_QUOTES = [
  'The corporation always wins.',
  'Connection terminated by admin.',
  'Your signal has been traced.',
  'Firewall deployed. Access denied.',
  'Data leak contained.',
  'Antivirus signature matched.',
  'Ghost in the shell? Not this time.',
  'Packet loss: 100%.',
  'They were always watching.',
  'Encryption failed. Soul exposed.',
  'Node purged from network.',
  'Corporate justice is swift.',
  'Your exploit chain broke.',
  'System restore initiated.',
  'Memory wiped. Identity null.',
  'Intrusion detected. Countermeasures active.',
  'The grid remembers everything.',
  'Signal drifted too far.',
  'Backup failed. No recovery.',
  'End of line.',
];

export class Progression {
  constructor(save) {
    this.save = save;
  }

  hasExploit(id) {
    return this.save.data.exploits.includes(id);
  }

  canBuy(exploit) {
    if (this.hasExploit(exploit.id)) return false;
    if (this.getRank() < exploit.rank) return false;
    return this.save.data.credits >= exploit.cost;
  }

  buy(exploit) {
    if (!this.canBuy(exploit)) return false;
    this.save.data.credits -= exploit.cost;
    this.save.data.exploits.push(exploit.id);
    this.save.save();
    return true;
  }

  getRank() {
    const total = this.save.data.totalCredits;
    let rank = 0;
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (total >= RANKS[i].threshold) {
        rank = i;
        break;
      }
    }
    return rank;
  }

  getRankName() {
    return RANKS[this.getRank()].name;
  }

  addCredits(amount) {
    this.save.data.credits += amount;
    this.save.data.totalCredits += amount;
    this.save.save();
  }

  calcRunCredits(runStats) {
    let credits = runStats.packets;
    credits += Math.floor(runStats.length * 0.5);
    credits += Math.floor(runStats.survivalTime / 10);
    credits += runStats.huntersKilled * 5;
    credits += runStats.dilationCredits || 0;
    return credits;
  }

  endRun(runStats) {
    const earned = this.calcRunCredits(runStats);
    this.addCredits(earned);
    this.save.data.stats.totalRuns++;
    this.save.data.stats.totalPackets += runStats.packets;
    this.save.data.stats.huntersKilled += runStats.huntersKilled;
    if (runStats.length > this.save.data.stats.bestLength) {
      this.save.data.stats.bestLength = runStats.length;
    }
    if (runStats.survivalTime > this.save.data.stats.bestTime) {
      this.save.data.stats.bestTime = runStats.survivalTime;
    }
    this.save.save();
    return earned;
  }

  getModifiers() {
    return {
      startLength: this.hasExploit('lightweight') ? 3 : 1,
      dilationBurnRate: this.hasExploit('compression') ? 0.5 : 1,
      firewallDurationMod: this.hasExploit('firewall_breach') ? -2 : 0,
      ghostCollision: this.hasExploit('ghost_machine'),
      dataLeech: this.hasExploit('data_leech'),
      speedBoost: this.hasExploit('neural_overclock') ? 1.15 : 1,
      timeThief: this.hasExploit('time_thief'),
      systemCollapse: this.hasExploit('system_collapse'),
    };
  }
}
