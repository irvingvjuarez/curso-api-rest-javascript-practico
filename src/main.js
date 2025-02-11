const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'Cache-Control': 'public, max-age=548'
  },
  params: {
    'api_key': API_KEY,
  }
});

// Utils

function createMovies(movies, container) {
  removeMoviesSkeleton(container);

  movies.forEach(movie => {
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container');
    movieContainer.addEventListener('click', () => {
      location.hash = '#movie=' + movie.id;
    });

    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img');
    movieImg.setAttribute('alt', movie.title);
    movieImg.setAttribute(
      'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path,
    );

    if (movieContainer.hasChildNodes()) {
      movieContainer.replaceChild(movieImg, movieContainer.firstChild);
    } else {
      movieContainer.appendChild(movieImg);
    }

    container.appendChild(movieContainer);
  });
}

function createCategories(categories, container) {
  container.innerHTML = "";

  categories.forEach(category => {  
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container');

    const categoryTitle = document.createElement('h3');
    categoryTitle.classList.add('category-title');
    categoryTitle.setAttribute('id', 'id' + category.id);
    categoryTitle.addEventListener('click', () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });
    const categoryTitleText = document.createTextNode(category.name);

    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    container.appendChild(categoryContainer);
  });
}

// Skeletons

function createMoviesSkeleton(container) {
  Array.from({ length: 5 }).forEach((_) => {
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container');

    const skeleton = document.createElement('div');
    skeleton.classList.add('skeleton');
    movieContainer.appendChild(skeleton);
    container.appendChild(movieContainer);
  });
}

function removeMoviesSkeleton(container) {
  const skeletons = container.querySelectorAll('.skeleton');
  skeletons.forEach((skeleton) => {
    skeleton.parentElement.remove();
  });
}

// Intersection observer
function createObserver(container, page) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        getTrendingMoviesPreview(page);
        observer.unobserve(entry.target);
      }
    });
  });

  observer.observe(container.lastChild);
}

// Llamados a la API

async function getTrendingMoviesPreview(currentPage = 1) {
  createMoviesSkeleton(trendingMoviesPreviewList);
  const { data } = await api(`trending/movie/day?page=${currentPage}`);
  console.log(data)
  const movies = data.results;

  createMovies(movies, trendingMoviesPreviewList);
  createObserver(trendingMoviesPreviewList, currentPage + 1);
}

async function getCategegoriesPreview() {
  const { data } = await api('genre/movie/list');
  const categories = data.genres;

  createCategories(categories, categoriesPreviewList)  ;
}

async function getMoviesByCategory(id) {
  const { data } = await api('discover/movie', {
    params: {
      with_genres: id,
    },
  });
  const movies = data.results;

  createMovies(movies, genericSection);
}

async function getMoviesBySearch(query) {
  const { data } = await api('search/movie', {
    params: {
      query,
    },
  });
  const movies = data.results;

  createMovies(movies, genericSection);
}

async function getTrendingMovies() {
  const { data } = await api('trending/movie/day');
  const movies = data.results;

  createMovies(movies, genericSection);
}

async function getMovieById(id) {
  const { data: movie } = await api('movie/' + id);

  const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
  console.log(movieImgUrl)
  headerSection.style.background = `
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 19.27%,
      rgba(0, 0, 0, 0) 29.17%
    ),
    url(${movieImgUrl})
  `;
  
  movieDetailTitle.textContent = movie.title;
  movieDetailDescription.textContent = movie.overview;
  movieDetailScore.textContent = movie.vote_average;

  createCategories(movie.genres, movieDetailCategoriesList);

  getRelatedMoviesId(id);
}

async function getRelatedMoviesId(id) {
  const { data } = await api(`movie/${id}/recommendations`);
  const relatedMovies = data.results;

  createMovies(relatedMovies, relatedMoviesContainer);
}
