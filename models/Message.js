const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const Room = require("./Room.js");
const Message = new mongoose.Schema({
  user: { type: ObjectId, ref: "User" },
  text: { type: String },
  room: { type: ObjectId, ref: "Room", required: true },
  autogenerated: { type: Boolean },
  timestamp: { type: Number }, // SAVING THIS IN UNIX TIME FOR EASY SORTING but in MS
  reference: {
    element: { type: String },
    elementType: { type: String }
  },
  messageType: {
    type: String,
    enum: [
      "TEXT",
      "TOOK_CONTROL",
      "RELEASED_CONTROL",
      "LEFT_ROOM",
      "SWITCH_TAB",
      "JOINED_ROOM"
    ],
    default: "TEXT"
  },
  isTrashed: { type: Boolean, default: false }
});

// Add this message to the room's chat
// @TODO for some reason I can't get $push to work
Message.pre("save", async function() {
  if (this.isNew) {
    // @TODO CHANGIN controlledBY HERE IS TERRRRIBLLE!!!!! THIS SHOULD ALL BE DONE SOMEWHERE ELSE WHERE ITS LESS OF A SIDE EFFECT
    if (this.messageType === "TOOK_CONTROL") {
      try {
        await Room.findByIdAndUpdate(this.room, {
          controlledBy: this.user._id,
          $addToSet: { chat: this._id }
        });
      } catch (err) {
        console.log("ERROR: ", err);
      }
    } else if (
      this.messageType === "LEFT_ROOM" ||
      this.messageType === "RELEASED_CONTROL"
    ) {
      try {
        await Room.findByIdAndUpdate(this.room, {
          $addToSet: { chat: this._id }
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        await Room.findByIdAndUpdate(this.room, {
          $addToSet: { chat: this._id }
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
});
module.exports = mongoose.model("Message", Message);
