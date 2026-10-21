/**
 * LC Cutter Number Engine
 *
 * Implements the Library of Congress Cutter Table algorithm for generating
 * Cutter numbers from names/words, plus an LC Call Number parser/formatter.
 *
 * References:
 * - LC Classification: https://www.loc.gov/catdir/cpso/lcco/
 * - Cutter Table: https://www.loc.gov/aba/pcc/053/table.html
 * - G 63 Cutter Table: https://www.loc.gov/aba/pcc/053/cuttertable.html
 */

// ============================================================
// CUTTER NUMBER GENERATION
// ============================================================

/**
 * LC Cutter Table rules:
 *
 * 1. After initial VOWELS (A, E, I, O, U):
 *    2nd letter: b=2, d=3, l-m=4, n=5, p=6, r=7, s-t=8, u-z=9
 *
 * 2. After initial letter S:
 *    2nd letter: a=2, ch=3, e=4, h-i=5, m-p=6, t=7, u=8, w-z=9
 *
 * 3. After initial letters Qu:
 *    3rd letter: a=3, e=4, i=5, o=6, r=7, t=8, y=9
 *
 * 4. After other initial CONSONANTS (B,C,D,F,G,H,J-Q,R,T-Z):
 *    2nd letter: a=3, e=4, i=5, o=6, r=7, s-t=8, u-z=9
 *
 * For subsequent digits (3rd, 4th character onward):
 *    a-d=3, e-h=4, i-l=5, m-o=6, p-s=7, t-v=8, w-z=9
 */

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function getSecondDigitAfterVowel(ch: string): string {
  if (ch <= "b") return "2";
  if (ch <= "d") return "3";
  if (ch <= "m") return "4";
  if (ch <= "n") return "5";
  if (ch <= "p") return "6";
  if (ch <= "r") return "7";
  if (ch <= "t") return "8";
  return "9"; // u-z
}

function getSecondDigitAfterS(ch: string, nextCh?: string): { digit: string; skip: number } {
  if (ch === "a") return { digit: "2", skip: 0 };
  if (ch === "c" && nextCh === "h") return { digit: "3", skip: 1 };
  if (ch === "e") return { digit: "4", skip: 0 };
  if (ch >= "h" && ch <= "i") return { digit: "5", skip: 0 };
  if (ch >= "m" && ch <= "p") return { digit: "6", skip: 0 };
  if (ch === "t") return { digit: "7", skip: 0 };
  if (ch === "u") return { digit: "8", skip: 0 };
  if (ch >= "w") return { digit: "9", skip: 0 };
  // Default for remaining letters (b, d, f, g, j, k, l)
  if (ch <= "d") return { digit: "3", skip: 0 };
  if (ch <= "g") return { digit: "4", skip: 0 };
  if (ch <= "l") return { digit: "5", skip: 0 };
  return { digit: "6", skip: 0 };
}

function getThirdDigitAfterQu(ch: string): string {
  if (ch <= "a") return "3";
  if (ch <= "e") return "4";
  if (ch <= "i") return "5";
  if (ch <= "o") return "6";
  if (ch <= "r") return "7";
  if (ch <= "t") return "8";
  return "9"; // u-z
}

function getSecondDigitAfterConsonant(ch: string): string {
  if (ch <= "a") return "3";
  if (ch <= "e") return "4";
  if (ch <= "i") return "5";
  if (ch <= "o") return "6";
  if (ch <= "r") return "7";
  if (ch <= "t") return "8";
  return "9"; // u-z
}

function getExpansionDigit(ch: string): string {
  if (ch <= "d") return "3";
  if (ch <= "h") return "4";
  if (ch <= "l") return "5";
  if (ch <= "o") return "6";
  if (ch <= "s") return "7";
  if (ch <= "v") return "8";
  return "9"; // w-z
}

export interface CutterResult {
  input: string;
  cutterNumber: string;
  breakdown: {
    initialLetter: string;
    rule: string;
    digits: { letter: string; digit: string; rule: string }[];
  };
  formatted: string;
}

