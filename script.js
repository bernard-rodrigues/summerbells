document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and Initial Variables ---
    const rabbitStartHeight = 0; // Initial vertical position of the rabbit (percentage of container height).
    const rabbitStartLeft = 50;  // Initial horizontal position of the rabbit (percentage of container width).
    const jumpSpeed = 0.15;       // Initial upward speed of the rabbit during a jump (% of container height per millisecond).
    const horizontalSpeed = 1;   // Speed of the rabbit's horizontal movement (% of container width per frame).
    const gravity = 0.0005;      // Downward acceleration affecting the rabbit during a jump (% of container height per millisecond squared).
    const boostFactor = 2;    // Multiplier applied to the jump speed when a collision occurs.
    let jumpAnimationId;         // ID of the requestAnimationFrame used for the jump animation.
    let isJumping = false;       // Boolean flag to track if the rabbit is currently jumping.
    let keysPressed = {};        // Object to store the state of pressed keys for horizontal movement.

    let bellsPoints = 0;
    let bellsList = [];

    // --- DOM Element References ---
    const container = document.getElementById('container');
    const rabbit = document.getElementById('rabbit'); // Reference to the rabbit element.
    rabbit.style.left = `${rabbitStartLeft}%`;   // Set the initial horizontal position.
    rabbit.style.bottom = `${rabbitStartHeight}%`; // Set the initial vertical position (on the ground).
    
    const floor = document.getElementById('floor'); // Reference to the floor element.
    floor.style.bottom = "0";

    /**
     * Resets the game to its initial
     */
    const resetGame = () => {
        // --- Initial Styling ---
        rabbit.style.bottom = `${rabbitStartHeight}%`; // Set the initial vertical position (on the ground).
        rabbit.style.transform = "translateX(-50%)";

        const container = document.getElementById('container')
        const containerChildren = Array.from(container.children).filter(child => child.id !== 'rabbit' && child.id !== 'floor');
        containerChildren.forEach(child => {
            child.remove();
        })

        bellsPoints = 0;
        bellsList = [];
        floor.style.bottom = "0";
        addBell();
    }
    
    
    /**
     * Add a new bell to container
     * @param {number} bottom - Bell height according to container
     */
    const addBell = (bottom) => {
        const newBell = document.createElement('div');
        bellsList.push(newBell);

        newBell.className = 'bell';

        container.appendChild(newBell);

        newBell.style.bottom = `${bottom ? bottom : 20}%`;
        newBell.style.left = `${bottom ? Math.random() * 100 : 50}%`;

        let bellToDelete;

        while(bellsList.length > 10){
            bellToDelete = bellsList.shift();
            bellToDelete.remove();
        }
    }
    
    /**
        * Checks for collision between two HTML elements.
        * @param {HTMLElement} element1 - The first element to check.
        * @param {HTMLElement} element2 - The second element to check.
        * @returns {boolean} - True if the elements are colliding, false otherwise.
    */
    const checkCollision = (element1, element2) => {
        const rectA = element1.getBoundingClientRect();
        const rectB = element2.getBoundingClientRect();

        // Returns true if the rectangles overlap, false otherwise.
        return !(rectA.right < rectB.left ||
            rectA.left > rectB.right ||
            rectA.bottom < rectB.top ||
            rectA.top > rectB.bottom);
    }

    /**
        * Animates the rabbit's jump, applying physics and collision detection.
        * @param {number} initialTime - The timestamp when the jump started (performance.now()).
        * @param {number} [initialHeight=0] - The initial vertical position of the rabbit at the start of this jump cycle (percentage).
        * @param {number} [initialVelocity=jumpSpeed] - The initial upward velocity of the rabbit for this jump cycle (% per millisecond).
    */
    const jump = (initialTime, initialHeight = 0, initialVelocity = jumpSpeed, lastRabbitHeight = initialHeight) => {
        const currentTime = performance.now(); // Get the current timestamp.
        const t = currentTime - initialTime;   // Calculate the elapsed time since the jump started.
        const height = initialHeight + initialVelocity * t - 0.5 * (gravity * Math.pow(t, 2)); // Calculate the current vertical position using the MUV formula.

        const bells = document.getElementsByClassName('bell'); // Get all elements with the class 'bell'.
        let collidedBell = null; // Variable to store the bell that the rabbit collided with (if any).

        // Iterate through all the 'bell' elements to check for collision with the rabbit.
        for (let i = 0; i < bells.length; i++) {
            if (checkCollision(bells[i], rabbit)) {
                collidedBell = bells[i]; // If a collision occurs, store the collided bell.
                break; // Exit the loop as we only need to detect the first collision.
            }
        }

        let currentHorizontalPosition = parseFloat(rabbit.style.left); // Get the current horizontal position of the rabbit as a float.

        // Handle horizontal movement based on pressed keys.
        if (keysPressed['a'] || keysPressed['ArrowLeft']) {
            currentHorizontalPosition = Math.max(currentHorizontalPosition - horizontalSpeed, 0); // Move left, ensuring it doesn't go beyond 0%.
            rabbit.style.transform = "translateX(-50%) rotate(-15deg)";
        } else if (keysPressed['d'] || keysPressed['ArrowRight']) {
            currentHorizontalPosition = Math.min(currentHorizontalPosition + horizontalSpeed, 100); // Move right, ensuring it doesn't go beyond 100%.
            rabbit.style.transform = "translateX(-50%) rotate(15deg)";
        }else{
            rabbit.style.transform = "translateX(-50%)";
        }

        rabbit.style.left = `${currentHorizontalPosition}%`; // Update the rabbit's horizontal position in the DOM.

        // Handle collision with a bell.
        if (collidedBell) {
            bellsPoints += 1;
            
            collidedBell.remove(); // Remove the collided bell from the DOM.
            cancelAnimationFrame(jumpAnimationId); // Stop the current jump animation frame.
            // Start a new jump animation with the current bottom position as the initial height and an increased jump speed.
            addBell(90);
            addBell(120);
            jumpAnimationId = requestAnimationFrame(() => jump(performance.now(), height, jumpSpeed * boostFactor));
        }
        
        else if (height >= 60) {
            const container = document.getElementById('container');
            const currentContainerChildren = Array.from(container.children).filter(child => child.id !== 'rabbit');

            const heightDifference = height - lastRabbitHeight; // Calcula a diferença de altura desde o último frame
            
            for(let i = 0; i < currentContainerChildren.length; i++){
                const currentBottom = parseFloat(currentContainerChildren[i].style.bottom) || 0;
                currentContainerChildren[i].style.bottom = `${currentBottom - heightDifference}%`; // Aplica a diferença (pode ser negativa se o coelho estiver descendo)
            }
            rabbit.style.bottom = '60%';
            jumpAnimationId = requestAnimationFrame(() => jump(initialTime, initialHeight, initialVelocity, height)); // Request the next animation frame for the jump.
        }
        // Continue the jump animation as long as the rabbit is above or at the ground.
        else if (height >= 0) {
            rabbit.style.bottom = `${height}%`; // Update the rabbit's vertical position in the DOM.
            floor.style.bottom = "0"; // Ensure the floor is set to the ground.
            jumpAnimationId = requestAnimationFrame(() => jump(initialTime, initialHeight, initialVelocity, height)); // Request the next animation frame for the jump.
        }
        // The jump has ended (rabbit has returned to or gone below the ground).
        else {
            rabbit.style.bottom = `0`; // Ensure the rabbit is set to the ground.
            cancelAnimationFrame(jumpAnimationId); // Stop the jump animation.
            jumpAnimationId = null; // Reset the animation ID.
            isJumping = false; // Reset the jumping flag.
            resetGame();
        }
    };

    // --- Event Listeners ---

    // Event listener for mouse clicks to initiate a jump.
    document.addEventListener('click', () => {
        // Only initiate a jump if the rabbit is not currently jumping.
        if (!isJumping) {
            isJumping = true; // Set the jumping flag to true.
            jump(performance.now(), rabbitStartHeight, jumpSpeed); // Start the jump animation.
        }
    });

    // Event listener for keydown events to track pressed keys for horizontal movement.
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        // If the pressed key is 'a', 'ArrowLeft', 'd', or 'ArrowRight', mark it as pressed.
        if (key === 'a' || key === 'ArrowLeft' || key === 'd' || key === 'ArrowRight') {
            keysPressed[key] = true;
        }
    });

    // Event listener for keyup events to track released keys for horizontal movement.
    document.addEventListener('keyup', (event) => {
        const key = event.key;
        // If the released key is 'a', 'ArrowLeft', 'd', or 'ArrowRight', mark it as not pressed.
        if (key === 'a' || key === 'ArrowLeft' || key === 'd' || key === 'ArrowRight') {
            keysPressed[key] = false;
        }
    });

    addBell();
});