import { createTestClient } from "apollo-server-testing"

import { createSimpleApolloServer } from "../utilities/basicServer"

test("read a list of books name", async () => {
  const server = createSimpleApolloServer()

  const { query } = createTestClient(server)

  const GET_BOOKS = `
  {
    books {
      name
    }
  }
  `

  const response = await query({ query: GET_BOOKS })

  expect(response.data.books).toEqual([{ name: "Harry Potter" }])
})
