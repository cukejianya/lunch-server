const User = require('./user')
const Place = require('./place')

const Query = {
  test(root, args) {
    return 'It works'
  },
  ...User.Query,
  ...Place.Query
}

const Mutation = {
  ...User.Mutation,
}

module.exports = {Query, Mutation}
