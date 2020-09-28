const { ApolloServer, gql } = require('apollo-server-express')
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

function generateRandomString(length) {
  var result = ''
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const typeDefs = gql`
  type File {
    url: String!
  }

  type Query {
    hello: String!
  }

  type Mutation {
    uploadFile(file: Upload!): File!
  }
`

const resolvers = {
  Query: {
    hello: () => 'Hello World',
  },
  Mutation: {
    uploadFile: async (parent, { file }) => {
      const { createReadStream, filename } = await file

      const { ext } = path.parse(filename)
      const randomName = generateRandomString(12) + ext

      const stream = createReadStream()
      const pathName = path.join(__dirname, `/public/images/${randomName}`)
      await stream.pipe(fs.createWriteStream(pathName))

      return {
        url: `http://localhost:4000/images/${randomName}`,
      }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const app = express()
server.applyMiddleware({ app })

app.use(express.static('public'))
app.use(cors())

app.listen({ port: 4000 }, () => {
  console.log(`🚀 Server ready at http://localhost:4000`)
})
