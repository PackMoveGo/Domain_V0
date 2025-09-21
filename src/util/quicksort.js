// Quicksort (ESM) - functional (non-mutating) and in-place variants
// - Default comparator sorts ascending for numbers/strings
// - Provide a custom comparator: (a, b) => a - b

/**
 * Default comparator: ascending order
 * @param {any} a
 * @param {any} b
 * @returns {number} negative if a < b, 0 if equal, positive if a > b
 */
export function defaultCompare(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/**
 * Non-mutating quicksort. Returns a new sorted array.
 * Uses 3-way partitioning to handle many duplicates efficiently.
 * @template T
 * @param {T[]} array
 * @param {(a: T, b: T) => number} [compare=defaultCompare]
 * @returns {T[]}
 */
export function quickSort(array, compare = defaultCompare) {
  if (!Array.isArray(array)) throw new TypeError('quickSort: expected an array');
  const len = array.length;
  if (len <= 1) return array.slice();

  // Choose pivot (median-of-three: first, middle, last) to reduce worst cases
  const first = array[0];
  const mid = array[Math.floor(len / 2)];
  const last = array[len - 1];
  const pivot = medianOfThree(first, mid, last, compare);

  const less = [];
  const equal = [];
  const greater = [];

  for (let i = 0; i < len; i++) {
    const cmp = compare(array[i], pivot);
    if (cmp < 0) less.push(array[i]);
    else if (cmp > 0) greater.push(array[i]);
    else equal.push(array[i]);
  }

  const left = quickSort(less, compare);
  const right = quickSort(greater, compare);
  return left.concat(equal, right);
}

/**
 * In-place quicksort (mutates the array). Hoare partition scheme.
 * @template T
 * @param {T[]} array
 * @param {(a: T, b: T) => number} [compare=defaultCompare]
 * @returns {T[]} the same array instance, sorted
 */
export function quickSortInPlace(array, compare = defaultCompare) {
  if (!Array.isArray(array)) throw new TypeError('quickSortInPlace: expected an array');
  if (array.length <= 1) return array;

  const swap = (i, j) => {
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  };

  const partition = (lo, hi) => {
    const pivot = array[Math.floor(lo + (hi - lo) / 2)];
    let i = lo - 1;
    let j = hi + 1;
    while (true) {
      do { i++; } while (compare(array[i], pivot) < 0);
      do { j--; } while (compare(array[j], pivot) > 0);
      if (i >= j) return j;
      swap(i, j);
    }
  };

  const sort = (lo, hi) => {
    if (lo >= hi) return;
    const p = partition(lo, hi);
    sort(lo, p);
    sort(p + 1, hi);
  };

  sort(0, array.length - 1);
  return array;
}

/**
 * Helper: median-of-three selection
 * @template T
 * @param {T} a
 * @param {T} b
 * @param {T} c
 * @param {(x: T, y: T) => number} compare
 * @returns {T}
 */
export function medianOfThree(a, b, c, compare) {
  // Order a, b
  if (compare(a, b) > 0) { const t = a; a = b; b = t; }
  // Order b, c
  if (compare(b, c) > 0) { const t = b; b = c; c = t; }
  // Order a, b again
  if (compare(a, b) > 0) { const t = a; a = b; b = t; }
  return b;
}

export default quickSort;
