import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

const mongoMemoryServer = new MongoMemoryServer()

const createMockDB = async () => {
  const uri = await mongoMemoryServer.getConnectionString()

  const mongooseOptions = {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000
  }

  await mongoose.connect(uri, mongooseOptions)
  return mongoMemoryServer
}

export default createMockDB
