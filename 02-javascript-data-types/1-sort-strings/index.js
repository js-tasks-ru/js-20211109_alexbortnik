/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  return [...arr].sort((a, b) =>
    param === 'asc' ? compareChar(a, b)
      : compareChar(b, a));
}

const compareChar = (a, b) =>
  a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' });
