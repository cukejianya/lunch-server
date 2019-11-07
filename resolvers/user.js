const crypto = require('crypto')
const { pool } = require('../util')

const userResolver = {
  Query: {
    async getUser(root, args) {
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
      return rows[0]
    },
    async loginUser(root, args) {
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
    async registerUser(root, args) {
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
      return await userResolve.Query.getUser(null, {email: newUser.email})
    }
  }
}


function createSalt() {
  return crypto.randomBytes(128).toString('base64') 
}

function sha512(password, salt) {
  return crypto.createHash('sha512').update(password + salt).digest('hex')
}

module.exports = userResolver; 
