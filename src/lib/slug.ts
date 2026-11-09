const GREEK: Record<string, string> = {
  α: 'a',
  ά: 'a',
  β: 'v',
  γ: 'g',
  δ: 'd',
  ε: 'e',
  έ: 'e',
  ζ: 'z',
  η: 'i',
  ή: 'i',
  θ: 'th',
  ι: 'i',
  ί: 'i',
  ϊ: 'i',
  ΐ: 'i',
  κ: 'k',
  λ: 'l',
  μ: 'm',
  ν: 'n',
  ξ: 'x',
  ο: 'o',
  ό: 'o',
  π: 'p',
  ρ: 'r',
  σ: 's',
  ς: 's',
  τ: 't',
  υ: 'y',
  ύ: 'y',
  ϋ: 'y',
  ΰ: 'y',
  φ: 'f',
  χ: 'ch',
  ψ: 'ps',
  ω: 'o',
  ώ: 'o',
};

export function slugify(input: string): string {
  let slug = '';
  for (const char of input.toLowerCase().normalize('NFC')) {
    if (GREEK[char]) slug += GREEK[char];
    else if (/[a-z0-9]/.test(char)) slug += char;
    else slug += '-';
  }
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug || 'event'}-${suffix}`.slice(0, 90);
}
