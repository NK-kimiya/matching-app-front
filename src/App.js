import React, { useState, useEffect } from "react";
import "./App.css";
import RegisterForm from "./Auth/RegisterForm";
import Login from "./Auth/Login";
import Navigation from "./Common/Navigation";

function App() {
  const [registerDisplay, setRegisterDisplay] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  useEffect(() => {
    setAccessToken(localStorage.getItem("access"));
  }, []);
  return (
    <div className="App">
      {accessToken ? (
        <Navigation setAccessToken={setAccessToken} />
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
