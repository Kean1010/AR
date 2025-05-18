const dishes = {
  "Nasi Lemak": ["rice", "egg", "ikan_bilis", "peanuts", "cucumber", "sambal", "chicken"],
  "Chicken Rice": ["rice", "chicken", "cucumber", "soy_sauce", "soup"],
  "Laksa": ["beehoon", "gravy", "fishcake", "prawns", "cockles"]
};

const allIngredients = Array.from(new Set(Object.values(dishes).flat()));

const ingredientTray = document.getElementById("ingredient-tray");
const droppedIngredients = document.getElementById("dropped-ingredients");
const plateArea = document.getElementById("plate-area");
const orderBubble = document.getElementById("order-bubble");
const serveButton = document.getElementById("serve-button");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const customerFace = document.getElementById("customer-face");
const requiredIngredientsEl = document.getElementById("required-ingredients");

const gameOverScreen = document.getElementById("game-over");
const finalScoreEl = document.getElementById("final-score");
const gameResultEl = document.getElementById("game-result");

// Sound elements
const soundDrag = document.getElementById("sound-drag");
const soundCorrect = document.getElementById("sound-correct");
const soundWrong = document.getElementById("sound-wrong");
const soundEnd = document.getElementById("sound-end");

let currentOrder = "";
let addedIngredients = [];
let score = 0;
let timeLeft = 300;
let timerInterval;

