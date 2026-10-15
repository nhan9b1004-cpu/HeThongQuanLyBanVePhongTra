function errorHandler(err, req, res, next) {
  console.error('❌ Lỗi:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi hệ thống, vui lòng thử lại sau',
  });
}

module.exports = errorHandler;