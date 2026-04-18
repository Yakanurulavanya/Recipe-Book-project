import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  query,
  orderBy,
} from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';
import { USE_FIREBASE, firebaseConfig } from './firebaseConfig.js';

let db = null;
let initialized = false;

async function ensureFirebase() {
  if (!USE_FIREBASE) return false;
  if (initialized) return true;
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  initialized = true;
  return true;
}

function recipeDoc(id) {
  return doc(db, 'recipes', id);
}

function normalizeRecipeSnap(docSnap) {
  return { ...docSnap.data(), id: docSnap.id };
}

export async function isFirebaseEnabled() {
  return USE_FIREBASE && (await ensureFirebase());
}

export async function getRecipes() {
  if (!(await ensureFirebase())) return [];
  const recipeQuery = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(recipeQuery);
  return snapshot.docs.map(normalizeRecipeSnap);
}

export async function addRecipe(recipeData) {
  await ensureFirebase();
  const recipe = {
    id: recipeData.id || `r-${Math.random().toString(36).slice(2, 10)}`,
    favorite: false,
    createdAt: Date.now(),
    ...recipeData,
  };
  await setDoc(recipeDoc(recipe.id), recipe);
  return recipe;
}

export async function updateRecipe(recipeData) {
  await ensureFirebase();
  await setDoc(recipeDoc(recipeData.id), recipeData, { merge: true });
  return recipeData;
}

export async function deleteRecipe(recipeId) {
  await ensureFirebase();
  await deleteDoc(recipeDoc(recipeId));
  return getRecipes();
}

export async function toggleFavorite(recipeId) {
  await ensureFirebase();
  const snapshot = await getDoc(recipeDoc(recipeId));
  if (!snapshot.exists()) return getRecipes();
  const recipe = snapshot.data();
  await updateDoc(recipeDoc(recipeId), { favorite: !recipe.favorite });
  return getRecipes();
}

export async function findRecipeById(recipeId) {
  await ensureFirebase();
  const snapshot = await getDoc(recipeDoc(recipeId));
  return snapshot.exists() ? normalizeRecipeSnap(snapshot) : null;
}
