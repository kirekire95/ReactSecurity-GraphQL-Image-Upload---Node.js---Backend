import { gql } from "apollo-server-express"

export const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
    createdAt: String!
  }

  type Query {
    getUsers: [User]!
    getUser(userId: ID!): User
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
  }
`
