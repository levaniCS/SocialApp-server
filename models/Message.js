const  { model, Schema } = require('mongoose')

const messageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  username: String,
  content: String,
  createdAt: String
})

module.exports = model('Message', messageSchema)