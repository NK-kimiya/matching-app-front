import axios from "axios";

// .env の REACT_APP_API_ROOT があればそれを、なければローカルの Django を基準 URL とする
const baseURL = (
  process.env.REACT_APP_API_ROOT || "http://127.0.0.1:8000"
).replace(/\/+$/, ""); // 末尾に余分なスラッシュが複数あっても 1 つだけにする（無くても OK）

// Axios インスタンスを作成し、以降はこれを共通クライアントとして使う
const axiosClient = axios.create({
  baseURL, // 上で組み立てた基準 URL
  headers: {
    "Content-Type": "application/json", // デフォルトは JSON を送受信
    Accept: "application/json",
  },
});

/* ------- リクエスト前：Access トークンを付与 ------- */
axiosClient.interceptors.request.use((config) => {
  // すべてのリクエスト前に実行
  const access = localStorage.getItem("access"); // ローカルストレージから access を取得
  if (access) config.headers.Authorization = `Bearer ${access}`; // 取得できたらヘッダーに付与
  return config; // 加工後の設定を返す
});

/* ------- レスポンス後：401 ならリフレッシュ ------- */
axiosClient.interceptors.response.use(
  (response) => response, // 成功時はそのままレスポンスを通す
  async (error) => {
    // 失敗時はここに来る（非同期関数）
    const original = error.config; // 失敗したリクエスト設定を保持

    // // ① 401（Unauthorized）で、まだリトライしておらず、refresh がある場合
    if (
      error?.response?.status === 401 && // アクセストークンの期限切れなど
      !original._retry && // 自前で付けるフラグ：一度だけリトライ
      localStorage.getItem("refresh") // refresh トークンが保存されている
    ) {
      original._retry = true; // 今回リトライするのでフラグを立てる
      try {
        //② Refresh エンドポイントへ POST して新しい access を取得
        const res = await axios.post(`${baseURL}/api/token/refresh/`, {
          refresh: localStorage.getItem("refresh"),
        });

        localStorage.setItem("access", res.data.access); // 新 access を保存
        //失敗した元のリクエストに新しいトークンを付与して再送
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return axiosClient(original); // リトライ結果を呼び出し元へ返す
      } catch (refreshErr) {
        // ③ Refresh も失敗（例：期限切れ）→ ログアウト処理
        localStorage.clear(); // 全トークンを削除
        window.location.href = "/";
        return Promise.reject(refreshErr); // 呼び出し元にエラーを伝搬
      }
    }

    // ④ 上記以外はそのままエラーを返す
    return Promise.reject(error);
  }
);

export default axiosClient;
