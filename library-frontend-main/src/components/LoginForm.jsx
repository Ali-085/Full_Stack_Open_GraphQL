import React, { useState,useEffect } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "./queries";
const Login= ({ setToken,setPage }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login,result] = useMutation(LOGIN, {
    onError: (error) => {
      console.error("Login failed:", error.message);
      alert("Login failed. Please check your credentials.");
    },
  });
    useEffect(() => {
    if (result.data && result.data.login) {
      console.log("Login successful, token received",result.data.login);
      const token = result.data.login.value;
      const fav = result.data.login.favoriteGenre;
      setToken(token);
      console.log("Login successful, token:", token);
      console.log("Favourite genre:", fav);
      localStorage.setItem("library-user-token", token);
      localStorage.setItem("Favorite-Genre", fav);
        setPage("authors"); // Redirect to authors page after successful login
    }
    }, [result.data]);


  const handleLogin = async (event) => {
    event.preventDefault();
    if (!username || !password) {
      console.error("Username and password are required");
      return;
    }
    login({ variables: { username, password } })
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          type="text"
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  );
}
export default Login;