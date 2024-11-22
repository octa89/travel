const API_URL = "./travel_recommendation_api.json";

// Perform Search
async function performSearch() {
  const input = document
    .getElementById("search-bar")
    .value.toLowerCase()
    .trim();

  // Validate input
  if (!input) {
    alert("Please enter a keyword to search.");
    return;
  }

  try {
    // Fetch the JSON data
    const response = await axios.get(API_URL);
    const data = response.data;

    let results = [];

    // Check for type-based matches (Beach, Temple, etc.)
    if (input.includes("beach")) {
      results = data.beaches;
    } else if (input.includes("temple")) {
      results = data.temples;
    } else {
      // Search within countries, cities, and names for specific matches
      const cities = data.countries.flatMap((country) =>
        country.cities.filter(
          (city) =>
            city.name.toLowerCase().includes(input) ||
            country.name.toLowerCase().includes(input)
        )
      );

      const beaches = data.beaches.filter((beach) =>
        beach.name.toLowerCase().includes(input)
      );

      const temples = data.temples.filter((temple) =>
        temple.name.toLowerCase().includes(input)
      );

      // Combine results
      results = [...cities, ...beaches, ...temples];
    }

    // Check if results are empty
    if (results.length === 0) {
      document.getElementById("results-container").innerHTML =
        "<p>No recommendations found.</p>";
      return;
    }

    // Display results
    displayRecommendations(results);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    document.getElementById("results-container").innerHTML =
      "<p>Failed to fetch recommendations. Please try again later.</p>";
  }
}

// Display Recommendations
function displayRecommendations(recommendations) {
  const container = document.getElementById("results-container");
  container.innerHTML = recommendations
    .map((item) => {
      // Get current time in the recommended location
      const timezone = getTimeZoneForLocation(item.name);
      const currentTime = timezone
        ? `<p>Current Time: ${getCurrentTime(timezone)}</p>`
        : "";

      return `<div class="recommendation">
          <h3>${item.name}</h3>
          <img src="${item.imageUrl}" alt="${item.name}" style="max-width: 300px; height: auto;">
          <p>${item.description}</p>
          ${currentTime}
        </div>`;
    })
    .join("");
}

// Clear Results
function clearResults() {
  document.getElementById("search-bar").value = "";
  document.getElementById("results-container").innerHTML =
    "<h2>Recommendations will appear here:</h2>";
}

// Get Current Time in a Location
function getCurrentTime(timezone) {
  const options = {
    timeZone: timezone,
    hour12: true,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  return new Date().toLocaleTimeString("en-US", options);
}

// Map Locations to Timezones
function getTimeZoneForLocation(location) {
  const timezones = {
    Australia: "Australia/Sydney",
    Brazil: "America/Sao_Paulo",
    Japan: "Asia/Tokyo",
    "French Polynesia": "Pacific/Tahiti",
    Cambodia: "Asia/Phnom_Penh",
    India: "Asia/Kolkata",
  };

  // Match a timezone based on the location name
  for (const [key, timezone] of Object.entries(timezones)) {
    if (location.toLowerCase().includes(key.toLowerCase())) {
      return timezone;
    }
  }

  // Return undefined if no timezone is found
  return undefined;
}
