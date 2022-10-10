const express = require("express");
const { check } = require("express-validator");

const passController = require("../controllers/pass-controller");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:pid", passController.getPassById);

router.get("/user/:uid", passController.getPassesByUserId);

router.use(checkAuth);

router.post(
  "/",
  check("title").not().isEmpty(),
  check("password").isLength({ min: 6 }),
  passController.createPass
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("password").isLength({ min: 6 })],
  passController.updatePass
);

router.delete("/:pid", passController.deletePass);

module.exports = router;
