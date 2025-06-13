document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const busId = urlParams.get("busId");
    const busName = urlParams.get("busName");
    const from = urlParams.get("from");
    const to = urlParams.get("to");
    const date = urlParams.get("date");
    const busType = urlParams.get("busType");
    const seatPrice = parseFloat(urlParams.get("seatPrice")) || 0;
    const seatCount = parseInt(urlParams.get("seatCount")) || 0;

    if (!busId || !date) {
        console.error("Missing busId or date in URL");
        return;
    }

    document.getElementById("busTitle").innerText = `${busName} (${busType})`;
    document.getElementById("route").innerText = `From: ${from} → To: ${to}`;
    document.getElementById("date").innerText = `Date: ${date}`;
    document.getElementById("seatInfo").innerText = `Available Seats: ${seatCount}`;

    const lowerDeck = document.getElementById("lowerDeck");
    const upperDeck = document.getElementById("upperDeck");

    if (!lowerDeck || !upperDeck) {
        console.error("Lower or Upper Deck not found in HTML!");
        return;
    }

    if (busType) {
        generateSeatLayout(busType, seatCount, lowerDeck, upperDeck, seatPrice);
    } else {
        console.error("Bus Type is missing or invalid!");
    }

    fetchBookedSeats(busId, date);
    setupSeatSelection(seatPrice, busId, busName, from, to, date, busType);
});

function fetchBookedSeats(busId, travelDate) {
    fetch(`http://localhost:8080/api/seats/booked?busId=${busId}&date=${travelDate}`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch booked seats.");
            return response.json();
        })
        .then(bookedSeats => {
            bookedSeats.forEach(seat => {
                const seatElement = document.querySelector(`[data-seat-number="${seat}"]`);
                if (seatElement) {
                    seatElement.classList.add("booked");
                    seatElement.classList.remove("selected");
                }
            });
        })
        .catch(error => console.error("Error fetching booked seats:", error));
}
///this is the seat availability

function createSeat(seatNumber, seatPrice) {
    const seat = document.createElement("div");
    seat.classList.add("seat");
    seat.innerText = seatNumber;
    seat.dataset.seatNumber = seatNumber;
    seat.dataset.price = seatPrice;
    return seat;
}

function generateSeaterLayout(seatCount, lowerDeck, seatPrice) {
    for (let i = 1; i <= seatCount; i++) {
        lowerDeck.appendChild(createSeat(`S${i}`, seatPrice));
    }
}

function generateSleeperLayout(seatCount, lowerDeck, upperDeck, seatPrice) {
    const half = Math.ceil(seatCount / 2);
    for (let i = 1; i <= half; i++) {
        lowerDeck.appendChild(createSeat(`SL${i}`, seatPrice));
    }
    for (let i = 1; i <= seatCount - half; i++) {
        upperDeck.appendChild(createSeat(`SU${i}`, seatPrice));
    }
}

function generateSeatLayout(busType, seatCount, lowerDeck, upperDeck, seatPrice) {
    lowerDeck.innerHTML = "";
    upperDeck.innerHTML = "";

    if (busType.toLowerCase() === "seater") {
        upperDeck.style.display = "none";
        generateSeaterLayout(seatCount, lowerDeck, seatPrice);
    } else if (busType.toLowerCase() === "sleeper") {
        upperDeck.style.display = "block";
        generateSleeperLayout(seatCount, lowerDeck, upperDeck, seatPrice);
    } else {
        console.error("Unsupported bus type:", busType);
    }
}

function setupSeatSelection(seatPrice, busId, busName, from, to, date, busType) {
    const selectedSeatsContainer = document.getElementById("selectedSeatsList");
    const totalAmountElement = document.getElementById("totalAmount");
    const proceedToPayment = document.getElementById("proceedToPayment");

    let selectedSeats = [];

    document.addEventListener("click", (event) => {
        const seat = event.target;
        if (!seat.classList.contains("seat") || seat.classList.contains("booked")) return;

        const seatNumber = seat.dataset.seatNumber;

        if (seat.classList.contains("selected")) {
            seat.classList.remove("selected");
            selectedSeats = selectedSeats.filter(s => s !== seatNumber);
            document.getElementById(`selectedSeat-${seatNumber}`)?.remove();
        } else {
            if (selectedSeats.length >= 6) {
                alert("You can select up to 6 seats only.");
                return;
            }
            seat.classList.add("selected");
            selectedSeats.push(seatNumber);

            const seatElement = document.createElement("div");
            seatElement.id = `selectedSeat-${seatNumber}`;
            seatElement.innerText = `Seat ${seatNumber} - ₹${seatPrice}`;
            selectedSeatsContainer.appendChild(seatElement);
        }

        totalAmountElement.innerText = `Total: ₹${selectedSeats.length * seatPrice}`;
        proceedToPayment.disabled = selectedSeats.length === 0;
    });

    proceedToPayment.addEventListener("click", () => {
        if (selectedSeats.length === 0) {
            alert("Please select at least one seat.");
            return;
        }
        showAsideSection(selectedSeats, seatPrice, busId, busName, from, to, date, busType);
    });
}

