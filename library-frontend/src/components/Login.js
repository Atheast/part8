import React, {useState, useEffect} from 'react';
import {LOGIN} from './queries';
import {useMutation} from '@apollo/client';

const Login = (props) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [login, result] = useMutation(LOGIN,{
        onError: (err) => {
            props.setError(err.graphQLErrors[0].message);
            setTimeout(() => props.setError(null),5000)
        }
    });

    useEffect(() => {
        if(result.data) {
            const token = result.data.login.value;
            props.setToken(token);
            localStorage.setItem('userToken',token);
        }
    },[props, result.data])

    const handleSubmit = (e) => {
        e.preventDefault();

        login({variables: {username,password}});
        props.setPage('authors');
    }
    

    if(!props.show) {
        return null;
    }

    return(
        <div>
            <form onSubmit={(e) => handleSubmit(e)}>
                <div>
                    <label>Username: </label>
                    <input value={username} onChange={({target}) => setUsername(target.value)}/>
                </div>
                <div>
                    <label>Password: </label>
                    <input type="password" value={password} onChange={({target}) => setPassword(target.value)}/>
                </div>
                <button>Login</button>
            </form>
        </div>
    )
}

export default Login;