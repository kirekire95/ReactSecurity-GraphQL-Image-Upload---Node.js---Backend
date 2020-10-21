import { gql } from "apollo-server-express"

export const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
    avatar: String
    createdAt: String!
  }

  type File {
    url: String!
  }

  type Query {
    getUsers: [User]!
    getUser(userId: ID!): User
    uploads: [File]
  }

  type AuthenticationResult {
    message: String
    userInfo: User!
    token: String!
    expiresAt: String!
  }

  type Mutation {
    loginUser(username: String!, password: String!): AuthenticationResult
    addUser(
      username: String!
      password: String!
      confirmPassword: String!
      email: String!
    ): AuthenticationResult
    editUser(
      userId: ID!
      username: String
      password: String
      confirmPassword: String
      email: String
    ): User
    deleteUser(userId: ID!): User
    uploadFile(file: Upload!): File!
  }
`
