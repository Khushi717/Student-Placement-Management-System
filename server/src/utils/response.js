// Consistent success envelope: { success: true, message?, data, meta? }
export const sendSuccess = (res, data = null, { status = 200, message, meta } = {}) =>
  res.status(status).json({ success: true, ...(message && { message }), data, ...(meta && { meta }) });
