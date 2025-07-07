import React, { useState, useEffect } from "react";
import "./MyChat.css";
import { useNavigate } from "react-router-dom";
import UserDetail from "./UserDetail";
import "./UserList.css";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000"; // fallbackあり

const MyChat = () => {
  const [users, setUsers] = useState([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false); // 追加
  const [selectedId, setSelectedId] = useState(null); // 追加
  const navigate = useNavigate();
  /* ① access 付き API 呼び出し */
  const apiCall = async (access) => {
    try {
      const res = await fetch(`${baseURL}/api/chat/participants/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
      });
      if (res.status === 401 || res.status === 403) return null;
      return res.ok ? res.json() : null;
    } catch (e) {
      console.log("apiCall error:", e);
      return null;
    }
  };

  /* ② access 更新 */
  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return null;

    const res = await fetch(`${baseURL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;

    const { access } = await res.json();
    localStorage.setItem("access", access);
    return access;
  };

  /* ③ 取得フロー */
  useEffect(() => {
    const fetchUsers = async () => {
      let access = localStorage.getItem("access");
      let data = await apiCall(access); // 1回目

      if (data === null) {
        access = await refreshAccessToken(); // 再発行
        if (access) data = await apiCall(access); // 2回目
      }

      if (data) {
        setUsers(data);
      } else {
        localStorage.clear(); // トークン無効
        navigate("/"); // 画面遷移（任意）
      }
    };
    fetchUsers();
  }, []);
  return (
    <>
      <h3>履歴</h3>
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
                {user.bio?.length > 30
                  ? user.bio.slice(0, 30) + "..."
                  : user.bio}
              </p>
              <button
                onClick={() => {
                  setSelectedId(user.id);
                  setIsDetailOpen(true);
                }}
              >
                もっと見る
              </button>
            </div>
          );
        })}
      </div>

      {isDetailOpen && (
        <UserDetail
          selectedId={selectedId}
          isDetailOpen={isDetailOpen}
          setIsDetailOpen={setIsDetailOpen}
        />
      )}
    </>
  );
};

export default MyChat;
