let lastSec = -1;
let lastMin = -1;
let lastHr = -1;
let secondRotation = 0;
let minuteRotation = 0;
let hourRotation = 0;

let numberDisplayMode = 0; // 0: arabic, 1: roman, 2: none
let orbitDisplayMode = 0;  // 0: arabic-in, 1: roman-in, 2: arabic-out, 3: roman-out, 4: none

let animationQueue = [];
let isAnimating = false;

function toRoman(num) {
    if (num < 1 || num > 3999) return "";
    const val = [
        1000, 900, 500, 400,
        100, 90, 50, 40,
        10, 9, 5, 4,
        1
    ];
    const syb = [
        "M", "CM", "D", "CD",
        "C", "XC", "L", "XL",
        "X", "IX", "V", "IV",
        "I"
    ];
    let roman = "";
    for (let i = 0; i < val.length; i++) {
        while (num >= val[i]) {
            roman += syb[i];
            num -= val[i];
        }
    }
    return roman;
}

async function processAnimationQueue() {
    if (isAnimating || animationQueue.length === 0) return;
    isAnimating = true;
    
    try {
        const animationFunction = animationQueue.shift();
        await animationFunction();
    } catch (error) {
        console.error('Animation error:', error);
    } finally {
        isAnimating = false;
        // Continue processing remaining animations
        processAnimationQueue();
    }
}

function updateClock() {
    const now = new Date();
    
    // Get the actual current time for orbiting numbers
    const actualSec = now.getSeconds();
    const actualMin = now.getMinutes();
    const actualHr = now.getHours();
    
    // Add 1 second to make the clock arms run ahead
    now.setSeconds(now.getSeconds() + 1);
    
    const sec = now.getSeconds();
    const min = now.getMinutes();
    const hr = now.getHours();

    // Handle second hand rotation continuity
    if (lastSec === 59 && sec === 0) {
        secondRotation += 360;
    }
    
    // Handle minute hand rotation continuity
    if (lastMin === 59 && min === 0) {
        minuteRotation += 360;
    }
    
    // Handle hour hand rotation continuity
    if (lastHr === 23 && hr === 0) {
        hourRotation += 360;
    }
    
    const secDeg = sec * 6 + secondRotation;
    const minDeg = min * 6 + sec * 0.1 + minuteRotation;
    const hrDeg = ((hr % 12) * 30) + (min * 0.5) + hourRotation;

    const secondHand = document.getElementById('second');

    secondHand.style.transform = `translate(-50%, 0) rotate(${secDeg}deg)`;
    document.getElementById('minute').style.transform = `translate(-50%, 0) rotate(${minDeg}deg)`;
    document.getElementById('hour').style.transform = `translate(-50%, 0) rotate(${hrDeg}deg)`;

    const dynamicHour = document.getElementById('dynamic-hour');
    const dynamicMinute = document.getElementById('dynamic-minute');
    const dynamicSecond = document.getElementById('dynamic-second');

    let hourOrbitRadius, minuteOrbitRadius, secondOrbitRadius;
    if (orbitDisplayMode === 0 || orbitDisplayMode === 1) { // inside orbits
        hourOrbitRadius = 90;
        minuteOrbitRadius = 120;
        secondOrbitRadius = 150;
    } else { // outside orbits
        hourOrbitRadius = 210;
        minuteOrbitRadius = 240;
        secondOrbitRadius = 270;
    }

    const formatTwoDigits = (num) => num.toString().padStart(2, '0');

    // Check if tick-tock is enabled to determine which time to use for orbiting numbers
    const clock = document.getElementById('clock');
    const isWiggling = clock.classList.contains('wiggling');
    
    // Use clock arm time (1 sec ahead) when wiggling, actual time when not wiggling
    const displayHr = isWiggling ? hr : actualHr;
    const displayMin = isWiggling ? min : actualMin;
    const displaySec = isWiggling ? sec : actualSec;

    if (orbitDisplayMode === 1 || orbitDisplayMode === 3) { // roman orbits
        dynamicHour.textContent = toRoman(displayHr % 12 === 0 ? 12 : displayHr % 12);
        dynamicMinute.textContent = toRoman(displayMin === 0 ? 60 : displayMin);
        dynamicSecond.textContent = toRoman(displaySec === 0 ? 60 : displaySec);
    } else { // arabic orbits
        dynamicHour.textContent = formatTwoDigits(displayHr);
        dynamicMinute.textContent = formatTwoDigits(displayMin);
        dynamicSecond.textContent = formatTwoDigits(displaySec);
    }

    dynamicHour.style.transform = `translate(-50%, -50%) rotate(${hrDeg}deg) translateY(-${hourOrbitRadius}px) rotate(-${hrDeg}deg)`;
    dynamicMinute.style.transform = `translate(-50%, -50%) rotate(${minDeg}deg) translateY(-${minuteOrbitRadius}px) rotate(-${minDeg}deg)`;
    dynamicSecond.style.transform = `translate(-50%, -50%) rotate(${secDeg}deg) translateY(-${secondOrbitRadius}px) rotate(-${secDeg}deg)`;
    
    // Store the current rotations on the elements for use during animations
    dynamicHour.dataset.rotation = hrDeg;
    dynamicMinute.dataset.rotation = minDeg;
    dynamicSecond.dataset.rotation = secDeg;
    
    document.getElementById('clock').classList.remove('noshow');
    lastSec = sec;
    lastMin = min;
    lastHr = hr;
}

