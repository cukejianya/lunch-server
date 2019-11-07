const User = require('./user')

const Query = {
  test(root, args) {
    return 'It works'
  },
  ...User.Query,
}

const Mutation = {
  ...User.Mutation,
}

module.exports = {Query, Mutation}
