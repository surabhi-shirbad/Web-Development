let allRooms = [];


// =====================================
// PAGE NAVIGATION
// =====================================

function showSection(sectionId, button = null) {

    document.querySelectorAll(".section")
        .forEach(section => {
            section.classList.remove("active");
        });

    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active");
    }


    document.querySelectorAll(".nav-item")
        .forEach(item => {
            item.classList.remove("active");
        });


    if (button) {
        button.classList.add("active");
    } else {

        const navButtons =
            document.querySelectorAll(".nav-item");

        navButtons.forEach(item => {

            if (
                item.textContent
                    .toLowerCase()
                    .includes(
                        sectionId === "search"
                            ? "find"
                            : sectionId
                    )
            ) {
                item.classList.add("active");
            }

        });
    }


    const titles = {

        dashboard: [
            "Dashboard",
            "Welcome back! Here's your hotel overview."
        ],

        rooms: [
            "Room Management",
            "Manage all hotel rooms."
        ],

        bookings: [
            "Bookings",
            "View and manage reservations."
        ],

        search: [
            "Find a Room",
            "Search available rooms by type and dates."
        ]

    };


    if (titles[sectionId]) {

        document.getElementById("pageTitle")
            .textContent = titles[sectionId][0];

        document.getElementById("pageSubtitle")
            .textContent = titles[sectionId][1];
    }


    if (sectionId === "rooms") {
        loadRooms();
    }

    if (sectionId === "bookings") {
        loadBookings();
    }
}


// =====================================
// TOAST
// =====================================

function showToast(message, success = true) {

    const toast =
        document.getElementById("toast");

    const icon =
        document.getElementById("toastIcon");

    const messageElement =
        document.getElementById("toastMessage");


    icon.textContent =
        success ? "✓" : "!";

    messageElement.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


// =====================================
// LOAD EVERYTHING
// =====================================

function loadAllData() {

    loadStats();

    loadRooms();

    loadBookings();

    showToast("Dashboard refreshed");
}


// =====================================
// STATISTICS
// =====================================

async function loadStats() {

    try {

        const response =
            await fetch("/api/stats");

        const data =
            await response.json();


        if (!data.success) {
            throw new Error(data.message);
        }


        const stats = data.stats;


        document.getElementById("totalRooms")
            .textContent = stats.totalRooms || 0;

        document.getElementById("availableRooms")
            .textContent = stats.availableRooms || 0;

        document.getElementById("activeBookings")
            .textContent = stats.activeBookings || 0;


        const revenue =
            Number(stats.revenue || 0);

        document.getElementById("revenue")
            .textContent =
            "₹" +
            revenue.toLocaleString("en-IN");

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load statistics",
            false
        );
    }
}


// =====================================
// ROOMS
// =====================================

async function loadRooms() {

    try {

        const response =
            await fetch("/api/rooms");

        const data =
            await response.json();


        if (!data.success) {
            throw new Error(data.message);
        }


        allRooms = data.rooms;

        displayRooms(allRooms);

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load rooms",
            false
        );
    }
}


