// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import RegisterForm from "./Auth/RegisterForm";
import Login from "./Auth/Login";
import Navigation from "./Common/Navigation";
import UserList from "./Components/UserList";
import UserDetail from "./Components/UserDetail";
import MyChat from "./Components/MyChat";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Maypage from "./Components/Maypage";

function App() {
  const [registerDisplay, setRegisterDisplay] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setAccessToken(localStorage.getItem("refresh"));
  }, []);

  // 従来のログイン／ユーザー一覧コンテンツ
  const mainContent = (
    <div className="App">
      {accessToken ? (
        <>
          <UserList
            accessToken={accessToken}
            setSelectedId={setSelectedId}
            setIsDetailOpen={setIsDetailOpen}
          />
          {/* どのルートでも、詳細モーダルは開閉できる */}
          {isDetailOpen && (
            <UserDetail
              selectedId={selectedId}
              setIsDetailOpen={setIsDetailOpen}
              isDetailOpen={isDetailOpen}
            />
          )}
        </>
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

  return (
    <Router>
      {/* ログイン済みなら常に表示 */}
      {accessToken && (
        <Navigation
          setAccessToken={setAccessToken}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      <Routes>
        {/* /my-chat にアクセスしたら MyChat コンポーネント */}
        <Route
          path="/my-chat"
          element={
            <MyChat
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              setIsDetailOpen={setIsDetailOpen}
            />
          }
        />

        <Route path="/my-page" element={<Maypage />} />

        {/* その他すべては mainContent */}
        <Route path="*" element={mainContent} />
      </Routes>
    </Router>
  );
}

export default App;
