import React, { useState } from "react"
import { ALL_AUTHORS, EDIT_AUTHOR } from "./queries"
import { useQuery, useMutation } from "@apollo/client"

const Authors = () => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const result=useQuery(ALL_AUTHORS)
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })


  if (result.loading) {
    return <div>loading...</div>
  }
  
  const submit = async (event) => {
    event.preventDefault()
    editAuthor({ variables: { name, setBornTo: Number(born) } })
    setName('')
    setBorn('')
  }
  const authors = result.data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          <label>name</label>
          <select value={name} onChange={({ target }) => setName(target.value)}>
            <option value="">Select author</option>
            {authors.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>born</label>
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit" disabled={!name || !born}>update author</button>
      </form>
    </div>
  )
}

export default Authors
