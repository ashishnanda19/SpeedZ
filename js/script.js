// Word lists and quotes
const commonWords = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what"
];

const quotes = [
    "The only way to do great work is to love what you do.",
    "Innovation distinguishes between a leader and a follower.",
    "Stay hungry, stay foolish.",
    "Life is what happens when you're busy making other plans.",
    "The future belongs to those who believe in the beauty of their dreams."
];

const codeSnippets = [
    "function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}",
    "const map = array.map(x => x * 2);\nconst filter = array.filter(x => x > 10);",
    "class Rectangle {\n  constructor(width, height) {\n    this.width = width;\n    this.height = height;\n  }\n}"
];

// Game state
let state = {
    currentText: "",
    currentInput: "",
    startTime: null,
    endTime: null,
    timer: null,
    timeLimit: 60,
    mistakes: 0,
    totalChars: 0,
    isTestActive: false
};

// DOM Elements
const textDisplay = document.getElementById('textDisplay');
const textInput = document.getElementById('textInput');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timeDisplay = document.getElementById('time');
const themeToggle = document.getElementById('themeToggle');
const resetButton = document.getElementById('resetButton');
const resultModal = document.getElementById('resultModal');
const finalWpm = document.getElementById('finalWpm');
const finalAccuracy = document.getElementById('finalAccuracy');
const finalChars = document.getElementById('finalChars');
const retryButton = document.getElementById('retryButton');

// Initialize
function init() {
    generateNewText();
    addEventListeners();
    updateTheme();
}

// Generate new text based on selected type
function generateNewText() {
    const type = document.querySelector('.type-button.active').dataset.type;
    let text = "";

    switch(type) {
        case 'words':
            text = generateRandomWords();
            break;
        case 'quotes':
            text = quotes[Math.floor(Math.random() * quotes.length)];
            break;
        case 'code':
            text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
            break;
    }

    state.currentText = text;
    displayText();
}

// Generate random words
function generateRandomWords() {
    const wordCount = 50;
    let words = [];
    for(let i = 0; i < wordCount; i++) {
        words.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
    }
    return words.join(' ');
}

// Display text with current progress
function displayText() {
    const text = state.currentText;
    const input = state.currentInput;
    let html = '';

    for(let i = 0; i < text.length; i++) {
        if(i < input.length) {
            if(input[i] === text[i]) {
                html += `<span class="correct">${text[i]}</span>`;
            } else {
                html += `<span class="error">${text[i]}</span>`;
            }
        } else if(i === input.length) {
            html += `<span class="current">${text[i]}</span>`;
        } else {
            html += text[i];
        }
    }

    textDisplay.innerHTML = html;
}

// Calculate WPM
function calculateWPM() {
    if(!state.startTime) return 0;
    
    const timeElapsed = (Date.now() - state.startTime) / 1000 / 60; // in minutes
    const wordsTyped = state.currentInput.length / 5; // assume average word length of 5
    return Math.round(wordsTyped / timeElapsed);
}

// Calculate accuracy
function calculateAccuracy() {
    if(state.currentInput.length === 0) return 100;
    
    const correct = state.currentInput.split('').filter((char, i) => char === state.currentText[i]).length;
    return Math.round((correct / state.currentInput.length) * 100);
}

// Update displays
function updateDisplays() {
    wpmDisplay.textContent = calculateWPM();
    accuracyDisplay.textContent = calculateAccuracy() + '%';
    
    if(state.startTime) {
        const timeElapsed = Math.round((Date.now() - state.startTime) / 1000);
        const timeLeft = Math.max(0, state.timeLimit - timeElapsed);
        timeDisplay.textContent = timeLeft + 's';

        if(timeLeft <= 0) {
            clearInterval(state.timer);
            endTest();
        }
    }
}

// End test
function endTest() {
    if(state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }
    state.endTime = Date.now();
    textInput.disabled = true;
    showResults();
}

// Show results
function showResults() {
    finalWpm.textContent = calculateWPM();
    finalAccuracy.textContent = calculateAccuracy() + '%';
    resultModal.classList.add('active');
}

// Event Listeners
function addEventListeners() {
    // Text input
    textInput.addEventListener('input', (e) => {
        if(!state.startTime && e.target.value.length > 0) {
            startTest();
        }
        
        state.currentInput = e.target.value;
        displayText();
        updateDisplays();
        
        // Check if test is complete
        if(state.currentInput.length === state.currentText.length) {
            endTest();
        }
    });

    // Theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        updateTheme();
    });

    // Reset button
    resetButton.addEventListener('click', resetTest);

    // Time buttons
    document.querySelectorAll('.time-button').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelector('.time-button.active').classList.remove('active');
            e.target.classList.add('active');
            state.timeLimit = parseInt(e.target.dataset.time);
            resetTest();
        });
    });

    // Type buttons
    document.querySelectorAll('.type-button').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelector('.type-button.active').classList.remove('active');
            e.target.classList.add('active');
            resetTest();
        });
    });

    // Retry button
    retryButton.addEventListener('click', () => {
        resultModal.classList.remove('active');
        resetTest();
    });
}

// Start test
function startTest() {
    state.startTime = Date.now();
    state.timer = setInterval(() => {
        updateDisplays();
    }, 1000);
}

// Reset test
function resetTest() {
    state = {
        currentText: "",
        currentInput: "",
        startTime: null,
        endTime: null,
        timer: null,
        timeLimit: parseInt(document.querySelector('.time-button.active').dataset.time),
        mistakes: 0,
        totalChars: 0,
        isTestActive: false
    };
    
    clearInterval(state.timer);
    textInput.value = "";
    textInput.disabled = false;
    generateNewText();
    updateDisplays();
    timeDisplay.textContent = state.timeLimit + 's';
}

// Update theme
function updateTheme() {
    localStorage.setItem('theme', document.body.dataset.theme || 'light');
}

// Load saved theme
document.body.dataset.theme = localStorage.getItem('theme') || 'light';

// Initialize the app
init(); 