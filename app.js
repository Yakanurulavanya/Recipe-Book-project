import { initializeRecipeStore, getRecipes, addRecipe, updateRecipe, deleteRecipe, toggleFavorite, findRecipeById, getUniqueCategories } from './service.js';
import { dom, renderRecipeCards, renderCategoryOptions, updateStats, openModal, closeModal, getFormRecipeData, showToast } from './ui.js';

const state = {
  recipes: [],
  query: '',
  category: 'all',
  difficulty: 'all',
  rating: 'all',
  sortBy: 'newest',
};

async function loadState() {
  state.recipes = await initializeRecipeStore();
}

function filterAndSortRecipes() {
  return state.recipes
    .filter((recipe) => {
      const queryMatch = [recipe.title, recipe.ingredients.join(' '), recipe.tags.join(' ')].some((field) => field.toLowerCase().includes(state.query.toLowerCase()));
      const categoryMatch = state.category === 'all' || recipe.category === state.category;
      const difficultyMatch = state.difficulty === 'all' || recipe.difficulty === state.difficulty;
      const ratingMatch = state.rating === 'all' || recipe.rating >= Number(state.rating);
      return queryMatch && categoryMatch && difficultyMatch && ratingMatch;
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
  if (action === 'delete') {
    if (confirm('Delete this recipe?')) {
      state.recipes = await deleteRecipe(id);
      refreshView();
      showToast('Recipe deleted');
    }
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

function initEvents() {
  dom.openAddModal.addEventListener('click', () => openModal());
  dom.closeModal.addEventListener('click', closeModal);
  dom.cancelModal.addEventListener('click', closeModal);
  dom.searchInput.addEventListener('input', handleInputChange);
  dom.categoryFilter.addEventListener('change', handleFilterChange);
  dom.difficultyFilter.addEventListener('change', handleFilterChange);
  dom.ratingFilter.addEventListener('change', handleFilterChange);
  dom.sortSelect.addEventListener('change', handleFilterChange);
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
