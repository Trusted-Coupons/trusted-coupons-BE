export function convertToArray(str: string): string[] {
  // Remove leading and trailing double quotes
  str = str.replace(/^"|\s*"$/g, "");

  // Remove leading and trailing square brackets
  str = str.replace(/^\[|\]$/g, "");

  // Split the string by comma and single quotes
  const array = str.split(`", "`);

  // Remove any extra single quotes from array elements
  const result = array.map(word => word.replace(/^'|'$/g, ""));
  
  return result;
}

export const sanitizeCircularReferences = (_data) => {
    const seen = new WeakSet();
    function replacer(_key, _value) {
      // Check for circular reference
      if (typeof _value === 'object' && _value !== null) {
        if (seen.has(_value)) {
          return;
        }
        seen.add(_value);
      }
      return _value;
    }
    return JSON.parse(JSON.stringify(_data, replacer));
  }