import React, { useState, useEffect } from "react";
import "./App.css";
import RegisterForm from "./Auth/RegisterForm";
import Login from "./Auth/Login";
import Navigation from "./Common/Navigation";
import UserList from "./Components/UserList";

function App() {
  const [registerDisplay, setRegisterDisplay] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    setAccessToken(localStorage.getItem("refresh"));
  }, []);
  return (
    <div className="App">
      {accessToken ? (
        <div>
          <Navigation setAccessToken={setAccessToken} />
          <UserList accessToken={accessToken} />
        </div>
      ) : registerDisplay ? (
        <RegisterForm setRegisterDisplay={setRegisterDisplay} />
      ) : (
        <Login
          setRegisterDisplay={setRegisterDisplay}
          setAccessToken={setAccessToken}
        />
      )}
    </div>
  );
}

export default App;
