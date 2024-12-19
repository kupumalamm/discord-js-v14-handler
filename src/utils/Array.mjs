/**
 * A utility class for array manipulations.
 */
export class Array {
  /**
   * @param {import('../cores/BotClient.mjs').BotClient} client - The bot client instance.
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * @typedef {(element: any, index: number, arr: []) => any} CallbackFunction
   */

  /**
   * Removes elements from the array until a condition is met.
   * @param {Array} arr - The array to process.
   * @param {Function} predicate - A function that tests each element of the array.
   * @param {boolean} keepIfEmpty - Whether to return the original array if no elements match.
   * @returns {Array} A new array with elements removed until the condition is met.
   */
  removeUntil(arr, predicate, keepIfEmpty) {
    const index = arr.findIndex(predicate);
    return index >= 0 ? arr.slice(index) : (keepIfEmpty ? arr : []);
  }

  /**
   * Shuffles the elements of an array.
   * @param {Array} arr - The array to shuffle.
   * @returns {Array} A new shuffled array.
   */
  shuffle(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Gets the last element of an array.
   * @param {Array} arr - The array to get the last element from.
   * @returns {*} The last element of the array.
   */
  last(arr) {
    return arr[arr.length - 1];
  }

  /**
   * Gets the first element of an array.
   * @param {Array} arr - The array to get the first element from.
   * @returns {*} The first element of the array.
   */
  first(arr) {
    return arr[0];
  }

  /**
   * Splits an array into chunks of a specified size.
   * @param {Array} arr - The array to split into chunks.
   * @param {number} chunkSize - The size of each chunk.
   * @returns {Array[]} An array of chunks.
   * @throws {SyntaxError} If chunkSize is not defined, not a number, or less than or equal to 0.
   */
  chunks(arr, chunkSize) {
    if (!chunkSize) throw new SyntaxError('No chunkSize defined');
    if (typeof chunkSize !== 'number') {
      throw new SyntaxError(`chunkSize must be a number, but received: ${typeof chunkSize}`);
    }
    if (chunkSize <= 0) throw new SyntaxError('chunkSize must be greater than 0');

    const chunks = [];
    for (let i = arr.length - 1; i >= 0; i -= chunkSize) {
      chunks.push(arr.slice(
        arr.length - 1 - i < 0 ? 0 : arr.length - 1 - i,
        arr.length - 1 - i + chunkSize
      ));
    }
    return chunks;
  }

  /**
   * Sums the elements of an array.
   * @param {Array} arr - The array to sum.
   * @param {Function} [mapFn] - An optional mapping function to apply to each element.
   * @returns {number} The sum of the array elements.
   * @throws {SyntaxError} If mapFn is not a function.
   */
  sum(arr, mapFn) {
    if (typeof mapFn !== 'undefined' && typeof mapFn !== 'function') {
      throw new SyntaxError(`mapFn must be a function, but received: ${typeof mapFn}`);
    }
    return (mapFn ? arr.map(mapFn) : arr).reduce((a, b) => a + b, 0);
  }

  /**
   * Sums only numeric elements in an array.
   * @param {Array} arr - The array to sum.
   * @param {Function} [mapFn] - An optional mapping function to apply to each element.
   * @returns {number} The sum of numeric elements in the array.
   */
  sumNumbersOnly(arr, mapFn) {
    return (mapFn ? arr.map(mapFn) : arr)
      .filter((elem) => typeof elem === 'number' && !isNaN(elem))
      .reduce((a, b) => a + b, 0);
  }

  /**
   * Removes nullish values (null and undefined) from an array.
   * @param {Array} arr - The array to filter.
   * @returns {Array} A new array without nullish values.
   */
  removeNullish(arr) {
    return arr.filter(Boolean);
  }

  /**
   * Removes undefined values from an array.
   * @param {Array} arr - The array to filter.
   * @returns {Array} A new array without undefined values.
   */
  removeUndefined(arr) {
    return arr.filter((elem) => typeof elem !== 'undefined');
  }

  /**
   * Removes empty strings from an array.
   * @param {Array} arr - The array to filter.
   * @returns {Array} A new array without empty strings.
   */
  removeEmptyStrings(arr) {
    return arr.filter((elem) => typeof elem !== 'string' || elem.length);
  }

  /**
   * Removes NaN values from an array.
   * @param {Array} arr - The array to filter.
   * @returns {Array} A new array without NaN values.
   */
  removeNaNs(arr) {
    return arr.filter((elem) => !isNaN(elem));
  }

  /**
   * Removes specified elements from an array.
   * @param {Array} arr - The array to filter.
   * @param {...*} elems - The elements to remove.
   * @returns {Array} A new array without the specified elements.
   * @throws {SyntaxError} If no elements to remove are provided.
   */
  remove(arr, ...elems) {
    if (!elems || !elems.length) {
      throw new SyntaxError('No elements provided to remove.');
    }
    return arr.filter((element) => !elems.some((elem) => element === elem));
  }

  /**
   * Removes duplicate elements from an array.
   * @param {Array} arr - The array to filter.
   * @param {string} [keyToCheck] - A key to compare for duplicate objects.
   * @returns {Array} A new array without duplicates.
   */
  removeDuplicates(arr, keyToCheck) {
    return arr.reduce((uniqueArr, currentElem) => (
      !uniqueArr.some((item) => item == currentElem || (keyToCheck && item[keyToCheck] === currentElem[keyToCheck]))
        ? uniqueArr.concat([currentElem])
        : uniqueArr
    ), []);
  }

  /**
   * Merges elements into an array.
   * @param {Array} arr - The original array.
   * @param {...*} elements - The elements to merge.
   * @returns {Array} A new array with the merged elements.
   * @throws {SyntaxError} If no elements are provided to merge.
   */
  merge(arr, ...elements) {
    if (!elements || !elements.length) {
      throw new SyntaxError('No elements provided to merge.');
    }
    return [...arr, ...elements];
  }

  /**
   * Keeps only string elements in an array.
   * @param {Array} arr - The array to filter.
   * @returns {Array} A new array with only string elements.
   */
  keepStrings(arr) {
    return arr.filter((elem) => typeof elem === 'string');
  }

  /**
   * Keeps only number elements in an array.
   * @param {Array} arr - The array to filter.
   * @returns {Array} A new array with only number elements.
   */
  keepNumbers(arr) {
    return arr.filter((elem) => typeof elem === 'number');
  }

  /**
   * Keeps only boolean elements in an array.
   * @param {Array} arr - The array to filter.
   * @returns {Array} A new array with only boolean elements.
   */
  keepBoolean(arr) {
    return arr.filter((elem) => typeof elem === 'boolean');
  }

  /**
   * Keeps only object elements (excluding arrays) in an array.
   * @param {Array} arr - The array to filter.
   * @returns {Array} A new array with only object elements.
   */
  keepObjects(arr) {
    return arr.filter((elem) => typeof elem === 'object' && !Array.isArray(elem));
  }

  /**
   * Keeps only array elements in an array.
   * @param {Array} arr - The array to filter.
   * @returns {Array} A new array with only array elements.
   */
  keepArrays(arr) {
    return arr.filter((elem) => typeof elem === 'object' && Array.isArray(elem));
  }

  /**
   * Executes a function on each element of an array.
   * @param {Array} arr - The array to iterate over.
   * @param {Function} fn - The function to execute on each element.
   * @throws {SyntaxError} If fn is not a function.
   */
  loopOver(arr, fn) {
    if (!fn || typeof fn !== 'function') {
      throw new SyntaxError(`Invalid function received: ${typeof fn}`);
    }
    for (let i = arr.length - 1; i >= 0; i--) {
      fn(arr[arr.length - 1 - i], arr.length - 1 - i, arr);
    }
  }

  /**
   * Maps an array to promises and resolves them.
   * @param {Array} arr - The array to map.
   * @param {Function} fn - The mapping function to apply.
   * @returns {Promise<Array>} A promise that resolves to the mapped array.
   * @throws {SyntaxError} If fn is not a function.
   */
  async promiseMap(arr, fn) {
    if (!fn || typeof fn !== 'function') {
      throw new SyntaxError(`Invalid function received: ${typeof fn}`);
    }
    return Promise.all(arr.map(fn));
  }

  /**
   * Iterates over an array with promises for each element.
   * @param {Array} arr - The array to iterate over.
   * @param {Function} fn - The function to execute for each element.
   * @returns {Promise<Array>} A promise that resolves when all functions are executed.
   * @throws {SyntaxError} If fn is not a function.
   */
  async promiseLoopOver(arr, fn) {
    if (!fn || typeof fn !== 'function') {
      throw new SyntaxError(`Invalid function received: ${typeof fn}`);
    }
    const promises = [];
    for (let i = arr.length - 1; i >= 0; i--) {
      promises.push((async () => fn(arr[arr.length - 1 - i], arr.length - 1 - i, arr))());
    }
    return Promise.all(promises);
  }
}
