const bnToEnMap: Record<string, string> = {
  // Independent Vowels (স্বরবর্ণ)
  "অ": "o", "আ": "a", "ই": "i", "ঈ": "i", "উ": "u", "ঊ": "u", "ঋ": "ri",
  "এ": "e", "ঐ": "oi", "ও": "o", "ঔ": "ou",

  // Consonants (ব্যঞ্জনবর্ণ)
  "ক": "k", "খ": "kh", "গ": "g", "ঘ": "gh", "ঙ": "ng",
  "চ": "ch", "ছ": "chh", "জ": "j", "ঝ": "jh", "ঞ": "n",
  "ট": "t", "ঠ": "th", "ড": "d", "ঢ": "dh", "ণ": "n",
  "ত": "t", "থ": "th", "দ": "d", "ধ": "dh", "ন": "n",
  "প": "p", "ফ": "f", "ব": "b", "ভ": "bh", "ম": "m",
  "য": "z", "র": "r", "ল": "l", "শ": "sh", "ষ": "sh", "স": "s", "হ": "h",
  "ড়": "r", "ঢ়": "rh", "য়": "y", "ৎ": "t",

  // Numbers (সংখ্যা)
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
  "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",

  // Dependent Vowel Signs / Kar (কার)
  "া": "a", "ি": "i", "ী": "i", "ু": "u", "ূ": "u", "ৃ": "ri",
  "ে": "e", "ৈ": "oi", "ো": "o", "ৌ": "ou",

  // Diacritics / Special
  "্": "", "ং": "ng", "ঃ": "", "ঁ": "", "।": "",
};

export function transliterateBengali(text: string): string {
  // Replace common Bengali honorifics/titles
  const normalized = text
    .replace(/মোঃ/g, "md ")
    .replace(/মো\./g, "md ")
    .replace(/ডাঃ/g, "dr ")
    .replace(/ড\./g, "dr ");

  return normalized
    .split("")
    .map((char) => bnToEnMap[char] ?? char)
    .join("");
}

export function generateWorkerSlug(fullName: string, fallbackTrade?: string): string {
  const transliterated = transliterateBengali(fullName);
  let base = transliterated
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Safe fallback if base is empty or only special characters
  if (!base || base.length < 2) {
    base = fallbackTrade
      ? fallbackTrade.toLowerCase().replace(/[^a-z0-9]/g, "")
      : "worker";
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${randomSuffix}`;
}
