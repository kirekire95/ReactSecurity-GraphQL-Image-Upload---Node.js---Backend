import { config } from "dotenv"
config({ path: ".env.local" })
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import chalk from "chalk"
import morgan from "morgan"

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

    app.use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Credentials", true)
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
      res.header(
        "Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
      )
      next()
    })
    app.use(express.static("public"))

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
