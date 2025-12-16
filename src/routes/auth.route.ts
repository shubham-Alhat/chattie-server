import { Router } from "express";

const router = Router();

router.route("/login").get((req, res) => {
  res.send("login route hits..");
});

export default router;
