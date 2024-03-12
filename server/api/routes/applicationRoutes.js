// server/api/routes/applicationRoutes.js

const express = require("express");
const router = express.Router();
const applicationsController = require("../controllers/applicationsController");

router.get("/", applicationsController.listAllApplications);
router.post("/", applicationsController.createApplication);
router.get("/:name/translations", applicationsController.getApplicationTranslations);
router.post("/:name/add", applicationsController.addApplicationTranslations);
router.post("/:name/deploy", applicationsController.deployApplicationTranslations);
router.get("/:name/deployment-date", applicationsController.getDeploymentDate);

module.exports = router;
