const STORAGE_KEY = 'smartRecipeManager.recipes';

const defaultRecipes = [
  {
    id: 'r1',
    title: 'Lemon Garlic Chicken',
    ingredients: ['Chicken thighs', 'Lemon', 'Garlic', 'Olive oil', 'Rosemary', 'Salt', 'Pepper'],
    steps: ['Marinate chicken with lemon, garlic, and herbs.', 'Preheat oven to 200°C.', 'Roast chicken for 30 minutes until golden.', 'Rest for 5 minutes and serve.'],
    cookingTime: '35 mins',
    difficulty: 'Medium',
    category: 'Dinner',
    rating: 5,
    tags: ['poultry', 'oven', 'easy'],
    favorite: true,
    createdAt: Date.now() - 10000000,
  },
  {
    id: 'r2',
    title: 'Avocado Toast',
    ingredients: ['Bread', 'Avocado', 'Lime', 'Chili flakes', 'Salt', 'Pepper'],
    steps: ['Toast bread slices.', 'Mash avocado and season.', 'Spread avocado over toast.', 'Sprinkle chili flakes and serve.'],
    cookingTime: '10 mins',
    difficulty: 'Easy',
    category: 'Breakfast',
    rating: 4,
    tags: ['vegetarian', 'quick', 'brunch'],
    favorite: false,
    createdAt: Date.now() - 5000000,
  },
  {
    id: 'r3',
    title: 'Vegetable Stir Fry',
    ingredients: ['Broccoli', 'Bell pepper', 'Carrot', 'Soy sauce', 'Ginger', 'Garlic', 'Sesame oil'],
    steps: ['Chop vegetables.', 'Heat oil in a wok.', 'Stir fry vegetables until crisp tender.', 'Add sauce and toss until glazed.'],
    cookingTime: '20 mins',
    difficulty: 'Easy',
    category: 'Lunch',
    rating: 4,
    tags: ['vegan', 'healthy', 'one-pan'],
    favorite: false,
    createdAt: Date.now() - 8000000,
  },
];

function loadRecipes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [...defaultRecipes];
    return JSON.parse(stored) || [];
  } catch (error) {
    console.error('Failed to load recipes', error);
    return [...defaultRecipes];
  }
}

function saveRecipes(recipes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

function generateId() {
  return `r-${Math.random().toString(36).slice(2, 10)}`;
}

export async function initializeRecipeStore() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    saveRecipes(defaultRecipes);
    return [...defaultRecipes];
  }
  return loadRecipes();
}

export async function getRecipes() {
  return loadRecipes();
}

export async function addRecipe(recipeData) {
  const recipes = loadRecipes();
  const newRecipe = {
    id: generateId(),
    favorite: false,
    createdAt: Date.now(),
    ...recipeData,
  };
  recipes.unshift(newRecipe);
  saveRecipes(recipes);
  return newRecipe;
}

export async function updateRecipe(recipeData) {
  const recipes = loadRecipes();
  const index = recipes.findIndex((recipe) => recipe.id === recipeData.id);
  if (index === -1) return null;
  recipes[index] = { ...recipes[index], ...recipeData };
  saveRecipes(recipes);
  return recipes[index];
}

export async function deleteRecipe(recipeId) {
  const recipes = loadRecipes();
  const filtered = recipes.filter((recipe) => recipe.id !== recipeId);
  saveRecipes(filtered);
  return filtered;
}

export async function toggleFavorite(recipeId) {
  const recipes = loadRecipes();
  const updated = recipes.map((recipe) => {
    if (recipe.id !== recipeId) return recipe;
    return { ...recipe, favorite: !recipe.favorite };
  });
  saveRecipes(updated);
  return updated;
}

export async function findRecipeById(recipeId) {
  return loadRecipes().find((recipe) => recipe.id === recipeId) || null;
}

export function getUniqueCategories(recipes) {
  return [...new Set(recipes.map((recipe) => recipe.category).filter(Boolean))].sort();
}
