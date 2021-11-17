/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const props = path.split('.');

  return (obj) => {
    let i = 0;

    while (i < props.length - 1) {
      const internalObj = obj[props[i]];

      if (!internalObj) {
        return; // Object doesn't include the specified property
      }

      obj = internalObj;
      i++;
    }

    return obj[props[i]];
  };
}
