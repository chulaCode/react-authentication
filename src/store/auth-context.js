import React, { useState, useEffect, useCallback } from 'react';

let logoutTimer;
const AuthContext=React.createContext({
   token: '',
   isLogedIn: false,
   login: (token) => {},
   logout: () => {}

})
const calculateRemainingTime=(timeofExpiration) => 
{ 
    const currentTime = new Date().getTime();
    const expirationTime = new Date(timeofExpiration).getTime
    const remainingTime = expirationTime - currentTime;
    return remainingTime
}
const retrieveStoredToken = () =>{
    const storedToken = localStorage.getItem('token');
    const storedTokenExpirationDate = localStorage.getItem('expirationTime');
    
    const remainingTime=calculateRemainingTime(storedTokenExpirationDate)
    
    if(remainingTime<=3600){
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');
       
        return null;
    }
    return {
        token: storedToken,
        duration: remainingTime,

    }    
}

export const AuthContextProvider=(props)=>{
    const tokenData=retrieveStoredToken();
    let initialToken;

    if(tokenData){
        initialToken=tokenData.token;
    }
    const [token, setToken]=useState(initialToken);

    //!! token the !! converts a string to a boolearn true or false value
    const userIsLogedIn=!!token;

    const logoutHandler = useCallback(() => {
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');
        if(logoutTimer){
            clearTimeout(logoutTimer);

        }
        
    }, [])
    const loginHandler = (token, expirationTime) => {
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('expirationTime',expirationTime)

        const remainingTime = calculateRemainingTime(expirationTime);
        
       logoutTimer=setTimeout(logoutHandler,remainingTime);
    }
    useEffect(() => {
        if(tokenData){
            logoutTimer=setTimeout(logoutHandler, tokenData.duration)

        }
    }, [tokenData, logoutHandler]);

    const contextValue={
        token:token,
        isLogedIn:userIsLogedIn,
        login:loginHandler,
        logout:logoutHandler
    }

    return<AuthContext.Provider value={contextValue}>
          {props.children}
        </AuthContext.Provider>
}

export default AuthContext;

