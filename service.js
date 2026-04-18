import * as firebaseService from './firebaseService.js';
import * as localService from './localService.js';

export async function initializeRecipeStore() {
  if (await firebaseService.isFirebaseEnabled()) {
    const recipes = await firebaseService.getRecipes();
    return recipes.length ? recipes : await localService.initializeRecipeStore();
  }
  return localService.initializeRecipeStore();
}

export async function getRecipes() {
  return (await firebaseService.isFirebaseEnabled()) ? firebaseService.getRecipes() : localService.getRecipes();
}

export async function addRecipe(recipeData) {
  return (await firebaseService.isFirebaseEnabled()) ? firebaseService.addRecipe(recipeData) : localService.addRecipe(recipeData);
}

export async function updateRecipe(recipeData) {
  return (await firebaseService.isFirebaseEnabled()) ? firebaseService.updateRecipe(recipeData) : localService.updateRecipe(recipeData);
}

export async function deleteRecipe(recipeId) {
  return (await firebaseService.isFirebaseEnabled()) ? firebaseService.deleteRecipe(recipeId) : localService.deleteRecipe(recipeId);
}

export async function toggleFavorite(recipeId) {
  return (await firebaseService.isFirebaseEnabled()) ? firebaseService.toggleFavorite(recipeId) : localService.toggleFavorite(recipeId);
}

export async function findRecipeById(recipeId) {
  return (await firebaseService.isFirebaseEnabled()) ? firebaseService.findRecipeById(recipeId) : localService.findRecipeById(recipeId);
}

export function getUniqueCategories(recipes) {
  return localService.getUniqueCategories(recipes);
}
