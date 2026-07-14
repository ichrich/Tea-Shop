function endpoint(fn) {
  return async (req, res, next) => {
    try {
      const payload = await fn(req, res, next);
      if (!res.headersSent && payload !== undefined) {
        res.json(payload);
      }
    } catch (err) {
      if (!err.status && !err.statusCode) {
        err.status = err.statusCode = 400; // По умолчанию 400 для ошибок валидации
      }
      next(err);
    }
  };
}
module.exports = { endpoint };