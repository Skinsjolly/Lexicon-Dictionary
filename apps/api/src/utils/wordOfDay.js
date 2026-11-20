export const WORD_OF_THE_DAY = [
  { word: 'sonder', note: 'The quiet realization that every passerby has a life as vivid as your own.' },
  { word: 'luminous', note: 'Giving off light; bright or glowing.' },
  { word: 'resilient', note: 'Able to recover quickly after difficulty.' },
  { word: 'wander', note: 'To move without a fixed destination.' },
  { word: 'eloquent', note: 'Fluent or persuasive in speaking or writing.' },
  { word: 'serendipity', note: 'A happy discovery made by chance.' },
  { word: 'brisk', note: 'Quick and energetic.' },
  { word: 'gentle', note: 'Mild in manner or action.' },
  { word: 'curious', note: 'Eager to learn or understand.' },
  { word: 'brave', note: 'Showing courage.' },
  { word: 'harbor', note: 'A place of shelter; also, to keep a thought or feeling.' },
  { word: 'thrive', note: 'To grow, develop, or be successful.' },
  { word: 'clarity', note: 'The quality of being clear and easy to understand.' },
  { word: 'harmony', note: 'A pleasing arrangement of parts.' },
  { word: 'grateful', note: 'Warmly or deeply appreciative.' },
  { word: 'horizon', note: 'The line where earth and sky appear to meet.' },
  { word: 'whisper', note: 'To speak very softly.' },
  { word: 'ancient', note: 'Belonging to the distant past.' },
  { word: 'vivid', note: 'Producing powerful images or feelings.' },
  { word: 'steady', note: 'Firm, stable, and dependable.' },
  { word: 'discover', note: 'To find or learn about something for the first time.' },
  { word: 'balance', note: 'A state of steady equilibrium.' },
  { word: 'bloom', note: 'To produce flowers; to flourish.' },
  { word: 'compassion', note: 'Sympathetic concern for another’s suffering.' },
  { word: 'patient', note: 'Able to accept delay or trouble without complaint.' },
  { word: 'journey', note: 'An act of travelling from one place to another.' },
  { word: 'mosaic', note: 'A picture made from small pieces of coloured material.' },
  { word: 'quiet', note: 'Making little or no noise.' },
  { word: 'simple', note: 'Easy to understand or do.' },
  { word: 'wonder', note: 'A feeling of surprise and admiration.' },
];

export function pickWordOfTheDay(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000);
  return WORD_OF_THE_DAY[day % WORD_OF_THE_DAY.length];
}
