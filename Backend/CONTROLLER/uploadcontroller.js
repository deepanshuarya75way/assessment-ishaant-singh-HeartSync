import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONTROLLER/.. is the project root.
const uploadDir = path.resolve(__dirname, '..', 'data');

export const handleUpload = async (req, res) => {
  try {
    const {
      email,
      lovedOneName,
      relationship,
      personality,
      interests
    } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a chat file.'
      });
    }

    await fs.mkdir(uploadDir, { recursive: true });

    const safeEmail = email.trim().replace(/[^a-zA-Z0-9_-]/g, '_');

    const userInfo = {
      email: email.trim(),
      lovedOneName,
      relationship,
      personality,
      interests
    };

    const infoPath = path.join(
      uploadDir,
      `${safeEmail}_info.json`
    );

    const chatPath = path.join(
      uploadDir,
      `${safeEmail}_chat.txt`
    );

    // Save the user information.
    await fs.writeFile(
      infoPath,
      JSON.stringify(userInfo, null, 2),
      'utf8'
    );

    // Move the file saved by Multer into its final location.
    await fs.rename(req.file.path, chatPath);

    return res.status(200).json({
      success: true,
      message: 'Data uploaded and saved successfully.'
    });

  } catch (error) {
    console.error('Upload controller error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to save the uploaded chat file.'
    });
  }
};