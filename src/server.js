import { config } from "dotenv"
config({ path: ".env.local" })
import express from "express"
import cors from "cors"
import chalk from "chalk"
import morgan from "morgan"
import helmet from "helmet"

import ApolloServer from "./ApolloServer.js"
import { startMongoDB } from "./utilities/startMongo.js"

const { PORT } = process.env

const startServer = async () => {
  try {
    startMongoDB()

    const app = express()

    app.use(express.json())
    app.use(cors())

    if (process.env.NODE_ENV === "development") {
      app.use(morgan("dev"))
    }

    const server = await ApolloServer()

    server.applyMiddleware({ app, path: "/api/graphql" })

    app.use(helmet())
    app.use(express.static("public"))

    app.get("/", (req, res) => {
      return res.send(
        "Head over to /api/graphql to enter the GraphQL Playground"
      )
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