function updateNumberDisplay() {
    const clock = document.getElementById('clock');
    
    // Static numbers
    clock.classList.remove('arabic-static', 'roman-static', 'no-static-numbers');
    switch(numberDisplayMode) {
        case 0: clock.classList.add('arabic-static'); break;
        case 1: clock.classList.add('roman-static'); break;
        case 2: clock.classList.add('no-static-numbers'); break;
    }

    // Orbiting numbers
    clock.classList.remove('orbit-inside-arabic', 'orbit-inside-roman', 'orbit-outside-arabic', 'orbit-outside-roman', 'no-orbit-numbers');
    switch(orbitDisplayMode) {
        case 0: clock.classList.add('orbit-inside-arabic'); break;
        case 1: clock.classList.add('orbit-inside-roman'); break;
        case 2: clock.classList.add('orbit-outside-arabic'); break;
        case 3: clock.classList.add('orbit-outside-roman'); break;
        case 4: clock.classList.add('no-orbit-numbers'); break;
    }
}

function updateButtonLabels() {
    const toggleNumbersBtn = document.getElementById('toggle-numbers');
    const toggleOrbitsBtn = document.getElementById('toggle-orbits');
    
    // Update Numbers button text
    switch(numberDisplayMode) {
        case 0: toggleNumbersBtn.textContent = 'Numbers (Arabic)'; break;
        case 1: toggleNumbersBtn.textContent = 'Numbers (Roman)'; break;
        case 2: toggleNumbersBtn.textContent = 'Numbers (None)'; break;
    }
    
    // Update Orbits button text
    switch(orbitDisplayMode) {
        case 0: toggleOrbitsBtn.textContent = 'Orbits (Arabic In)'; break;
        case 1: toggleOrbitsBtn.textContent = 'Orbits (Roman In)'; break;
        case 2: toggleOrbitsBtn.textContent = 'Orbits (Arabic Out)'; break;
        case 3: toggleOrbitsBtn.textContent = 'Orbits (Roman Out)'; break;
        case 4: toggleOrbitsBtn.textContent = 'Orbits (None)'; break;
    }
}

function saveSettings() {
    const clock = document.getElementById('clock');
    const body = document.body;
    
    const settings = {
        numberDisplayMode: numberDisplayMode,
        orbitDisplayMode: orbitDisplayMode,
        tickTock: clock.classList.contains('wiggling'),
        lightMode: body.classList.contains('light-mode')
    };
    
    localStorage.setItem('clockSettings', JSON.stringify(settings));
}

function loadSettings() {
    const savedSettings = localStorage.getItem('clockSettings');
    if (!savedSettings) return;
    
    const settings = JSON.parse(savedSettings);
    const clock = document.getElementById('clock');
    const body = document.body;
    const toggleTickBtn = document.getElementById('toggle-tick');
    const toggleLightModeBtn = document.getElementById('toggle-light-mode');
    
    if (settings.numberDisplayMode !== undefined) {
        numberDisplayMode = settings.numberDisplayMode;
    }
    if (settings.orbitDisplayMode !== undefined) {
        orbitDisplayMode = settings.orbitDisplayMode;
    }

    updateNumberDisplay();
    //updateButtonLabels();
    
    if (settings.tickTock) {
        clock.classList.add('wiggling');
        toggleTickBtn.classList.add('active');
    } else {
        clock.classList.remove('wiggling');
        toggleTickBtn.classList.remove('active');
    }
    
    if (settings.lightMode) {
        body.classList.add('light-mode');
        toggleLightModeBtn.classList.add('active');
        toggleLightModeBtn.textContent = 'Dark Mode';
    } else {
        body.classList.remove('light-mode');
        toggleLightModeBtn.classList.remove('active');
        toggleLightModeBtn.textContent = 'Light Mode';
    }
}

