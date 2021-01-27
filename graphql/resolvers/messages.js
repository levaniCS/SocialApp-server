const  { UserInputError } = require('apollo-server')
const Message = require('../../models/Message')
const checkAuth = require('../../util/check-auth')

const { NEW_MESSAGE } = require('../../util/constants')

module.exports = {
  Query: {
    async getMessages() {
      try {
        const messages = await Message.find()
        return messages
      } catch(err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    async postMessage(_, { content }, context) {
      const user = checkAuth(context)
      if(content.trim() === ''){
        throw new UserInputError('Empty message', {
          errors: {
            body: 'Message body must not empty'
          }
        })
      }

      const newMessage = new Message({
        content,
        user: user._id,
        username: user.username,
        createdAt: new Date().toISOString()
      })
      await newMessage.save()


      // Get all messages
      const messages = await Message.find()
      context.pubsub.publish(NEW_MESSAGE, { newMessages: messages })
      
      return newMessage._id.toString()
    }

  },
  Subscription: {
    newMessages: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: async (_, __, { pubsub }) => {
        const messages = await Message.find()
        // To fetch data initially
        setTimeout(() => pubsub.publish(NEW_MESSAGE, { newMessages: messages }), 0)
        return pubsub.asyncIterator([NEW_MESSAGE])
      }
    }
  }
}