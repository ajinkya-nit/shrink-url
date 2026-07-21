import { Router } from "express";
import { analytics, activeUrls, deactiveUrls, expiredUrls } from '../controller/dashboard.controller.js'

const router = Router()

router.route("/analytics").get(analytics)
router.route("/activeurls").get(activeUrls)
router.route("/deactiveurls").get(deactiveUrls)
router.route("/expiredurls").get(expiredUrls)

export default router
