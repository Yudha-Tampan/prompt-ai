import { getPrompts, replacePrompts, readJsonBody, isPayloadTooLarge } from "./_db.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const prompts = await getPrompts();
      return res.status(200).json({ success: true, prompts });
    }

    if (req.method === "PUT") {
      if (isPayloadTooLarge(req)) {
        return res.status(413).json({ success: false, message: "Payload terlalu besar" });
      }
      const body = await readJsonBody(req);
      if (!Array.isArray(body.prompts)) {
        return res.status(400).json({ success: false, message: "Format prompts tidak valid" });
      }
      if (body.prompts.length > 10000) {
        return res.status(413).json({ success: false, message: "Terlalu banyak data prompt" });
      }
      const count = await replacePrompts(body.prompts);
      return res.status(200).json({ success: true, count });
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memproses prompts",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
