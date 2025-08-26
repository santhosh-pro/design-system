export function deepEqual(obj1: any, obj2: any): boolean {
  // Check if both values are identical
  if (obj1 === obj2) {
    return true;
  }

  // Check if both values are objects
  if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 === null || obj2 === null) {
    return false;
  }

  // Get the keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if both objects have the same number of keys
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check if all keys and values are equal
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

export function jsonEqual(json1: string, json2: string): boolean {
  return json1 === json2;
}
