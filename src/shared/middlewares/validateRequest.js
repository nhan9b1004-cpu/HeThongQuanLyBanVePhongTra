function validateRequest(requiredParams = []) {
  return (req, res, next) => {
    const missing = requiredParams.filter(
      (key) => !req.params[key] && !req.body[key]
    );
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Thiếu tham số bắt buộc: ${missing.join(', ')}`,
      });
    }
    next();
  };
}

module.exports = validateRequest;