function displayRooms(rooms) {

    const table =
        document.getElementById("roomsTable");


    if (!rooms.length) {

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <div>🛏️</div>
                        <h3>No rooms available</h3>
                        <p>Add your first hotel room.</p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        rooms.map(room => {

            const statusClass =
                room.status.toLowerCase();


            return `
                <tr>

                    <td>
                        <span class="room-number">
                            #${escapeHTML(room.room_no)}
                        </span>
                    </td>

                    <td>
                        ${escapeHTML(room.type)}
                    </td>

                    <td>
                        ₹${Number(room.price)
                            .toLocaleString("en-IN")}
                    </td>

                    <td>
                        <span class="badge ${statusClass}">
                            ${escapeHTML(room.status)}
                        </span>
                    </td>

                    <td>

                        ${
                            room.status === "Available"
                            ?
                            `<button
                                class="action-btn book"
                                onclick="openBooking(
                                    ${room.id},
                                    '${escapeAttribute(room.room_no)}',
                                    '${escapeAttribute(room.type)}'
                                )">
                                Book
                            </button>`
                            :
                            ""
                        }

                        <button
                            class="action-btn delete"
                            onclick="deleteRoom(${room.id})">
                            Delete
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}


// =====================================
// ADD ROOM MODAL
// =====================================

function openRoomModal() {

    document
        .getElementById("roomModal")
        .classList.add("show");

    document
        .getElementById("roomForm")
        .reset();
}


function closeRoomModal() {

    document
        .getElementById("roomModal")
        .classList.remove("show");
}


// =====================================
// ADD ROOM
// =====================================

document
    .getElementById("roomForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const room = {

            room_no:
                document
                    .getElementById("roomNo")
                    .value,

            type:
                document
                    .getElementById("roomType")
                    .value,

            price:
                document
                    .getElementById("roomPrice")
                    .value,

            status: "Available"
        };


        try {

            const response =
                await fetch("/api/rooms", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(room)
                });


            const data =
                await response.json();


            if (!response.ok) {
                throw new Error(data.message);
            }


            closeRoomModal();

            showToast(
                "Room added successfully!"
            );


            await loadAllData();

        } catch (error) {

            showToast(
                error.message,
                false
            );
        }

    });


// =====================================
// DELETE ROOM
// =====================================

async function deleteRoom(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this room?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/rooms/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(data.message);
        }


        showToast(
            "Room deleted successfully!"
        );


        await loadAllData();

    } catch (error) {

        showToast(
            error.message,
            false
        );
    }
}


// =====================================
// SEARCH ROOMS
// =====================================

async function searchRooms() {

    const type =
        document
            .getElementById("searchType")
            .value;

    const checkIn =
        document
            .getElementById("searchCheckIn")
            .value;

    const checkOut =
        document
            .getElementById("searchCheckOut")
            .value;


    if (!checkIn || !checkOut) {

        showToast(
            "Please select check-in and check-out dates.",
            false
        );

        return;
    }


    if (checkOut <= checkIn) {

        showToast(
            "Check-out must be after check-in.",
            false
        );

        return;
    }


    try {

        const params =
            new URLSearchParams({
                type,
                check_in: checkIn,
                check_out: checkOut
            });


        const response =
            await fetch(
                `/api/rooms/search?${params}`
            );


        const data =
            await response.json();


        if (!data.success) {
            throw new Error(data.message);
        }


        displaySearchResults(
            data.rooms
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Search failed",
            false
        );
    }
}


// =====================================
// DISPLAY SEARCH RESULTS
// =====================================

function displaySearchResults(rooms) {

    const container =
        document.getElementById(
            "searchResults"
        );


    if (!rooms.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>😔</div>
                <h3>No rooms found</h3>
                <p>
                    No rooms are available
                    for these dates.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        rooms.map(room => {

            return `
                <div class="room-card">

                    <div class="room-image">
                        ${
                            room.type === "Suite"
                            ? "👑"
                            :
                            room.type === "Deluxe"
                            ? "🌟"
                            :
                            room.type === "Executive"
                            ? "💎"
                            :
                            "🛏️"
                        }
                    </div>

                    <div class="room-info">

                        <div class="room-top">

                            <div>
                                <h3>
                                    Room #${escapeHTML(
                                        room.room_no
                                    )}
                                </h3>

                                <p class="room-type">
                                    ${escapeHTML(
                                        room.type
                                    )}
                                </p>
                            </div>

                            <span class="badge available">
                                Available
                            </span>

                        </div>


                        <div class="room-price">

                            ₹${Number(room.price)
                                .toLocaleString("en-IN")}

                            <small>
                                / night
                            </small>

                        </div>


                        <button
                            class="primary-btn"
                            onclick="openBooking(
                                ${room.id},
                                '${escapeAttribute(room.room_no)}',
                                '${escapeAttribute(room.type)}'
                            )">
                            Book This Room
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


// =====================================
// BOOKING MODAL
// =====================================

