// CONTROLLER/uploadcontroller.js
import fs from 'fs';
import path from 'path';
import multer from 'multer';


const upload=multer({
  storage:multer.diskStorage({
    destination:(req,file,cb)=>{
      cb(null,"Backend/Bakend/data");
    },
    filename:(req,file,cb)=>{
      const crypto =require("crypto");
      cb(null,crypto.randomUUID()+".txt");
    }
  }),
  limits:{
    fileSize:2*1024*1024,file:1
  },
  fileFilter:(req,file,cb)=>{
    const allowed=new Set([
      "text/plain","text/csv",
      "application/json"
    ]);
    if(!allowed.has(file.mimetype)){
      return cb(new Error ("Unsupported file type:"));
    }
    cb(null,true);
  }
});
export const handleUpload = (req, res) => {
  const { email, lovedOneName, relationship, personality, interests } = req.body;

  const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
  const uploadDir = path.join('Backend', 'data');

  // Save info
  const userInfo = { email, lovedOneName, relationship, personality, interests };
  const infoPath = path.join(uploadDir, `${safeEmail}_info.json`);
  fs.writeFileSync(infoPath, JSON.stringify(userInfo, null, 2));

  // Rename chat file
  if (req.file) {
    const newChatPath = path.join(uploadDir, `${safeEmail}_chat.txt`);
    fs.renameSync(req.file.path, newChatPath);
  }

  // ✅ THIS LINE FIXES YOUR ISSUE
  res.json({ success: true, message: "Data uploaded and saved successfully." });
};
