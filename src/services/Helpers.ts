export  function  convertToArray(str: string): string[] {
    return str
      .replace(/^\[/g, "")
      .replace(/\]$/g, "")
      .split("', '")
      .map((word) => word.replace(/^'|'$/g, ""));
  }