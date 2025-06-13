document.addEventListener('DOMContentLoaded', () => {
    // Retrieve payment data stored in sessionStorage
    const paymentData = JSON.parse(sessionStorage.getItem('paymentData'));

    if (!paymentData) {
        alert('No payment data found!');
        window.location.href = "/Paruvatha_Bus_Booking_Website/public/"; // Redirect if no data found
        return;
    }

    const { seats, passengers, totalAmount } = paymentData;

    // Display selected seats and passenger details
    const seatsList = document.getElementById('seatsList');
    const totalAmountElement = document.getElementById('totalAmount');
    const passengerList = document.getElementById('passengerList');

    seats.forEach(seat => {
        const seatElement = document.createElement('div');
        seatElement.innerText = `Seat ${seat}`;
        seatsList.appendChild(seatElement);
    });

    passengers.forEach((passenger, index) => {
        const passengerElement = document.createElement('div');
        passengerElement.innerHTML = `
            <p>Passenger ${index + 1}: ${passenger.name} (Seat: ${seats[index]})</p>
            <p>Phone: ${passenger.phone}, Gender: ${passenger.gender}</p>
        `;
        passengerList.appendChild(passengerElement);
    });

    totalAmountElement.innerText = `Total Amount: ₹${totalAmount}`;

    // Payment form submission
    const paymentForm = document.getElementById('paymentForm');
    paymentForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const cardNumber = document.getElementById('cardNumber').value;
        const cardExp = document.getElementById('cardExp').value;
        const cardCvc = document.getElementById('cardCvc').value;

        if (!cardNumber || !cardExp || !cardCvc) {
            alert('Please enter all payment details.');
            return;
        }

        const paymentDetails = {
            seats,
            passengers,
            totalAmount,
            cardNumber,
            cardExp,
            cardCvc
        };

        // Send payment request to backend
        fetch("http://localhost:8080/api/payment", {  // Replace with your actual payment API URL
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paymentDetails)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Payment successful! Your seats are booked.');
                sessionStorage.removeItem('paymentData');  // Clear session data
                window.location.href = "/Paruvatha_Bus_Booking_Website/public/confirmation.html";  // Redirect to confirmation page
            } else {
                alert('Payment failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Payment error:', error);
            alert('There was an error processing your payment. Please try again.');
        });
    });
});
