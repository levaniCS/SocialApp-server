const { ApolloServer, PubSub } = require('apollo-server')
const mongoose = require('mongoose')

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const { MONGODB, PORT } = require('./config')


const pubsub = new PubSub()

const SERVER_PORT = process.env.PORT || PORT

const server = new ApolloServer({
  typeDefs,
  resolvers,
  //It takes req.body and puts in context
  context: ({ req }) => ({ req, pubsub })
})

mongoose.connect(MONGODB, { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('DB connection successful!')
    return server.listen({ port: SERVER_PORT })
  })
  .then(res => {
    console.log(`Server running at ${res.url}`)
  })
  .catch(err => {
    console.error(err)
  })