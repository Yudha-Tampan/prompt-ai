import { bootstrapIfEmpty, getUsers, getPrompts } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await bootstrapIfEmpty();
    const [users, prompts] = await Promise.all([getUsers(), getPrompts()]);
    return res.status(200).json({ success: true, users, prompts });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat database",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
