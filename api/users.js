import { getUsers, replaceUsers, readJsonBody, isPayloadTooLarge } from "./_db.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const users = await getUsers();
      return res.status(200).json({ success: true, users });
    }

    if (req.method === "PUT") {
      if (isPayloadTooLarge(req)) {
        return res.status(413).json({ success: false, message: "Payload terlalu besar" });
      }
      const body = await readJsonBody(req);
      if (!Array.isArray(body.users)) {
        return res.status(400).json({ success: false, message: "Format users tidak valid" });
      }
      if (body.users.length > 5000) {
        return res.status(413).json({ success: false, message: "Terlalu banyak data user" });
      }
      const count = await replaceUsers(body.users);
      return res.status(200).json({ success: true, count });
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memproses users",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
