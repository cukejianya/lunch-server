const express = require('express')
const graphqlHTTP = require('express-graphql')
const { Pool } = require('pg')
const { makeExecutableSchema } = require('graphql-tools')
require('dotenv').config()
const app = express();
const pool = new Pool();
// const typeDefs = require('./scheme')

const typeDefs = `
  type User {
    did: ID
    email: String
    password: String
    first_name: String
    last_name: String
    phone_number: String
  }

  type Query {
    getUser(did: Int, email: String): User
  }

  type Mutation {
    register(email: String, password: String) : String
  }
`

const resolvers = {
  Query: {
    getUser: async (root, args) => {
      console.log(root, args)
      const client = await pool.connect()
      const { email } = args
      const { rows } = await client.query(
        'SELECT * FROM users WHERE email=$1',
        [email]
      )
      console.log(rows)
      return  rows[0]
    }
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}))

app.listen(3000, (...args) => {
  console.log(`🚀 Server ready at ${args}`);
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})