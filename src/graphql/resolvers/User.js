import { UserInputError, AuthenticationError } from "apollo-server-express"

import { UserModel } from "../../models/User.js"
import checkAuth from "../../helper/context/index.js"
import {
  createToken,
  hashPassword,
  jwtDecodeToken,
  verifyPassword
} from "../../utilities/utilities.js"

const Query = {
  getUsers: async () => {
    try {
      const allUsers = await UserModel.find({})
      return allUsers
    } catch (err) {
      throw new Error(err)
    }
  },
  getUser: async (parent, user, verifyJWT) => {
    const checkAuthContext = checkAuth(verifyJWT)
    console.log("checkAuthContext", checkAuthContext)
    try {
      const oneUser = await UserModel.findById(user.userId)
      if (oneUser) {
        return oneUser
      } else if (!oneUser) {
        throw new Error("User not found")
      }
    } catch (err) {
      throw new Error(err)
    }
  }
}

const Mutation = {
  loginUser: async (parent, user) => {
    try {
      const { username, password } = user
      const foundUser = await UserModel.findOne({ username })

      const errors = {}

      function userValidator() {
        if (!foundUser) {
          errors.username = "A user with that username could not be found!"
        }

        if (username.trim() === "") {
          console.log("user.username is empty")
          errors.username = "Username must not be empty"
        } else if (username.trim() !== "") {
          console.log("user.username is not empty")
        } else {
          console.log("user.username else")
        }

        if (password.trim() === "") {
          console.log("user.password is empty")
          errors.password = "Password must not be empty"
        } else if (password.trim() !== "") {
          console.log("user.password is not empty")
        } else {
          console.log("user.password else")
        }

        return {
          errors
        }
      }

      userValidator()

      // Must validate and throw errors here first because otherwise it cannot execute isValidPassword properly as it's empty

      console.log("User", user)

      console.log("ERRORS", errors)

      if (Object.keys(errors).length !== 0) {
        console.log("Invalid")
        throw new UserInputError("Errors", { errors })
      } else if (Object.keys(errors).length === 0) {
        console.log("It is valid")
        console.log("No Errors", Object.keys(errors).length)
      }

      const isValidPassword = await verifyPassword(password, foundUser.password)

      if (!isValidPassword && password !== "") {
        errors.password = "Wrong credentials"
        throw new UserInputError("Wrong credentials", { errors })
      } else if (isValidPassword) {
        const userInfo = foundUser

        console.log("Login Userinfo", userInfo)

        const token = createToken(userInfo)
        const expiresAt = jwtDecodeToken(token).expiresAt

        return {
          message: "Authentication successful",
          userInfo,
          errors,
          token,
          expiresAt
        }
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  addUser: async (parent, user) => {
    try {
      const { username, email, password, confirmPassword } = user

      const usernameExists = await UserModel.findOne({ username })
      const emailExists = await UserModel.findOne({ email })

      const errors = {}

      function registerValidator() {
        if (usernameExists) {
          errors.username = "This username has already been taken"
        }

        if (emailExists) {
          errors.email = "This email has already been taken"
        }

        if (username.trim() === "") {
          console.log("user.username is empty")
          errors.username = "Username must not be empty"
        } else if (username.trim() !== "") {
          console.log("user.username is not empty")
        } else {
          console.log("user.username else")
        }

        if (password === "") {
          console.log("user.password is empty")
          errors.password = "Password must not be empty"
        } else if (password.trim() !== "") {
          console.log("user.password is not empty")
        } else {
          console.log("user.password else")
        }

        if (password !== confirmPassword) {
          errors.confirmPassword = "Passwords must match"
        }

        if (email.trim() === "") {
          errors.email = "Email must not be empty"
        } else {
          const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/

          if (!email.match(regEx)) {
            errors.email = "Email must be a valid email address"
          }
        }
      }

      registerValidator()

      if (Object.keys(errors).length > 0) {
        throw new UserInputError("Errors", { errors })
      } else {
        console.log("No Errors", Object.keys(errors).length)
      }

      console.log("ERRORS", errors)

      console.log("The User", user)

      const hashedPassword = await hashPassword(password)

      const newUser = await new UserModel({
        username: username.toLowerCase().trim(),
        password: hashedPassword,
        email: email.toLowerCase().trim(),
        createdAt: new Date().toISOString(),
        role: "admin"
      })

      const savedUser = await newUser.save()

      if (savedUser) {
        console.log("SAVEDUSESEERRERRERE", savedUser)
        const token = createToken(savedUser)
        const expiresAt = jwtDecodeToken(token).expiresAt

        console.log("savedUser here:", savedUser)

        const { _id, username, password, email, createdAt, role } = savedUser

        const userInfo = {
          _id,
          username,
          password,
          email,
          createdAt,
          role
        }

        return {
          message: "Account successfully created",
          userInfo,
          errors,
          token,
          expiresAt,
          ...newUser._doc
        }
      } else {
        console.log("Something went wrong creating the account")
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  editUser: async (parent, user, verifyJWT) => {
    const authenticatedUser = checkAuth(verifyJWT)
    console.log("authenticatedUser", authenticatedUser)
    try {
      const { userId, username, password, email } = user
      const userExists = await UserModel.findById(userId)
      if (!userExists) {
        throw new UserInputError("A user with that ID could not be found", {
          error: {
            editUser: "A user with that ID could not be found"
          }
        })
      }

      const hashedPassword = await hashPassword(password)

      let updatedUser
      if (authenticatedUser.username === userExists.username) {
        updatedUser = await UserModel.findByIdAndUpdate(userId, {
          username: username,
          password: hashedPassword,
          email: email
        })
      } else {
        throw new AuthenticationError(
          "You do not have permission to edit another user",
          {
            error: {
              editUser: "You do not have permission to edit another user"
            }
          }
        )
      }

      // Need .save()?
      // Need to log out and give new token here?...

      return {
        message: "User edited successfully",
        ...updatedUser._doc,
        id: updatedUser._id
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  deleteUser: async (parent, user, verifyJWT) => {
    const authenticatedUser = checkAuth(verifyJWT)
    console.log("authenticatedUser", authenticatedUser)
    try {
      const { userId } = user
      const userExists = await UserModel.findById(userId)
      console.log("userExists", userExists)

      if (!userExists) {
        throw new UserInputError("A user with that ID could not be found", {
          error: {
            deleteUser: "A user with that ID could not be found"
          }
        })
      }

      let deletedUser

      if (authenticatedUser.username === userExists.username) {
        deletedUser = await UserModel.findByIdAndRemove(userId)
      } else {
        throw new AuthenticationError(
          "You do not have permission to delete another user",
          {
            error: {
              deleteUser: "You do not have permission to delete another user"
            }
          }
        )
      }

      return {
        message: "User deleted successfully",
        ...deletedUser._doc,
        id: deletedUser._id
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}

export const userResolvers = {
  Query,
  Mutation
}
