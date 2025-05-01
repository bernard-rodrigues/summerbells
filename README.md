# Rabbit Jump Game Documentation

## Overview

This JavaScript code creates an interactive browser game where players control a rabbit that jumps and collects bells. The game combines physics-based mechanics with simple controls, creating a vertical platformer experience. The game tracks two main scores: maximum height achieved and number of bells collected.

## Game Mechanics

### Core Gameplay
- Players control a rabbit character that can jump and move horizontally
- Collecting bells gives points and boosts the rabbit upward
- The game ends when the rabbit falls back to the ground
- The game tracks and displays high scores for maximum height and bells collected

### Controls
- **Click** or **Spacebar**: Initiate a jump (when rabbit is on the ground)
- **A** or **Left Arrow**: Move rabbit left
- **D** or **Right Arrow**: Move rabbit right

## Code Structure and Components

### Constants and Variables

```javascript
// --- Constants and Initial Variables ---
const fps = 60;                       // Target frames per second
const rabbitStartHeight = 0;          // Initial vertical position (% of container)
const rabbitStartLeft = 50;           // Initial horizontal position (% of container)
const jumpSpeed = 0.15;               // Initial upward velocity (% of container per ms)
const horizontalSpeed = 1;            // Horizontal movement speed (% of container per frame)
const gravity = 0.0005;               // Downward acceleration (% of container per ms²)
const boostFactor = 2;                // Jump boost multiplier when collecting bells
```

These constants define the game's physics parameters and initial positioning values.

### Game State Variables

```javascript
let jumpAnimationId;                  // ID for animation frame
let isJumping = false;                // Track if rabbit is currently jumping
let keysPressed = {};                 // Track currently pressed movement keys
let bellsPoints = 0;                  // Counter for collected bells
let bellsList = [];                   // List of all bell elements
let maxHeightScore = 0;               // Track maximum height achieved
```

These variables maintain the current state of the game during play.

### DOM Element References

The code creates references to key DOM elements:
- `container`: The game's main container
- `rabbit`: The player character
- `floor`: The ground element
- `score`: Container for score displays
- `bellsScore`: Display for bell count
- `heightScore`: Display for maximum height
- `title`: Game title element
- `heightRecordDisplay`: Display for height record
- `bellsRecordDisplay`: Display for bells record

### Core Functions

#### `resetGame()`
Resets the game to initial state:
- Repositions the rabbit to start position
- Removes all bells from the container
- Updates and displays high scores using localStorage
- Resets current game scores
- Adds the first bell

#### `createSparkleEffect(x, y)`
Creates a particle animation effect when a bell is collected:
- Generates multiple particle elements with random properties
- Animates particles in random directions with fade-out effects
- Creates a visual "sparkle" at the specified coordinates

#### `addBell(bottom, collidedLeft, collidedBottom)`
Creates a new bell element:
- Adds a bell to the game container
- Positions it at a random horizontal position or specified height
- Manages the bell list to prevent too many elements on screen

#### `checkCollision(element1, element2)`
Detects collision between two DOM elements:
- Gets bounding rectangles for both elements
- Returns true if the rectangles overlap, false otherwise

#### `jump(initialTime, initialHeight, initialVelocity, lastFrameTime, targetInterval, lastRabbitHeight)`
The main game loop function that handles jumping physics:
- Calculates the rabbit's position using physics equations
- Manages the vertical scrolling effect when rabbit reaches certain height
- Detects collisions with bells
- Handles horizontal movement when keys are pressed
- Updates visual elements and scores
- Manages game end condition when rabbit falls to ground

### Event Listeners

The code sets up event listeners for player input:
- `click`: Initiates a jump when clicking anywhere
- `keydown`: Tracks pressed movement keys and spacebar for jumping
- `keyup`: Tracks released movement keys

### Visual Effects

- Background color changes based on height
- Text color adjusts to maintain visibility
- Sparkle effects appear when collecting bells
- Game title fades out as player jumps higher
- Rabbit rotates slightly when moving horizontally

### Persistence

The game uses `localStorage` to save and display high scores between sessions.

## Physics Implementation

The game uses simple physics equations to simulate jumping:
- Position calculation: `height = initialHeight + initialVelocity * t - 0.5 * (gravity * t²)`
- Vertical camera effect: When rabbit reaches 60% height, the environment scrolls instead of the rabbit
- Collision detection using DOM element bounding rectangles

## Performance Considerations

- The code implements frame rate limiting to target 60fps
- Uses `requestAnimationFrame` for smooth animation
- Limits the number of bell elements to prevent memory issues
- Manages particle effects lifecycle to clean up DOM elements

## Initialization

The entire game is wrapped in a `DOMContentLoaded` event listener to ensure all elements are loaded before game initialization.
