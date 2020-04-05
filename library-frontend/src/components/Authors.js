  import React from 'react';
  import {useQuery,useMutation} from '@apollo/client';
  import {ALL_AUTHORS,EDIT_AUTHOR} from './queries';

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS);

  const [editA] = useMutation(EDIT_AUTHOR,{
    refetchQueries: [ {query: ALL_AUTHORS}],
    onError: (err) => {
      props.setError(err.graphQLErrors[0].message);
      setTimeout(() => props.setError(null),5000);
    }
  });

  if (!props.show) {
    return null
  }

  if(result.loading) {
    return <div>Loading...</div>;
  } 

  const authors = result.data.allAuthors;
  const names = authors.map(x => x.name);

  const editAuthor = async(e) => {
      e.preventDefault();
      
      if(e.target.born.value) {
        editA({variables: {name: e.target.name.value, setBornTo: Number(e.target.born.value)}});
      }
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={(e) => editAuthor(e)}>
            <div>
              <label>Name: </label>
              <select name="name" defaultValue={names[0]}>
                {names.map((x,i) => <option key={i} value={x}>{x}</option>)}
              </select>
            </div>
            <div>
              <label>Born: </label>
              <input type="number" name="born"/>
            </div>
            <button>Edit</button>
      </form>
    </div>
  )
}

export default Authors
