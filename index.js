const express = require('express')
const http = require('http')
const { ApolloServer, PubSub } = require('apollo-server-express')
const mongoose = require('mongoose')
const cors = require('cors')

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
// enable `cors` to set HTTP response header: Access-Control-Allow-Origin: *
app.use(cors())
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
})

server.applyMiddleware({ app })

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