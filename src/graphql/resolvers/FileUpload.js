import { createWriteStream } from "fs"
import path from "path"

import { generateRandomString } from "../../utilities/generateRandomString.js"

const Query = {
  uploads: () => File
}

const Mutation = {
  uploadFile: async (parent, args) => {
    const { file } = args
    // Don't need these two unless we want to store it in a database
    // const { mimetype, encoding } = await file
    const { createReadStream, filename } = await file

    const { ext } = path.parse(filename)
    const randomName = generateRandomString(12) + ext

    const stream = createReadStream()
    const pathName = path.join(__dirname, `/public/images/${randomName}`)

    await stream.pipe(createWriteStream(pathName))

    return {
      url: `https://reactsecurity---backend.herokuapp.com/images/${randomName}`
    }
  }
}

export const fileUploadResolvers = {
  Query,
  Mutation
}
