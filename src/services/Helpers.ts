export  function  convertToArray(str: string): string[] {
    return str
      .replace(/^\[/g, "")
      .replace(/\]$/g, "")
      .split("', '")
      .map((word) => word.replace(/^'|'$/g, ""));
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