async function changeStaticNumberMode(newMode) {
    // Skip animations if we're already in the desired mode
    if (numberDisplayMode === newMode) return;

    const clock = document.getElementById('clock');

    // Hide current numbers with animation
    clock.classList.add('numbers-hidden');
    
    // Wait for the animation to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update the mode
    numberDisplayMode = newMode;
    updateNumberDisplay();
    //updateButtonLabels();
    saveSettings();
    
    // Show the new numbers with animation
    clock.classList.remove('numbers-hidden');
}

async function applyExitAnimation(dynamicNumbers) {
    // Hide all orbit numbers regardless of current mode
    dynamicNumbers.forEach(num => {
        num.style.transition = 'opacity 0.5s ease-in-out';
        num.style.opacity = '0';
    });
    
    // Wait for exit animation
    await new Promise(resolve => setTimeout(resolve, 500));
}

async function applyEntranceAnimation(dynamicNumbers) {
    // Reset any custom styles and classes
    dynamicNumbers.forEach(num => {
        num.classList.remove('anim-inside-exit', 'anim-inside-enter', 'anim-outside-enter');
        num.style.transition = '';
        num.style.transform = '';
        num.style.opacity = '';
    });
    
    // Force reflow to ensure animations take effect
    void document.body.offsetHeight;
    
    // Update the clock to position orbit numbers correctly
    updateClock();
    
    // Wait a brief moment for positioning to settle
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Show orbit numbers with fade-in animation
    dynamicNumbers.forEach(num => {
        num.style.transition = 'opacity 0.5s ease-in-out';
        num.style.opacity = '1';
    });
    
    // Wait for entrance animation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clean up animation styles
    dynamicNumbers.forEach(num => {
        num.style.transition = '';
    });
}

async function changeOrbitNumberMode(newMode) {
    // Skip animations if we're already in the desired mode
    if (currentMode === newMode) return;
    
    const dynamicHour = document.getElementById('dynamic-hour');
    const dynamicMinute = document.getElementById('dynamic-minute');
    const dynamicSecond = document.getElementById('dynamic-second');
    const dynamicNumbers = [dynamicHour, dynamicMinute, dynamicSecond];
    
    const currentMode = orbitDisplayMode;
    
    // Determine if current mode is none
    const isCurrentNone = currentMode === 4;
    
    // Determine if new mode is none
    const isNewNone = newMode === 4;
    
    // Always hide all orbit numbers first (except when current mode is none)
    if (!isCurrentNone) {
        await applyExitAnimation(dynamicNumbers);
    }
    
    // Update the mode
    orbitDisplayMode = newMode;
    updateNumberDisplay();
    //updateButtonLabels();
    saveSettings();
    
    // Show orbit numbers at correct positions (except when new mode is none)
    if (!isNewNone) {
        await applyEntranceAnimation(dynamicNumbers);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const toggleNumbersBtn = document.getElementById('toggle-numbers');
    const toggleOrbitsBtn = document.getElementById('toggle-orbits');
    const toggleTickBtn = document.getElementById('toggle-tick');
    const toggleLightModeBtn = document.getElementById('toggle-light-mode');
    const clock = document.getElementById('clock');
    const body = document.body;

    loadSettings();
    
    // Set up dropdown click handlers for Numbers
    document.querySelectorAll('#toggle-numbers + .dropdown-content a').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const newMode = parseInt(e.target.getAttribute('data-mode'));
            
            // Add to animation queue to ensure animations wait for each other
            animationQueue.push(async () => {
                await changeStaticNumberMode(newMode);
            });
            processAnimationQueue();
        });
    });
    
    // Set up dropdown click handlers for Orbits
    document.querySelectorAll('#toggle-orbits + .dropdown-content a').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const newMode = parseInt(e.target.getAttribute('data-mode'));
            
            // Add to animation queue to ensure animations wait for each other
            animationQueue.push(async () => {
                await changeOrbitNumberMode(newMode);
            });
            processAnimationQueue();
        });
    });

    toggleTickBtn.addEventListener('click', () => {
        clock.classList.toggle('wiggling');
        toggleTickBtn.classList.toggle('active');
        saveSettings();
    });

    toggleLightModeBtn.addEventListener('click', () => {
        toggleLightModeBtn.classList.add('clicked');
        setTimeout(() => toggleLightModeBtn.classList.remove('clicked'), 300);
        
        body.classList.toggle('light-mode');
        toggleLightModeBtn.classList.toggle('active');
        
        if (body.classList.contains('light-mode')) {
            toggleLightModeBtn.textContent = 'Dark Mode';
        } else {
            toggleLightModeBtn.textContent = 'Light Mode';
        }
        
        saveSettings();
    });

    updateClock();
    setInterval(updateClock, 1000);
});