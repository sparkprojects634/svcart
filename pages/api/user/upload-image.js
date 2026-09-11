// pages/api/user/upload-image.js
import formidable from "formidable";
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // ✅ Ensure a real upload dir so `filepath` is set
    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const form = formidable({
      multiples: false,
      keepExtensions: true,
      uploadDir: tempDir,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("❌ Formidable error:", err);
        return res.status(500).json({ success: false, message: "File upload failed" });
      }

      const file = files.profile_image;
      if (!file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      // ✅ Use correct path property
      const tempPath = file.filepath || file.path;
      if (!tempPath) {
        console.error("❌ Temp path missing:", file);
        return res.status(400).json({ success: false, message: "Invalid file path" });
      }

      const originalName =
        file.originalFilename || file.newFilename || file.name || "upload";
      const fileName = Date.now() + "-" + originalName.replace(/\s+/g, "-");

      // ✅ Final WP uploads dir
      const wpUploadDir = path.join(
        process.cwd(),
        "../wordpress/wp-content/uploads/user-profile"
      );
      if (!fs.existsSync(wpUploadDir)) fs.mkdirSync(wpUploadDir, { recursive: true });

      const newPath = path.join(wpUploadDir, fileName);

      // ✅ Move file
      fs.renameSync(tempPath, newPath);

      const fileUrl = `https://dashboard.svcart.shop/wp-content/uploads/user-profile/${fileName}`;

      // ✅ Push to usermeta
      try {
        const conn = await mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.DB_NAME,
        });

        await conn.execute(
          "INSERT INTO wp_usermeta (user_id, meta_key, meta_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value)",
          [fields.user_id, "profile_image", fileUrl]
        );

        await conn.end();
      } catch (dbErr) {
        console.error("❌ DB error:", dbErr);
        return res.status(500).json({ success: false, message: "DB update failed" });
      }

      return res.status(200).json({ success: true, image_url: fileUrl });
    });
  } catch (err) {
    console.error("❌ Upload handler error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}