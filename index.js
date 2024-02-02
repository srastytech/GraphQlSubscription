const express  = require('express')
const { createServer } = require("http");
const { 
    makeExecutionSchema, makeExecutableSchema
} = require('@graphql-tools/schema');
const { create } = require('domain');
const { SubscriptionServer } = require("subscriptions-transport-ws")
const { ApolloServer } = require('apollo-server-express')
const mongoose = require('mongoose')
const typeDefs = require('./graphql/typeDefs.js')
const resolvers =  require('./graphql/resolvers.js')

const MONGODB = "'mongodb://127.0.0.1:27017'"
(
    async function() {
       const app = express();
       const httpServer = createServer(app);

       const schema = makeExecutableSchema({
        typeDefs,
        resolvers
       });
       const SubscriptionServer = SubscriptionServer.create(
        { schema, execute, subscribe},
        { server: httpServer, path: '/graphql'}
       );

       const server = new ApolloServer({
        schema, 
        plugins: [
            {
                async serverWillStart(){
                    return {
                        async drainServer() {
                            SubscriptionServer.close()
                        }
                    }
                }
            }
        ]
       })
       await server.start();
       server.applyMiddleWare({ app })
       mongoose.connect(MONGODB, {useNewUrlParser: true});
       const port = 4000
       httpServer.listen(PORT, () => console.log("http Server is now running on port" + PORT))
    }
)();

