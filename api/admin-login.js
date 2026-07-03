import { readJsonBody } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(req);
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });
    }

    if (username === (process.env.ADMIN_USERNAME || "") && password === (process.env.ADMIN_PASSWORD || "")) {
      return res.status(200).json({ success: true });
    }

    return res.status(401).json({ success: false, message: "Username atau password admin salah." });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal login admin",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
