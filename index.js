import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema.js";
import db from "./db.js";

const resolvers = {
    Query: {
        games() {
            return db.games;
        },
        reviews() {
            return db.reviews;
        },
        authors() {
            return db.authors;
        },
        review(_, args) {
            return db.reviews.find(review => review.id === args.id);
        },
        game(_, args) {
            return db.games.find(game => game.id === args.id);
        },
        author(_, args) {
            return db.authors.find(author => author.id === args.id);
        }

    },

    Game: {
        reviews(parent) { //initial resolver function will access a single game, then to resolve its reviews it will look here
            return db.reviews.filter(review => review.game_id === parent.id);
        }
    },
    Author: {
        reviews(parent) {
            return db.reviews.filter(review => review.author_id === parent.id);
        }
    },
    Review: {
        game(parent) {
            return db.games.find(game => game.id === parent.game_id);
        },
        author(parent) {
            return db.authors.find(author => author.id === parent.author_id);
        }
    },
    Mutation: {
        deleteGame(_, args) {
            db.games = db.games.filter(game => game.id !== args.id);
            return db.games;
        },
        addGame(_, args) {
            let game= {
                ...args.game,
                id: Math.floor(Math.random() * 1000).toString()
            }
            db.games.push(game);
            return game;
        },
        //mutation
        updateGame(_, args) {
            let game = db.games.find(game => game.id === args.id);
            if (args.game.title) {
                game.title = args.game.title;
            }
            if (args.game.platform) {
                game.platform = args.game.platform;
            }

            //update db.games array
            db.games = db.games.map(g => g.id === game.id ? game : g);
            return game;
        }
    }
}

//graphql is  a layer between the client and the server
const server = new ApolloServer({
    typeDefs,  // schema (type definitions)
    resolvers
    // resolvers (functions that are called when a query is made)
})


const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
});

console.log(`Server ready at ${url}`   );