function showAsideSection(selectedSeats, seatPrice, busId, busName, from, to, date, busType) {
    const asideSection = document.getElementById("asideSection");
    const passengerForm = document.getElementById("passengerForm");
    const paymentBtn = document.getElementById("paymentBtn");
    const closeAside = document.getElementById("closeAside");
    const paymentForm = document.getElementById("paymentForm");

    passengerForm.innerHTML = "";
    selectedSeats.forEach((seat, index) => {
        passengerForm.innerHTML += `
            <div class="passenger-entry">
                <label>Passenger ${index + 1} (Seat ${seat})</label>
                <input type="text" placeholder="Full Name" required>
                <input type="tel" placeholder="Phone Number" required>
                <select required>
                    <option value="" disabled selected>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
        `;
    });

    asideSection.classList.add("show");
    closeAside.onclick = () => asideSection.classList.remove("show");

    paymentBtn.onclick = () => {
        const inputs = passengerForm.querySelectorAll("input, select");
        for (const input of inputs) {
            if (!input.value.trim()) {
                alert("Please fill all passenger details.");
                return;
            }
        }

        paymentForm.classList.remove("hidden");
        paymentBtn.classList.add("hidden");
    };

    paymentForm.onsubmit = (e) => {
        e.preventDefault();
    
        const userName = document.getElementById("userName").value.trim();
        const userPhone = document.getElementById("userPhone").value.trim();
        const userEmail = document.getElementById("userEmail").value.trim();
        const cardNumber = document.getElementById("cardNumber").value.trim();
        const cardPin = document.getElementById("cardPin").value.trim();
    
        if (!userName || !userPhone || !userEmail || !cardNumber || !cardPin) {
            alert("Please fill all payment fields.");
            return;
        }
    
        const bookingData = {
            busId,
            busName,
            from,
            to,
            date,
            busType,
            seatNumbers: selectedSeats,
            passengers: collectPassengerDetails(),
            user: {
                name: userName,
                phone: userPhone,
                email: userEmail
            }
        };
    
        
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "block";
    
        fetch("http://localhost:8080/api/seats/book", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData),
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to save booking");
            return response.json();
        })
        .then(data => {
            // Mark seats as booked in the UI
            selectedSeats.forEach(seatNumber => {
                const seatEl = document.querySelector(`[data-seat-number="${seatNumber}"]`);
                if (seatEl) {
                    seatEl.classList.remove("selected");
                    seatEl.classList.add("booked");
                }
            });
    
            // Hide loader after UI updates and confirmation
            setTimeout(() => {
                if (loader) loader.style.display = "none";
                asideSection.classList.remove("show");
                alert("Booking and Payment Successful!");
    
                // Send confirmation email
                fetch("http://localhost:8080/api/email/send-ticket", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: userName,
                        email: userEmail,
                        phone: userPhone,
                        busName,
                        from,
                        to,
                        date,
                        seatNumbers: selectedSeats
                    })
                })
                .then(res => res.ok ? console.log("Email sent") : console.error("Email failed"))
                .catch(err => console.error("Email error:", err));
            }, 3000); // You can adjust delay as needed
        })
        .catch(error => {
            console.error("Error saving booking:", error);
            alert("Booking failed. Please try again.");
            if (loader) loader.style.display = "none"; // Hide loader on failure
        });
    };
    

function collectPassengerDetails() {
    const entries = document.querySelectorAll(".passenger-entry");
    return Array.from(entries).map(entry => {
        const inputs = entry.querySelectorAll("input, select");
        return {
            name: inputs[0].value.trim(),
            phone: inputs[1].value.trim(),
            gender: inputs[2].value.trim()
        };
    });
}}

// Show the modal when Proceed to Payment is clicked
document.getElementById("paymentBtn").addEventListener("click", function () {
    document.getElementById("paymentModal").style.display = "block";
  });
  
  // Close the modal
  document.getElementById("closePaymentModal").addEventListener("click", function () {
    document.getElementById("paymentModal").style.display = "none";
  });
  
  // Optional: Close if user clicks outside the modal
  window.addEventListener("click", function (e) {
    const modal = document.getElementById("paymentModal");
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
  
  // Show aside
document.getElementById("proceedToPayment").addEventListener("click", () => {
    document.getElementById("asideSection").classList.add("show");
  });
  
  // Hide aside
  document.getElementById("closeAside").addEventListener("click", () => {
    document.getElementById("asideSection").classList.remove("show");
  });
  