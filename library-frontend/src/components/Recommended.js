import React, {useEffect} from 'react';
import {useLazyQuery} from '@apollo/client';
import {ALL_BOOKS,USER_GENRE} from './queries';

const Recommended = (props) => {
    const [loadUser, user] = useLazyQuery(USER_GENRE);
    const [loadGenre, genre] = useLazyQuery(ALL_BOOKS,{
        variables: {
            genre: user.data ? user.data.me.favoriteGenre : null
        }
    });

    useEffect(() => {
        loadUser();
        loadGenre();
        
    }, [loadGenre,loadUser])

    if(!props.show || !user.data || !genre.data) {
        return null;
    } 

    if(user.loading) {
        return <p>Loading...</p>
    }

    return(
        <div>
            <h2>recommendations</h2>
            <p>books in your favorite genre <b>{user.data.me.favoriteGenre}</b></p>
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
            {genre.data.allBooks.map(a =>
                <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author}</td>
                <td>{a.published}</td>
                </tr>
            )}
            </tbody>
        </table>
        </div>
    )
}

export default Recommended;