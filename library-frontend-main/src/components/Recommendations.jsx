import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "./queries";

const Recommendations= () => {
    const {loading,error ,data}=useQuery(ALL_BOOKS);

    if (loading) {
        return <div>loading...</div>
    }
    if (error) {
        return <div>Error loading recommendations: {books.error.message}</div>
    }
    if (!data || !data.allBooks || data.allBooks.length === 0) {
        console.error("No books found in the database.");
        return <div>No recommendations available.</div>
    }

    const Books = data.allBooks;
    //const favoriteGenre = localStorage.getItem('Favorite-Genre');
    const favoriteGenre = "refactoring";
    if (!favoriteGenre) {
        console.error("Favorite genre not set in localStorage");
        return <div>Error: Favorite genre not set.</div>;
    }
    const filteredBooks = Books.filter(book => Array.isArray(book.genres) && book.genres.includes(favoriteGenre));
    if (filteredBooks.length === 0) {
        return <div>No books found for the genre: {favoriteGenre}</div>;
    }
   
  return (
    <div>
      <h2>Recommended Books</h2>
      <table>
        <tbody>
          <tr>
            <th>Title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default Recommendations;