/**
 * Generate an LC Cutter number from a name or word.
 *
 * @param input - The name/word to convert (e.g., "Johnson", "Shakespeare", "Qureshi")
 * @param numDigits - Number of digits to generate (default: 2-3)
 * @returns CutterResult with the generated Cutter number and breakdown
 */
export function generateCutter(input: string, numDigits: number = 3): CutterResult {
  const cleaned = input.trim().replace(/[^a-zA-Z]/g, "");
  if (!cleaned) {
    return {
      input,
      cutterNumber: "",
      breakdown: { initialLetter: "", rule: "Invalid input", digits: [] },
      formatted: "",
    };
  }

  const lower = cleaned.toLowerCase();
  const initial = cleaned[0].toUpperCase();
  const digits: { letter: string; digit: string; rule: string }[] = [];

  let pos = 1; // start after the first letter
  let rule = "";

  if (VOWELS.has(lower[0])) {
    // Rule 1: After initial vowel
    rule = `After initial vowel "${initial}"`;
    if (pos < lower.length) {
      const d = getSecondDigitAfterVowel(lower[pos]);
      digits.push({ letter: lower[pos], digit: d, rule: "Vowel table" });
      pos++;
    }
  } else if (lower[0] === "s") {
    // Rule 2: After initial S
    rule = 'After initial "S"';
    if (pos < lower.length) {
      const nextCh = pos + 1 < lower.length ? lower[pos + 1] : undefined;
      const { digit, skip } = getSecondDigitAfterS(lower[pos], nextCh);
      const letters = skip > 0 ? lower.slice(pos, pos + 1 + skip) : lower[pos];
      digits.push({ letter: letters, digit, rule: "S-table" });
      pos += 1 + skip;
    }
  } else if (lower[0] === "q" && lower[1] === "u") {
    // Rule 3: After Qu
    rule = 'After initial "Qu"';
    pos = 2; // skip past "qu"
    if (pos < lower.length) {
      const d = getThirdDigitAfterQu(lower[pos]);
      digits.push({ letter: lower[pos], digit: d, rule: "Qu-table" });
      pos++;
    }
  } else {
    // Rule 4: After other consonants
    rule = `After initial consonant "${initial}"`;
    if (pos < lower.length) {
      const d = getSecondDigitAfterConsonant(lower[pos]);
      digits.push({ letter: lower[pos], digit: d, rule: "Consonant table" });
      pos++;
    }
  }

  // Generate expansion digits for additional precision
  while (digits.length < numDigits && pos < lower.length) {
    if (/[a-z]/.test(lower[pos])) {
      const d = getExpansionDigit(lower[pos]);
      digits.push({ letter: lower[pos], digit: d, rule: "Expansion table" });
    }
    pos++;
  }

  // Build the Cutter number
  const quPrefix = lower[0] === "q" && lower[1] === "u" ? "u" : "";
  const cutterNumber = initial + quPrefix + digits.map((d) => d.digit).join("");
  const formatted = "." + cutterNumber;

  return { input: cleaned, cutterNumber, breakdown: { initialLetter: initial + quPrefix, rule, digits }, formatted };
}

// ============================================================
// CALL NUMBER PARSER / FORMATTER
// ============================================================

export interface CallNumberParts {
  classLetters: string;
  classNumber: string;
  decimalPart: string;
  cutters: { letter: string; number: string }[];
  date: string;
  remainder: string;
  valid: boolean;
  errors: string[];
}

/**
 * Parse and format an LC Call Number string.
 *
 * Handles formats like:
 * - QA76.73.J38 2018
 * - PS3515.U274 A6 1998
 * - ML410.B4 K4 2001
 *
 * @param input - Raw LC call number string
 * @returns Parsed and formatted call number parts
 */
