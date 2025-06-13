document.addEventListener("DOMContentLoaded", () => {
  const ADMIN_EMAIL = "sathishsuganesan23@gmail.com";

  const userBtn = document.getElementById("userBtn");
  const modal = document.getElementById("authModal");
  const closeModal = document.getElementById("closeModal");
  const signupModal = document.getElementById("signupModal");
  const closeSignupModal = document.getElementById("closeSignupModal");
  const loginForm = document.getElementById("authForm");
  const signupForm = document.getElementById("signupForm");

  function parseJwt(token) {
      try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
              '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          ).join(''));
          return JSON.parse(jsonPayload);
      } catch (e) {
          console.error("Failed to parse JWT:", e);
          return null;
      }
  }

  function showAdminNavLink() {
      const nav = document.querySelector(".nav");

      // Prevent duplicate link
      if (document.getElementById("adminNavLink")) return;

      const link = document.createElement("a");
      link.href = "/Paruvatha_Bus_Booking_Website/public/adminpage.html";
      link.className = "nav-link";
      link.id = "adminNavLink";
      link.innerHTML = `
          <i data-lucide="user-cog"></i>
          <span>Admin Page</span>
      `;
      nav.insertBefore(link, userBtn);
  }

  function showUserProfile(fullName, email) {
      const initial = fullName.charAt(0).toUpperCase();
      userBtn.style.display = "none";

      const profileCircle = document.createElement("div");
      profileCircle.classList.add("profile-circle");
      profileCircle.textContent = initial;
      profileCircle.title = fullName;

      const headerNav = document.querySelector(".nav");
      headerNav.appendChild(profileCircle);

      const userAside = document.getElementById("userAside");
      const asideName = document.getElementById("asideName");
      const asideEmail = document.getElementById("asideEmail");
      asideName.textContent = fullName;
      asideEmail.textContent = email;

      profileCircle.addEventListener("click", () => {
          userAside.style.display = "block";
      });

      document.addEventListener("click", (e) => {
          if (!userAside.contains(e.target) && !profileCircle.contains(e.target)) {
              userAside.style.display = "none";
          }
      });

      const logoutBtn = document.getElementById("logoutBtn");
      logoutBtn.addEventListener("click", () => {
          localStorage.clear();
          location.reload();
      });
  }

  
  const token = localStorage.getItem("jwt");
  const name = localStorage.getItem("userName");
  if (token && name) {
      const decoded = parseJwt(token);
      if (decoded && decoded.sub === ADMIN_EMAIL) {
          showAdminNavLink();
      }
      showUserProfile(name, decoded?.sub || "");
  }

  loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const response = await fetch("http://localhost:8080/api/user-auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
          const data = await response.json();
          localStorage.setItem("jwt", data.token);
          localStorage.setItem("userName", data.fullName);

          const decoded = parseJwt(data.token);
          if (decoded && decoded.sub === ADMIN_EMAIL) {
              showAdminNavLink();
          }

          showUserProfile(data.fullName, decoded?.sub || "");
          modal.style.display = "none";
      } else {
          alert("Invalid credentials!");
      }
  });


  signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("signupName").value;
      const email = document.getElementById("signupEmail").value;
      const phone = document.getElementById("signupPhone").value;
      const password = document.getElementById("signupPassword").value;

      const response = await fetch("http://localhost:8080/api/user-auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, password }),
      });

      if (response.ok) {
          alert("Signup successful! Please login.");
          signupModal.style.display = "none";
      } else {
          alert("Signup failed!");
      }
  });

  // Modal controls
  userBtn.addEventListener("click", () => modal.style.display = "block");
  closeModal.addEventListener("click", () => modal.style.display = "none");
  closeSignupModal.addEventListener("click", () => signupModal.style.display = "none");

  document.getElementById("toggleAuth").addEventListener("click", () => {
      modal.style.display = "none";
      signupModal.style.display = "block";
  });

  document.getElementById("switchToLogin").addEventListener("click", () => {
      signupModal.style.display = "none";
      modal.style.display = "block";
  });
});


const apiKey = "564ed59afb5940f79af9eac965153fc9";

