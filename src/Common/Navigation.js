import React from "react";
import { CiUser } from "react-icons/ci";
import "./Navigation.css";
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
          <h3>MENU</h3>
          <a
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
          >
            ログアウト
          </a>
          <a href="">マイページ</a>
          <a href="">履歴</a>
        </div>
      )}
    </div>
  );
};

export default Navigation;
