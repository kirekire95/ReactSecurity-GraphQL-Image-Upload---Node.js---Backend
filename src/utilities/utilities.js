import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import jwtDecode from "jwt-decode"

const createToken = (user) => {
  console.log("createToken User", user)
  return jwt.sign(
    {
      username: user.username,
      email: user.email,
      role: user.role
    },
    process.env.SECRET,
    {
      expiresIn: "1h",
      algorithm: "HS256"
    }
  )
}

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    // Generate a salt at level 12 strength
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err)
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err)
        }
        resolve(hash)
      })
    })
  })
}

const verifyPassword = (passwordAttempt, hashedPassword) => {
  return bcrypt.compare(passwordAttempt, hashedPassword)
}

const jwtDecodeToken = (passedInToken) => {
  const decodedToken = jwtDecode(passedInToken)
  console.log("jwtDecodeToken token", decodedToken)
  const expiresAt = decodedToken.exp

  return {
    decodedToken,
    expiresAt
  }
}

export { createToken, hashPassword, verifyPassword, jwtDecodeToken }
