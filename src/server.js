import { config } from "dotenv"
config({ path: ".env.local" })
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import chalk from "chalk"
import morgan from "morgan"
import helmet from "helmet"

import ApolloServer from "./ApolloServer.js"

const { MONGODB, PORT } = process.env

const startServer = async () => {
  try {
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

    const app = express()

    app.use(express.json())
    app.use(cors())

    if (process.env.NODE_ENV === "development") {
      app.use(morgan("dev"))
    }

    const server = await ApolloServer()

    server.applyMiddleware({ app, path: "/api/graphql" })

    app.use(express.static("public"))
    app.use(helmet())

    app.get("/", (req, res) => {
      return res.send("Received a GET HTTP method")
    })

    app.listen({ port: PORT }, () => {
      console.log(
        chalk.hex("#897DDC")(
          `Server running in ${process.env.NODE_ENV} mode at http://localhost:${PORT}${server.graphqlPath}`
        )
      )
    })
  } catch (error) {
    console.error(error)
  }
}

startServer()
