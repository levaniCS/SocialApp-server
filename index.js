const express = require('express')
const http = require('http')
const { ApolloServer, PubSub } = require('apollo-server-express')
const mongoose = require('mongoose')
const cors = require('cors')

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const { MONGODB, PORT } = require('./config')

const pubsub = new PubSub()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  //It takes req.body and puts in context
  context: ({ req }) => ({ req, pubsub })
})

const app = express()
// disables the apollo-server-express cors to allow the cors middleware use
server.applyMiddleware({ app, cors: {
  origin: '*',
  credentials: false
}})

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

mongoose.connect(MONGODB, { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('DB connection successful!')
    return httpServer.listen({ port: PORT || 4000 })
  })
  .then(() => {
    console.log(`🚀 Server running at http://localhost:4000${server.graphqlPath}`)
    console.log(process.env.NODE_ENV)
  })
  .catch(err => {
    console.error(err)
  })