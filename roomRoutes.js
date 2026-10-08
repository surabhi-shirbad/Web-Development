const express = require("express");

const router = express.Router();

const roomController = require("../controllers/roomController");

const validation = require("../middleware/validation");


// ======================================================
// SEARCH ROOMS
// GET /api/rooms/search
// ======================================================

router.get(
    "/search",
    roomController.searchRooms
);


// ======================================================
// GET ALL ROOMS
// GET /api/rooms
// ======================================================

router.get(
    "/",
    roomController.getRooms
);


// ======================================================
// GET SINGLE ROOM
// GET /api/rooms/:id
// ======================================================

router.get(
    "/:id",
    roomController.getRoomById
);


// ======================================================
// ADD ROOM
// POST /api/rooms
// ======================================================

router.post(
    "/",
    validation.validateRoom,
    roomController.addRoom
);


// ======================================================
// UPDATE ROOM
// PUT /api/rooms/:id
// ======================================================

router.put(
    "/:id",
    validation.validateRoom,
    roomController.updateRoom
);


// ======================================================
// DELETE ROOM
// DELETE /api/rooms/:id
// ======================================================

router.delete(
    "/:id",
    roomController.deleteRoom
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;