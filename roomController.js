const db = require("../database/db");


// ======================================================
// GET ALL ROOMS
// GET /api/rooms
// ======================================================

exports.getRooms = (req, res) => {

    const sql = `
        SELECT *
        FROM Rooms
        ORDER BY CAST(room_no AS INTEGER), id
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {

            console.error(
                "Get rooms error:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            rooms: rows
        });
    });
};


// ======================================================
// GET SINGLE ROOM
// GET /api/rooms/:id
// ======================================================

exports.getRoomById = (req, res) => {

    const { id } = req.params;

    db.get(
        `SELECT * FROM Rooms WHERE id = ?`,
        [id],
        (err, row) => {

            if (err) {

                console.error(
                    "Get room error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (!row) {

                return res.status(404).json({
                    success: false,
                    message: "Room not found."
                });
            }

            res.json({
                success: true,
                room: row
            });
        }
    );
};


// ======================================================
// ADD ROOM
// POST /api/rooms
// ======================================================

exports.addRoom = (req, res) => {

    const {
        room_no,
        type,
        price,
        status = "Available"
    } = req.body;


    const sql = `
        INSERT INTO Rooms
        (
            room_no,
            type,
            price,
            status
        )
        VALUES (?, ?, ?, ?)
    `;


    db.run(
        sql,
        [
            room_no.trim(),
            type,
            Number(price),
            status
        ],
        function (err) {

            if (err) {

                if (
                    err.message.includes("UNIQUE")
                ) {

                    return res.status(409).json({
                        success: false,
                        message:
                            "Room number already exists."
                    });
                }


                console.error(
                    "Add room error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }


            res.status(201).json({
                success: true,
                message:
                    "Room added successfully.",
                roomId: this.lastID
            });
        }
    );
};


// ======================================================
// UPDATE ROOM
// PUT /api/rooms/:id
// ======================================================

exports.updateRoom = (req, res) => {

    const { id } = req.params;

    const {
        room_no,
        type,
        price,
        status
    } = req.body;


    const sql = `
        UPDATE Rooms
        SET
            room_no = ?,
            type = ?,
            price = ?,
            status = ?
        WHERE id = ?
    `;


    db.run(
        sql,
        [
            room_no,
            type,
            Number(price),
            status || "Available",
            id
        ],
        function (err) {

            if (err) {

                if (
                    err.message.includes("UNIQUE")
                ) {

                    return res.status(409).json({
                        success: false,
                        message:
                            "Room number already exists."
                    });
                }


                console.error(
                    "Update room error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }


            if (this.changes === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Room not found."
                });
            }


            res.json({
                success: true,
                message:
                    "Room updated successfully."
            });
        }
    );
};


// ======================================================
// DELETE ROOM
// DELETE /api/rooms/:id
// ======================================================

exports.deleteRoom = (req, res) => {

    const { id } = req.params;


    // Check active bookings first
    db.get(
        `
        SELECT COUNT(*) AS count
        FROM Bookings
        WHERE room_id = ?
        AND status = 'Booked'
        `,
        [id],
        (err, row) => {

            if (err) {

                console.error(
                    "Check booking error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }


            // Don't delete if room has active booking
            if (row.count > 0) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Cannot delete a room with active bookings."
                });
            }


            // Delete room
            db.run(
                `
                DELETE FROM Rooms
                WHERE id = ?
                `,
                [id],
                function (err) {

                    if (err) {

                        console.error(
                            "Delete room error:",
                            err.message
                        );

                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }


                    if (this.changes === 0) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "Room not found."
                        });
                    }


                    res.json({
                        success: true,
                        message:
                            "Room deleted successfully."
                    });
                }
            );
        }
    );
};


// ======================================================
// SEARCH AVAILABLE ROOMS
// GET /api/rooms/search
// ======================================================

exports.searchRooms = (req, res) => {

    const {
        type,
        check_in,
        check_out
    } = req.query;


    let sql = `
        SELECT r.*
        FROM Rooms r
        WHERE 1 = 1
    `;


    const params = [];


    // Filter by room type
    if (
        type &&
        type !== "All"
    ) {

        sql += `
            AND r.type = ?
        `;

        params.push(type);
    }


    // Check room availability for dates
    if (
        check_in &&
        check_out
    ) {

        sql += `
            AND NOT EXISTS (

                SELECT 1
                FROM Bookings b

                WHERE b.room_id = r.id

                AND b.status = 'Booked'

                AND b.check_in < ?

                AND b.check_out > ?
            )
        `;

        params.push(
            check_out,
            check_in
        );
    }


    sql += `
        ORDER BY r.price ASC
    `;


    db.all(
        sql,
        params,
        (err, rows) => {

            if (err) {

                console.error(
                    "Search rooms error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }


            res.json({
                success: true,
                rooms: rows
            });
        }
    );
};