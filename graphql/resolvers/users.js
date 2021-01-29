const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { UserInputError } = require('apollo-server-express')

const {validateRegisterInput, validateLoginInput} = require('../../util/validators')
const { JWT_SECRET, JWT_EXPIRES } = require('../../config')
const User = require('../../models/User')

const generateToken = (user) => {
  return jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username
  }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

module.exports = {
  Mutation: {
    async login(_, { username, password}){
      const { errors, valid } = validateLoginInput(username, password)

      if(!valid) {
        throw new UserInputError('Errors', { errors })
      }

      const user = await User.findOne({ username })

      if(!user) {
        errors.general = 'Wrong credentials'
        throw new UserInputError('Wrong credentials', { errors })
      }

      const match = await bcrypt.compare(password, user.password)
      if(!match) {
        errors.general = 'Wrong credentials'
        throw new UserInputError('Wrong credentials', { errors })
      }

      const token = generateToken(user)
      return {
        ...user._doc,
        id: user._id,
        token
      }
    },
    async register(_, { registerInput: { username, email, password, confirmPassword }}) {
      // 1) Validate user data
      const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword)

      if(!valid) {
        throw new UserInputError('Errors', { errors })
      }
      
      // 2) Make sure user doesn't already exists
      const user = await User.findOne({ username })

      if(user) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'This username is taken'
          }
        })
      }
      
      // 3) Hash password and create an auth token
      password = await bcrypt.hash(password, 12)

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString()
      })

      const res = await newUser.save()

      const token = generateToken(newUser)

      return {
        ...res._doc,
        id: res._id,
        token
      }
    }
  }
}