import fs from "fs/promises";
import path from "path";

async function deleteUserData(req,res){
  try{
    if(!req.user  || !req.user.id){
      return res.status(401).json({
        success:false,
        message:"Authentication required"
      });
    }
    const userId=req.user.id;

    const dataDir=path.join(__dirname,"..","data");
    const safeId= String(userID).replace(/[^a-zA-Z0-9-]/g,"");

    if(!safeId || safeId!=String(userId)){
      return res.status(400).json({
        success:false,
        message:"Invalid user identifier."
      });
    }
    const filesToDelete=[
      path.join(dataDir,`${safeId}__chat.txt`),
      path.join(dataDir,`${safeId}__user.txt`),

    ];

    for(const filePath of filesToDelete){
      await fs.rm(filePath,{force:true});
    }

    return res.json({
      success:true,
      message:"Your stored conversation has been deleted",
    });
  }
  catch{
    return res.status(500).json({
      success:false,
      message:"unable to delete data right now"
    });
  }
}

module.exports ={deleteUserData};