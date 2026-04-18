import { initializeRecipeStore, getRecipes, addRecipe, updateRecipe, toggleFavorite, findRecipeById, getUniqueCategories } from './service.js';
import { dom, renderRecipeCards, renderCategoryOptions, updateStats, openModal, closeModal, getFormRecipeData, showToast, openProfilePage, closeProfilePage } from './ui.js';

const state = {
  recipes: [],
  query: '',
  category: 'all',
  difficulty: 'all',
  rating: 'all',
  sortBy: 'newest',
  selectedDate: null,
};

async function loadState() {
  state.recipes = await initializeRecipeStore();
}

function getDateKey(timestamp) {
  return new Date(timestamp).toISOString().split('T')[0];
}

function formatDateLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDateStats(recipes) {
  const stats = recipes.reduce((acc, recipe) => {
    const dateKey = getDateKey(recipe.createdAt);
    if (!acc[dateKey]) acc[dateKey] = { dateKey, label: formatDateLabel(recipe.createdAt), count: 0 };
    acc[dateKey].count += 1;
    return acc;
  }, {});

  return [{ dateKey: 'all', label: 'All Dates', count: recipes.length }, ...Object.values(stats).sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))];
}

function filterAndSortRecipes() {
  return state.recipes
    .filter((recipe) => {
      const queryMatch = [recipe.title, recipe.ingredients.join(' '), recipe.tags.join(' ')].some((field) => field.toLowerCase().includes(state.query.toLowerCase()));
      const categoryMatch = state.category === 'all' || recipe.category === state.category;
      const difficultyMatch = state.difficulty === 'all' || recipe.difficulty === state.difficulty;
      const ratingMatch = state.rating === 'all' || recipe.rating >= Number(state.rating);
      const dateMatch = !state.selectedDate || getDateKey(recipe.createdAt) === state.selectedDate;
      return queryMatch && categoryMatch && difficultyMatch && ratingMatch && dateMatch;
    })
    .sort((a, b) => {
      if (state.sortBy === 'rating') return b.rating - a.rating || b.createdAt - a.createdAt;
      return b.createdAt - a.createdAt;
    });
}

function refreshView() {
  const visibleRecipes = filterAndSortRecipes();
  renderRecipeCards(visibleRecipes);
  renderCategoryOptions(getUniqueCategories(state.recipes));
  updateStats(state.recipes);
}

function handleInputChange() {
  state.query = dom.searchInput.value.trim();
  refreshView();
}

function handleFilterChange() {
  state.category = dom.categoryFilter.value;
  state.difficulty = dom.difficultyFilter.value;
  state.rating = dom.ratingFilter.value;
  state.sortBy = dom.sortSelect.value;
  refreshView();
}

async function handleRecipeGridClick(event) {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!action || !id) return;
  if (action === 'favorite') {
    state.recipes = await toggleFavorite(id);
    refreshView();
    showToast('Favorite status updated');
    return;
  }
  if (action === 'edit') {
    const recipe = await findRecipeById(id);
    if (recipe) openModal(recipe);
    return;
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const recipeData = getFormRecipeData();
  if (!recipeData.title || !recipeData.ingredients.length || !recipeData.steps.length) {
    showToast('Please complete the recipe fields');
    return;
  }
  if (recipeData.id) {
    await updateRecipe(recipeData);
    state.recipes = await getRecipes();
    showToast('Recipe updated successfully');
  } else {
    await addRecipe(recipeData);
    state.recipes = await getRecipes();
    showToast('Recipe added successfully');
  }
  closeModal();
  refreshView();
}

function handleProfilePageClick(event) {
  const editButton = event.target.closest('.edit-btn');
  if (!editButton) return;
  showToast('Profile edit clicked');
}

function initEvents() {
  dom.openAddModal.addEventListener('click', () => openModal());
  dom.closeModal.addEventListener('click', closeModal);
  dom.cancelModal.addEventListener('click', closeModal);
  dom.searchInput.addEventListener('input', handleInputChange);
  dom.categoryFilter.addEventListener('change', handleFilterChange);
  dom.difficultyFilter.addEventListener('change', handleFilterChange);
  dom.ratingFilter.addEventListener('change', handleFilterChange);
  dom.sortSelect.addEventListener('change', handleFilterChange);
  dom.profileButton.addEventListener('click', (event) => {
    event.stopPropagation();
    openProfilePage();
  });
  dom.closeProfilePage.addEventListener('click', closeProfilePage);
  dom.logoutButton.addEventListener('click', () => {
    closeProfilePage();
    showToast('Logged out');
  });
  dom.profilePage.addEventListener('click', handleProfilePageClick);
  dom.recipeGrid.addEventListener('click', handleRecipeGridClick);
  dom.recipeForm.addEventListener('submit', handleFormSubmit);
  dom.recipeModal.addEventListener('click', (event) => {
    if (event.target === dom.recipeModal) closeModal();
  });
}

async function mount() {
  await loadState();
  refreshView();
  initEvents();
}

mount();