const foodHistories = {
  "Nasi Lemak": "Nasi Lemak, a fragrant rice dish cooked in coconut milk, has its roots in Malay culture and was traditionally served as a breakfast dish in Singapore. Its name, meaning 'rich rice,' reflects the creamy texture from coconut milk. It became popular in the early 20th century among Malay communities and evolved with Chinese and Indian influences, incorporating ingredients like sambal and fried chicken.",
  "Chicken Rice": "Hainanese Chicken Rice, one of Singapore's national dishes, was brought by Hainanese immigrants in the 19th century. Adapted from the Chinese Wenchang chicken, it became a hawker staple in the 1950s. The dish's simplicity—poached or steamed chicken with fragrant rice cooked in chicken broth—belies its cultural significance as a comfort food across Singapore's diverse communities.",
  "Laksa": "Laksa, a spicy noodle soup, reflects Singapore's Peranakan heritage, blending Chinese and Malay culinary traditions. Originating in the 19th century, it combines coconut milk, curry spices, and ingredients like prawns and fishcake. Katong Laksa, a Singaporean variant, became iconic in the 1960s, with its rich, spicy broth and short noodles, symbolizing the city-state's fusion of cultures."
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createIngredientTray() {
  ingredientTray.innerHTML = "";
  const shuffledIngredients = shuffleArray([...allIngredients]);
  shuffledIngredients.forEach(ingredient => {
    const img = document.createElement("img");
    img.src = `assets/ingredients/${ingredient}.png`;
    img.className = "ingredient";
    img.dataset.name = ingredient;
    img.style.position = "relative"; // for tray positioning

    // Pointer events for drag (works for mouse + touch)
    img.style.touchAction = "none"; // prevent default touch scrolling

    img.addEventListener("pointerdown", pointerDown);

    ingredientTray.appendChild(img);
  });
}

function displayRequiredIngredients() {
  requiredIngredientsEl.innerHTML = "";
  const ingredients = dishes[currentOrder];
  ingredients.forEach(ingredient => {
    const span = document.createElement("span");
    span.textContent = ingredient.replace(/_/g, " ");
    span.className = "required-ingredient";
    requiredIngredientsEl.appendChild(span);
  });
}

// Variables for dragging
let dragItem = null;
let offsetX = 0;
let offsetY = 0;

function pointerDown(e) {
  e.preventDefault();
  const originalItem = e.target;
  soundDrag.currentTime = 0;
  soundDrag.play();

  // Clone the ingredient for dragging
  dragItem = originalItem.cloneNode(true);
  dragItem.style.position = "fixed";
  dragItem.style.zIndex = 1000;
  document.body.appendChild(dragItem);

  // Calculate offset between pointer and element top-left corner
  const rect = originalItem.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  moveAt(e.clientX, e.clientY);

  document.addEventListener("pointermove", pointerMove);
  document.addEventListener("pointerup", pointerUp);
}

function pointerMove(e) {
  e.preventDefault();
  if (!dragItem) return;
  moveAt(e.clientX, e.clientY);
}

function moveAt(clientX, clientY) {
  dragItem.style.left = (clientX - offsetX) + "px";
  dragItem.style.top = (clientY - offsetY) + "px";
}

function pointerUp(e) {
  e.preventDefault();
  if (!dragItem) return;

  // Check if dropped inside plate area
  const plateRect = plateArea.getBoundingClientRect();
  if (
    e.clientX > plateRect.left &&
    e.clientX < plateRect.right &&
    e.clientY > plateRect.top &&
    e.clientY < plateRect.bottom
  ) {
    const ingredient = dragItem.dataset.name;
    if (!addedIngredients.includes(ingredient)) {
      addedIngredients.push(ingredient);

      const img = document.createElement("img");
      img.src = `assets/ingredients/${ingredient}.png`;
      img.dataset.name = ingredient;
      img.className = "dropped-ingredient";

      // Remove ingredient on click/tap
      img.addEventListener("click", () => {
        droppedIngredients.removeChild(img);
        addedIngredients = addedIngredients.filter(i => i !== ingredient);
        serveButton.style.display = checkOrder() ? "inline-block" : "none";
      });

      droppedIngredients.appendChild(img);
    }
    if (checkOrder()) {
      serveButton.style.display = "inline-block";
    }
  }

  // Remove the dragged clone
  document.body.removeChild(dragItem);
  dragItem = null;
  document.removeEventListener("pointermove", pointerMove);
  document.removeEventListener("pointerup", pointerUp);
}

function newOrder() {
  const keys = Object.keys(dishes);
  const randomDish = keys[Math.floor(Math.random() * keys.length)];
  currentOrder = randomDish;
  orderBubble.textContent = randomDish;
  customerFace.src = "assets/ui/customer_neutral.png";
  resetPlate();
  createIngredientTray(); // Recreate tray with randomized ingredients
  displayRequiredIngredients(); // Show required ingredients
}

function resetPlate() {
  addedIngredients = [];
  droppedIngredients.innerHTML = "";
  serveButton.style.display = "none";
}

function checkOrder() {
  const correct = dishes[currentOrder];
  return correct.every(ing => addedIngredients.includes(ing)) && addedIngredients.length === correct.length;
}

serveButton.addEventListener("click", () => {
  if (checkOrder()) {
    score += 10;
    scoreEl.textContent = score;
    customerFace.src = "assets/ui/customer_happy.png";
    soundCorrect.currentTime = 0;
    soundCorrect.play();
    serveButton.style.display = "none";

    if (score >= 200) {
      endGame(true);
      return;
    }

    setTimeout(() => {
      newOrder();
    }, 1500);
  } else {
    customerFace.src = "assets/ui/customer_angry.png";
    soundWrong.currentTime = 0;
    soundWrong.play();
  }
});

function updateTimer() {
  timeLeft--;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerEl.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;

  if (timeLeft <= 0) {
    endGame(false);
  }
}

function endGame(won) {
  clearInterval(timerInterval);
  gameOverScreen.style.display = "flex";
  finalScoreEl.textContent = score;
  if (won) {
    const dishesList = Object.keys(foodHistories);
    const randomDish = dishesList[Math.floor(Math.random() * dishesList.length)];
    gameResultEl.textContent = `History of ${randomDish}`;
    const historyText = document.createElement("p");
    historyText.textContent = foodHistories[randomDish];
    gameResultEl.appendChild(historyText);
  } else {
    gameResultEl.textContent = "Time's Up!";
  }
  soundEnd.play();
}

createIngredientTray();
newOrder();
timerInterval = setInterval(updateTimer, 1000);