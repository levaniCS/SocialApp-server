const { AuthenticationError } = require('apollo-server')

const jwt = require('jsonwebtoken')
const config = require('../Config')

module.exports = (context) => {
  const authHeader = context.req.headers.authorization
  if(authHeader){
    const token = authHeader.split('Bearer ')[1]
    if(token){
      try {
        const user = jwt.verify(token, config.JWT_SECRET)
        return user
      } catch(err) {
        throw new AuthenticationError('Invalid/Expired token')
      }
    }
    throw new Error('Authentication token must be \'Bearer [token]')
  }
  throw new Error('Authentication header must be provided')
}