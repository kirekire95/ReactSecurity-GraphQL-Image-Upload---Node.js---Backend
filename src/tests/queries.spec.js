import { createTestClient } from "apollo-server-testing"
import { ApolloServer, gql } from "apollo-server-express"

import { postResolvers, userResolvers } from "../graphql/resolvers"
import { typeDefs } from "../schemas"
import { startMongoDB } from "../utilities/startMongo"
import createMockDB from "../utilities/startMockMongo"

const GET_USERS = gql`
  query getUsers {
    getUsers {
      _id
      username
      password
      email
      createdAt
    }
  }
`

const constructTestServer = () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers: [userResolvers, postResolvers]
  })

  return { server }
}

// describe("Queries", () => {
//   it("fetches an array of users", async () => {
//     const { server } = constructTestServer()

//     const { query } = createTestClient(server)

//     const response = await query({
//       query: GET_USERS
//     })

//     console.log("RESPONSE", response)

//     // expect(response).toMatchSnapshot()
//     expect(response.data.getUsers).toEqual([{ name: "The Colour Of Magic" }])
//   })
// })

const { server } = constructTestServer()

const { query } = createTestClient(server)

describe("User resolver", () => {
  beforeAll(async () => {
    await createMockDB()
  })

  test("get users", async () => {
    const GET_USERS = gql`
      query getUsers {
        getUsers {
          _id
          username
          password
          email
          createdAt
        }
      }
    `

    const {
      data: { getUsers }
    } = await query({ query: GET_USERS })
    expect(getUsers).toEqual([
      {
        id: "5e7df7fc6553acd3ec50fe8f",
        name: "John",
        address: "Privatgatan 15"
      }
    ])
    expect(getUsers).toMatchSnapshot()
  })
})
