const { ApolloServer, PubSub } = require('apollo-server')
const mongoose = require('mongoose')

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const { MONGODB } = require('./config')

const pubsub = new PubSub()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: {
    credentials: true,
    origin: (origin, callback) => {
        const whitelist = [
            "http://localhost:3000",
            "https://warm-bastion-27092.herokuapp.com"
        ];

        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    }
  },
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
    return server.listen({ port: process.env.PORT || 4000 })
  })
  .then(res => {
    console.log(`Server running at ${res.url}`)
  })
  .catch(err => {
    console.error(err)
  })