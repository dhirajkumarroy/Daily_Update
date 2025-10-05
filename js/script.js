let posts = [];
let currentPage = 1;
const postsPerPage = 4;

const postList = document.getElementById("post-list");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("category-filter");
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

// Load posts from JSON
async function loadPosts() {
  try {
    const res = await fetch("data/posts.json");
    posts = await res.json();
    loadCategories();
    renderPosts();
  } catch (err) {
    console.error("Error loading posts.json:", err);
  }
}

// Populate categories
function loadCategories() {
  const categories = ["all", ...new Set(posts.map(p => p.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Filtered posts
function getFilteredPosts() {
  const filterText = searchInput.value.toLowerCase();
  const filterCategory = categoryFilter.value;
  return posts.filter(post => {
    const matchesText =
      post.title.toLowerCase().includes(filterText) ||
      post.summary.toLowerCase().includes(filterText);
    const matchesCategory =
      filterCategory === "all" || post.category === filterCategory;
    return matchesText && matchesCategory;
  });
}

// Render posts + pagination
function renderPosts() {
  const filtered = getFilteredPosts();
  const totalPages = Math.ceil(filtered.length / postsPerPage);

  if (currentPage > totalPages) currentPage = totalPages || 1;

  // Clear existing posts and ensure the grid class is present
  postList.innerHTML = "";
  postList.className = "grid-container";

  if (filtered.length === 0) {
    postList.innerHTML = "<p>No posts found.</p>";
    pageInfo.textContent = "";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  const start = (currentPage - 1) * postsPerPage;
  const end = start + postsPerPage;
  const pagePosts = filtered.slice(start, end);

  pagePosts.forEach(post => {
    const article = document.createElement("article");
    article.innerHTML = `
      <a href="${post.link}" class="post-card">
        <img src="${post.image}" alt="${post.title}" class="post-thumb" />
        <div class="post-content">
          <h2>${post.title}</h2>
          <small>${new Date(post.date).toDateString()}</small>
          <p>${post.summary}</p>
          <span class="category">${post.category}</span>
        </div>
      </a>
    `;
    postList.appendChild(article);
  });

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// Events
searchInput.addEventListener("input", () => { currentPage = 1; renderPosts(); });
categoryFilter.addEventListener("change", () => { currentPage = 1; renderPosts(); });
prevBtn.addEventListener("click", () => { if (currentPage > 1) { currentPage--; renderPosts(); } });
nextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(getFilteredPosts().length / postsPerPage);
  if (currentPage < totalPages) { currentPage++; renderPosts(); }
});

// Theme toggle
const themeToggle = document.getElementById("theme-toggle");
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Back to top button
const backToTopBtn = document.getElementById("back-to-top");
window.addEventListener("scroll", () => {
  backToTopBtn.style.display = window.scrollY > 200 ? "block" : "none";
});
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Init
loadPosts();
