const wordEl = document.getElementById("word");
const wrongLettersEl = document.getElementById("wrong-letters");
const playButton = document.getElementById("play-button");
const finalMessage = document.getElementById("final-message");
const finalMessageContainer = document.getElementById("final-message-container");
const notification = document.getElementById("notification");

// Now there are exactly 6 .figure-part elements in the SVG:
// 0: noose, 1: head, 2: body, 3: left arm, 4: right arm, 5: legs (both)
const figureParts = document.querySelectorAll(".figure-part");

let selectedWord = "";
let correctLetters = [];
let wrongLetters = [];


// ✅ Fetch random meaningful word (between 4 and 8 letters)
async function getRandomWord() {
  try {
    const res = await fetch("https://random-word-api.herokuapp.com/word?number=1");
    const data = await res.json();
    const word = data[0].toLowerCase();

    // Accept only 4–8 letter words
    if (word.length >= 4 && word.length <= 8) {
      return word;
    } else {
      return getRandomWord(); // try again if not valid
    }
  } catch (err) {
    console.error("API error, fallback to default word list.");
    const fallback = ["computer", "hangman", "coding", "python", "browser", "laptop", "network"];
    const filtered = fallback.filter(w => w.length >= 4 && w.length <= 8);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
}



// Initialize game
async function initGame() {
  selectedWord = await getRandomWord();
  correctLetters = [];
  wrongLetters = [];
  displayWord();
  updateWrongLetters();
  finalMessageContainer.style.display = "none";
}

// Show the hidden word
function displayWord() {
  wordEl.innerHTML = `
    ${selectedWord
      .split("")
      .map(
        (letter) =>
          `<span class="letter">${
            correctLetters.includes(letter) ? letter : "_"
          }</span>`
      )
      .join("")}
  `;

  const innerWord = wordEl.innerText.replace(/\n/g, "");
  if (innerWord === selectedWord) {
    finalMessage.innerText = "🎉 Congratulations! You won!";
    finalMessageContainer.style.display = "flex";
  }
}

// Update wrong letters
function updateWrongLetters() {
  wrongLettersEl.innerText = wrongLetters.join(" ");

  figureParts.forEach((part, index) => {
    const errors = wrongLetters.length;
    if (index < errors) {
      part.style.display = "block";   // reveal body part
    } else {
      part.style.display = "none";    // hide unused
    }
  });

  // Losing condition: wrong letters equals number of figure parts (6)
  if (wrongLetters.length === figureParts.length) {
    finalMessage.innerText = `💀 You lost! The word was "${selectedWord}".`;
    finalMessageContainer.style.display = "flex";
  }
}

// Show notification
function showNotification() {
  notification.style.display = "block";
  setTimeout(() => (notification.style.display = "none"), 2000);
}

// Keyboard input
window.addEventListener("keydown", (e) => {
  // only handle letters a-z
  if (e.key >= "a" && e.key <= "z") {
    const letter = e.key;

    if (selectedWord.includes(letter)) {
      if (!correctLetters.includes(letter)) {
        correctLetters.push(letter);
        displayWord();
      } else {
        showNotification();
      }
    } else {
      if (!wrongLetters.includes(letter)) {
        wrongLetters.push(letter);
        updateWrongLetters();
      } else {
        showNotification();
      }
    }
  }
});

// Restart game
playButton.addEventListener("click", initGame);

// Start first game
initGame();
