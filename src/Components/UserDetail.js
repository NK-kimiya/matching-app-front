import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserDetail.css";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000"; // fallbackあり
const UserDetail = ({ setIsDetailOpen, isDetailOpen, selectedId }) => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log("isDetailOpen:", isDetailOpen);
  }, [isDetailOpen]);

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

  useEffect(() => {
    if (userData?.chat_rooms?.[0]?.id) {
      fetchMessages(userData.chat_rooms[0].id);
    }
  }, [userData]);

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

  const postMessage = async () => {
    if (!content.trim()) return;

    const access = localStorage.getItem("access");
    const chatRoomId = userData?.chat_rooms?.[0]?.id; // ② 最初のルームを例で使用
    if (!chatRoomId) {
      alert("チャットルームが存在しません");
      return;
    }

    let res = await fetch(`${baseURL}/api/chat/messages/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({ chat_room: chatRoomId, content }),
    });

    if (res.status === 401 || res.status === 403) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        res = await fetch(`${baseURL}/api/chat/messages/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshed}`,
          },
          body: JSON.stringify({ chat_room: chatRoomId, content }),
        });
      }
    }

    if (res.ok) {
      const newMessage = await res.json(); // ← 新しく送信されたメッセージを取得
      setMessages((prevMessages) => [...prevMessages, newMessage]); // ← メッセージ配列に追加
      setContent(""); // 成功したら入力欄クリア
    } else {
      const errorText = await res.text(); // ← エラーレスポンスの中身（プレーンテキスト or JSON文字列）
      alert("送信失敗: " + errorText); // ← アラートで表示
    }
  };

  const fetchMessages = async (chatRoomId) => {
    const access = localStorage.getItem("access");
    const res = await fetch(`${baseURL}/api/chat/messages/${chatRoomId}/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    } else {
      console.error("メッセージ取得失敗:", await res);
    }
  };
  return (
    <div className="user-detail-area">
      <button
        onClick={() => setIsDetailOpen(false)}
        className="user-detail-close-button"
      >
        ×
      </button>
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
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="コメントを入力"
        />
        <button onClick={postMessage} className="message-post-button">
          投稿
        </button>
      </div>

      <div className="message-list">
        <h3>メッセージ一覧</h3>
        <ul>
          {messages.map((msg) => (
            <li key={msg.id}>
              <strong>送信者: {msg.sender_username}</strong>
              <br />
              <p>{msg.content}</p>
              <br />
              <small>{new Date(msg.timestamp).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserDetail;
