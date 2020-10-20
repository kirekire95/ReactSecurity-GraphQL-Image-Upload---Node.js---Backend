import { UserInputError } from "apollo-server-express"

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
    console.log("verifyJWT", verifyJWT)
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
      const foundUser = await UserModel.findOne({ username: user.username })

      const errors = {}

      function userValidator() {
        if (!foundUser) {
          errors.username = "A user with that username could not be found!"
        }

        if (user.username.trim() === "") {
          console.log("user.username is empty")
          errors.username = "Username must not be empty"
        } else if (user.username.trim() !== "") {
          console.log("user.username is not empty")
        } else {
          console.log("user.username else")
        }

        if (user.password.trim() === "") {
          console.log("user.password is empty")
          errors.password = "Password must not be empty"
        } else if (user.password.trim() !== "") {
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

      const isValidPassword = await verifyPassword(
        user.password,
        foundUser.password
      )

      if (!isValidPassword && user.password !== "") {
        errors.password = "Wrong credentials"
        throw new UserInputError("Wrong credentials", { errors })
      } else if (isValidPassword) {
        console.log("User:", user)
        console.log("foundUser Info:", foundUser)

        const token = createToken(user)
        console.log("token:", token)
        const expiresAt = jwtDecodeToken(token).expiresAt

        return {
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
      const usernameExists = await UserModel.findOne({
        username: user.username
      })
      const emailExists = await UserModel.findOne({ email: user.email })

      const errors = {}

      function registerValidator() {
        if (usernameExists) {
          errors.username = "This username has already been taken"
        }

        if (emailExists) {
          errors.email = "This email has already been taken"
        }

        if (user.username.trim() === "") {
          console.log("user.username is empty")
          errors.username = "Username must not be empty"
        } else if (user.username.trim() !== "") {
          console.log("user.username is not empty")
        } else {
          console.log("user.username else")
        }

        if (user.password === "") {
          console.log("user.password is empty")
          errors.password = "Password must not be empty"
        } else if (user.password.trim() !== "") {
          console.log("user.password is not empty")
        } else {
          console.log("user.password else")
        }

        if (user.password !== user.confirmPassword) {
          errors.confirmPassword = "Passwords must match"
        }

        if (user.email.trim() === "") {
          errors.email = "Email must not be empty"
        } else {
          const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/

          if (!user.email.match(regEx)) {
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

      const hashedPassword = await hashPassword(user.password)

      const newUser = await new User({
        username: user.username.toLowerCase().trim(),
        password: hashedPassword,
        email: user.email.toLowerCase().trim(),
        createdAt: new Date().toISOString()
      })

      const savedUser = await newUser.save()

      if (savedUser) {
        const token = createToken(savedUser)
        const expiresAt = jwtDecodeToken(token).expiresAt

        console.log("newUser here:", newUser)

        return {
          errors,
          token,
          expiresAt,
          ...newUser._doc,
          id: newUser._id
        }
      } else {
        console.log("Something went wrong creating the account")
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  editUser: async (parent, user) => {
    try {
      const userExists = await UserModel.findById(user.userId)
      if (!userExists) {
        throw new UserInputError("A user with that ID could not be found", {
          error: {
            ID: "A user with that ID could not be found"
          }
        })
      }

      const hashedPassword = await hashPassword(user.password)

      const updatedUser = await UserModel.findByIdAndUpdate(user.userId, {
        username: user.username,
        password: hashedPassword,
        email: user.email
      })

      // Need .save()?
      // Need to log out and give new token here?...

      console.log("the user", user)

      return {
        ...updatedUser._doc,
        id: updatedUser._id
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  deleteUser: async (parent, user) => {
    try {
      const userExists = await UserModel.findById(user.userId)
      console.log(userExists)

      if (!userExists) {
        throw new UserInputError("A user with that ID could not be found", {
          error: {
            ID: "A user with that ID could not be found"
          }
        })
      }

      const deletedUser = await UserModel.findByIdAndRemove(user.userId)

      return {
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
