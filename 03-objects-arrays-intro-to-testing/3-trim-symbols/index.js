/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (string === '' || size === 0) {
    return '';
  }

  if (size === undefined) {
    return string;
  }

  let trimmedStr = string[0];
  let sequenceChar = string[0];
  let counter = 1;

  for (let i = 1; i < string.length; i++) {
    if (sequenceChar === string[i]) {
      if (counter < size) {
        trimmedStr += sequenceChar;
        counter++;
      }
    } else {
      sequenceChar = string[i];
      trimmedStr += sequenceChar;
      counter = 1;
    }
  }

  return trimmedStr;
}
