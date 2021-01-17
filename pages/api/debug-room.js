require('../../models/database');
const Room = require('../../models/room');

export default async (req, res) => {
  const { id } = req.body;
  const room = await Room.findById(id);
  return res.json({ room });
}
