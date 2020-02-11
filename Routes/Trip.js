const express = require("express");
const tripController = require("../Controllers/Trip");
const { authenticate } = require("../Middlewares/Auth");

//create router middleware
const router = express.Router();

router.post("/", tripController.createTrip);

router.get("/", tripController.getTrips);

router.patch("/booking", authenticate, tripController.bookTrip);

module.exports = router;
