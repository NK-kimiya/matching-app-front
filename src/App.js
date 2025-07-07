import React, { useState, useEffect } from "react";
import "./App.css";
import RegisterForm from "./Auth/RegisterForm";
import Login from "./Auth/Login";
import Navigation from "./Common/Navigation";
import UserList from "./Components/UserList";
import UserDetail from "./Components/UserDetail";
import MyChat from "./Components/MyChat";

function App() {
  const [registerDisplay, setRegisterDisplay] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setAccessToken(localStorage.getItem("refresh"));
  }, []);
  return (
    <div className="App">
      {accessToken ? (
        <div>
          <Navigation
            setAccessToken={setAccessToken}
            isSidebarOpen={isSidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <UserList
            accessToken={accessToken}
            setSelectedId={setSelectedId}
            setIsDetailOpen={setIsDetailOpen}
          />
          {isDetailOpen && (
            <UserDetail
              setIsDetailOpen={setIsDetailOpen}
              selectedId={selectedId}
            />
          )}
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
