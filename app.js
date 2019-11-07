require('dotenv').config()
const express = require('express')
const graphqlHTTP = require('express-graphql')
const { makeExecutableSchema } = require('graphql-tools')
const app = express()

const typeDefs = require('./schema')
const resolvers = require('./resolvers')

console.log(typeDefs)
console.log(resolvers)
console.log(process.env)
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

app.listen(3000, (...args) => {
  console.log(`🚀 Server ready at ${args}`);
});
