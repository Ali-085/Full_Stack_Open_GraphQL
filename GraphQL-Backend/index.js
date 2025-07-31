// index.js
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import cors from 'cors';
import http from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
console.log('Correct PubSub?', typeof PubSub); // function// Debugging line to confirm PubSub creation
import dotenv from 'dotenv';

import User from './models/user.js';
import typeDefs from './schema.js';
import resolvers from './resolvers.js';
import DataLoader from 'dataloader';
import Book from './models/Book.js';

dotenv.config();
mongoose.set('strictQuery', false);

console.log('Connecting to', process.env.MONGODB_URI);
await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB');

// ✅ Create ONE PubSub instance globally
const pubsub = new PubSub();
console.log('Has asyncIterator?', typeof pubsub.asyncIterator); // function ✅
// Create schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Express + HTTP server
const app = express();
const httpServer = http.createServer(app);

// ✅ WebSocket setup with graphql-ws
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/', // Match client path
});

const serverCleanup = useServer(
  {
    schema,
    context: async () => {
      // ✅ Always return the same PubSub instance here
      return { pubsub };
    }
  },
  wsServer
);

// Apollo Server v5 setup
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();

// ✅ HTTP endpoint

app.use(
  '/',
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const auth = req?.headers.authorization ?? '';
      let currentUser = null;
      if (auth.startsWith('Bearer ')) {
        try {
          const decodedToken = jwt.verify(
            auth.substring(7),
            process.env.JWT_SECRET
          );
          currentUser = await User.findById(decodedToken.id).populate('favoriteGenre');
        } catch (err) {
          console.warn('Invalid or expired JWT:', err.message);
        }
            }
      // DataLoader for batching book count lookups
      const bookCountLoader = new DataLoader(async (authorIds) => {
        const counts = await Book.aggregate([
          { 
            $match: { 
              author: { 
                $in: authorIds.map(id => new mongoose.Types.ObjectId(id)) 
              } 
            } 
          },
          { $group: { _id: '$author', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        counts.forEach((b) => {
          countMap[b._id.toString()] = b.count;
        });

        return authorIds.map(id => countMap[id] || 0);
      });

      // ✅ Same PubSub instance as WebSocket
      return { currentUser, pubsub, bookCountLoader };
    },
  })
);

// Start HTTP + WS server
const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 HTTP endpoint: http://localhost:${PORT}`);
  console.log(`📡 WS endpoint: ws://localhost:${PORT}`);
});