export function parseCallNumber(input: string): CallNumberParts {
  const trimmed = input.trim();
  const errors: string[] = [];

  if (!trimmed) {
    return { classLetters: "", classNumber: "", decimalPart: "", cutters: [], date: "", remainder: "", valid: false, errors: ["Empty input"] };
  }

  // Regex to parse LC call number components
  // Pattern: [Letters][Number][.Decimal] [.CutterLetter+Digits]* [Year] [remainder]
  const match = trimmed.match(
    /^([A-Z]{1,3})\s*(\d{1,4})(?:\.(\d{1,}))?(?:\s*\.([A-Z]\d{1,}))?(?:\s*\.?([A-Z]\d{1,}))?(?:\s+(\d{4}[a-z]?))?(?:\s+(.*))?$/i
  );

  if (!match) {
    // Try a more relaxed parse
    const relaxed = trimmed.match(/^([A-Z]{1,3})\s*(\d+)/i);
    if (relaxed) {
      return {
        classLetters: relaxed[1].toUpperCase(),
        classNumber: relaxed[2],
        decimalPart: "",
        cutters: [],
        date: "",
        remainder: trimmed.slice(relaxed[0].length).trim(),
        valid: true,
        errors: [],
      };
    }
    return {
      classLetters: "", classNumber: "", decimalPart: "", cutters: [], date: "", remainder: trimmed,
      valid: false, errors: ["Could not parse as LC call number. Expected format: [Letters][Number] [.Cutter] [Year]"],
    };
  }

  const classLetters = (match[1] || "").toUpperCase();
  const classNumber = match[2] || "";
  const decimalPart = match[3] || "";
  const cutters: { letter: string; number: string }[] = [];

  if (match[4]) {
    const c = match[4];
    cutters.push({ letter: c[0].toUpperCase(), number: c.slice(1) });
  }
  if (match[5]) {
    const c = match[5];
    cutters.push({ letter: c[0].toUpperCase(), number: c.slice(1) });
  }

  const date = match[6] || "";
  const remainder = match[7] || "";

  // Validate class letters
  if (classLetters.length === 0) errors.push("Missing classification letters");
  if (classNumber.length === 0) errors.push("Missing classification number");

  return {
    classLetters,
    classNumber,
    decimalPart,
    cutters,
    date,
    remainder,
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format a parsed call number into a display string.
 */
export function formatCallNumber(parts: CallNumberParts): string {
  let result = parts.classLetters;
  if (parts.classNumber) result += " " + parts.classNumber;
  if (parts.decimalPart) result += "." + parts.decimalPart;
  for (const c of parts.cutters) {
    result += " ." + c.letter + c.number;
  }
  if (parts.date) result += " " + parts.date;
  if (parts.remainder) result += " " + parts.remainder;
  return result;
}

// ============================================================
// EXAMPLE CALL NUMBERS
// ============================================================

export const EXAMPLE_CALL_NUMBERS = [
  { label: "Computer Science", value: "QA76.73.J38 2018" },
  { label: "American Literature", value: "PS3515.U274 A6 1998" },
  { label: "Music Biography", value: "ML410.B4 K4 2001" },
  { label: "World History", value: "D21.3 .W67 2005" },
  { label: "Medicine", value: "RC489.B4 C64 2019" },
  { label: "Law", value: "KF4541 .A35 2010" },
  { label: "Education", value: "LB2395 .S37 2015" },
  { label: "Philosophy", value: "B831.2 .D48 2020" },
];

export const EXAMPLE_NAMES = [
  { label: "Johnson", value: "Johnson" },
  { label: "Shakespeare", value: "Shakespeare" },
  { label: "Qureshi", value: "Qureshi" },
  { label: "Adams", value: "Adams" },
  { label: "Smith", value: "Smith" },
  { label: "Lee", value: "Lee" },
  { label: "Obama", value: "Obama" },
  { label: "Brown", value: "Brown" },
  { label: "Schrader", value: "Schrader" },
  { label: "Ibrahim", value: "Ibrahim" },
];
