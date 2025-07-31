import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/LoginForm";
import Recommendations from "./components/Recommendations";
import { useSubscription,useApolloClient } from "@apollo/client";
import { BOOK_ADDED, ALL_BOOKS_G, ALL_AUTHORS, ALL_GENRES } from "./components/queries";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);

  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const newBook = subscriptionData.data.bookAdded;
      alert(`New book added: ${newBook.title} by ${newBook.author.name}`);
      client.refetchQueries({
        include: [ALL_BOOKS_G, ALL_AUTHORS, ALL_GENRES],
      });
    },
  });

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("recommendations")}>recommendations</button>
            <button onClick={() => {
              setToken(null);
              localStorage.removeItem("library-user-token");
              localStorage.removeItem("Favorite-Genre");
              setPage("authors");
            }}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      {page === "authors" && <Authors />}
      {page === "books" && <Books />}
      {page === "add" && <NewBook setPage={setPage}/>}
      {page === "recommendations" && <Recommendations />}
      {page === "login" && <Login setToken={setToken} setPage={setPage}/>}
      
    </div>
  );
};

export default App;
