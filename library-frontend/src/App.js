import React, {useState,useEffect} from 'react';
import {useApolloClient, useSubscription} from '@apollo/client';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Login from './components/Login';
import Recommended from './components/Recommended';
import {BOOK_ADDED,ALL_BOOKS} from './components/queries';

const App = () => {
  const [page, setPage] = useState('authors');
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  const updateCacheWith = (book) => {
    const includedIn = (set,object) => set.map(p => p.title).includes(object.title);

    const dataInStore = client.readQuery({query: ALL_BOOKS});
    if(!includedIn(dataInStore.allBooks,book)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: {allBooks : dataInStore.allBooks.concat(book)}
      });
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({subscriptionData }) => {
      const book = subscriptionData.data.bookAdded;
      window.alert(`Book ${book.title} by ${book.author} added`);
      updateCacheWith(book);
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if(token) {
      setToken(token);
    }
  },[])

  const logout = () => {
    localStorage.removeItem('userToken');
    client.resetStore();
    setToken(null);
  }

  return (
    <div>
      {error ? <div style={{color: 'red'}}>{error}</div> : ''}
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? null : <button onClick={() => setPage('login')}>login</button>}
        {token ? <button onClick={() => setPage('recommended')}>recommended</button> : null}
        {token ? <button onClick={() => setPage('add')}>add book</button> : null}
        {token ? <button onClick={() => logout()}>logout</button> : null}
      </div>

      <Authors
        show={page === 'authors'}
        setError={setError}
      />

      <Books
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
        setError={setError}
        updateCacheWith={updateCacheWith}
      />

      <Login 
        show={page === 'login'}
        setPage={setPage}
        setToken={setToken}
        setError={setError}
      />

      {token ? <Recommended 
        show={page === 'recommended'}
      /> : null}
    </div>
  )
}

export default App