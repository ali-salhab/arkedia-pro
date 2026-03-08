function notFound(req, res, next) {
  res.status(404).json({ message: "Not Found" });
}

function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  console.error(err);

  // Catch Mongoose duplication error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `Duplicate value for ${field}` });
  }

  // Catch Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || "Server error" });
}

module.exports = { notFound, errorHandler };
