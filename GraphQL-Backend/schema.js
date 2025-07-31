const typeDefs = `
    type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }
  
  type Book {
        title: String!
        published: Int!
        author: Author!
        id: ID!
        genres: [String!]!
    }
  
  type User {
  username: String!
  favoriteGenre: String!
  id: ID!
  }

  type Token {
  value: String!
  favoriteGenre: String!
  }

  type Subscription {
    bookAdded: Book!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
      ): Book
    
    editAuthor(
      name: String!
      setBornTo: Int!
      ): Author
    
    createUser(
    username: String!
    favoriteGenre: String!
      ): User

    login(
      username: String!
      password: String!
      ): Token
  }
  

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]!
    allAuthors: [Author!]!
    allGenres: [String]!
    me: User
  }
`
export default typeDefs;