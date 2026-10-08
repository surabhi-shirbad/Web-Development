const sqlite3 = require("sqlite3").verbose();
const path = require("path");


// ======================================================
// DATABASE PATH
// ======================================================
const dbPath = path.join(
    __dirname,
    "..",
    "hotel.db"
);


// ======================================================
// CONNECT DATABASE
// ======================================================
const db = new sqlite3.Database(
    dbPath,
    (err) => {

        if (err) {

            console.error(
                "❌ Database connection error:",
                err.message
            );

        } else {

            console.log(
                "✅ Connected to SQLite database"
            );
        }
    }
);


// ======================================================
// CREATE TABLES
// ======================================================
db.serialize(() => {

    // ROOMS TABLE
    db.run(
        `
        CREATE TABLE IF NOT EXISTS Rooms (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            room_no TEXT UNIQUE NOT NULL,

            type TEXT NOT NULL,

            price REAL NOT NULL,

            status TEXT DEFAULT 'Available'
        )
        `,
        (err) => {

            if (err) {

                console.error(
                    "Rooms table error:",
                    err.message
                );
            }
        }
    );


    // BOOKINGS TABLE
    db.run(
        `
        CREATE TABLE IF NOT EXISTS Bookings (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            room_id INTEGER NOT NULL,

            guest_name TEXT NOT NULL,

            email TEXT,

            phone TEXT,

            check_in TEXT NOT NULL,

            check_out TEXT NOT NULL,

            guests INTEGER DEFAULT 1,

            status TEXT DEFAULT 'Booked',

            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY(room_id)
                REFERENCES Rooms(id)
        )
        `,
        (err) => {

            if (err) {

                console.error(
                    "Bookings table error:",
                    err.message
                );
            }
        }
    );


    console.log(
        "✅ Database tables ready"
    );
});


module.exports = db;