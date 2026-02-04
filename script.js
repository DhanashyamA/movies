const API_URL = "https://www.omdbapi.com/?apikey=594c2454";
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const movieResults = document.getElementById("movieResults");
const favorites = document.getElementById("favorites");
const filterToggle = document.getElementById("filterToggle");
const filterOptions = document.getElementById("filterOptions");

let favoriteMovies = JSON.parse(localStorage.getItem("favorites")) || [];

document.addEventListener("DOMContentLoaded", () => {
  displayFavorites();
  const lastSearch = sessionStorage.getItem("lastSearch");
  if (lastSearch) fetchMovies(lastSearch);
});

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    sessionStorage.setItem("lastSearch", query);
    fetchMovies(query);
  }
});

filterToggle.addEventListener("click", () => {
  filterOptions.classList.toggle("hidden");
});

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

function displayMovies(movies) {
  movieResults.innerHTML = "";
  movies.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

    const isFavorite = favoriteMovies.some((fav) => fav.id === movie.imdbID);

    movieCard.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"}" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
      ${
        isFavorite
          ? `<button class="added" disabled>✅ Added to Favorites</button>`
          : `<button onclick="addToFavorites('${movie.imdbID}', '${movie.Title.replace(/'/g, "\\'")}', '${movie.Poster}', '${movie.Year}')">Add to Favorites</button>`
      }
    `;
    movieResults.appendChild(movieCard);
  });
}

function addToFavorites(id, title, poster, year) {
  if (!favoriteMovies.some((movie) => movie.id === id)) {
    favoriteMovies.push({ id, title, poster, year, rating: 0 });
    localStorage.setItem("favorites", JSON.stringify(favoriteMovies));
    displayFavorites();
    const currentSearch = sessionStorage.getItem("lastSearch");
    if (currentSearch) fetchMovies(currentSearch);
  }
}

function displayFavorites() {
  favorites.innerHTML = "";

  favoriteMovies.forEach((movie, index) => {
    const favoriteCard = document.createElement("div");
    favoriteCard.classList.add("movie-card");

    // Font Awesome stars
    let starsHtml = "";
    for (let i = 1; i <= 5; i++) {
      const full = movie.rating >= i;
      const half = movie.rating >= i - 0.5 && movie.rating < i;

      let starClass = "fa-regular fa-star"; // default empty
      if (full) {
        starClass = "fa-solid fa-star";
      } else if (half) {
        starClass = "fa-solid fa-star-half-stroke";
      }

      starsHtml += `<i class="star ${starClass}" data-index="${index}" data-value="${i}"></i>`;
    }

    favoriteCard.innerHTML = `
      <img src="${movie.poster !== "N/A" ? movie.poster : "placeholder.jpg"}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>${movie.year}</p>
      <div class="stars">${starsHtml}</div>
      <p>Rating: ${movie.rating.toFixed(1)} / 5</p>
      <button class="remove" onclick="removeFromFavorites('${movie.id}')">Remove</button>
    `;
    favorites.appendChild(favoriteCard);
  });

  // Click logic: toggle rating
  document.querySelectorAll(".stars").forEach((starContainer) => {
    starContainer.querySelectorAll(".star").forEach((star) => {
      star.addEventListener("click", () => {
        const index = parseInt(star.dataset.index);
        const selected = parseInt(star.dataset.value);
        const currentRating = favoriteMovies[index].rating;

        favoriteMovies[index].rating = currentRating === selected ? selected - 0.5 : selected;

        localStorage.setItem("favorites", JSON.stringify(favoriteMovies));
        displayFavorites();
      });
    });
  });
}

function removeFromFavorites(id) {
  favoriteMovies = favoriteMovies.filter((movie) => movie.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favoriteMovies));
  displayFavorites();
  const currentSearch = sessionStorage.getItem("lastSearch");
  if (currentSearch) fetchMovies(currentSearch);
}

function sortFavorites(order) {
  favoriteMovies.sort((a, b) =>
    order === "asc" ? a.rating - b.rating : b.rating - a.rating
  );
  displayFavorites();
}
