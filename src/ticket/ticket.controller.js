const ticketService = require('./ticket.service');

async function getTicketByQr(req, res) {
  try {
    const ticket = await ticketService.findTicketByQr(req.params.code);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vé'
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('getTicketByQr:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Lỗi tra cứu vé'
    });
  }
}

async function checkIn(req, res) {
  try {
    const result = await ticketService.checkInTicket(req.params.id);

    if (result.success) {
      return res.status(200).json(result);
    }

    if (result.code === 'TICKET_NOT_FOUND') {
      return res.status(404).json(result);
    }

    if (result.code === 'ALREADY_CHECKED_IN') {
      return res.status(409).json(result);
    }

    return res.status(400).json(result);
  } catch (error) {
    console.error('checkIn:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Lỗi khi soát vé'
    });
  }
}

async function getRecentCheckins(req, res) {
  try {
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isNaN(parsedLimit)
      ? 20
      : Math.min(100, Math.max(1, parsedLimit));

    const data = await ticketService.getRecentCheckins(limit);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('getRecentCheckins:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy lịch sử check-in'
    });
  }
}

module.exports = {
  getTicketByQr,
  checkIn,
  getRecentCheckins
};