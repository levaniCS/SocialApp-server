const express = require('express')
const http = require('http')
const { ApolloServer, PubSub } = require('apollo-server-express')
const mongoose = require('mongoose')

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const { MONGODB } = require('./config')

const pubsub = new PubSub()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  //It takes req.body and puts in context
  context: ({ req }) => ({ req, pubsub })
})

const app = express()
server.applyMiddleware({ 
  app,
  origin: (origin, callback) => {
    const whitelist = [
      'http://localhost:3000/',
      'https://jolly-wiles-d92a29.netlify.app/'
    ]

    if (whitelist.indexOf(origin) !== -1) {
        callback(null, true)
    } else {
        callback(new Error('Not allowed by CORS'))
    }
  },
  path: '/graphql'
})

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
    return httpServer.listen({ port: process.env.PORT || 4000 })
  })
  .then(() => {
    console.log(`🚀 Server running at http://localhost:4000${server.graphqlPath}`)
  })
  .catch(err => {
    console.error(err)
  })