
const init = async (req, res, next) => {
  try {
    // code xử lý ở đây
    res.status(200).json({ message: "Khởi tạo thanh toán" });
  } catch (error) {
    next(error);
  }
};

const callback = async (req, res, next) => {
  try {
    res.status(200).json({ message: "Xử lý callback" });
  } catch (error) {
    next(error);
  }
};

const getTicket = async (req, res, next) => {
  try {
    res.status(200).json({ ticketId: req.params.ticketId });
  } catch (error) {
    next(error);
  }
};

const myTickets = async (req, res, next) => {
  try {
    res.status(200).json({ tickets: [] });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  init,
  callback,
  getTicket,
  myTickets,
};