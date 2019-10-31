const express = require('express')
const graphqlHTTP = require('express-graphql')
const { Pool } = require('pg')
const { makeExecutableSchema } = require('graphql-tools')
const crypto = require('crypto')
require('dotenv').config()
const app = express()
const pool = new Pool()
// const typeDefs = require('./scheme')

const typeDefs = `
  type User {
    did: ID
    email: String
    first_name: String
    last_name: String
    phone_number: String
  }

  type Query {
    getUser(did: Int, email: String): User
    loginUser(email: String, password: String): Boolean 
  }

  type Mutation {
    registerUser(user: newUser): Int 
  }

  input newUser {
    email: String
    first_name: String
    last_name: String
    phone_number: String
    password: String
  }
`

const resolvers = {
  Query: {
    getUser: async (root, args) => {
      const { email } = args
      let columns = [
        'did',
        'email',
        'first_name',
        'last_name',
        'phone_number'
      ].join(',');
      const client = await pool.connect()
      const { rows } = await client.query(
        `SELECT ${columns} FROM users WHERE email=$1`,
        [email]
      )
      client.release()
      console.log(rows)
      return  rows[0]
    },
    loginUser: async (root, args) => {
      let {email, password} = args
      const client = await pool.connect()
      let { rows: [ authObj ] } = await client.query(
        `SELECT password, salt FROM users where email=$1`,
        [email]
      )
      client.release()
      let hash = sha512(password, authObj.salt)

      return hash === authObj.password
    }
  },
  Mutation: {
    registerUser: async (root, args) => {
      let salt = createSalt()
      let newUser = args.user
      let hash = sha512(newUser.password, salt)
      const client = await pool.connect()
      let { rows } = await client.query(
        `SELECT did FROM users
          ORDER BY did
          DESC LIMIT 1`
      )
      let did = (rows.length) ? rows[0]['did'] : 0
      let text = `INSERT INTO users 
        (email, first_name, last_name, phone_number, password, salt, did)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`
      let values = [
        newUser.email,
        newUser.first_name,
        newUser.last_name,
        newUser.phone_number,
        hash,
        salt,
        did + 1,
      ]
      await client.query(text, values)
      client.release()
      return resolvers.
    },
  }
}

function createSalt() {
  return crypto.randomBytes(128).toString('base64') 
}

function sha512(password, salt) {
  return crypto.createHash('sha512').update(password + salt).digest('hex')
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