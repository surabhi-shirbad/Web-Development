// ======================================================
// ROOM VALIDATION
// ======================================================

function validateRoom(req, res, next) {

    const room_no = req.body.room_no;
    const type = req.body.type;
    const price = req.body.price;

    // Check required fields
    if (
        !room_no ||
        !type ||
        price === undefined ||
        price === ""
    ) {
        return res.status(400).json({
            success: false,
            message: "Room number, type and price are required."
        });
    }

    // Check price
    if (Number(price) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Price must be greater than 0."
        });
    }

    next();
}


// ======================================================
// BOOKING VALIDATION
// ======================================================

function validateBooking(req, res, next) {

    const room_id = req.body.room_id;
    const guest_name = req.body.guest_name;
    const check_in = req.body.check_in;
    const check_out = req.body.check_out;
    const guests = req.body.guests;

    // Check required fields
    if (
        !room_id ||
        !guest_name ||
        !check_in ||
        !check_out
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Room, guest name, check-in and check-out dates are required."
        });
    }

    // Check dates
    if (check_out <= check_in) {
        return res.status(400).json({
            success: false,
            message:
                "Check-out date must be after check-in date."
        });
    }

    // Check guests
    if (
        guests !== undefined &&
        guests !== "" &&
        Number(guests) < 1
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Number of guests must be at least 1."
        });
    }

    next();
}


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    validateRoom: validateRoom,
    validateBooking: validateBooking
};