import React, { useState } from "react";
import axios from "axios";
import "./RegisterForm.css";

const Login = ({ setRegisterDisplay, setAccessToken }) => {
  //---1.フォームの状態---
  const [cred, setCred] = useState({ username: "", password: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("success"); // success | error
  const [dialogMsg, setDialogMsg] = useState("");

  //入力ハンドラ
  const handleChange = (e) =>
    setCred({ ...cred, [e.target.name]: e.target.value });

  //---3.送信ハンドラ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/token/", cred, {
        headers: { "Content-Type": "application/json" },
      });

      // 4. トークン保存
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      setAccessToken(true);
      // 5. 必要なら別ページへ遷移     // setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        Object.values(err.response?.data || {}).join(" ") ||
        err.message;

      setDialogType("error");
      setDialogMsg(`ログイン失敗: ${detail}`);
      setIsDialogOpen(true);
    }
  };
  return (
    <div className="register-form">
      {/* ---------- ログインフォーム ---------- */}
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="ユーザー名"
          value={cred.username}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="パスワード"
          value={cred.password}
          onChange={handleChange}
          required
        />
        <button type="submit">ログイン</button>
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            setRegisterDisplay(true);
          }}
        >
          新規登録
        </a>
      </form>

      {/* ---------- ダイアログ ---------- */}
      {isDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsDialogOpen(false)}>
          <div
            className={`modal modal--${dialogType}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {dialogType === "success" ? "ログイン成功" : "ログインエラー"}
            </h3>
            <p>{dialogMsg}</p>
            <button onClick={() => setIsDialogOpen(false)}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