// Function to fetch city suggestions
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

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    const fromInput = document.getElementById("from");
    const toInput = document.getElementById("to");
    const dateInput = document.getElementById("date");
    const fromSuggestions = document.getElementById("fromSuggestions");
    const toSuggestions = document.getElementById("toSuggestions");

    fromInput.addEventListener("input", () => fetchCitySuggestions(fromInput.value, fromSuggestions));
    toInput.addEventListener("input", () => fetchCitySuggestions(toInput.value, toSuggestions));

    document.addEventListener("click", (event) => {
        if (!fromInput.contains(event.target) && !fromSuggestions.contains(event.target)) {
            fromSuggestions.innerHTML = "";
        }
        if (!toInput.contains(event.target) && !toSuggestions.contains(event.target)) {
            toSuggestions.innerHTML = "";
        }
    });

    document.getElementById("searchForm").addEventListener("submit", function (event) {
        event.preventDefault(); 
        searchBuses();
    });

    function searchBuses() {
        let fromPlace = fromInput.value.trim();
        let toPlace = toInput.value.trim();
        let selectedDate = dateInput.value.trim();

        if (fromPlace === "" || toPlace === "" || selectedDate === "") {
            alert("Please enter From, To, and Date before searching.");
            return;
        }

        if (fromPlace.toLowerCase() === toPlace.toLowerCase()) {
            alert("Departure and destination locations cannot be the same.");
            return;
        }

        let queryParams = new URLSearchParams({
            from: fromPlace,
            to: toPlace,
            date: selectedDate
        });

        window.location.href = "/Paruvatha_Bus_Booking_Website/public/busdetail.html?" + queryParams.toString();
    }
});

/// place card feth 
fetch("sources/Json/Places.json")
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    const container = document.getElementById("places-container");

    data.tourist_places.forEach(place => {
      const card = document.createElement("div");
      card.className = "place-card";
      card.innerHTML = `
        <img src="${place.image_url}" alt="${place.name}">
        <p>${place.name}</p>
      `;
      container.appendChild(card);
    });

    // Carousel controls
    let currentIndex = 0;
    const totalCards = data.tourist_places.length;
    const cards = document.querySelectorAll(".place-card");
    
    function updateCarouselPosition() {
      const offset = -currentIndex * (cards[0].offsetWidth + 15); // Adding gap
      document.querySelector(".carousel").style.transform = `translateX(${offset}px)`;
    }

    // Next Button
    document.getElementById("next").addEventListener("click", () => {
      if (currentIndex < totalCards - 1) {
        currentIndex++;
        updateCarouselPosition();
      }
    });

    // Previous Button
    document.getElementById("prev").addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarouselPosition();
      }
    });

    // Auto-slide every 3 seconds
    setInterval(() => {
      if (currentIndex < totalCards - 1) {
        currentIndex++;
      } else {
        currentIndex = 0; // Reset to the first item
      }
      updateCarouselPosition();
    }, 3000);
  })
  .catch(error => {
    console.error("Error loading places:", error);
  });


  const reviewCarousel = document.querySelector(".reviews-carousel");
  const prevReviewButton = document.querySelector(".carousel-btn.prev");
  const nextReviewButton = document.querySelector(".carousel-btn.next");
  let reviewIndex = 0;
  const totalReviews = 15; // Match number of review cards

  function moveReviewCarousel() {
    const reviewCardWidth = document.querySelector(".review-card").offsetWidth + 20;
    reviewCarousel.style.transform = `translateX(-${reviewIndex * reviewCardWidth}px)`;
  }

  nextReviewButton.addEventListener("click", () => {
    if (reviewIndex < totalReviews - 3) {
      reviewIndex++;
    } else {
      reviewIndex = 0;
    }
    moveReviewCarousel();
  });

  prevReviewButton.addEventListener("click", () => {
    if (reviewIndex > 0) {
      reviewIndex--;
    } else {
      reviewIndex = totalReviews - 3;
    }
    moveReviewCarousel();
  });

  // Optional: Auto-scroll
  setInterval(() => {
    if (reviewIndex < totalReviews - 3) {
      reviewIndex++;
    } else {
      reviewIndex = 0;
    }
    moveReviewCarousel();
  }, 5000);



  
  const dateInput = document.getElementById("date");

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0
  const dd = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${yyyy}-${mm}-${dd}`;
  

  // Set default value and minimum date
 
  dateInput.min = formattedToday;