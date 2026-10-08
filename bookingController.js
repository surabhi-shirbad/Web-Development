const db = require("../database/db");


// ======================================================
// GET ALL BOOKINGS
// GET /api/bookings
// ======================================================

exports.getBookings = (req, res) => {

    const sql = `
        SELECT
            b.id,
            b.room_id,
            b.guest_name,
            b.email,
            b.phone,
            b.check_in,
            b.check_out,
            b.guests,
            b.status,
            b.created_at,
            r.room_no,
            r.type,
            r.price

        FROM Bookings b

        JOIN Rooms r
            ON b.room_id = r.id

        ORDER BY b.id DESC
    `;


    db.all(
        sql,
        [],
        (err, rows) => {

            if (err) {

                console.error(
                    "Get bookings error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }


            res.json({
                success: true,
                bookings: rows
            });
        }
    );
};


// ======================================================
// CREATE BOOKING
// POST /api/bookings
// ======================================================

exports.createBooking = (req, res) => {

    const {
        room_id,
        guest_name,
        email,
        phone,
        check_in,
        check_out,
        guests = 1
    } = req.body;


    // --------------------------------------------------
    // CHECK ROOM
    // --------------------------------------------------

    db.get(
        `SELECT * FROM Rooms WHERE id = ?`,
        [room_id],
        (err, room) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }


            if (!room) {

                return res.status(404).json({
                    success: false,
                    message: "Room not found."
                });
            }


            // --------------------------------------------------
            // CHECK OVERLAPPING BOOKING
            // --------------------------------------------------

            const overlapSQL = `
                SELECT *
                FROM Bookings
                WHERE room_id = ?
                AND status = 'Booked'
                AND check_in < ?
                AND check_out > ?
            `;


            db.get(
                overlapSQL,
                [
                    room_id,
                    check_out,
                    check_in
                ],
                (err, existingBooking) => {

                    if (err) {

                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }


                    // Room already booked
                    if (existingBooking) {

                        return res.status(409).json({
                            success: false,
                            message:
                                "This room is already booked for the selected dates."
                        });
                    }


                    // --------------------------------------------------
                    // INSERT BOOKING
                    // --------------------------------------------------

                    const sql = `
                        INSERT INTO Bookings
                        (
                            room_id,
                            guest_name,
                            email,
                            phone,
                            check_in,
                            check_out,
                            guests,
                            status
                        )

                        VALUES
                        (?, ?, ?, ?, ?, ?, ?, 'Booked')
                    `;


                    db.run(
                        sql,
                        [
                            room_id,
                            guest_name.trim(),
                            email || "",
                            phone || "",
                            check_in,
                            check_out,
                            Number(guests)
                        ],
                        function (err) {

                            if (err) {

                                return res.status(500).json({
                                    success: false,
                                    message: err.message
                                });
                            }


                            res.status(201).json({
                                success: true,
                                message:
                                    "Room booked successfully.",
                                bookingId:
                                    this.lastID
                            });
                        }
                    );
                }
            );
        }
    );
};


// ======================================================
// CANCEL BOOKING
// DELETE /api/bookings/:id
// ======================================================

exports.cancelBooking = (req, res) => {

    const { id } = req.params;


    const sql = `
        UPDATE Bookings

        SET status = 'Cancelled'

        WHERE id = ?

        AND status = 'Booked'
    `;


    db.run(
        sql,
        [id],
        function (err) {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }


            if (this.changes === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Active booking not found."
                });
            }


            res.json({
                success: true,
                message:
                    "Booking cancelled successfully."
            });
        }
    );
};