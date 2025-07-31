import { ALL_BOOKS_G,ALL_GENRES } from "./queries"
import { useQuery } from "@apollo/client"
import { use } from "react"
import { useState,useEffect } from "react"


const Books = (props) => {
  const [genre, setGenre] = useState(null)
  const [allGenres, setAllGenres] = useState([])

  const { loading, error, data } = useQuery(ALL_BOOKS_G, {
    variables: { genre: genre || null }
  })
  const { data: genreData } = useQuery(ALL_GENRES)

  useEffect(() => {
    if (genreData && genreData.allGenres) {
      console.log("Genres data fetched successfully:", genreData.allGenres)
      setAllGenres(genreData.allGenres)
    }
  }, [genreData])

  if (loading) {
    return <div>loading...</div>
  }

  if (error) {
    return <div>Error loading books: {error.message}</div>
  }

  if (!data || !data.allBooks || data.allBooks.length === 0) {
    return <div>No books found.</div>
  }

  const books = data.allBooks

  return (
    <div>
      <div>
        <h2>books</h2>
        <table>
          <tbody>
            <tr>
              <th>Title</th>
              <th>author</th>
              <th>published</th>
            </tr>
            {books.map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3>Filter by Genre</h3>
        <select value={genre || ''} onChange={e => setGenre(e.target.value || null)}>
          <option value="">All Genres</option>
          {allGenres.map((g, index) => (
            <option key={index} value={g}>{g}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default Books
