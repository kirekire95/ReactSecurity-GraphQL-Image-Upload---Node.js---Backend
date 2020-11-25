import mongoose from "mongoose"
const { Schema } = mongoose

const PostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  username: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  createdAt: String
})

export const PostModel = mongoose.model("Post", PostSchema)
