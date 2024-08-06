export function createUniqueID(value1: string, value2: string): number {
  // Concatenate the values with a separator
  const concatenatedValues = value1 + ',' + value2;

  // Sort the values alphabetically
  const sortedValues = concatenatedValues.split(',').sort().join(',');

  // Hash the sorted values to generate a unique ID
  const uniqueID = hashCode(sortedValues);

  return uniqueID;
}

// Hash function example (you can use a different hash function if desired)
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
}

// Usage example
// const value1 = "A";
// const value2 = "B";
// const uniqueID = createUniqueID(value1, value2);
// console.log(uniqueID);
