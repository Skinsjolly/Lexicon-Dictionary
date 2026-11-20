export function notFound(req, res) { res.status(404).json({ error: 'not_found', message: 'That API route does not exist.' }); }
export function errorHandler(error, req, res, next) {
  void next;
  const status = Number(error?.status) || 500;
  if (status >= 500) console.error('[lexicon-api]', error);
  res.status(status).json({ error: error?.name || 'server_error', message: status >= 500 ? 'Something went wrong on our side. Please try again.' : error?.message });
}
