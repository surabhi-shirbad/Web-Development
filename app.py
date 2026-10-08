from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DATABASE = os.path.join(
    os.path.dirname(__file__),
    "..",
    "hotel.db"
)


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/")
def home():
    return jsonify({
        "message": "StayEase Flask Backend Running"
    })


@app.route("/api/rooms", methods=["GET"])
def get_rooms():

    conn = get_db()

    rooms = conn.execute(
        "SELECT * FROM Rooms"
    ).fetchall()

    conn.close()

    return jsonify([
        dict(room)
        for room in rooms
    ])


@app.route("/api/rooms", methods=["POST"])
def add_room():

    data = request.json

    conn = get_db()

    try:

        cursor = conn.execute(
            """
            INSERT INTO Rooms
            (room_no, type, price, status)
            VALUES (?, ?, ?, ?)
            """,
            (
                data["room_no"],
                data["type"],
                data["price"],
                data.get(
                    "status",
                    "Available"
                )
            )
        )

        conn.commit()

        room_id = cursor.lastrowid

        conn.close()

        return jsonify({
            "success": True,
            "message": "Room added",
            "id": room_id
        }), 201

    except Exception as e:

        conn.close()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


@app.route("/api/rooms/<int:room_id>", methods=["DELETE"])
def delete_room(room_id):

    conn = get_db()

    conn.execute(
        "DELETE FROM Rooms WHERE id = ?",
        (room_id,)
    )

    conn.commit()

    conn.close()

    return jsonify({
        "success": True,
        "message": "Room deleted"
    })


@app.route("/api/bookings", methods=["GET"])
def get_bookings():

    conn = get_db()

    bookings = conn.execute(
        """
        SELECT
            b.*,
            r.room_no,
            r.type,
            r.price
        FROM Bookings b
        JOIN Rooms r
        ON b.room_id = r.id
        ORDER BY b.id DESC
        """
    ).fetchall()

    conn.close()

    return jsonify([
        dict(booking)
        for booking in bookings
    ])


if __name__ == "__main__":

    print(
        "Flask server running at "
        "http://localhost:5000"
    )

    app.run(
        port=5000,
        debug=True
    )