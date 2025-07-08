// src/components/Mypage.js
import React, { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient"; // ← 変更点
import "./MyPage.css";
// 簡易版：都道府県リスト (id:1~47)
const PREFS = [
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

const Mypage = () => {
  /* ---------- state ---------- */
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null); // 画像ファイル
  const [msg, setMsg] = useState("");

  const [rooms, setRooms] = useState([]); // ① ルーム ID 配列
  const [active, setActive] = useState(null); // ② 選択中ルーム ID
  const [messages, setMessages] = useState([]);

  const [newMsg, setNewMsg] = useState(""); // 送信ボタンハンドラ
  const [isProfile, setIsProfile] = useState(true);

  /* ---------- ① ユーザー情報取得 ---------- */
  useEffect(() => {
    axiosClient
      .get("/api/me/")
      .then((res) => {
        console.log("マイページの取得データ", res.data);
        setUser(res.data);
        setFormData({
          username: res.data.username || "",
          email: res.data.email || "",
          bio: res.data.bio || "",
          prefecture: res.data.prefecture || "",
        });

        const ids = (res.data.chat_rooms || []).map((r) => r.id);
        setRooms(ids);
        if (ids.length) setActive(ids[0]);
      })
      .catch((err) => setMsg(`取得失敗 (${err.response?.status})`));
  }, []);

  useEffect(() => {
    if (!active) return;
    axiosClient
      .get(`/api/chat/messages/${active}/`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("メッセージ取得失敗", err));
  }, [active]);

  /* ---------- 入力ハンドラ ---------- */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFile = (e) => setFile(e.target.files[0]);

  /* ---------- 更新リクエスト ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (file) {
        /* multipart */
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
        fd.append("profile_image_upload", file);

        await axiosClient.put("/api/profile/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        /* JSON */
        await axiosClient.put("/api/profile/", formData);
      }
      setMsg("更新しました");
      const res = await axiosClient.get("/api/me/");
      setUser(res.data);
    } catch (err) {
      setMsg(`更新失敗 (${err.response?.status})`);
    }
  };

  const sendMessage = async () => {
    if (!active || !newMsg.trim()) return; // ルーム未選択 or 空文字は無視
    try {
      const res = await axiosClient.post("/api/chat/messages/", {
        chat_room: active, // 送信先ルーム ID
        content: newMsg.trim(), // 本文
      });
      /* ① サーバが 201 で返したメッセージを直ちに画面に追加する */
      setMessages((prev) => [...prev, res.data]);
      setNewMsg(""); // 入力欄クリア
    } catch (err) {
      console.error("送信失敗", err);
      alert("メッセージ送信に失敗しました");
    }
  };

  /* ---------- 画面 ---------- */
  if (!user) return <p>Loading...</p>;

  return (
    <div className="mypage-area">
      <div className="area-switching-button">
        <button
          onClick={() => setIsProfile(true)}
          className={isProfile ? "switching-button" : "switching-button-none"} // ← display / none を自動切替
        >
          プロフィール編集
        </button>

        <button
          onClick={() => setIsProfile(false)}
          className={!isProfile ? "switching-button" : "switching-button-none"} // ← 反転
        >
          コメント({messages.length}件)
        </button>
      </div>

      <div className={isProfile ? "display" : "none"}>
        <div className="space-y-2 border p-4 rounded-lg shadow">
          <img
            src={user.profile_image}
            alt="profile"
            className="w-32 h-32 object-cover rounded-full"
          />
        </div>

        <h2 className="text-xl font-bold">プロフィール編集</h2>
        {msg && <p className="text-sm text-red-600">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">ユーザー名</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="block w-full border p-1"
          />

          <label className="block">メールアドレス</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full border p-1"
          />

          <label className="block">自己紹介</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="block w-full border p-1"
          />

          <label className="block">都道府県</label>
          <select
            name="prefecture"
            value={formData.prefecture || ""}
            onChange={handleChange}
            className="block w-full border p-1"
          >
            <option value="">-- 選択 --</option>
            {PREFS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <label className="block">プロフィール画像</label>
          <input type="file" accept="image/*" onChange={handleFile} />
          {file && <p className="text-sm">{file.name}</p>}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 rounded-lg"
          >
            更新
          </button>
        </form>
      </div>

      <div className={!isProfile ? "display" : "none"}>
        <h2 className="text-xl font-bold mt-8">コメント</h2>
        <div className="chat-area">
          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 border p-2 rounded"
              placeholder="メッセージを入力"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              送信
            </button>
          </div>
          {/* メッセージ表示 */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {messages.map((m) => (
              <div key={m.id} className="border p-2 rounded">
                <p className="text-xs text-gray-500">{m.sender_username}</p>
                <p>{new Date(m.timestamp).toLocaleString()}</p>
                <p>{m.content}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-sm text-gray-400">メッセージがありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mypage;
