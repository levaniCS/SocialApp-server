const express = require('express')
const http = require('http')
const { ApolloServer, PubSub } = require('apollo-server-express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

// for defining enviroment variables
dotenv.config({
  path: '.env'
})
console.log(process.env.NODE_ENV)
console.log(process.env.JWT_SECRET)
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const pubsub = new PubSub()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  //It takes req.body and puts in context
  context: ({ req }) => ({ req, pubsub })
})

const app = express()
app.use(cors(
  {
    credentials: true,
    origin: new RegExp('/*/')
  }
))
// disables the apollo-server-express cors to allow the cors middleware use
server.applyMiddleware({ app, cors: false })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

mongoose.connect(process.env.MONGODB, { 
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