module.exports = {
  INIT_PAYMENT: `
    -- Script khởi tạo thanh toán
    return 1
  `,
  CONFIRM_PAYMENT_FULL: `
    -- Script xác nhận thanh toán
    return {1, ARGV[1]}
  `,
  CANCEL_PAYMENT: `
    -- Script hủy thanh toán
    return 1
  `,
};