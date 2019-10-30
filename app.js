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
    authenticateUser(email: String, password: String): User
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
    }
  },
  Mutation: {
    registerUser: async (root, args) => {
      let salt = createSalt()
      let newUser = args.user
      // console.log(salt, newUser.password);
      let hash = sha512(newUser.password, salt)
      const client = await pool.connect()
      let { rows: [{did}] }  = await client.query(
        `SELECT did FROM users
          ORDER BY did
          DESC LIMIT 1`
      )
      console.log(hash)
      //      console.log(did, salt, hash, newUser);
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
      let { rows: [user] } = await client.query(text, values)
      console.log(user);
      return user;
    }
  }
}

function createSalt() {
  return crypto.randomBytes(128).toString('base64') 
}

function sha512(password, salt) {
  return crypto.createHash('sha512', password).update(salt).digest('hex')
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