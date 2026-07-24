// DOM Elements
const jokeText = document.getElementById('jokeText');
const getJokeBtn = document.getElementById('getJokeBtn');
const shareBtn = document.getElementById('shareBtn');
const safeModeToggle = document.getElementById('safeModeToggle');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const jokeCountDisplay = document.getElementById('jokeCount');

// State
let jokeCount = 0;
let currentJoke = '';
let safeMode = true;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    getJokeBtn.addEventListener('click', fetchJoke);
    shareBtn.addEventListener('click', shareJoke);
    safeModeToggle.addEventListener('change', (e) => {
        safeMode = e.target.checked;
    });
    
    // Load initial joke
    fetchJoke();
});

// Fetch joke from API
async function fetchJoke() {
    try {
        // Show loading state
        showLoading(true);
        hideError();
        getJokeBtn.disabled = true;
        shareBtn.disabled = true;
        
        // Build API URL based on safe mode
        let apiUrl = 'https://api.jokes.one/jokes/random';
        
        // Using JokeAPI (supports filtering)
        const jokeApiUrl = safeMode
            ? 'https://v2.jokeapi.dev/joke/Any?safe-mode'
            : 'https://v2.jokeapi.dev/joke/Any';
        
        const response = await fetch(jokeApiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Format joke based on type
        if (data.type === 'single') {
            currentJoke = data.joke;
        } else if (data.type === 'twopart') {
            currentJoke = `${data.setup}\n\n${data.delivery}`;
        } else {
            currentJoke = 'Could not load joke format';
        }
        
        // Display joke with animation
        jokeText.textContent = currentJoke;
        jokeText.parentElement.classList.add('success-animation');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            jokeText.parentElement.classList.remove('success-animation');
        }, 600);
        
        // Increment counter
        jokeCount++;
        jokeCountDisplay.textContent = jokeCount;
        
    } catch (error) {
        console.error('Error fetching joke:', error);
        showError(`Failed to fetch joke: ${error.message}`);
        
        // Fallback jokes if API fails
        const fallbackJokes = [
            "Why don't scientists trust atoms?\nBecause they make up everything!",
            "Why did the scarecrow win an award?\nBecause he was outstanding in his field!",
            "What do you call a fake noodle?\nAn impasta!",
            "Why don't eggs tell jokes?\nThey'd crack each other up!",
            "What did one ocean say to the other ocean?\nNothing, they just waved!",
            "Why did the coffee file a police report?\nIt got mugged!",
            "What do you call a bear with no teeth?\nA gummy bear!",
            "Why don't skeletons fight each other?\nThey don't have the guts!"
        ];
        
        const randomJoke = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
        currentJoke = randomJoke;
        jokeText.textContent = currentJoke;
        jokeCount++;
        jokeCountDisplay.textContent = jokeCount;
        
    } finally {
        showLoading(false);
        getJokeBtn.disabled = false;
        shareBtn.disabled = false;
    }
}

// Share joke to clipboard
function shareJoke() {
    if (!currentJoke) {
        showError('No joke to share!');
        return;
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(currentJoke).then(() => {
        // Show feedback
        const originalText = shareBtn.textContent;
        shareBtn.textContent = '✓ Copied!';
        
        setTimeout(() => {
            shareBtn.textContent = originalText;
        }, 2000);
        
    }).catch(err => {
        showError('Failed to copy to clipboard');
        console.error('Clipboard error:', err);
    });
}

// Show/hide loading spinner
function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !getJokeBtn.disabled) {
        fetchJoke();
    }
    if (e.key === 's' || e.key === 'S') {
        if (!shareBtn.disabled) {
            shareJoke();
        }
    }
});