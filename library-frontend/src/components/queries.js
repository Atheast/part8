import {gql} from '@apollo/client';

export const ALL_AUTHORS = gql`
    query{
        allAuthors{
            name
            born
            bookCount
        }
    }
`;

export const ALL_BOOKS = gql`
    query($genre: String){
        allBooks(genre: $genre){
            title
            published
            author
            genres
        }
    }
`;

export const USER_GENRE= gql`
    query{
        me{
            favoriteGenre
        }
    }
`


export const ADD_BOOK = gql`
    mutation addBook($title: String!,$published: Int!,$author: String!,$genres: [String!]!) {
        addBook(
            title: $title,
            published: $published,
            author: $author,
            genres: $genres
            ) {
                title
                published
                author
                genres
            }
    }
`;

export const EDIT_AUTHOR = gql`
    mutation editAuthor($name: String!, $setBornTo: Int!) {
        editAuthor(
            name: $name,
            setBornTo: $setBornTo
        ) {
            name
            born
        }
    }
`;

export const LOGIN = gql`
    mutation login($username: String!, $password: String!) {
        login(
            username: $username
            password: $password
        ) {
            value
        }
    }
`;

export const BOOK_ADDED = gql`
    subscription{
        bookAdded{
            title
            author
            published
            genres
        }
    }
`;