function openBooking(
    roomId,
    roomNo,
    roomType
) {

    document
        .getElementById("bookingRoomId")
        .value = roomId;


    document
        .getElementById("bookingRoomInfo")
        .textContent =
        `Room #${roomNo} • ${roomType}`;


    document
        .getElementById("bookingForm")
        .reset();


    document
        .getElementById("bookingRoomId")
        .value = roomId;


    document
        .getElementById("bookingModal")
        .classList.add("show");
}


function closeBookingModal() {

    document
        .getElementById("bookingModal")
        .classList.remove("show");
}


// =====================================
// CREATE BOOKING
// =====================================

document
    .getElementById("bookingForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const booking = {

            room_id:
                document
                    .getElementById("bookingRoomId")
                    .value,

            guest_name:
                document
                    .getElementById("guestName")
                    .value,

            email:
                document
                    .getElementById("guestEmail")
                    .value,

            phone:
                document
                    .getElementById("guestPhone")
                    .value,

            check_in:
                document
                    .getElementById("bookingCheckIn")
                    .value,

            check_out:
                document
                    .getElementById("bookingCheckOut")
                    .value,

            guests:
                document
                    .getElementById("bookingGuests")
                    .value
        };


        try {

            const response =
                await fetch(
                    "/api/bookings",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(booking)
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {
                throw new Error(data.message);
            }


            closeBookingModal();


            showToast(
                "🎉 Room booked successfully!"
            );


            await loadAllData();


            // Refresh search if visible
            if (
                document
                    .getElementById("search")
                    .classList.contains("active")
            ) {
                searchRooms();
            }


        } catch (error) {

            showToast(
                error.message,
                false
            );
        }

    });


// =====================================
// BOOKINGS
// =====================================

async function loadBookings() {

    try {

        const response =
            await fetch("/api/bookings");

        const data =
            await response.json();


        if (!data.success) {
            throw new Error(data.message);
        }


        displayBookings(
            data.bookings
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load bookings",
            false
        );
    }
}


function displayBookings(bookings) {

    const table =
        document.getElementById(
            "bookingsTable"
        );


    if (!bookings.length) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div>📋</div>
                        <h3>No bookings yet</h3>
                        <p>
                            Your reservations will appear here.
                        </p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        bookings.map(booking => {

            const statusClass =
                booking.status.toLowerCase();


            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                booking.guest_name
                            )}
                        </strong>
                    </td>

                    <td>
                        <span class="room-number">
                            #${escapeHTML(
                                booking.room_no
                            )}
                        </span>
                    </td>

                    <td>
                        ${formatDate(
                            booking.check_in
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            booking.check_out
                        )}
                    </td>

                    <td>
                        ${booking.guests}
                    </td>

                    <td>
                        <span class="badge ${statusClass}">
                            ${escapeHTML(
                                booking.status
                            )}
                        </span>
                    </td>

                    <td>

                        ${
                            booking.status === "Booked"
                            ?
                            `<button
                                class="action-btn cancel"
                                onclick="cancelBooking(
                                    ${booking.id}
                                )">
                                Cancel
                            </button>`
                            :
                            "-"
                        }

                    </td>

                </tr>
            `;

        }).join("");
}


// =====================================
// CANCEL BOOKING
// =====================================

async function cancelBooking(id) {

    const confirmed =
        confirm(
            "Are you sure you want to cancel this booking?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/bookings/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(data.message);
        }


        showToast(
            "Booking cancelled successfully."
        );


        await loadAllData();


        if (
            document
                .getElementById("bookings")
                .classList.contains("active")
        ) {
            loadBookings();
        }

    } catch (error) {

        showToast(
            error.message,
            false
        );
    }
}


// =====================================
// HELPERS
// =====================================

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");
}


// =====================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// =====================================

window.addEventListener("click", function(event) {

    const roomModal =
        document.getElementById("roomModal");

    const bookingModal =
        document.getElementById("bookingModal");


    if (event.target === roomModal) {
        closeRoomModal();
    }

    if (event.target === bookingModal) {
        closeBookingModal();
    }
});


// =====================================
// INITIAL LOAD
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadStats();

        loadRooms();

        loadBookings();

    }
);