function notFound(req, res, next) {
  res.status(404).json({ message: "Not Found" });
}

function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || "Server error" });
}

module.exports = { notFound, errorHandler };
