const express = require("express");

const router = express.Router();

const bookingController =
    require("../controllers/bookingController");

const validation =
    require("../middleware/validation");


// ======================================================
// GET ALL BOOKINGS
// GET /api/bookings
// ======================================================

router.get(
    "/",
    bookingController.getBookings
);


// ======================================================
// CREATE BOOKING
// POST /api/bookings
// ======================================================

router.post(
    "/",
    validation.validateBooking,
    bookingController.createBooking
);


// ======================================================
// CANCEL BOOKING
// DELETE /api/bookings/:id
// ======================================================

router.delete(
    "/:id",
    bookingController.cancelBooking
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;