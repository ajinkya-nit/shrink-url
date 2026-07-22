import { Router } from "express";
import { shortenUrl, redirectUrl, deleteUrl, toggleIsActive } from "../controller/url.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/shortenurl").post(verifyJWT, shortenUrl)
router.route("/:shortCode").get(redirectUrl)
router.route("/delete/:urlId").delete(verifyJWT, deleteUrl)
router.route("/toggleurl/:urlId").patch(verifyJWT, toggleIsActive)

export default router