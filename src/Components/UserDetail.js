import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserDetail.css";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000"; // fallbackあり
const UserDetail = ({ setIsDetailOpen, selectedId }) => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
      const access = localStorage.getItem("access");
      let res = await apiCall(access); // ① 最初のリクエスト

      if (res.status === 401 || res.status === 403) {
        const refreshed = await refreshAccessToken(); // ② 再発行トークン
        if (refreshed) {
          res = await apiCall(refreshed); // ③ 再試行
        }
      }

      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      } else {
        localStorage.clear(); // ④ ログアウト
        setError("ユーザー取得に失敗しました");
      }
    };

    fetchUserDetail();
  }, [selectedId]);

  // API呼び出し関数（fetch使用に統一）
  const apiCall = (access) =>
    fetch(`${baseURL}/api/users/${selectedId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
    });

  // アクセストークンの再発行
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
    <div className="user-detail-area">
      <button onClick={() => setIsDetailOpen(false)}>×</button>
      {userData ? (
        <>
          {userData.profile_image && (
            <img src={userData.profile_image} alt="プロフィール画像" />
          )}
          <h4>{userData.username}</h4>
          <p>{userData.prefecture}</p>
          <p>{userData.bio}</p>
        </>
      ) : (
        <p>None</p>
      )}
      <div className="post-area">
        <textarea placeholder="コメントを入力"></textarea>
        <button>投稿</button>
      </div>
    </div>
  );
};

export default UserDetail;
