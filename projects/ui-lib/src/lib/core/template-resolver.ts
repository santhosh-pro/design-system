type AnyObject = { [key: string]: any };


export function resolveTemplateWithObject(
  obj: AnyObject,
  expression: string,
  fallback: string = "N/A"
): string {
  return expression.replace(/\$([a-zA-Z0-9_.\[\]]+)/g, (_, key: string) => {
    const keys: string[] = key.split(/[\.\[\]]/).filter(k => k !== "");
    let value: any = obj;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];

      // THOUSAND_FORMAT
      if (k === "THOUSAND_FORMAT") {
        if (!isNaN(Number(value))) {
          return (Number(value) / 1_000).toFixed(2) + "K"; // Format as thousands
        } else {
          return value; // If not resolvable, return the resolved value
        }
      }

      // MILLION_FORMAT
      if (k === "MILLION_FORMAT") {
        if (!isNaN(Number(value))) {
          return (Number(value) / 1_000_000).toFixed(2) + "M"; // Format as millions
        } else {
          return value; // If not resolvable, return the resolved value
        }
      }

      // BILLION_FORMAT
      if (k === "BILLION_FORMAT") {
        if (!isNaN(Number(value))) {
          return (Number(value) / 1_000_000_000).toFixed(2) + "B"; // Format as billions
        } else {
          return value; // If not resolvable, return the resolved value
        }
      }
      // CURRENCY_FORMAT
      if (k === "CURRENCY_FORMAT") {
        if (!isNaN(Number(value))) {
          return Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 });
        } else {
          return value; // If not resolvable, return the resolved value
        }
      }
      // PERCENTAGE_FORMAT
      if (k === "PERCENTAGE_FORMAT") {
        if (!isNaN(Number(value))) {
          return (Number(value) * 100).toFixed(2) + "%"; // Format as percentage
        } else {
          return value; // If not resolvable, return the resolved value
        }
      }
      // DECIMAL_FORMAT(n) where 'n' is the number of decimal places
      if (k.startsWith("DECIMAL_FORMAT")) {
        if (!isNaN(Number(value))) {
          const decimalPlaces = parseInt(k.match(/\((\d+)\)/)?.[1] || "2", 10);
          return Number(value).toFixed(decimalPlaces); // Format with decimal places
        } else {
          return value; // If not resolvable, return the resolved value
        }
      }
      // ROUND_FORMAT
      if (k === "ROUND_FORMAT") {
        if (!isNaN(Number(value))) {
          return Math.round(Number(value)).toString(); // Round the value
        } else {
          return value; // If not resolvable, return the resolved value
        }
      }

      // Handle arrays and array indexing
      if (Array.isArray(value)) {
        if (k === "COUNT") {
          return value.length.toString(); // Return the count of array elements
        }

        const index = parseInt(k);
        if (isNaN(index) || index >= value.length || index < 0) {
          return fallback; // Invalid index
        }
        value = value[index];
      } else {
        // Handle object properties
        value = value[k as keyof typeof value];
      }

      if (value === undefined) return fallback; // Return fallback if key not found
    }

    return value;
  });
}


export enum TemplateResolverFormat {
  THOUSAND_FORMAT = "THOUSAND_FORMAT",
  MILLION_FORMAT = "MILLION_FORMAT",
  BILLION_FORMAT = "BILLION_FORMAT",
  CURRENCY_FORMAT = "CURRENCY_FORMAT",
  PERCENTAGE_FORMAT = "PERCENTAGE_FORMAT",
  ROUND_FORMAT = "ROUND_FORMAT"
}

export enum TemplateResolverArrayUtil {
  COUNT = "COUNT",
}
