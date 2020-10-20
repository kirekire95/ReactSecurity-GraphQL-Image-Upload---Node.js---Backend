const mongoose = require("mongoose")
const Schema = mongoose.Schema

const TokenSchema = new Schema({
  refreshToken: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
})

export const TokenModel = mongoose.model("Token", TokenSchema)
