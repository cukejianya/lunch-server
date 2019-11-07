const User = require('./user')

const typeDefs =`
type Query {
  test: String 
}
`

module.exports = [typeDefs, User]
