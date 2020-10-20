import mongoose from "mongoose"
const { Schema } = mongoose

const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  createdAt: String,
  role: {
    type: String,
    required: true,
    default: "user"
  }
})

export const UserModel = mongoose.model("User", UserSchema)
