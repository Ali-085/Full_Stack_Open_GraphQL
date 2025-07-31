import { useState } from 'react'
import { ADD_BOOK, ALL_BOOKS, ALL_AUTHORS, ALL_GENRES, ALL_BOOKS_G } from './queries'
import {useMutation} from "@apollo/client"

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
 
  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [ { query: ALL_AUTHORS }, { query: ALL_GENRES } ],
    update: (cache, { data: { addBook } }) => {
      if (!addBook) return;
      // Update cache for all genres, including null (all books)
      const genresToUpdate = [null, ...addBook.genres];
      genresToUpdate.forEach(g => {
        try {
          const existing = cache.readQuery({
            query: ALL_BOOKS_G,
            variables: { genre: g }
          });
          if (existing && existing.allBooks) {
            // Avoid duplicate books
            const alreadyExists = existing.allBooks.some(b => b.title === addBook.title);
            if (!alreadyExists) {
              cache.writeQuery({
                query: ALL_BOOKS_G,
                variables: { genre: g },
                data: {
                  allBooks: [...existing.allBooks, addBook]
                }
              });
            }
          }
        } catch (e) {
          console.error(`Error updating cache for genre ${g}:`, e);
        }
      });
    },
    onError: (error) => {
      console.error("Error adding book:", error.message);
      alert("Failed to add book. Please check your input.");
    },
    onCompleted: () => {
      console.log("Book added successfully");
      props.setPage('books') // Redirect to books page after adding a new book
    }
  })

  const submit = async (event) => {
    event.preventDefault()

    addBook({variables: {title, published: Number(published), author, genres: Array.isArray(genres) ? genres : []}})

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('') // Redirect to books page after adding a new book
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook