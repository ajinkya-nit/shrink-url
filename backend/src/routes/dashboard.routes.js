import { Router } from "express";
import { analytics, activeUrls, deactiveUrls, expiredUrls } from '../controller/dashboard.controller.js'
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/analytics").get(verifyJWT, analytics)
router.route("/activeurls").get(verifyJWT, activeUrls)
router.route("/deactiveurls").get(verifyJWT, deactiveUrls)
router.route("/expiredurls").get(verifyJWT, expiredUrls)

export default router
