import express from "express";
import { deleteUser, test, updateUser,getUserListings, getContactController } from "../controllers/userController.js";
import { verifyToken } from "../utils/verifyUser.js";

const router=express.Router();

router.get("/test",test);
router.post("/update/:id",verifyToken,updateUser);
router.delete("/delete/:id",verifyToken,deleteUser);
router.get("/listings/:id",verifyToken,getUserListings);
router.get("/:id([a-fA-F0-9]{24})", verifyToken, getContactController);

export default router;
