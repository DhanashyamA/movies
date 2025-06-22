const API_URL = "http://www.omdbapi.com/?i=tt3896198&apikey=YOUR_API_KEY"; // Replace YOUR_API_KEY with your OMDB API key
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const movieResults = document.getElementById("movieResults");
const favorites = document.getElementById("favorites");

// Load Favorites from Local Storage
let favoriteMovies = JSON.parse(localStorage.getItem("favorites")) || [];

// Display Favorites on Page Load
document.addEventListener("DOMContentLoaded", () => {
  displayFavorites();
});

// Fetch Movies from API
async function fetchMovies(query) {
  try {
    const response = await fetch(`${API_URL}&s=${query}`);
    const data = await response.json();

    if (data.Response === "True") {
      displayMovies(data.Search);
    } else {
      movieResults.innerHTML = `<p>No movies found for "${query}".</p>`;
    }
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

// Display Movies in Results Section
function displayMovies(movies) {
  movieResults.innerHTML = "";
  movies.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");
    movieCard.innerHTML = `
      <img src="${
        movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"
      }" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
      <button onclick="addToFavorites('${movie.imdbID}', '${movie.Title.replace("'", "\\" + "'")}', '${
      movie.Poster
    }', '${movie.Year}')">Add to Favorites</button>
    `;
    movieResults.appendChild(movieCard);
  });
}

// Add Movie to Favorites
function addToFavorites(id, title, poster, year) {
  if (!favoriteMovies.some((movie) => movie.id === id)) {
    favoriteMovies.push({ id, title, poster, year });
    localStorage.setItem("favorites", JSON.stringify(favoriteMovies));
    displayFavorites();
  }
}

// Display Favorites
function displayFavorites() {
  favorites.innerHTML = "";
  favoriteMovies.forEach((movie) => {
    const favoriteCard = document.createElement("div");
    favoriteCard.classList.add("movie-card");
    favoriteCard.innerHTML = `
      <img src="${
        movie.poster !== "N/A" ? movie.poster : "placeholder.jpg"
      }" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>${movie.year}</p>
      <button onclick="removeFromFavorites('${movie.id}')">Remove</button>
    `;
    favorites.appendChild(favoriteCard);
  });
}

// Remove Movie from Favorites
function removeFromFavorites(id) {
  favoriteMovies = favoriteMovies.filter((movie) => movie.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favoriteMovies));
  displayFavorites();
}

// Event Listener for Search Button
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    sessionStorage.setItem("lastSearch", query);
    fetchMovies(query);
  }
});
