export { API_URL, showRecipes, getRecipes, formatArray, main, favBtn };

import { API_KEY } from './constants.mjs';

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const favBtn = document.getElementById('fav-btn');
const alert = document.querySelector('.alert');

const API_URL = `https://api.spoonacular.com/recipes/random?apiKey=${API_KEY}&number=5`;

const SEARCH_API = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=3&addRecipeInformation=true&fillIngredients=true&instructionsRequired=true&query=`;

// ****** Get initial recipes ******
async function getRecipes(url) {
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);
  showRecipes(data.recipes);
}

getRecipes(API_URL);

// ****** Search for new recipes ******
async function searchRecipes(url) {
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);
  if (data.results.length === 0) {
    main.innerHTML = '';
    const noRecipeFound = document.createElement('div');
    noRecipeFound.classList.add('not-found');
    noRecipeFound.innerHTML = `<p>Sorry! We couldn't find any recipe based on your search.</p>`;
    main.append(noRecipeFound);
  } else {
    showRecipes(data.results);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const searchTerm = search.value;

  if (searchTerm && searchTerm !== '') {
    searchRecipes(SEARCH_API + searchTerm);

    search.value = '';
  } else {
    window.location.reload();
  }
});

// ****** Display recipe cards and recipe info ******
function showRecipes(recipes) {
  main.innerHTML = '';

  recipes.forEach((recipe) => {
    const {
      title,
      readyInMinutes,
      servings,
      image,
      dishTypes,
      instructions,
      extendedIngredients,
      analyzedInstructions,
    } = recipe;

    const getInstructions = () => {
      if (instructions) {
        return instructions;
      } else {
        const stepSection = document.createElement('ol');
        analyzedInstructions[0].steps.forEach((step) => {
          const cookingStep = document.createElement('li');
          cookingStep.innerHTML = `${step.step}`;
          stepSection.appendChild(cookingStep);
        });
        return stepSection.outerHTML;
      }
    };

    const getIngredients = () =>
      extendedIngredients.map(
        (ingredient) =>
          `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
      );

    // Hide recipes that don???t have an image (however they can still be returned as results from our API call, so there might be fewer than 15 recipes showing)
    if (recipe.image !== undefined) {
      const recipeEl = document.createElement('div');
      recipeEl.classList.add('recipe-card');
      recipeEl.innerHTML = ` <img
        src="${image}"
        alt=""
      />
      <h3 class="recipe-title">${title}</h3>
      <button class="save-btn"><i class="fas fa-heart"></i></button>
      <div class="recipe-text">
        <div class="recipe-info">
          <p><i class="far fa-clock"></i>${readyInMinutes} min</p>
          <p><i class="fas fa-utensils"></i>${
            servings < 2 ? `${servings} serving` : `${servings} servings`
          }</p>
          <p><i class="fas fa-book-reader"></i>${formatArray(dishTypes)}</p>
        </div>
        <div class="ingredients">
          <h4>Ingredients</h4>
          <p>${formatArray(getIngredients())}</p>
        </div>
        <div class="recipe-instructions">
          <h4>Cooking Steps</h4>
            ${getInstructions()}
        </div>
      </div>`;

      main.appendChild(recipeEl);
    }

    // Show content of recipe cards
    const cards = document.querySelectorAll('.recipe-card');

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        removeActiveClasses();
        card.classList.add('active');
      });
    });
    function removeActiveClasses() {
      cards.forEach((card) => card.classList.remove('active'));
    }

    // save feature
    const saveBtns = document.querySelectorAll('.save-btn');

    saveBtns[saveBtns.length - 1].addEventListener('click', (e) => {
      // if the mouse position has the coordinates of the saveBtn and the recipe-card does not contain the active class, remove the active class (when we click on the card or saveBtn it will be active so we want to remove it right away)

      // Try 1
      let saveBtnSize = e.target.getBoundingClientRect();
      console.log(saveBtnSize);
      //let x = e.clientX - saveBtnSize.left;
      //let y = e.clientY - saveBtnSize.top;

      // Try 2
      // mouse position in viewport
      const x = e.clientX;
      const y = e.clientY;

      // where top and left of button start
      const buttonTop = e.target.offsetTop;
      const buttonLeft = e.target.offsetLeft;

      // calculating the position of our click inside the button >> only useful to assign those coordinates to an element?
      const xInside = x - buttonLeft;
      const yInside = y - buttonTop;

      // console.log(x, y);
      // console.log(buttonTop, buttonLeft);
      // console.log(xInside, yInside);
      // console.log(e.target);

      if (xInside === saveBtnSize.left && yInside === saveBtnSize.top) {
        console.log('You are inside');
      } else {
        console.log('You are outside');
        console.log(xInside, yInside);
        console.log(saveBtnSize.left, saveBtnSize.top);
      }

      addToFavourites(recipe);
    });
  });
}

// ****** Save to favourites ******

function addToFavourites(recipe) {
  displayAlert('Recipe added to Favourites', 'success');
  storeRecipe(recipe);
}

function displayAlert(text, action) {
  alert.textContent = text;
  alert.classList.add(`alert-${action}`);
  setTimeout(() => {
    alert.textContent = '';
    alert.classList.remove(`alert-${action}`);
  }, 3000);
}

function storeRecipe(recipe) {
  let myFavourites = getLocalStorage();
  myFavourites.push(recipe);
  localStorage.setItem('favourites', JSON.stringify(myFavourites));
}

// ****** Helper functions ******
const formatArray = (array) =>
  array.map((el) => el.charAt(0).toUpperCase() + el.slice(1)).join(' - ');


// create variables
const toggleBtn = document.querySelector('#toggleBtn');
const divList = document.querySelector('.listHolder');

// action to be taken when clicked on hide list button

/* 
2. add list items
-----------------
*/
// create variables
const addInput = document.querySelector('#addInput');
const addBtn = document.querySelector('#addBtn');

function addLists() {
  if (addInput.value === '') {
    alert('Enter the list name please!!!');
  } else {
    const ul = divList.querySelector('ul');
    const li = document.createElement('li');
    li.innerHTML = addInput.value;
    addInput.value = '';
    ul.appendChild(li);
    createBtn(li);
  }
}

// add list when clicked on add item button
addBtn.addEventListener('click', () => {
  addLists();
});

// add list when pressed enter
addInput.addEventListener('keyup', (event) => {
  if(event.which === 13) {
    addLists();
  }
});

/* 
3. create action buttons
------------------------
*/
// create variables
const listUl = document.querySelector('.list');
const lis = listUl.children;

function createBtn(li) {
  // create remove button
  const remove = document.createElement('button');
  remove.className = 'btn-icon remove';
  li.appendChild(remove);

  
  return li;
}

// loop to add buttons in each li
for (var i = 0; i < lis.length; i++) {
  createBtn(lis[i]);
}


/* 
4. enabling button actions for delete
------------------------------------------------------------
*/
divList.addEventListener('click', (event) => {
  if (event.target.tagName === 'BUTTON') {
    const button = event.target;
    const li = button.parentNode;
    const ul = li.parentNode;
    if (button.className === 'btn-icon remove') {
      ul.removeChild(li);
    } 
  }
});