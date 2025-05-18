const dishes = {
  "Nasi Lemak": ["rice", "egg", "ikan_bilis", "peanuts", "cucumber", "sambal", "chicken"],
  "Chicken Rice": ["rice", "chicken", "cucumber", "soy_sauce", "soup"]
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

function createIngredientTray() {
  ingredientTray.innerHTML = "";
  allIngredients.forEach(ingredient => {
    const img = document.createElement("img");
    img.src = `assets/ingredients/${ingredient}.png`;
    img.className = "ingredient";
    img.dataset.name = ingredient;
    img.style.position = "relative"; // for moving during drag

    // Pointer events for drag (works for mouse + touch)
    img.style.touchAction = "none"; // prevent default touch scrolling

    img.addEventListener("pointerdown", pointerDown);

    ingredientTray.appendChild(img);
  });
}

// Variables for dragging
let dragItem = null;
let offsetX = 0;
let offsetY = 0;

function pointerDown(e) {
  e.preventDefault();
  dragItem = e.target;
  soundDrag.currentTime = 0;
  soundDrag.play();

  // Calculate offset between pointer and element top-left corner
  const rect = dragItem.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  // Bring dragged element on top
  dragItem.style.position = "fixed";
  dragItem.style.zIndex = 1000;
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

  // Reset dragged ingredient position back to tray
  dragItem.style.position = "relative";
  dragItem.style.left = "";
  dragItem.style.top = "";
  dragItem.style.zIndex = "";

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
  gameResultEl.textContent = won ? "You Win! 🏆" : "Time's Up!";
  soundEnd.play();
}

createIngredientTray();
newOrder();
timerInterval = setInterval(updateTimer, 1000);
