let lastSec = -1;
let secondRotation = 0;

let numberDisplayMode = 'arabic';

function updateClock() {
    const now = new Date();
    const sec = now.getSeconds();
    const min = now.getMinutes();
    const hr = now.getHours();

    if (lastSec === 59 && sec === 0) {
        secondRotation += 360;
    }
    
    const secDeg = sec * 6 + secondRotation;
    const minDeg = min * 6 + sec * 0.1;
    const hrDeg = ((hr % 12) * 30) + (min * 0.5);

    const secondHand = document.getElementById('second');

    secondHand.style.transform = `translate(-50%, 0) rotate(${secDeg}deg)`;
    document.getElementById('minute').style.transform = `translate(-50%, 0) rotate(${minDeg}deg)`;
    document.getElementById('hour').style.transform = `translate(-50%, 0) rotate(${hrDeg}deg)`;
    
    document.getElementById('clock').classList.remove('noshow');
    lastSec = sec;
}

function updateNumbersButton() {
    const toggleNumbersBtn = document.getElementById('toggle-numbers');
    switch(numberDisplayMode) {
        case 'arabic':
            toggleNumbersBtn.textContent = 'Arabic';
            break;
        case 'roman':
            toggleNumbersBtn.textContent = 'Roman';
            break;
        case 'hidden':
            toggleNumbersBtn.textContent = 'No Numbers';
            break;
    }
}

function saveSettings() {
    const clock = document.getElementById('clock');
    const body = document.body;
    
    const settings = {
        numberDisplayMode: numberDisplayMode,
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
    const toggleNumbersBtn = document.getElementById('toggle-numbers');
    const toggleTickBtn = document.getElementById('toggle-tick');
    const toggleLightModeBtn = document.getElementById('toggle-light-mode');
    
    if (settings.numberDisplayMode) {
        numberDisplayMode = settings.numberDisplayMode;
        switch(numberDisplayMode) {
            case 'arabic':
                clock.classList.remove('roman-mode', 'numbers-hidden');
                break;
            case 'roman':
                clock.classList.add('roman-mode');
                clock.classList.remove('numbers-hidden');
                break;
            case 'hidden':
                clock.classList.add('numbers-hidden');
                clock.classList.remove('roman-mode');
                break;
        }
    } else if (settings.numbersHidden) {
        numberDisplayMode = 'hidden';
        clock.classList.add('numbers-hidden');
    }
    
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

document.addEventListener('DOMContentLoaded', () => {
    const toggleNumbersBtn = document.getElementById('toggle-numbers');
    const toggleTickBtn = document.getElementById('toggle-tick');
    const toggleLightModeBtn = document.getElementById('toggle-light-mode');
    const clock = document.getElementById('clock');
    const body = document.body;

    loadSettings();

    toggleNumbersBtn.addEventListener('click', () => {
        const clock = document.getElementById('clock');
        
        switch(numberDisplayMode) {
            case 'arabic':
                clock.classList.add('numbers-hidden');
                
                setTimeout(() => {
                    clock.classList.remove('numbers-hidden');
                    clock.classList.add('roman-mode');
                    numberDisplayMode = 'roman';
                    saveSettings();
                }, 500);
                break;
                
            case 'roman':
                numberDisplayMode = 'hidden';
                clock.classList.add('numbers-hidden');
                clock.classList.remove('roman-mode');
                saveSettings();
                break;
                
            case 'hidden':
                numberDisplayMode = 'arabic';
                clock.classList.remove('numbers-hidden', 'roman-mode');
                saveSettings();
                break;
        }
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
