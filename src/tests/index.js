import { createTestClient } from "apollo-server-testing"

const { query, mutate } = createTestClient(server)

query({
  query: GET_USER,
  variables: { id: 1 }
})

mutate({
  mutation: UPDATE_USER,
  variables: { id: 1, email: "nancy@foo.co" }
})
