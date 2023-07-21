const express = require("express");
const {
  getProblem,
  testProblem,
} = require("../controllers/problemsController");
const apicache = require("apicache");

let app = express();
let cache = apicache.middleware;
const router = express.Router();
router.get("/:id", cache(), getProblem);
router.post("/:id", testProblem);

module.exports = router;
