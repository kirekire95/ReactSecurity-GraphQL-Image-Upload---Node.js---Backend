import { gql } from "apollo-server-express"

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
    createdAt: String!
  }

  type Retailer {
    id: ID!
    country: String!
    gridHeading: String
    header: String!
    city: String!
    address: String!
    href: String
    url: String
    username: String!
    createdAt: String!
  }

  type Query {
    getUsers: [User]!
    getUser(userId: ID!): User
    getRetailers: [Retailer]
    getRetailer(retailerId: ID!): Retailer
  }

  type Token {
    token: String!
  }

  type Mutation {
    loginUser(username: String!, password: String!): Token
    addUser(
      username: String!
      password: String!
      confirmPassword: String!
      email: String!
    ): User
    editUser(
      userId: ID!
      username: String
      password: String
      confirmPassword: String
      email: String
    ): User
    deleteUser(userId: ID!): User
    addRetailer(
      country: String!
      gridHeading: String
      header: String!
      city: String!
      address: String!
      href: String
      url: String
    ): Retailer!
    deleteRetailer(retailerId: ID!): Retailer
    editRetailer(
      retailerId: ID!
      country: String!
      gridHeading: String
      header: String!
      city: String!
      address: String!
      href: String
      url: String
    ): Retailer!
  }
`
