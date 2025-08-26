import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import errorHandler from "../utils/error.js";
import cloudinary from "../utils/cloudinary.js"; 
import Listing from "../models/listing.model.js";
export const test = (req, res) => {
  res.json({ message: "Hello from the server" });
};

export const updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return next(errorHandler(401, "You can only update your own account"));

    if (req.body.password) {
      if (req.body.password.trim() !== "") {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
      } else {
        delete req.body.password; 
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedUser) return next(errorHandler(404, "User not found"));

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    console.error("Update user error:", error);
    next(errorHandler(500, error.message));
  }
};


export const deleteUser=async(req,res,next)=>{
  if(req.user.id !==req.params.id) return next(errorHandler(401,'you can only delete your own account'));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json("User has been deleted!");
  } catch (error) {
    next(error);
  }
};
export const getUserListings=async(req,res,next)=>{
  if(req.user.id === req.params.id){
  try {
    const listings=await Listing.find({userRef:req.params.id});
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
  }else{
    return next(errorHandler(401,'you can only view your own listing!'));
  }

}
export const getContactController = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { password: _, ...userDetails } = user._doc;
    return res.status(200).json({
      user: userDetails,
    });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};