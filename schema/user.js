const typeDefs =`
type User {
  did: ID
  email: String
  first_name: String
  last_name: String
  phone_number: String
}

extend type Query {
  getUser(did: Int, email: String): User
  loginUser(email: String, password: String): Boolean 
}

type Mutation {
  registerUser(user: newUser): User
}

input newUser {
  email: String
  first_name: String
  last_name: String
  phone_number: String
  password: String
}
`

module.exports = typeDefs;
