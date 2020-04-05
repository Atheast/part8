const {ApolloServer, gql, UserInputError, AuthenticationError} = require('apollo-server');
const {v1: uuidv1} = require('uuid');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');


const {PubSub} = require('apollo-server');
const pubsub = new PubSub();

mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);

const JWT_SECRET = 'aaaa';

const MONGODB_URL = 'mongodb+srv://fullstack:zaq12wsx@cluster0-w3cwn.mongodb.net/graphql?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URL, {useNewUrlParser: true})
    .then(() => console.log('connected to MongoDb'))
    .catch(err => console.error(err));

const typeDefs = gql`
    type Author {
        name: String!
        born: Int
        bookCount: Int
        id: ID!
    }

    type Book {
        title: String!
        published: Int!
        author: String!
        genres: [String!]!
        id: ID!
    }

    type User {
        username: String!
        favoriteGenre: String!
        id: ID!
    }

    type Token {
        value: String!
    }

    type Query {
        authorCount: Int!
        bookCount: Int!
        allBooks(author: String, genre: String): [Book!]!
        allAuthors: [Author!]!
        me: User
    }

    type Mutation {
        addBook(
            title: String!
            author: String!
            published: Int!
            genres: [String!]!
        ) : Book

        editAuthor(name: String!, setBornTo: Int!) : Author

        createUser(
            username: String!
            favoriteGenre: String!
        ) : User
        
        login(
            username: String!
            password: String!
        ) : Token 
    }

    type Subscription {
        bookAdded: Book!
    }
`;

const resolvers = {
    Query: {
        authorCount: () => Author.collection.countDocuments(),
        bookCount: () => Book.collection.countDocuments(),
        allBooks: async(root,args) => {
            if(args.author && args.genre) {
                return Book.find({author: args.name, genres: [args.genre]})
            } else if(args.author) {
                const author = await Author.findOne({name: args.author});
                if(author) {
                    return Book.find({author: author._id}); 
                } 
                return null;
            } else if (args.genre) {
                return Book.find({genres: {$in: [args.genre]}})
            } else {
                return Book.find({})
            }
        },
        allAuthors: () => Author.find({}),
        me: (root,args,context) => {
            return context.currentUser;
        }
    },
    Author: {
        bookCount: async(root) => {
            return Book.find({author: root.id}).countDocuments();
        }
    },
    Book: {
        author: async(root) => {
            const author = await Author.findOne({_id: root.author});
            return (author) ? author.name : '';
        }
    },
    Mutation: {
        addBook: async(root,args,context) => {
            const currentUser = context.currentUser;

            if(!currentUser) {
                throw new AuthenticationError("not authenticated");
            }

            const book = new Book({...args});
            const author = await Author.findOne({name: args.author});
            if(!author) {
                const newAuthor = new Author({name: args.author});
                try {
                    await newAuthor.save();
                } catch (err) {
                    throw new UserInputError(err.message, {
                        invalidArgs: args
                    })
                }
                book.author = newAuthor._id;
            } else {
                book.author = author._id;
            }
            try {
                await book.save();
            } catch (err) {
                throw new UserInputError(err.message, {
                    invalidArgs: args
                })
            }

            pubsub.publish('BOOK_ADDED', {bookAdded: book});

            return book;
        },

        editAuthor: async (root,args,context) => {
            const currentUser = context.currentUser;

            if(!currentUser) {
                throw new AuthenticationError("not authenticated");
            }

            const author = await Author.findOne({name: args.name});
            author.born = args.setBornTo;
            try {
                return await author.save();
            } catch (err) {
                throw new UserInputError(err.message, {
                    invalidArgs: args
                })
            }
        },

        createUser: async(root,args) => {
            const user = new User({...args});

            return user.save()
                .catch(err => {
                    throw new UserInputError(err.message, {
                        invalidArgs: args
                    })
                })
        },

        login: async(root,args) => {
            const user = await User.findOne({username: args.username});

            if(!user || args.password !== 'root') {
                throw new UserInputError('wrong credentials');
            }

            const tokenUser = {
                username: user.username,
                id: user._id
            }

            return {value: jwt.sign(tokenUser, JWT_SECRET)}
        }
    },

    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async({req}) => {
        const auth = req ? req.headers.authorization : null;
        if(auth && auth.toLowerCase().startsWith('bearer ')) {
            const decodedToken = jwt.verify(
                auth.substring(7), JWT_SECRET
            )

            const currentUser = await User.findById(decodedToken.id);
            
            return {currentUser}
        }
    }
});

server.listen().then(({url,subscriptionsUrl}) => {
    console.log(`Server ready at ${url}`);
    console.log(`Subscription ready at ${subscriptionsUrl}`)
});

