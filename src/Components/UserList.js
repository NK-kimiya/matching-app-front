import React, { useEffect, useState } from "react";
import "./UserList.css";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000"; // fallbackあり
const cloudinaryBaseURL = "https://res.cloudinary.com/dl56fz2c5/";
const UserList = ({ accessToken }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const access = localStorage.getItem("access");
      let res = await apiCall(access); // ①

      if (res.status === 401 || res.status === 403) {
        const refreshed = await refreshAccessToken(); // ②
        if (refreshed) {
          res = await apiCall(refreshed); // ③
        }
      }

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        // ④ まだ失敗 → ログアウト
        localStorage.clear();
        setUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // API 呼び出し（access を渡して実行）
  const apiCall = (access) =>
    fetch(`${baseURL}/api/users/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });

  // refresh で access を再発行
  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return null;

    const res = await fetch(`${baseURL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) return null;

    const data = await res.json(); // { access: "NEW_ACCESS" }
    localStorage.setItem("access", data.access);
    return data.access;
  };

  return (
    <div className="user-list-area">
      {users.map((user) => {
        return (
          <div key={user.id} className="user-list-item">
            {user.profile_image && (
              <img src={user.profile_image} alt="プロフィール画像" />
            )}
            <h4>{user.username}</h4>
            <p>{user.prefecture}</p>
            <p>
              {user.bio?.length > 30 ? user.bio.slice(0, 30) + "..." : user.bio}
            </p>
            <button>もっと見る</button>
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
