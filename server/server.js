import { Schema } from './schema/schema.js';
import graphqlHTTP from 'express-graphql';
import express from 'express';

const app = express();
const PORT = 3000;

app.use('/graphql', graphqlHTTP({ schema: Schema, graphiql: true }));

app.listen(PORT, () => {
 console.log("GraphQL server listening on port %s", PORT); 
});
