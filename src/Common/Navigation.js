import React from "react";

const Navigation = ({ setAccessToken }) => {
  const logout = () => {
    // 1. トークン削除
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAccessToken(false);
  };
  return (
    <div>
      <button onClick={() => logout()}>ログアウト</button>
    </div>
  );
};

export default Navigation;
