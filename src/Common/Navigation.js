import React from "react";
import "./Navigation.css";
const Navigation = ({ setAccessToken }) => {
  const logout = () => {
    // 1. トークン削除
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAccessToken(false);
  };
  return (
    <div className="header">
      <button onClick={() => logout()}>ログアウト</button>
    </div>
  );
};

export default Navigation;
