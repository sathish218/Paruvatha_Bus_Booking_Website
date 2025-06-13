
const seatOptions = {
  seater: ["28", "30"],
  sleeper: ["30", "22"]
  
};

const form = document.getElementById("busForm");
const busTypeSelect = form.querySelector('select[name="busType"]');
const seatCountSelect = form.querySelector('select[name="seatCount"]');
const seatCountContainer = document.getElementById("seatCountContainer"); 
const seaterFareContainer = document.getElementById("seaterFareContainer");
const sleeperFareContainer = document.getElementById("sleeperFareContainer");

// Handle bus type change
busTypeSelect.addEventListener("change", function () {
  const busType = busTypeSelect.value;

  if (busType) {
    seatCountContainer.style.display = "block";
    seatCountSelect.innerHTML = '<option value="">Select Seat Count</option>';
    seatOptions[busType].forEach((count) => {
      const option = document.createElement("option");
      option.value = count;
      option.textContent = `${count} Seats`;
      seatCountSelect.appendChild(option);
    });
    seatCountSelect.setAttribute("required", "true");
  } else {
    seatCountContainer.style.display = "none";
    seatCountSelect.value = "";
    seatCountSelect.removeAttribute("required");
  }

  seaterFareContainer.style.display = busType === "seater" || busType === "seater-sleeper" ? "block" : "none";
  sleeperFareContainer.style.display = busType === "sleeper" || busType === "seater-sleeper" ? "block" : "none";
});

// Handle form submission
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Ensure seat count is visible before submission
  if (seatCountSelect.value === "") {
    seatCountContainer.style.display = "block";
    seatCountSelect.focus();
    return;
  }

  // Get form data
  const formData = {
    busName: form.busName.value.trim(),
    fromPlace: form.fromPlace.value.trim(),
    toPlace: form.toPlace.value.trim(),
    boardingPlace: form.boardingPlace.value.trim(),
    arrivalPlace: form.arrivalPlace.value.trim(),
    departureDate: form.departureDate.value,
    departureTime: form.departureTime.value,
    arrivalDate: form.arrivalDate.value,
    arrivalTime: form.arrivalTime.value,
    busType: form.busType.value,
    seatCount: form.seatCount.value,
    seaterFare: form.seaterFare ? form.seaterFare.value : "",
    sleeperFare: form.sleeperFare ? form.sleeperFare.value : "",
    amenities: {
      ac: form.ac.checked,
      blankets: form.blankets.checked,
      waterBottle: form.waterBottle.checked,
    },
  };

 
  if (!formData.busName || !formData.fromPlace || !formData.toPlace || !formData.departureDate || !formData.departureTime) {
    alert("Please fill all required fields!");
    return;
  }

  console.log("Submitting form:", formData);

  try {
    const response = await fetch("http://localhost:8080/api/buses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error(`Server error: ${errorText}`);
    }

    const result = await response.json();
    console.log("Success:", result);
    alert("Bus added successfully!");
    form.reset();
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Failed to add bus. Please try again.");
  }
});

const departureDate = document.getElementById("departureDate");
    const arrivalDate = document.getElementById("arrivalDate");
    const departureDisplay = document.getElementById("departureDisplay");
    const arrivalDisplay = document.getElementById("arrivalDisplay");

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;

    // Set today's date as minimum
    departureDate.min = formattedToday;
    arrivalDate.min = formattedToday;

    // Optional: Set default value as today
    departureDate.value = formattedToday;
    arrivalDate.value = formattedToday;

    // Update display on change
    departureDate.addEventListener("change", () => {
      departureDisplay.textContent = `Selected Departure: ${departureDate.value}`;
    });

    arrivalDate.addEventListener("change", () => {
      arrivalDisplay.textContent = `Selected Arrival: ${arrivalDate.value}`;
    });

    // Initial display
    departureDisplay.textContent = `Selected Departure: ${departureDate.value}`;
    arrivalDisplay.textContent = `Selected Arrival: ${arrivalDate.value}`;


    //// geoApify ////

    const apiKey = "564ed59afb5940f79af9eac965153fc9";

    async function fetchCitySuggestions(query, suggestionsContainer) {
      if (!query) {
        suggestionsContainer.innerHTML = "";
        return;
      }
    
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&type=city&format=json&apiKey=${apiKey}`;
    
      try {
        const response = await fetch(url);
        const data = await response.json();
    
        suggestionsContainer.innerHTML = "";
    
        if (!data.results || data.results.length === 0) {
          suggestionsContainer.innerHTML = "<p class='no-results'>No results found</p>";
          return;
        }
    
        const uniqueCities = new Set();
    
        data.results.forEach((place) => {
          const city = place.city || place.county || place.state;
    
          if (city && !uniqueCities.has(city)) {
            uniqueCities.add(city);
    
            const suggestionItem = document.createElement("div");
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.textContent = city;
    
            suggestionItem.addEventListener("click", () => {
              suggestionsContainer.previousElementSibling.value = city;
              suggestionsContainer.innerHTML = "";
            });
    
            suggestionsContainer.appendChild(suggestionItem);
          }
        });
      } catch (error) {
        console.error("Error fetching city suggestions:", error);
      }
    }
    
    const fromPlace = document.getElementById("fromPlace");
    const toPlace = document.getElementById("toPlace");
    const fromSuggestions = document.getElementById("fromSuggestions");
    const toSuggestions = document.getElementById("toSuggestions");
    
    fromPlace.addEventListener("input", () => {
      fetchCitySuggestions(fromPlace.value, fromSuggestions);
    });
    
    toPlace.addEventListener("input", () => {
      fetchCitySuggestions(toPlace.value, toSuggestions);
    });
    
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".input-group")) {
        fromSuggestions.innerHTML = "";
        toSuggestions.innerHTML = "";
      }
    });
    