const postsResolvers = require('./posts')
const usersResolvers = require('./users')
const commentsResolvers = require('./comments')
const messagesResolvers = require('./messages')

module.exports = {
  Post: {
    //Parent holds previous data
    // IF WE RETURN POST OBJECT IT WILL GOES THROUGH THIS MODIFIER 
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length
  },
  Query: {
    ...postsResolvers.Query,
    ...commentsResolvers.Query,
    ...messagesResolvers.Query
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...postsResolvers.Mutation,
    ...commentsResolvers.Mutation,
    ...messagesResolvers.Mutation
  },
  Subscription: {
    ...postsResolvers.Subscription,
    ...messagesResolvers.Subscription
  }
}