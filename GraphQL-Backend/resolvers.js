import mongoose from 'mongoose'
import { GraphQLError } from 'graphql'
import Book from './models/Book.js'
import Author from './models/Author.js'
import User from './models/user.js'
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import DataLoader from 'dataloader';

const resolvers = {
  Query: {
    bookCount: async () => await Book.collection.countDocuments(),
    authorCount: async () => await Author.collection.countDocuments(),
    me: (root, args, context) => {
      return context.currentUser;},
    allGenres: async () => {
      const books = await Book.find({});
      const genres = new Set();
      books.forEach(book => {
        book.genres.forEach(genre => genres.add(genre));
      });
      return Array.from(genres);
    },

    allBooks: async (root, args) => {
      const filter = {};
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (author) {
          filter.author = author._id;
        }
      }
      if (args.genre) {
        filter.genres = { $in: [args.genre] };
      }
      return await Book.find(filter).populate('author');
    },

    allAuthors: async (root, args, context) => {
      const authors = await Author.find({});
      // Use DataLoader to batch bookCount lookups
      const bookCounts = await context.bookCountLoader.loadMany(authors.map(a => a._id.toString()));
      return authors.map((author, idx) => {
        const obj = author.toObject();
        obj.bookCount = bookCounts[idx] || 0;
        return obj;
      });
    },
  },

  Author: {
    id: (root) => root._id.toString(),
    bookCount: async (author, args, context) => {
      // Use DataLoader for efficient batch loading
      return context.bookCountLoader.load(author._id.toString());
    },
  },

  User: {
    id: (root) => root._id.toString(),
  },

  Book: {
    id: (root) => root._id.toString(),
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const { currentUser, pubsub } = context;
      console.log('0.Context:', context);
      console.log('0.1.pubsub', pubsub);
      console.log('1.Adding book:', args);
      if (!currentUser) {
        console.error('2.User not authenticated');
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }
      console.log('3.Current user:', currentUser.username);
      if (!args.author || args.author.length < 4 || !args.title || args.title.length < 5) {
        throw new GraphQLError('Saving Author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            message: 'Book title and Author name must be at least 3 characters long',
          },
        });
      }
      console.log('3.2.Current user:', currentUser.username);
      let author = await Author.findOne({ name: args.author });
      console.log('3.3.Author found:', author);
      if (!author) {
        author = new Author({ name: args.author });
        console.log('4.Creating new author:', author);
        try {
          await author.save();
        } catch (error) {
          throw new GraphQLError('Saving Author failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              error,
            },
          });
        }
      }
      console.log('5.Author found or created:', author);
      const book = new Book({
        title: args.title,
        published: args.published,
        genres: args.genres,
        author: author._id
      });
      console.log('6.Creating new book:', book);
      try {
        await book.save();
        console.log('7.Book saved:', book);
        const populatedBook = await book.populate('author');
        pubsub.publish('BOOK_ADDED', { bookAdded: populatedBook });
        return populatedBook;
      } catch (error) {
        throw new GraphQLError('Saving Book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            error,
          }
        });
      }
    },

    editAuthor: async (root, args,{currentUser}) => {
      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }
      const author = await Author.findOne({ name: args.name });
      if (!author) {
        throw new GraphQLError('Author not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      author.born = args.setBornTo;

      try {
        await author.save();
        console.log('Author updated:', author);
        return author;
      } catch (error) {
        throw new GraphQLError('Updating Author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        });
      }
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre });
      try {
        await user.save();
        return user;
      } catch (error) {
        throw new GraphQLError('Creating User failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            error,
          },
        });
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      console.log('User found:', user);
      if (!user || !process.env.SECRET || args.password !== process.env.SECRET) {
        throw new GraphQLError('Invalid credentials', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }
      if (!process.env.JWT_SECRET) {
        throw new GraphQLError('JWT_SECRET not set in environment', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
          },
        });
      }
      const token = sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const favoriteGenre = user.favoriteGenre || 'Unknown';
      console.log('Token generated for user:', user.username);
      console.log('Favorite genre:', favoriteGenre);
      console.log('Generated token:', token);
      if (!token) {
        throw new GraphQLError('Token generation failed', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
          },
        });
      }
      const tok= { value: token , favoriteGenre: favoriteGenre};
      console.log('Returning token:', tok);
      return tok;
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: (root, args, context) => {
        console.log('Subscription started for bookAdded');
        console.log('Context.pubsub:', context.pubsub);
        console.log('PubSub asyncIterator type:', typeof context.pubsub.asyncIterator);
        return context.pubsub.asyncIterator('BOOK_ADDED');
      },
    },
  }
};
export default resolvers;