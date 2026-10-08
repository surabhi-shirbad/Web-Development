const express = require("express");
const cors = require("cors");
const path = require("path");


// ======================================================
// DATABASE
// ======================================================
const db = require("./database/db");


// ======================================================
// ROUTES
// ======================================================
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");


// ======================================================
// APP
// ======================================================
const app = express();

const PORT = 3000;


// ======================================================
// MIDDLEWARE
// ======================================================
app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ======================================================
// SERVE FRONTEND
// ======================================================
app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ======================================================
// API ROUTES
// ======================================================
app.use(
    "/api/rooms",
    roomRoutes
);


app.use(
    "/api/bookings",
    bookingRoutes
);


// ======================================================
// STATISTICS API
// ======================================================
app.get(
    "/api/stats",
    (req, res) => {

        const sql = `
            SELECT

            (
                SELECT COUNT(*)
                FROM Rooms
            ) AS totalRooms,


            (
                SELECT COUNT(*)
                FROM Rooms
                WHERE status = 'Available'
            ) AS availableRooms,


            (
                SELECT COUNT(*)
                FROM Bookings
                WHERE status = 'Booked'
            ) AS activeBookings,


            (
                SELECT COALESCE(
                    SUM(
                        CASE
                            WHEN b.status = 'Booked'
                            THEN
                                (
                                    julianday(b.check_out)
                                    -
                                    julianday(b.check_in)
                                )
                                *
                                r.price

                            ELSE 0
                        END
                    ),
                    0
                )

                FROM Bookings b

                JOIN Rooms r
                    ON b.room_id = r.id
            ) AS revenue
        `;


        db.get(
            sql,
            [],
            (err, row) => {

                if (err) {

                    console.error(
                        "Stats error:",
                        err.message
                    );

                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }


                res.json({
                    success: true,
                    stats: row
                });
            }
        );
    }
);


// ======================================================
// HOME PAGE
// ======================================================
app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );
    }
);


// ======================================================
// 404 HANDLER
// ======================================================
app.use(
    (req, res) => {

        res.status(404).json({
            success: false,
            message: "API route not found."
        });
    }
);


// ======================================================
// START SERVER
// ======================================================
app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "======================================"
        );

        console.log(
            "🏨 StayEase Hotel Booking System"
        );

        console.log(
            "======================================"
        );

        console.log(
            `🚀 Server: http://localhost:${PORT}`
        );

        console.log(
            "======================================"
        );
    }
);