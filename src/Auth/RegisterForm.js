import React, { useState } from "react";
import axios from "axios";
import "./RegisterForm.css";

// 47都道府県リスト
const PREF_LIST = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

const RegisterForm = ({ setRegisterDisplay }) => {
  //----------1.フォームの状態----------
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    prefecture: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [message, setMessage] = useState(null);

  //ダイアログメッセージステート
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMsg, setDialogMsg] = useState("");
  const [dialogType, setDialogType] = useState("success"); // "success" | "error"

  //----------2.入力ハンドラ----------
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setProfileImage(e.target.files[0]);

  // ---------- 3. 送信ハンドラ ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    // 全テキストフィールドを追加
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    // 画像があれば追加
    if (profileImage) formData.append("profile_image", profileImage);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/register/", // ←適宜置き換え
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      // ★ 成功したらダイアログを開く
      setDialogMsg(
        `${res.data.username || "ユーザー"} さん、登録が完了しました！`
      );
      setIsDialogOpen(true);
      setDialogType("success");
    } catch (err) {
      let detail = "登録に失敗しました。";
      if (err.response?.data) {
        detail = Object.entries(err.response.data)
          .map(
            ([field, msgs]) =>
              `${field}: ${Array.isArray(msgs) ? msgs.join(" ") : msgs}`
          )
          .join("\n");
      }
      setDialogMsg(detail);
      setDialogType("error");
      setIsDialogOpen(true);
    }
  };
  return (
    <div className="register-form">
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="ユーザー名"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="メールアドレス"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="パスワード"
          value={form.password}
          onChange={handleChange}
          required
        />
        <textarea
          name="bio"
          placeholder="自己紹介 (任意)"
          value={form.bio}
          onChange={handleChange}
          rows={3}
        />
        {/* ▼ 都道府県セレクト ▼ */}
        <select
          name="prefecture"
          value={form.prefecture}
          onChange={handleChange}
        >
          <option value="">都道府県を選択</option>
          {PREF_LIST.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <input
          className="file-field-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        <button type="submit">登録</button>

        {message && <p>{message}</p>}
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            setRegisterDisplay(false);
          }}
        >
          ログイン
        </a>
      </form>

      {/* ---------- ダイアログ ---------- */}
      {isDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsDialogOpen(false)}>
          <div
            className={`modal modal--${dialogType}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{dialogType === "success" ? "登録成功" : "登録エラー"}</h3>
            <pre className="modal__msg">{dialogMsg}</pre>
            <button onClick={() => setIsDialogOpen(false)}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
