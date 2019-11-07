const User = require('./user')
const Place = require('./place')

const typeDefs =`
type Query {
  test: String
}
`

module.exports = [typeDefs, User, Place]
