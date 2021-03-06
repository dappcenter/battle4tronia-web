import { Howl } from 'howler';
import { rndElem } from '../utils';

const Spec = {
  src: ['/assets/sounds.ogg', '/assets/sounds.m4a', '/assets/sounds.mp3', '/assets/sounds.ac3'],
  sprite: {
    'bg-battle': [0, 57260.4081632653, true],
    'bg-home': [59000, 54595.91836734694, true],
    spin: [115000, 5250.612244897965, true],
    'bg-battle2': [141000, 5511.065759637177, true],
    battleEndA: [122000, 2026.3038548752802],
    battleEndB: [126000, 2274.444444444441],
    battleEndC: [130000, 1964.6712018140704],
    battleEndD: [133000, 2354.875283446717],
    battleEndE: [137000, 2019.4557823129173],
    btnNegative: [148000, 127.6190476190493],
    btnPositive: [150000, 234.64852607710895],
    'move-blockA': [152000, 3500.521541950121],
    'move-blockB': [157000, 2016.0317460317572],
    'move-blockC': [161000, 1612.1088435374133],
    'move-blockD': [164000, 2224.8072562358348],
    'move-boomerang': [168000, 1944.716553287975],
    'move-punch': [171000, 1555.8049886621177],
    'move-scatter': [174000, 4472.902494331066],
    'move-sword': [180000, 3306.054421768721],
    'move-trashA': [185000, 1750.2721088435464],
    'move-trashB': [188000, 1166.8480725623454],
    'move-trashC': [191000, 972.380952380945],
    'move-trashD': [193000, 972.3582766440018],
    'move-trashE': [195000, 1361.315192743774],
    'move-trashF': [198000, 1071.3378684807253],
    'move-trashG': [201000, 1341.7233560090835],
    'move-tronium': [204000, 3889.501133786837],
    taunt1: [209000, 1978.3900226757396],
    taunt10: [212000, 1485.4875283446631],
    taunt11: [215000, 2474.6485260770896],
    taunt12: [219000, 2187.165532879817],
    taunt13: [223000, 1540.2721088435385],
    taunt14: [226000, 2447.278911564638],
    taunt15: [230000, 1992.0634920634939],
    taunt16: [233000, 1865.4195011338004],
    taunt17: [236000, 2748.48072562358],
    taunt18: [240000, 2950.4308390022798],
    taunt19: [244000, 1506.0317460317378],
    taunt2: [247000, 2217.959183673457],
    taunt20: [251000, 1519.7278911564638],
    taunt3: [254000, 1759.2970521541815],
    taunt4: [257000, 2642.380952380961],
    taunt5: [261000, 2936.734693877554],
    taunt6: [265000, 941.2698412698433],
    taunt7: [267000, 2238.4807256235604],
    taunt8: [271000, 2313.809523809539],
    taunt9: [275000, 2255.623582766418],
    villainEntry: [279000, 1718.2312925170322],
  },
};

export type SoundId = keyof typeof Spec['sprite'];

const Taunts: SoundId[] = [
  'taunt1',
  'taunt10',
  'taunt11',
  'taunt12',
  'taunt13',
  'taunt14',
  'taunt15',
  'taunt16',
  'taunt17',
  'taunt18',
  'taunt19',
  'taunt2',
  'taunt3',
  'taunt4',
  'taunt5',
  'taunt6',
  'taunt7',
  'taunt8',
  'taunt9',
];

export class SoundManager {
  volumeOn = true;
  musicOn = true;
  private howl: Howl;
  private currentSpin: null | number = null;
  private musicSounds: number[] = [];
  private toStopOnFade: Set<number> = new Set();
  private endListeners: Map<number, () => void> = new Map();

  constructor() {
    this.howl = new Howl(Spec as any);
    this.howl.on('fade', id => {
      if (this.toStopOnFade.has(id)) {
        this.howl.stop(id);
        this.toStopOnFade.delete(id);
      }
    });

    this.howl.on('end', id => {
      if (this.endListeners.has(id)) {
        this.endListeners.get(id)!();
        this.endListeners.delete(id);
      }
    });
  }

  soundChooser = (...soundIds: SoundId[]) => () => this.play(rndElem(soundIds));

  toggleMusic() {
    this.musicOn = !this.musicOn;
    this.musicSounds.forEach(id => {
      this.howl.mute(!(this.musicOn && this.volumeOn), id);
    });
    return this.musicOn;
  }

  toggleVolume() {
    this.volumeOn = !this.volumeOn;
    this.howl.mute(!this.volumeOn);
    this.musicSounds.forEach(id => {
      this.howl.mute(!(this.musicOn && this.volumeOn), id);
    });
    return this.volumeOn;
  }

  play(id: SoundId) {
    return this.howl.play(id);
  }

  async playAndWait(id: SoundId) {
    const num = this.play(id);
    return new Promise(resolve => {
      this.endListeners.set(num, resolve);
    });
  }

  enterHome() {
    this.changeMusic('bg-home');
  }
  enterBattle() {
    this.changeMusic('bg-battle', 'bg-battle2');
  }

  load() {
    return new Promise(resolve => {
      if (this.howl.state() === 'loaded') {
        resolve();
      } else {
        this.howl.once('load', resolve);
      }
    });
  }

  startSpin() {
    this.currentSpin = this.play('spin');
  }

  stopSpin(duration: number) {
    if (this.currentSpin) {
      this.fadeAndStop(this.currentSpin, duration);
      this.currentSpin = null;
    }
  }

  playWin() {
    const winSounds: SoundId[] = ['battleEndA', 'battleEndB', 'battleEndC'];
    return this.playAndWait(rndElem(winSounds));
  }

  async playVillainEntry() {
    await this.playAndWait('villainEntry');
    await this.playAndWait(rndElem(Taunts));
  }

  private fadeAndStop(id: number, duration: number) {
    this.howl.fade(1, 0, duration, id);
    this.toStopOnFade.add(id);
  }

  private changeMusic(...soundIds: SoundId[]) {
    this.musicSounds.forEach(id => {
      this.howl.stop(id);
    });
    this.musicSounds = soundIds.map(s => {
      const id = this.play(s);
      this.howl.mute(!(this.musicOn && this.volumeOn), id);
      return id;
    });
  }
}

const SM = new SoundManager();

export const MoveSound = {
  punch: () => SM.play('move-punch'),
  boomerang: () => SM.play('move-boomerang'),
  sword: () => SM.play('move-sword'),
  tronium: () => SM.play('move-tronium'),
  scatter: () => SM.play('move-scatter'),
  block: SM.soundChooser('move-blockA', 'move-blockB', 'move-blockC', 'move-blockD'),
  trash: SM.soundChooser(
    'move-trashA',
    'move-trashB',
    'move-trashC',
    'move-trashD',
    'move-trashE',
    'move-trashF',
    'move-trashG'
  ),
};

export default SM;
