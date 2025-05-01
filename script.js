document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and Initial Variables ---
    const fps = 60;                       // Target frames per second for smooth animation
    const rabbitStartHeight = 0;          // Initial vertical position of the rabbit (percentage of container height)
    const rabbitStartLeft = 50;           // Initial horizontal position of the rabbit (percentage of container width)
    const jumpSpeed = 0.15;               // Initial upward speed of the rabbit during a jump (% of container height per millisecond)
    const horizontalSpeed = 1;            // Speed of the rabbit's horizontal movement (% of container width per frame)
    const gravity = 0.0005;               // Downward acceleration affecting the rabbit during a jump (% of container height per millisecond squared)
    const boostFactor = 2;                // Multiplier applied to the jump speed when a bell collision occurs
    let jumpAnimationId;                  // ID of the requestAnimationFrame used for the jump animation
    let isJumping = false;                // Boolean flag to track if the rabbit is currently jumping
    let keysPressed = {};                 // Object to store the state of pressed keys for horizontal movement

    let bellsPoints = 0;                  // Counter for number of bells collected
    let bellsList = [];                   // Array to keep track of all bell elements
    let maxHeightScore = 0;               // Tracks the maximum height achieved in the current game

    // --- DOM Element References ---
    const container = document.getElementById('container');                  // Main game container
    const rabbit = document.getElementById('rabbit');                        // Rabbit character element
    rabbit.style.left = `${rabbitStartLeft}%`;                               // Set the initial horizontal position
    rabbit.style.bottom = `${rabbitStartHeight}%`;                           // Set the initial vertical position (on the ground)

    const floor = document.getElementById('floor');                          // Reference to the floor element
    floor.style.bottom = "0";                                                // Place floor at bottom of container

    const score = document.getElementById('score');                          // Container for score displays
    
    const bellsScore = document.getElementById('bells-score');               // Element showing bells collected
    bellsScore.innerText = "Bells: 0";                                       // Initialize bells score display

    const heightScore = document.getElementById('height-score');             // Element showing height reached
    heightScore.innerText = "Height: 0";                                     // Initialize height score display

    const title = document.getElementById('title');                          // Game title element

    const heightRecordDisplay = document.getElementById('height-record');    // Display for height record
    const bellsRecordDisplay = document.getElementById('bells-record');      // Display for bells record


    /**
     * Resets the game to its initial state
     * Repositions rabbit, clears bells, updates high scores, and adds first bell
     */
    const resetGame = () => {
        // --- Initial Styling ---
        rabbit.style.bottom = `${rabbitStartHeight}%`;                       // Reset rabbit to ground level
        rabbit.style.transform = "translateX(-50%)";                         // Reset rabbit rotation

        // Remove all game elements except essential UI components
        const containerChildren = Array.from(container.children).filter(child => 
            child.id !== 'rabbit' && 
            child.id !== 'floor' &&
            child.id !== 'height-score' &&
            child.id !== 'bells-score' &&
            child.id !== 'score' &&
            child.id !== 'title');
        containerChildren.forEach(child => {
            child.remove();
        });

        // Get current high scores from localStorage
        const heightRecord = localStorage.getItem('heightRecord') ? parseFloat(localStorage.getItem('heightRecord')) : 0;
        const bellsRecord = localStorage.getItem('bellsRecord') ? parseInt(localStorage.getItem('bellsRecord')) : 0;

        // Update high scores if current game beat records
        if (maxHeightScore > heightRecord){
            localStorage.setItem('heightRecord', maxHeightScore.toFixed(2));
        }

        if (bellsPoints > bellsRecord){
            localStorage.setItem('bellsRecord', bellsPoints.toFixed(0));
        }

        // Retrieve and display the updated records
        const updatedHeightRecord = localStorage.getItem('heightRecord') ? localStorage.getItem('heightRecord') : "0";
        const updatedBellsRecord = localStorage.getItem('bellsRecord') ? localStorage.getItem('bellsRecord') : "0";

        heightRecordDisplay.innerText = `Height Record: ${updatedHeightRecord}`;
        bellsRecordDisplay.innerText = `Bells Record: ${updatedBellsRecord}`;

        // Reset current game variables
        bellsPoints = 0;
        maxHeightScore = 0;
        bellsList = [];
        floor.style.bottom = "0";
        bellsScore.innerText = "Bells: 0";
        heightScore.innerText = "Height: 0";
        addBell();                                                         // Add initial bell to start the game
    }


    /**
     * Creates a sparkle effect animation when collecting a bell
     * Generates multiple particles with random properties that animate outward
     * @param {number} x - Horizontal position for sparkle effect (percentage of container width)
     * @param {number} y - Vertical position for sparkle effect (percentage of container height)
     */
    const createSparkleEffect = (x, y) => {
        // Number of particles to create
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            // Create a particle element
            const particle = document.createElement('div');
            particle.className = 'sparkle-particle';
            container.appendChild(particle);
            
            // Random size between 3px and 8px
            const size = 3 + Math.random() * 5;
            
            // Random color - magical colors
            const hue = Math.random() * 360;
            const color = `hsl(${hue}, 100%, 70%)`;
            
            // Set initial styles
            particle.style.position = 'absolute';
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = color;
            particle.style.boxShadow = `0 0 ${size}px ${color}, 0 0 ${size * 2}px white`;
            particle.style.left = `${x}%`;
            particle.style.bottom = `${y}%`;
            particle.style.transform = 'translate(-50%, 50%)';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '10';
            
            // Generate random direction
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            const dirX = Math.cos(angle) * speed;
            const dirY = Math.sin(angle) * speed;
            
            // Animate the particle
            let opacity = 1;
            let frameCount = 0;
            const maxFrames = 30 + Math.random() * 30;    // Random duration for each particle
            
            const animateParticle = () => {
                frameCount++;
                
                const currentX = parseFloat(particle.style.left);
                const currentY = parseFloat(particle.style.bottom);
                
                // Move particle in its random direction
                particle.style.left = `${currentX + dirX}%`;
                particle.style.bottom = `${currentY + dirY}%`;
                
                // Fade out gradually
                opacity -= 1 / maxFrames;
                particle.style.opacity = opacity;
                
                // Add a subtle pulse effect
                const scale = 1 + 0.2 * Math.sin(frameCount * 0.3);
                particle.style.transform = `translate(-50%, 50%) scale(${scale})`;
                
                if (frameCount < maxFrames) {
                    requestAnimationFrame(animateParticle);  // Continue animation
                } else {
                    particle.remove();                       // Remove particle when animation completes
                }
            };
            
            requestAnimationFrame(animateParticle);          // Start particle animation
        }
    };
    
    /**
     * Adds a new bell to the game
     * @param {number} bottom - Vertical position for the bell (percentage of container height)
     * @param {number} collidedLeft - Horizontal position of collision (not used but accepted in parameters)
     * @param {number} collidedBottom - Vertical position of collision (not used but accepted in parameters)
     */
    const addBell = (bottom, collidedLeft, collidedBottom) => {
        const newBell = document.createElement('div');
        bellsList.push(newBell);                             // Add bell to tracking array

        newBell.className = 'bell';

        container.appendChild(newBell);

        // Position the bell - random horizontal if not specified, default vertical height of 20% if not specified
        const newLeft = bottom ? Math.random() * 100 : 50;
        const newBottom = bottom ? bottom : 20;
        
        newBell.style.left = `${newLeft}%`;
        newBell.style.bottom = `${newBottom}%`;
        
        // Remove oldest bells if we have too many to prevent performance issues
        let bellToDelete;
        
        while (bellsList.length > 10) {
            bellToDelete = bellsList.shift();                // Remove oldest bell from array
            bellToDelete.remove();                           // Remove bell from DOM
        }
    }

    /**
     * Checks for collision between two HTML elements
     * @param {HTMLElement} element1 - The first element to check
     * @param {HTMLElement} element2 - The second element to check
     * @returns {boolean} - True if the elements are colliding, false otherwise
     */
    const checkCollision = (element1, element2) => {
        const rectA = element1.getBoundingClientRect();      // Get bounding box of first element
        const rectB = element2.getBoundingClientRect();      // Get bounding box of second element

        // Returns true if the rectangles overlap, false otherwise
        return !(rectA.right < rectB.left ||
            rectA.left > rectB.right ||
            rectA.bottom < rectB.top ||
            rectA.top > rectB.bottom);
    }

    /**
     * Animates the rabbit's jump with physics, handles collisions and game state
     * @param {number} initialTime - The timestamp when the jump started (performance.now())
     * @param {number} initialHeight - The initial vertical position at the start of this jump cycle (percentage)
     * @param {number} initialVelocity - The initial upward velocity for this jump cycle (% per millisecond)
     * @param {number} lastFrameTime - The timestamp of the previous animation frame
     * @param {number} targetInterval - The target time interval between frames (in milliseconds for ~60fps)
     * @param {number} lastRabbitHeight - The last recorded height of the rabbit
     */
    const jump = (initialTime, initialHeight = 0, initialVelocity = jumpSpeed, lastFrameTime = 0, targetInterval = 1000 / fps, lastRabbitHeight = initialHeight) => {
        const currentTime = performance.now();               // Get the current timestamp
        const elapsedSinceLastFrame = currentTime - lastFrameTime;

        // Only update game state at target frame rate
        if (elapsedSinceLastFrame >= targetInterval) {
            const t = currentTime - initialTime;             // Calculate elapsed time since jump started
            // Calculate current height using physics formula for vertical motion under gravity
            const height = initialHeight + initialVelocity * t - 0.5 * (gravity * Math.pow(t, 2)); 
            
            // Update maximum height score if current height is greater
            maxHeightScore = height > maxHeightScore ? height : maxHeightScore;
            heightScore.innerText = `Height: ${maxHeightScore.toFixed(2)}`;
            
            // Fade out title as player jumps higher
            title.style.opacity = height < 100 ? 1 - height/100 : 0;
            title.style.top = height < 100 ? `${30 - 15*(height/100)}%` : "0";

            const bells = document.getElementsByClassName('bell');  // Get all bell elements
            let collidedBell = null;                         // Track collided bell (if any)

            // Change background color based on height (darker as you go higher)
            const lightness = height < 10000 ? 100 - (height/10000)*100 : 0;
            container.style.backgroundColor = `hsl(200, 100%, ${lightness.toFixed(2)}%)`;
            score.style.color = `hsl(200, 100%, ${(100 - lightness).toFixed(2)}%)`;  // Invert text color

            // Check for collision with any bell
            for (let i = 0; i < bells.length; i++) {
                if (checkCollision(bells[i], rabbit)) {
                    collidedBell = bells[i];                // Store collided bell
                    break;                                  // Exit loop after first collision
                }
            }

            // Handle horizontal movement
            let currentHorizontalPosition = parseFloat(rabbit.style.left);

            // Move left if appropriate keys are pressed
            if (keysPressed['a'] || keysPressed['ArrowLeft']) {
                currentHorizontalPosition = Math.max(currentHorizontalPosition - horizontalSpeed, 0);  // Don't go beyond left edge
                rabbit.style.transform = "translateX(-50%) rotate(-15deg)";  // Tilt rabbit left while moving
            } 
            // Move right if appropriate keys are pressed
            else if (keysPressed['d'] || keysPressed['ArrowRight']) {
                currentHorizontalPosition = Math.min(currentHorizontalPosition + horizontalSpeed, 100);  // Don't go beyond right edge
                rabbit.style.transform = "translateX(-50%) rotate(15deg)";   // Tilt rabbit right while moving
            } 
            // Reset rotation if no movement keys pressed
            else {
                rabbit.style.transform = "translateX(-50%)";
            }

            rabbit.style.left = `${currentHorizontalPosition}%`;  // Update rabbit's horizontal position

            // Handle collision with a bell
            if (collidedBell) {
                bellsPoints += 1;                          // Increment bell counter
                bellsScore.innerText = `Bells: ${bellsPoints}`;  // Update bell score display

                // Get the position of the bell for the animation
                const bellRect = collidedBell.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Create magical sparkle animation at bell's position
                createSparkleEffect(
                    (bellRect.left + bellRect.width/2 - containerRect.left) / containerRect.width * 100, 
                    parseFloat(collidedBell.style.bottom) || 0
                );

                // Add two new bells at higher positions
                addBell(80 + Math.random()*20);
                addBell(100 + Math.random()*20);

                collidedBell.remove();                     // Remove the collected bell from the DOM
                cancelAnimationFrame(jumpAnimationId);     // Stop the current jump animation

                // Start a new jump with boosted velocity from current height
                jumpAnimationId = requestAnimationFrame(() => jump(performance.now(), height, jumpSpeed * boostFactor));
                return;  // Exit current frame execution after collision
            } 
            // When rabbit reaches certain height, scroll the world instead of moving rabbit higher
            else if (height >= 60) {
                const container = document.getElementById('container');
                const currentContainerChildren = Array.from(container.children).filter(child => child.id !== 'rabbit');

                // Calculate height difference since last frame
                const heightDifference = height - lastRabbitHeight;

                // Move all elements down by the height difference (camera effect)
                for (let i = 0; i < currentContainerChildren.length; i++) {
                    const currentBottom = parseFloat(currentContainerChildren[i].style.bottom) || 0;
                    currentContainerChildren[i].style.bottom = `${currentBottom - heightDifference}%`;
                }
                
                // Keep rabbit at fixed height
                rabbit.style.bottom = '60%';
                
                // Continue jump animation with updated lastRabbitHeight
                jumpAnimationId = requestAnimationFrame(() => jump(initialTime, initialHeight, initialVelocity, currentTime, targetInterval, height));
            }
            // Continue jump animation while rabbit is above the ground
            else if (height >= 0) {
                rabbit.style.bottom = `${height}%`;        // Update rabbit's vertical position
                floor.style.bottom = "0";                  // Keep floor at ground level
                
                // Request next animation frame
                jumpAnimationId = requestAnimationFrame(() => jump(initialTime, initialHeight, initialVelocity, currentTime, targetInterval, height));
            }
            // End jump when rabbit falls to or below ground
            else {
                rabbit.style.bottom = `0`;                 // Place rabbit on the ground
                cancelAnimationFrame(jumpAnimationId);     // Stop the jump animation
                jumpAnimationId = null;                    // Reset animation ID
                isJumping = false;                         // Reset jumping flag
                resetGame();                               // Reset game state
                return;                                    // End animation loop
            }
        } else {
            // If target interval hasn't elapsed, request next frame without updating game state
            jumpAnimationId = requestAnimationFrame((newTime) => jump(initialTime, initialHeight, initialVelocity, lastFrameTime, targetInterval, lastRabbitHeight));
        }
    };

    // --- Event Listeners ---

    // Event listener for mouse clicks to initiate a jump
    document.addEventListener('click', () => {
        // Only start jump if rabbit is not already jumping
        if (!isJumping) {
            isJumping = true;                              // Set jumping flag
            jump(performance.now(), rabbitStartHeight, jumpSpeed);  // Start jump animation
        }
    });

    // Event listener for keydown events to track pressed keys
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        // Track movement keys
        if (key === 'a' || key === 'ArrowLeft' || key === 'd' || key === 'ArrowRight') {
            keysPressed[key] = true;
        } 
        // Allow jumping with spacebar
        else if ((key === ' ' || key === 'Spacebar') && !isJumping){
            isJumping = true;
            jump(performance.now(), rabbitStartHeight, jumpSpeed);
        }
    });

    // Event listener for keyup events to track released keys
    document.addEventListener('keyup', (event) => {
        const key = event.key;
        // Update movement key tracking when keys are released
        if (key === 'a' || key === 'ArrowLeft' || key === 'd' || key === 'ArrowRight') {
            keysPressed[key] = false;
        }
    });

    // Initialize the game
    resetGame();
});