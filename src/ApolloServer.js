import { ApolloServer } from "apollo-server-express"

import { typeDefs } from "./schemas/index.js"
import { userResolvers, postResolvers } from "./graphql/resolvers/index.js"

export default () => {
  return new ApolloServer({
    typeDefs,
    resolvers: [userResolvers, postResolvers],
    introspection: true,
    playground: true,
    context: ({ req }) => ({ req }),
    engine: {
      reportSchema: true,
      variant: "current"
    }
  })
}
