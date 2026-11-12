import { moveThumb, thumbForTouch, type PriceRange } from '@/components/ui/PriceRangeSlider';

const MIN = 199;
const MAX = 14999;

describe('thumbForTouch', () => {
  it('grabs the low thumb below the range and the high thumb above it', () => {
    expect(thumbForTouch(100, [500, 9000])).toBe(0);
    expect(thumbForTouch(14000, [500, 9000])).toBe(1);
  });

  it('grabs the nearer thumb inside the range', () => {
    expect(thumbForTouch(1000, [500, 9000])).toBe(0);
    expect(thumbForTouch(8000, [500, 9000])).toBe(1);
  });

  it('can always reopen a collapsed range from either side', () => {
    const collapsed: PriceRange = [5000, 5000];
    expect(thumbForTouch(1000, collapsed)).toBe(0);
    expect(thumbForTouch(9000, collapsed)).toBe(1);
  });
});

describe('moveThumb', () => {
  it('clamps to the bounds', () => {
    expect(moveThumb(0, -500, [500, 9000], MIN, MAX)).toEqual([MIN, 9000]);
    expect(moveThumb(1, 99999, [500, 9000], MIN, MAX)).toEqual([500, MAX]);
  });

  it('keeps the pair ordered instead of crossing over', () => {
    expect(moveThumb(0, 12000, [500, 9000], MIN, MAX)).toEqual([9000, 9000]);
    expect(moveThumb(1, 100, [500, 9000], MIN, MAX)).toEqual([500, 500]);
  });

  it('leaves the other thumb untouched', () => {
    expect(moveThumb(0, 2000, [500, 9000], MIN, MAX)).toEqual([2000, 9000]);
    expect(moveThumb(1, 7000, [500, 9000], MIN, MAX)).toEqual([500, 7000]);
  });

  it('rounds to whole minor units', () => {
    expect(moveThumb(0, 2000.6, [500, 9000], MIN, MAX)).toEqual([2001, 9000]);
  });
});

describe('drag sequences', () => {
  /** Mirrors the component: grant picks a thumb, each move re-applies from the grant amount. */
  function drag(value: PriceRange, touchAmount: number, deltas: number[]): PriceRange {
    const which = thumbForTouch(touchAmount, value);
    let next = moveThumb(which, touchAmount, value, MIN, MAX);
    for (const delta of deltas) {
      next = moveThumb(which, touchAmount + delta, next, MIN, MAX);
    }
    return next;
  }

  it('drags the high thumb down without dragging the low one with it', () => {
    expect(drag([MIN, MAX], 14000, [-2000, -4000])).toEqual([MIN, 10000]);
  });

  it('drags the low thumb up to meet the high thumb and no further', () => {
    expect(drag([MIN, 9000], 1000, [3000, 20000])).toEqual([9000, 9000]);
  });

  it('reopens a range collapsed at the minimum', () => {
    expect(drag([MIN, MIN], 8000, [2000])).toEqual([MIN, 10000]);
  });
});
