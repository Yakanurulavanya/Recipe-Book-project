export const dom = {
  searchInput: document.querySelector('#searchInput'),
  categoryFilter: document.querySelector('#categoryFilter'),
  difficultyFilter: document.querySelector('#difficultyFilter'),
  ratingFilter: document.querySelector('#ratingFilter'),
  sortSelect: document.querySelector('#sortSelect'),
  recipeGrid: document.querySelector('#recipeGrid'),
  totalRecipes: document.querySelector('#totalRecipes'),
  favoriteCount: document.querySelector('#favoriteCount'),
  categoryCount: document.querySelector('#categoryCount'),
  openAddModal: document.querySelector('#openAddModal'),
  profileButton: document.querySelector('#profileButton'),
  profilePage: document.querySelector('#profilePage'),
  closeProfilePage: document.querySelector('#closeProfilePage'),
  dateGrid: document.querySelector('#dateGrid'),
  selectedDateSummary: document.querySelector('#selectedDateSummary'),
  logoutButton: document.querySelector('#logoutButton'),
  profileRecipeList: document.querySelector('#profileRecipeList'),
  profilePageStats: document.querySelector('#profilePageStats'),
  recipeModal: document.querySelector('#recipeModal'),
  modalTitle: document.querySelector('#modalTitle'),
  closeModal: document.querySelector('#closeModal'),
  cancelModal: document.querySelector('#cancelModal'),
  recipeForm: document.querySelector('#recipeForm'),
  recipeId: document.querySelector('#recipeId'),
  title: document.querySelector('#title'),
  ingredients: document.querySelector('#ingredients'),
  steps: document.querySelector('#steps'),
  cookingTime: document.querySelector('#cookingTime'),
  difficulty: document.querySelector('#difficulty'),
  category: document.querySelector('#category'),
  rating: document.querySelector('#rating'),
  tags: document.querySelector('#tags'),
};

export function renderDateGrid(dateStats, activeDate) {
  dom.dateGrid.innerHTML = dateStats
    .map((item) => {
      const isActive = item.dateKey === (activeDate || 'all');
      return `
        <button type="button" class="date-card ${isActive ? 'active' : ''}" data-date="${item.dateKey}">
          <span>${item.label}</span>
          <strong>${item.count}</strong>
        </button>
      `;
    })
    .join('');
}

export function setSelectedDateSummary(message) {
  dom.selectedDateSummary.textContent = message;
}

export function openProfilePage() {
  dom.profilePage.classList.remove('hidden');
}

export function closeProfilePage() {
  dom.profilePage.classList.add('hidden');
}

export function setProfilePageStats({ total, favorites, categories }) {
  if (dom.profilePageStats) {
    dom.profilePageStats.textContent = `Total recipes: ${total} · Favorites: ${favorites} · Categories: ${categories}`;
  }
}

export function renderProfileRecipes(recipes) {
  if (!dom.profileRecipeList) return;
  if (!recipes.length) {
    dom.profileRecipeList.innerHTML = '<div class="empty-state"><h3>No recipes added on this date</h3><p>Select another day to view more entries.</p></div>';
    return;
  }

  dom.profileRecipeList.innerHTML = recipes
    .map((recipe) => `
      <article class="profile-recipe-card">
        <div>
          <h4>${recipe.title}</h4>
          <p>${recipe.cookingTime} • ${recipe.difficulty} • ${recipe.rating} ★</p>
          <p>${recipe.ingredients.length} ingredients · ${recipe.steps.length} steps</p>
        </div>
        <div class="profile-recipe-tags">${recipe.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
      </article>
    `)
    .join('');
}

export function renderRecipeCards(recipes) {
  if (!recipes.length) {
    dom.recipeGrid.innerHTML = `<div class="empty-state"><h3>No recipes found</h3><p>Try adjusting search terms, filters, or add a new recipe.</p></div>`;
    return;
  }

  dom.recipeGrid.innerHTML = recipes
    .map((recipe) => {
      const ingredientCount = recipe.ingredients.length;
      const stepsCount = recipe.steps.length;
      const tags = recipe.tags.map((tag) => `<span class="tag">${tag}</span>`).join('');
      const favoriteClass = recipe.favorite ? 'favorite-pill' : 'badge';
      return `
        <article class="recipe-card">
          <div class="recipe-card-head">
            <h3>${recipe.title}</h3>
            <div class="recipe-meta">
              <span class="badge">${recipe.category}</span>
              <span class="badge">${recipe.difficulty}</span>
              <span class="badge">${recipe.rating} ★</span>
            </div>
          </div>
          <p>${recipe.cookingTime} • ${ingredientCount} ingredients • ${stepsCount} steps</p>
          <div class="tag-list">${tags}</div>
          <div class="recipe-actions">
            <button type="button" class="secondary-btn" data-action="favorite" data-id="${recipe.id}">${recipe.favorite ? '★ Favorite' : '☆ Favorite'}</button>
            <button type="button" class="secondary-btn" data-action="edit" data-id="${recipe.id}">Edit</button>
            <button type="button" class="secondary-btn danger" data-action="delete" data-id="${recipe.id}">Delete</button>
          </div>
        </article>
      `;
    })
    .join('');
}

export function renderCategoryOptions(categories) {
  const options = ['<option value="all">All Categories</option>', ...categories.map((category) => `<option value="${category}">${category}</option>`)]
    .join('');
  dom.categoryFilter.innerHTML = options;
}

export function updateStats(recipes) {
  dom.totalRecipes.textContent = recipes.length;
  dom.favoriteCount.textContent = recipes.filter((recipe) => recipe.favorite).length;
  dom.categoryCount.textContent = new Set(recipes.map((recipe) => recipe.category)).size;
}

export function openModal(recipe = null) {
  dom.recipeModal.classList.remove('hidden');
  dom.modalTitle.textContent = recipe ? 'Edit Recipe' : 'Add Recipe';
  if (!recipe) {
    dom.recipeForm.reset();
    dom.recipeId.value = '';
    return;
  }
  dom.recipeId.value = recipe.id;
  dom.title.value = recipe.title;
  dom.ingredients.value = recipe.ingredients.join(', ');
  dom.steps.value = recipe.steps.join('\n');
  dom.cookingTime.value = recipe.cookingTime;
  dom.difficulty.value = recipe.difficulty;
  dom.category.value = recipe.category;
  dom.rating.value = recipe.rating;
  dom.tags.value = recipe.tags.join(', ');
}

export function closeModal() {
  dom.recipeModal.classList.add('hidden');
}

export function getFormRecipeData() {
  return {
    id: dom.recipeId.value || undefined,
    title: dom.title.value.trim(),
    ingredients: dom.ingredients.value.trim().split(',').map((item) => item.trim()).filter(Boolean),
    steps: dom.steps.value.trim().split('\n').map((line) => line.trim()).filter(Boolean),
    cookingTime: dom.cookingTime.value.trim(),
    difficulty: dom.difficulty.value,
    category: dom.category.value.trim(),
    rating: Number(dom.rating.value),
    tags: dom.tags.value.trim().split(',').map((item) => item.trim()).filter(Boolean),
  };
}

export function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 2200);
}
