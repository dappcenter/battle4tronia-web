import { cloneArr, genArray, rndElem, shuffle } from '../utils';

export const ReelSize = {
  rows: 3,
  columns: 5,
};

export interface SpinResultRow {
  symbols: SlotSymbol[];
  winningCols: number[];
}

export class SlotSymbol {
  static ALL: SlotSymbol[] = [];
  static Attack1 = new SlotSymbol('symbol-attack1');
  static Attack2 = new SlotSymbol('symbol-attack2');
  static Attack3 = new SlotSymbol('symbol-attack3');

  static rnd(): SlotSymbol {
    return rndElem(SlotSymbol.ALL);
  }

  readonly idx: number;

  private constructor(readonly id: string) {
    this.idx = SlotSymbol.ALL.length;
    SlotSymbol.ALL.push(this);
  }

  toString() {
    return this.id;
  }
}

function fullAttackCreator(symbol: SlotSymbol): () => SpinResultRow {
  return () => ({
    symbols: genArray(ReelSize.columns, () => symbol),
    winningCols: genArray(ReelSize.columns, i => i),
  });
}

function missBuilder(): SpinResultRow {
  // returns all different
  let base = shuffle(cloneArr(SlotSymbol.ALL));
  while (base.length < ReelSize.columns) {
    base = base.concat(shuffle(cloneArr(SlotSymbol.ALL)));
  }
  return {
    symbols: base.slice(0, ReelSize.columns),
    winningCols: [],
  };
}

function nearMissBuilder(): SpinResultRow {
  const win = genArray(ReelSize.columns, () => SlotSymbol.Attack1);
  win[win.length - 1] = SlotSymbol.Attack3;
  return {
    symbols: win,
    winningCols: [],
  };
}

export class ReelResult {
  static ALL: Array<{ max: number; result: ReelResult }> = [];
  static FullAttack1 = new ReelResult({
    label: 'FullAttack1',
    probability: 0.01,
    troniumPayout: 5000,
    famePayout: 5000,
    hpPayout: 200,
    builder: fullAttackCreator(SlotSymbol.Attack1),
  });
  static FullAttack2 = new ReelResult({
    label: 'FullAttack2',
    probability: 0.2,
    troniumPayout: 50,
    famePayout: 5,
    hpPayout: 2,
    builder: fullAttackCreator(SlotSymbol.Attack2),
  });
  static FullAttack3 = new ReelResult({
    label: 'FullAttack3',
    probability: 0.3,
    troniumPayout: 5,
    famePayout: 5,
    hpPayout: 2,
    builder: fullAttackCreator(SlotSymbol.Attack3),
  });

  static Miss = new ReelResult({
    label: 'Miss',
    probability: 0.29,
    troniumPayout: 0,
    famePayout: 0,
    hpPayout: 0,
    builder: missBuilder,
  });
  static NearMiss = new ReelResult({
    label: 'NearMiss',
    probability: 0.2,
    troniumPayout: 0,
    famePayout: 0,
    hpPayout: 0,
    builder: nearMissBuilder,
  });

  static spin(): ReelResult {
    const diceResult = Math.random();
    return ReelResult.fromDice(diceResult);
  }

  static fromDice(diceResult: number): ReelResult {
    const result = ReelResult.ALL.find(x => x.max > diceResult);
    if (result == null) {
      throw new Error('Logic Error: cant find result for ' + diceResult);
    }
    return result.result;
  }

  private static add(s: ReelResult) {
    if (ReelResult.ALL.length === 0) {
      ReelResult.ALL.push({ max: s.probability, result: s });
    } else {
      const prevMax = ReelResult.ALL[ReelResult.ALL.length - 1].max;
      ReelResult.ALL.push({ max: s.probability + prevMax, result: s });
    }
  }

  readonly label: string;
  readonly probability: number;
  readonly troniumPayout: number;
  readonly famePayout: number;
  readonly hpPayout: number;
  private readonly builder: () => SpinResultRow;

  private constructor(opts: {
    label: string;
    probability: number;
    troniumPayout: number;
    famePayout: number;
    hpPayout: number;
    builder: () => SpinResultRow;
  }) {
    this.label = opts.label;
    this.probability = opts.probability;
    this.troniumPayout = opts.troniumPayout;
    this.famePayout = opts.famePayout;
    this.hpPayout = opts.hpPayout;
    this.builder = opts.builder;

    ReelResult.add(this);
  }

  isWin() {
    return this.famePayout + this.hpPayout + this.troniumPayout > 0;
  }

  build(): SpinResultRow {
    return this.builder();
  }

  toString() {
    return this.label;
  }
}