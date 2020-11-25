import { AuthenticationError, UserInputError } from "apollo-server-express"

import { PostModel } from "../../models/Post.js"
import checkAuth from "../../helper/context/index.js"

const Query = {
  getPosts: async () => {
    try {
      const allPosts = await PostModel.find().sort({
        title: 1,
        description: 1,
        category: 1
      })
      return allPosts
    } catch (err) {
      throw new Error(err)
    }
  },
  getPost: async (parent, post, verifyJWT) => {
    const authenticatedUser = checkAuth(verifyJWT)
    console.log("authenticatedUser", authenticatedUser)
    try {
      const onePost = await PostModel.findById(post.postId)
      if (onePost) {
        return onePost
      } else {
        throw new Error("Post not found")
      }
    } catch (err) {
      throw new Error(err)
    }
  }
}

const Mutation = {
  addPost: async (parent, post, verifyJWT) => {
    const authenticatedUser = checkAuth(verifyJWT)
    console.log("authenticatedUser", authenticatedUser)
    try {
      console.log("Post", post)

      const postExists = await PostModel.findOne({
        title: post.title
      })
      if (postExists) {
        throw new UserInputError("Post already exists", {
          error: {
            addPost: "This post has already been created"
          }
        })
      }

      const errors = {}

      function postValidator() {
        if (post.title.trim() === "") {
          console.log("post.title is empty")
          errors.title = "Title must not be empty"
        } else if (post.title.trim() !== "") {
          console.log("post.title is not empty")
        } else {
          console.log("post.title else")
        }

        if (post.description.trim() === "") {
          console.log("post.description is empty")
          errors.description = "Description must not be empty"
        } else if (post.description.trim() !== "") {
          console.log("post.description is not empty")
        } else {
          console.log("post.description else")
        }

        if (post.category.trim() === "") {
          console.log("post.category is empty")
          errors.category = "post category must not be empty"
        } else if (post.category.trim() !== "") {
          console.log("post.category is not empty")
        } else {
          console.log("post.category else")
        }

        return {
          errors
        }
      }

      postValidator()

      if (Object.keys(errors).length !== 0) {
        console.log("Invalid")
        throw new UserInputError("Errors", { errors })
      } else if (Object.keys(errors).length === 0) {
        console.log("It is valid")
        console.log("No Errors", Object.keys(errors).length)
      }

      console.log("ERRORS", errors)

      const newPost = await PostModel.create({
        title: post.title,
        description: post.description,
        category: post.category,
        username: authenticatedUser.username,
        createdAt: new Date().toISOString()
      })

      newPost.save()

      console.log("new post here:", newPost)

      return {
        message: "Post successfully created!",
        ...newPost._doc,
        id: newPost._id
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  editPost: async (parent, post, verifyJWT) => {
    const authenticatedUser = checkAuth(verifyJWT)
    console.log("authenticatedUser", authenticatedUser)
    try {
      const postExists = await PostModel.findById(post.postId)
      if (!postExists) {
        throw new UserInputError("A post with that ID could not be found", {
          error: {
            editPost: "A post with that ID could not be found"
          }
        })
      }

      // Need .save()?

      let updatedPost
      if (authenticatedUser.username === postExists.username) {
        updatedPost = await PostModel.findByIdAndUpdate(post.postId, {
          title: post.title,
          description: post.description,
          category: post.category
        })
      } else {
        throw new AuthenticationError(
          "You do not have permission to edit posts by another user",
          {
            error: {
              editPost:
                "You do not have permission to edit posts by another user"
            }
          }
        )
      }

      console.log("the post", post)

      return {
        message: "Post successfully updated!",
        ...updatedPost._doc,
        id: updatedPost._id
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  deletePost: async (parent, post, verifyJWT) => {
    const authenticatedUser = checkAuth(verifyJWT)
    console.log("authenticatedUser", authenticatedUser)
    console.log("post", post)
    try {
      const postExists = await PostModel.findById(post.postId)
      console.log("postExists", postExists)

      if (postExists) {
        console.log("We have postId", post.postId)
      } else if (post === null) {
        return `The post with the ID of ${post.postId} has already been deleted!`
      }

      if (!postExists) {
        throw new UserInputError("A post with that ID could not be found", {
          error: {
            deletePost: "A post with that ID could not be found"
          }
        })
      }

      let deletedPost
      if (authenticatedUser.username === postExists.username) {
        deletedPost = await PostModel.findByIdAndRemove(post.postId)
      } else {
        throw new AuthenticationError(
          "You do not have permission to delete posts by another user",
          {
            error: {
              deletePost:
                "You do not have permission to delete posts by another user"
            }
          }
        )
      }

      return {
        message: "Post successfully deleted!",
        ...deletedPost._doc,
        id: deletedPost._id
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}

export const postResolvers = {
  Query,
  Mutation
}
