import React from "react";
import { CiUser } from "react-icons/ci";
import "./Navigation.css";
import { Link } from "react-router-dom";
const Navigation = ({ setAccessToken, isSidebarOpen, setSidebarOpen }) => {
  const logout = () => {
    // 1. トークン削除
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAccessToken(false);
  };
  return (
    <div className="header">
      <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
        <CiUser size={30} />
      </button>
      {isSidebarOpen && (
        <div className="sidebar">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)}>×</button>
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            Home
          </Link>
          <Link
            to="/"
            onClick={(e) => {
              setSidebarOpen(false);
              logout();
            }}
          >
            ログアウト
          </Link>
          <Link to="/my-page" onClick={() => setSidebarOpen(false)}>
            マイページ
          </Link>
          <Link to="/my-chat" onClick={() => setSidebarOpen(false)}>
            履歴
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navigation;
