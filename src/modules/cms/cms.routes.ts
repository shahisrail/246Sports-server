import { Router } from "express";
import * as cmsController from "./cms.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { writeRateLimit } from "../../middleware/rateLimit.middleware";
import { UserRole } from "../../types";

const router = Router();

router.get("/pages/public/:pageKey", cmsController.getPublicPage);

router.use(authenticate);
router.get(
  "/pages",
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  cmsController.getPages
);
router.get(
  "/pages/:pageKey",
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  cmsController.getPageByKey
);
router.post(
  "/pages",
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  writeRateLimit,
  cmsController.createPage
);
router.put(
  "/pages/:pageKey",
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  writeRateLimit,
  cmsController.updatePage
);
router.delete(
  "/pages/:pageKey",
  authorize(UserRole.SUPER_ADMIN, UserRole.ASSOCIATION_ADMIN),
  cmsController.archivePage
);

export default router;
