
    // Handle back button click
    document.querySelector('.back-button').addEventListener('click', () => {
        window.history.back(); 
    });
    


    let buses = []; 

    document.addEventListener("DOMContentLoaded", async () => {
        const busListContainer = document.getElementById("busListContainer");
        const loader = document.querySelector(".loader"); 
        const urlParams = new URLSearchParams(window.location.search);
        const from = urlParams.get("from");
        const to = urlParams.get("to");
        const date = urlParams.get("date");
    
        if (!from || !to || !date) {
            busListContainer.innerHTML = "<p>Invalid search parameters.</p>";
            return;
        }
    
        try {
            loader.style.display = "block";  
            const startTime = Date.now();
    
            const response = await fetch(`http://localhost:8080/api/buses/search?from=${from}&to=${to}&date=${date}`);
    
            if (!response.ok) {
                throw new Error("Failed to fetch bus details");
            }
    
            buses = await response.json();  
            console.log("Fetched Buses:", buses);
            console.log(buses[0].id)
    
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime); 
    
            setTimeout(() => {
                loader.style.display = "none"; 
                displayBuses(buses);  
            }, remainingTime);
    
        } catch (error) {
            console.error("Error fetching bus details:", error);
            busListContainer.innerHTML = "<p>No buses or fethch Error. Please try again.</p>";
            loader.style.display = "none"; 
        }
    });
    
    function displayBuses(filteredBuses) {
        const busListContainer = document.getElementById("busListContainer");
        busListContainer.innerHTML = ""; // Clear previous buses
    
        if (filteredBuses.length === 0) {
            busListContainer.innerHTML = "<p>No buses available.</p>";
            return;
        }
    
        filteredBuses.forEach((bus, index) => {
            const busItem = document.createElement("div");
            busItem.classList.add("bus-item");
            busItem.setAttribute("id", `bus-item-${index}`); // Unique ID for each bus item
            
            busItem.innerHTML = `
                <div id="bus-header-${index}" class="bus-header">
                    <h5>${bus.busName} (${bus.busType})</h5>
                     <p><strong>Amenities:</strong> 
                        ${bus.amenities.ac ? "AC, " : ""}
                        ${bus.amenities.blankets ? "Blankets, " : ""}
                        ${bus.amenities.waterBottle ? "Water Bottle" : "None"}
                    </p>
                </div>
                <div id="bus-amenities-${index}" class="bus-amenities">
                   
                    <p><strong>Seats:</strong> ${bus.seatCount} | 
                       <strong>Seater Fare:</strong> ₹${bus.seaterFare || "N/A"} | 
                       <strong>Sleeper Fare:</strong> ₹${bus.sleeperFare || "N/A"}
                    </p>
                </div>
                <div id="bus-route-${index}" class="bus-route">
                    <p><strong>From:</strong> ${bus.fromPlace} → <strong>To:</strong> ${bus.toPlace}</p>
                </div>
                <div id="bus-departure-${index}" class="bus-departure">
                    <p><strong>Departure:</strong> ${bus.departureDate} at ${bus.departureTime}</p>
                </div>
                <div id="bus-arrival-${index}" class="bus-arrival">
                    <p><strong>Arrival:</strong> ${bus.arrivalDate} at ${bus.arrivalTime}</p>
                </div>
                <button id="buy-now-btn-${index}" class="buy-now-btn" data-bus='${encodeURIComponent(JSON.stringify(bus))}'>BUY NOW</button>
            `;
        
            busListContainer.appendChild(busItem);
        });
        
    
        // Add event listeners to all "BUY NOW" buttons
        document.querySelectorAll(".buy-now-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                const busData = JSON.parse(decodeURIComponent(event.target.getAttribute("data-bus")));
                redirectToSeatPage(busData);
            });
        });
    }
    function redirectToSeatPage(bus) {
        const urlParams = new URLSearchParams();
        urlParams.append("busId",buses[0].id);
       
        urlParams.append("busName", bus.busName);
        urlParams.append("from", bus.fromPlace);
        urlParams.append("to", bus.toPlace);
        urlParams.append("date", bus.departureDate);
        urlParams.append("departureTime", bus.departureTime);
        urlParams.append("arrivalDate", bus.arrivalDate);
        urlParams.append("arrivalTime", bus.arrivalTime);
        urlParams.append("busType", bus.busType);
        urlParams.append("seatCount", bus.seatCount);
    
        // Correct seatPrice handling
        let seatPrice = "N/A"; // Default price
        if (bus.busType.toLowerCase() === "seater") {
            seatPrice = bus.seaterFare;  // Pass the seater fare here
        } else if (bus.busType.toLowerCase() === "sleeper") {
            seatPrice = bus.sleeperFare;  // Pass the sleeper fare here
        } else if (bus.busType.toLowerCase() === "seater + sleeper") {
            seatPrice = `${bus.seaterFare || "N/A"} | ${bus.sleeperFare || "N/A"}`;  // Handle mixed fares
        }
    
        // Log the seat price for debugging
        console.log("Seat Price:", seatPrice);
       

    
        // Append seatPrice to the URL
        urlParams.append("seatPrice", seatPrice);
    
        // Encode amenities as a single string
        let amenities = [];
        if (bus.amenities.ac) amenities.push("AC");
        if (bus.amenities.blankets) amenities.push("Blankets");
        if (bus.amenities.waterBottle) amenities.push("Water Bottle");
        urlParams.append("amenities", amenities.length > 0 ? amenities.join(", ") : "None");
    
        // Log the URL for debugging before redirecting
        console.log("Redirect URL:", `/Paruvatha_Bus_Booking_Website/public/seatpage.html?${urlParams.toString()}`);
    
        // Redirect to the seat booking page with all the necessary details
        window.location.href = `/Paruvatha_Bus_Booking_Website/public/seatpage.html?${urlParams.toString()}`;
    }
   
    document.getElementById("seater").addEventListener("click", () => toggleFilter("seater"));
    document.getElementById("sleeper").addEventListener("click", () => toggleFilter("sleeper"));
    document.getElementById("ac").addEventListener("click", () => toggleFilter("ac"));
    document.getElementById("waterBottle").addEventListener("click", () => toggleFilter("waterBottle"));
    document.getElementById("blankets").addEventListener("click", () => toggleFilter("blankets"));
    
  
    function toggleFilter(filterType) {
        const filterButton = document.getElementById(filterType);
        filterButton.classList.toggle("selected");
        applyFilters();  
    }
    
    
    function applyFilters() {
        const selectedBusTypes = getSelectedBusTypes();
        const selectedAmenities = getSelectedAmenities();
    
        const filteredBuses = buses.filter(bus => {
            const busTypeMatch = selectedBusTypes.length === 0 || selectedBusTypes.includes(bus.busType);
            const amenitiesMatch = selectedAmenities.every(amenity => bus.amenities[amenity]);
            return busTypeMatch && amenitiesMatch;
        });
    
        displayBuses(filteredBuses);
    }
    
    function getSelectedBusTypes() {
        const selectedBusTypes = [];
        if (document.getElementById("seater").classList.contains("selected")) {
            selectedBusTypes.push("seater");
        }
        if (document.getElementById("sleeper").classList.contains("selected")) {
            selectedBusTypes.push("sleeper");
        }
        return selectedBusTypes;
    }
    
    function getSelectedAmenities() {
        const selectedAmenities = [];
        if (document.getElementById("ac").classList.contains("selected")) {
            selectedAmenities.push("ac");
        }
        if (document.getElementById("waterBottle").classList.contains("selected")) {
            selectedAmenities.push("waterBottle");
        }
        if (document.getElementById("blankets").classList.contains("selected")) {
            selectedAmenities.push("blankets");
        }
        return selectedAmenities;
    }
    