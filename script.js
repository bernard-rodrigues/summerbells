document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and Initial Variables ---
    const fps = 60;
    const rabbitStartHeight = 0; // Initial vertical position of the rabbit (percentage of container height).
    const rabbitStartLeft = 50;   // Initial horizontal position of the rabbit (percentage of container width).
    const jumpSpeed = 0.15;       // Initial upward speed of the rabbit during a jump (% of container height per millisecond).
    const horizontalSpeed = 1;   // Speed of the rabbit's horizontal movement (% of container width per frame).
    const gravity = 0.0005;       // Downward acceleration affecting the rabbit during a jump (% of container height per millisecond squared).
    const boostFactor = 2;      // Multiplier applied to the jump speed when a collision occurs.
    let jumpAnimationId;        // ID of the requestAnimationFrame used for the jump animation.
    let isJumping = false;      // Boolean flag to track if the rabbit is currently jumping.
    let keysPressed = {};       // Object to store the state of pressed keys for horizontal movement.

    let bellsPoints = 0;
    let bellsList = [];
    let maxHeightScore = 0;

    // --- DOM Element References ---
    const container = document.getElementById('container');
    const rabbit = document.getElementById('rabbit'); // Reference to the rabbit element.
    rabbit.style.left = `${rabbitStartLeft}%`;   // Set the initial horizontal position.
    rabbit.style.bottom = `${rabbitStartHeight}%`; // Set the initial vertical position (on the ground).

    const floor = document.getElementById('floor'); // Reference to the floor element.
    floor.style.bottom = "0";

    const score = document.getElementById('score');
    
    const bellsScore = document.getElementById('bells-score');
    bellsScore.innerText = "Bells: 0";

    const heightScore = document.getElementById('height-score');
    heightScore.innerText = "Height: 0";

    const title = document.getElementById('title');

    const heightRecordDisplay = document.getElementById('height-record');
    const bellsRecordDisplay = document.getElementById('bells-record');


    /**
     * Resets the game to its initial
     */
    const resetGame = () => {
        // --- Initial Styling ---
        rabbit.style.bottom = `${rabbitStartHeight}%`; // Set the initial vertical position (on the ground).
        rabbit.style.transform = "translateX(-50%)";

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

        const heightRecord = localStorage.getItem('heightRecord') ? parseFloat(localStorage.getItem('heightRecord')) : 0;
        const bellsRecord = localStorage.getItem('bellsRecord') ? parseInt(localStorage.getItem('bellsRecord')) : 0;

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

        bellsPoints = 0;
        maxHeightScore = 0;
        bellsList = [];
        floor.style.bottom = "0";
        bellsScore.innerText = "Bells: 0";
        heightScore.innerText = "Height: 0";
        addBell();
    }


    // Add this function to create the sparkle effect
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
            const maxFrames = 30 + Math.random() * 30;
            
            const animateParticle = () => {
                frameCount++;
                
                const currentX = parseFloat(particle.style.left);
                const currentY = parseFloat(particle.style.bottom);
                
                particle.style.left = `${currentX + dirX}%`;
                particle.style.bottom = `${currentY + dirY}%`;
                
                // Fade out gradually
                opacity -= 1 / maxFrames;
                particle.style.opacity = opacity;
                
                // Add a subtle pulse effect
                const scale = 1 + 0.2 * Math.sin(frameCount * 0.3);
                particle.style.transform = `translate(-50%, 50%) scale(${scale})`;
                
                if (frameCount < maxFrames) {
                    requestAnimationFrame(animateParticle);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animateParticle);
        }
    };
    
    /**
     * Add a new bell to container
     * @param {number} bottom - Bell height according to container
     */
    const addBell = (bottom, collidedLeft, collidedBottom) => {
        const newBell = document.createElement('div');
        bellsList.push(newBell);

        newBell.className = 'bell';

        container.appendChild(newBell);

        const newLeft = bottom ? Math.random() * 100 : 50;
        const newBottom = bottom ? bottom : 20;
        
        newBell.style.left = `${newLeft}%`;
        newBell.style.bottom = `${newBottom}%`;
        
        
        let bellToDelete;
        
        while (bellsList.length > 10) {
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
     * Animates the rabbit's jump, applying physics and collision detection, targeting ~60fps.
     * @param {number} initialTime - The timestamp when the jump started (performance.now()).
     * @param {number} [initialHeight=0] - The initial vertical position of the rabbit at the start of this jump cycle (percentage).
     * @param {number} [initialVelocity=jumpSpeed] - The initial upward velocity of the rabbit for this jump cycle (% per millisecond).
     * @param {number} [lastFrameTime=0] - The timestamp of the previous animation frame.
     * @param {number} [targetInterval=1000/fps] - The target time interval between frames (in milliseconds for ~60fps).
     * @param {number} [lastRabbitHeight=initialHeight] - The last recorded height of the rabbit.
     */
    const jump = (initialTime, initialHeight = 0, initialVelocity = jumpSpeed, lastFrameTime = 0, targetInterval = 1000 / fps, lastRabbitHeight = initialHeight) => {
        const currentTime = performance.now(); // Get the current timestamp.
        const elapsedSinceLastFrame = currentTime - lastFrameTime;

        if (elapsedSinceLastFrame >= targetInterval) {
            const t = currentTime - initialTime;   // Calculate the elapsed time since the jump started.
            const height = initialHeight + initialVelocity * t - 0.5 * (gravity * Math.pow(t, 2)); // Calculate the current vertical position using the MUV formula.
            
            maxHeightScore = height > maxHeightScore ? height : maxHeightScore;
            heightScore.innerText = `Height: ${maxHeightScore.toFixed(2)}`;
            title.style.opacity = height < 100 ? 1 - height/100 : 0;
            title.style.top = height < 100 ? `${30 - 15*(height/100)}%` : "0";

            const bells = document.getElementsByClassName('bell'); // Get all elements with the class 'bell'.
            let collidedBell = null; // Variable to store the bell that the rabbit collided with (if any).

            const lightness = height < 10000 ? 100 - (height/10000)*100 : 0;
            container.style.backgroundColor = `hsl(200, 100%, ${lightness.toFixed(2)}%)`;
            score.style.color = `hsl(200, 100%, ${(100 - lightness).toFixed(2)}%)`;

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
            } else {
                rabbit.style.transform = "translateX(-50%)";
            }

            rabbit.style.left = `${currentHorizontalPosition}%`; // Update the rabbit's horizontal position in the DOM.

            // Handle collision with a bell.
            if (collidedBell) {
                bellsPoints += 1;
                bellsScore.innerText = `Bells: ${bellsPoints}`;

                // Get the position of the bell for the animation
                const bellRect = collidedBell.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Create magical sparkle animation
                createSparkleEffect(
                    (bellRect.left + bellRect.width/2 - containerRect.left) / containerRect.width * 100, 
                    parseFloat(collidedBell.style.bottom) || 0
                );

                addBell(80 + Math.random()*20);
                addBell(100 + Math.random()*20);

                collidedBell.remove(); // Remove the collided bell from the DOM.
                cancelAnimationFrame(jumpAnimationId); // Stop the current jump animation frame.
                // Start a new jump animation with the current bottom position as the initial height and an increased jump speed.
                
                jumpAnimationId = requestAnimationFrame(() => jump(performance.now(), height, jumpSpeed * boostFactor));
                return; // Important: Exit the current frame execution after collision and restart.
            } else if (height >= 60) {
                const container = document.getElementById('container');
                const currentContainerChildren = Array.from(container.children).filter(child => child.id !== 'rabbit');

                const heightDifference = height - lastRabbitHeight; // Calcula a diferença de altura desde o último frame

                for (let i = 0; i < currentContainerChildren.length; i++) {
                    const currentBottom = parseFloat(currentContainerChildren[i].style.bottom) || 0;
                    currentContainerChildren[i].style.bottom = `${currentBottom - heightDifference}%`; // Aplica a diferença (pode ser negativa se o coelho estiver descendo)
                }
                rabbit.style.bottom = '60%';
                jumpAnimationId = requestAnimationFrame(() => jump(initialTime, initialHeight, initialVelocity, currentTime, targetInterval, height)); // Request the next animation frame for the jump.
            }
            // Continue the jump animation as long as the rabbit is above or at the ground.
            else if (height >= 0) {
                rabbit.style.bottom = `${height}%`; // Update the rabbit's vertical position in the DOM.
                floor.style.bottom = "0"; // Ensure the floor is set to the ground.
                jumpAnimationId = requestAnimationFrame(() => jump(initialTime, initialHeight, initialVelocity, currentTime, targetInterval, height)); // Request the next animation frame for the jump.
            }
            // The jump has ended (rabbit has returned to or gone below the ground).
            else {
                rabbit.style.bottom = `0`; // Ensure the rabbit is set to the ground.
                cancelAnimationFrame(jumpAnimationId); // Stop the jump animation.
                jumpAnimationId = null; // Reset the animation ID.
                isJumping = false; // Reset the jumping flag.
                resetGame();
                return; // Ensure the animation loop ends here.
            }
        } else {
            // If the target interval hasn't elapsed, request the next frame without updating the game state.
            jumpAnimationId = requestAnimationFrame((newTime) => jump(initialTime, initialHeight, initialVelocity, lastFrameTime, targetInterval, lastRabbitHeight));
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
        } else if ((key === ' ' || key === 'Spacebar') && !isJumping){
            isJumping = true; // Set the jumping flag to true.
            jump(performance.now(), rabbitStartHeight, jumpSpeed); // Start the jump animation.
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

    resetGame();
});