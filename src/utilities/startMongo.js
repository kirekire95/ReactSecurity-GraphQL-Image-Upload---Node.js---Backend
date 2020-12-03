import { config } from "dotenv"
config({ path: ".env.local" })
import mongoose from "mongoose"

const { MONGODB } = process.env

export async function startMongoDB() {
  await mongoose.connect(MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  mongoose.connection.once("open", () =>
    console.log(chalk.hex("#897DDC")("Connected to MongoDB"))
  )
  mongoose.connection.on("error", (error) => console.error(error))
}
