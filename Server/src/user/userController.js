import User from "./userModel.js";
import fs from "fs";




const accDetailUpdater = async (req, res) => {
  try {
    const { email, phone_no } = req.body;
    const user_id = req.session.userId;

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: user_id } });
      if (emailExists) {
        return res.status(409).json({
          message: "Email already linked with another account",
        });
      }
      user.email = email;
    }


    if (phone_no && phone_no !== user.phone_no) {
      const phoneExists = await User.findOne({ phone_no, _id: { $ne: user_id } });
      if (phoneExists) {
        return res.status(409).json({
          message: "Phone number already linked with another account",
        });
      }
      user.phone_no = phone_no;
    }

    await user.save();

    return res.status(200).json({
      message: "Details updated successfully",
    });
  } catch (error) {
    console.error("ACCOUNT UPDATE ERROR:", error);

    // Fallback for unexpected duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(409).json({
          message: "Email already linked with another account",
        });
      }
      if (error.keyPattern?.phone_no) {
        return res.status(409).json({
          message: "Phone number already linked with another account",
        });
      }
    }

    return res.status(500).json({
      message: "Error updating the details",
    });
  }
};

const profilePhotoUpdater = async (req, res) => {
  try {
    const user_id = req.session.userId;
    const profilePhotoPath = req.file?.path;

    if (!profilePhotoPath) {
      return res.status(400).json({ message: "Avatar file is missing" });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Deleting old avatar from disk (if exists)
    if (user.profile_photo) {
      const oldPath = user.profile_photo.startsWith("/uploads")
        ? user.profile_photo.slice(1) // remove leading slash
        : user.profile_photo;

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save relative path in DB
    user.profile_photo = "/" + profilePhotoPath.replace(/\\/g, "/");
    await user.save();

    return res.status(200).json({
      message: "Profile photo updated successfully",
      avatar: user.profile_photo
    });
  } catch (error) {
    console.error("PROFILE PHOTO UPDATE ERROR:", error);
    return res.status(500).json({ message: "Error updating profile photo",
      error:error.message
     });
  }
};

const fetchUserDetails=async (req,res)=>{
try {
  const userId=req.session.userId;
  
  const user=await User.findById(userId);
  
  if(!user){
    return res.status(404).json({
      message:"User not found"
    });
  }
  return res.status(200).json(user);
  
} catch (error) {
 return res.status(500).json({
  message:"Error fetching user details",
  Error:error
})
}
}



export {accDetailUpdater, profilePhotoUpdater,fetchUserDetails};
