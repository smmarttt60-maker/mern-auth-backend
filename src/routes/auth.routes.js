import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMyProfile } from "../controllers/auth.controller.js";
import { refreshAccessToken } from "../controllers/auth.controller.js";
import { getAllUsersAdmin } from "../controllers/auth.controller.js";
import { authorizeRoles } from "../middlewares/roles.middleware.js";



import { registerUser,loginUser,logoutUser,updateProfile,updatePassword } from "../controllers/auth.controller.js";

const router = Router();

//  REGISTER ROUTE
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyJWT, getMyProfile);
router.get(
  "/admin/users",
  verifyJWT,
  authorizeRoles("admin"),
  getAllUsersAdmin
);
router.patch("/update", verifyJWT, updateProfile);
router.put("/password", verifyJWT, updatePassword);


router.get("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);




export default router;
