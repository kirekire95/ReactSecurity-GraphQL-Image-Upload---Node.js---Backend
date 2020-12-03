import { ApolloServer, gql } from "apollo-server-express"

export const createSimpleApolloServer = () => {
  const typeDefs = gql`
    type Book {
      isbn: ID
      name: String
    }
    type Query {
      books: [Book]
    }
  `

  const books = [{ isbn: "0252166276", name: "Harry Potter" }]

  const resolvers = {
    Query: {
      books: () => books
    }
  }

  const server = new ApolloServer({ typeDefs, resolvers })

  return server
}
