export class WordNotFoundError extends Error {
  constructor(word) { super(`No dictionary entry found for "${word}".`); this.name = 'WordNotFoundError'; this.status = 404; this.word = word; }
}
export class ProviderError extends Error {
  constructor(message, status = 502) { super(message); this.name = 'ProviderError'; this.status = status; }
}
