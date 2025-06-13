// script.js

// Get the canvas element and its 2D rendering context
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

// --- Configuration Variables ---
const fontSize = 20; // Size of each falling character in pixels
const trailLength = 20; // Number of characters in a falling trail (shorter for clarity)
const resetChance = 0.98; // Probability (0-1) that a column will reset when it goes off screen
const animationSpeed = 60; // Milliseconds per frame (approx. 8 FPS - as per your setting)

// --- Dynamic Canvas Resizing ---
// Function to set canvas dimensions to fill the window
function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Recalculate the number of columns based on the new width and font size
  // Each element in 'columns' array represents the Y-coordinate (vertical position)
  // of the next character to be drawn at the bottom of that column.
  // We initialize all columns to 0 (top of the screen).
  columns = Array(Math.floor(canvas.width / fontSize)).fill(0);
}

// Set initial size when the script loads
setCanvasSize();

// Adjust canvas size and recalculate columns when the window is resized
window.addEventListener("resize", setCanvasSize);

// --- Character Set Loading ---
let characters = []; // Array to hold the characters for the digital rain

// Fetch characters from the 'characters.json' file
fetch("characters.json")
  .then((response) => {
    // Check if the response is OK (status 200)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json(); // Parse the JSON data from the response
  })
  .then((data) => {
    // Assign the fetched data (array of characters) to our 'characters' variable
    characters = data;
    // Start the animation loop once characters are loaded
    setInterval(draw, animationSpeed);
  })
  .catch((error) => {
    // Log any errors that occur during the fetch operation
    console.error("Error loading characters.json:", error);
    // Fallback characters if loading fails (optional, but good for robustness)
    characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};':\"\\|,.<>/?`~".split(
        "",
      );
    setInterval(draw, animationSpeed); // Still try to start animation
  });

// --- Animation Logic ---
// The main drawing function called repeatedly
function draw() {
  // 1. Create the trailing effect by drawing a semi-transparent black rectangle
  // This makes previous frames fade out gradually. Higher alpha (0.3) for quicker fade.
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set font properties for drawing text
  ctx.font = `${fontSize}px monospace`; // Use a monospace font for consistent character width

  // Loop through each column of falling characters
  for (let i = 0; i < columns.length; i++) {
    // Calculate the X position for the current column
    const x = i * fontSize;
    // Get the current Y position (bottom of the current character trail) for this column
    let y = columns[i];

    // Draw a trail of characters for the current column
    for (let j = 0; j < trailLength; j++) {
      // Calculate the Y position for each character in the trail (moving upwards from 'y')
      const currentY = y - j * fontSize;

      // Get a random character from our loaded set
      const randomChar =
        characters[Math.floor(Math.random() * characters.length)];

      // Set the fill color based on whether it's the leading character or a trailing one
      if (j === 0) {
        // Bright green for the leading character (the "head" of the rain drop)
        ctx.fillStyle = "#0F0";
      } else {
        // Fading green for the trailing characters
        // The alpha (opacity) decreases as 'j' increases, making characters fade out
        ctx.fillStyle = `rgba(0, 255, 0, ${1 - j / trailLength})`;
      }

      // Draw the character on the canvas
      // text, x-position, y-position
      ctx.fillText(randomChar, x, currentY);
    }

    // Move the entire column down by one font size for the next frame
    columns[i] += fontSize;

    // If the bottom of the column goes off the screen, reset its Y position to the top
    // A random chance is added here (resetChance) so not all columns restart at the same time,
    // creating a more organic, continuous rain effect.
    if (y > canvas.height && Math.random() > resetChance) {
      columns[i] = 0; // Reset to the top of the canvas
    }
  }
}

// The animation loop is started in the fetch.then() block after characters are loaded.
