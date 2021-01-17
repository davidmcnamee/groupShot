const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  currentMembers: [
    {
      type: String,
      required: true,
    },
  ]
});

module.exports =
  mongoose.models.Room || mongoose.model("Room", RoomSchema);
