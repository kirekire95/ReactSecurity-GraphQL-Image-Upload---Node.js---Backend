import jwt from "jsonwebtoken"
import { AuthenticationError } from "apollo-server-express"

export default (verifyJWT) => {
  const authHeader = verifyJWT.req.headers.authorization
  console.log("AUTHHEADERRR", authHeader)
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1]
    if (token) {
      try {
        const verifyToken = jwt.verify(token, process.env.SECRET)
        return verifyToken
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired Token")
      }
    }
    throw new Error('Authentication token must be "Bearer [token]')
  }
  throw new Error("Authorization header must be provided")
}
