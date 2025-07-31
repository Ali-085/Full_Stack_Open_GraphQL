import {gql} from '@apollo/client'

export const ALL_AUTHORS=gql`
query {
  allAuthors {
    name
    born
    bookCount
  }
}
`

export const ALL_BOOKS=gql`
query{
    allBooks{
        title
        author{
          name
    }
        published    
        genres
    }
}
`

export const ALL_BOOKS_G=gql`
query AllBooks($genre: String){
    allBooks(genre: $genre){
        title
        author{
          name
        }
        published    
        genres
    }
}
`

export const ALL_GENRES = gql`
query AllGenres {
  allGenres
}
`

export const ADD_BOOK=gql`
mutation addNewBook($title: String!, $published: Int!, $author: String!, $genres: [String!]!){
  addBook(
    title: $title,
    published: $published,
    author: $author,
    genres: $genres
  ) {
    title
    author{
    name
    }
    published
    genres
  }
}
`
export const EDIT_AUTHOR=gql`
mutation editAuthor($name: String!, $setBornTo: Int!) {
  editAuthor(
    name: $name,
    setBornTo: $setBornTo
  ) {
    name
    born
  }
}
`
export const LOGIN=gql`
mutation login($username: String!, $password: String!) {
  login(
    username: $username,
    password: $password
  ) {
    value
    favoriteGenre
  }
}
`

export const BOOK_ADDED = gql`
subscription {
  bookAdded {
    title
    author {
      name
    }
    published
    genres
  }
}
`