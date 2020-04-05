import React,{useState,useEffect} from 'react';
import {useLazyQuery,useQuery} from '@apollo/client';
import {ALL_BOOKS} from './queries';

const Books = (props) => {
  const [genre, setGenre] = useState('all');
  const result = useQuery(ALL_BOOKS);
  const [loadBooks, {loading,data}] = useLazyQuery(ALL_BOOKS,{
    variables: {
      genre: (genre === 'all') ? null : genre
    }
  });

  useEffect(() => {
    loadBooks();
  },[genre,loadBooks])
  

  if (!props.show) {
    return null
  }

  if(loading) {
    return <div>Loading...</div>
  }

  const books = data.allBooks;

  const genres = [...new Set(result.data.allBooks.map(x => x.genres).flat(1))];

  return (
    <div>
      <h2>books</h2>
      {genre === 'all' ? <p>in <b>all</b> genres</p> : <p>in <b>{genre}</b> genre</p>}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        {genres.map((x,i) => <button key={i} onClick={() => setGenre(x)}>{x}</button>)}
        <button onClick={() => setGenre('all')}>all</button>
      </div>
    </div>
  )
}

export default Books