
// Store messages and track the top spenders
let messages = [];
let topSpender = { name: '', amount: 0 };

// Track daily, weekly, and monthly top spenders
let dailyTopSpenders = [];
let weeklyTopSpenders = [];
let monthlyTopSpenders = [];

// Track the reset times
let lastDailyReset = new Date();
let lastWeeklyReset = new Date();
let lastMonthlyReset = new Date();

// For Replit deployment: always use the same origin
const API_URL = window.location.origin;

console.log('Using API URL:', API_URL);

// DOM elements
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const amountInput = document.getElementById('amount');
const postButton = document.getElementById('post-button');
const messageList = document.getElementById('message-list');
const topSpenderMessage = document.getElementById('top-spender-message');
const topSpenderBannerMessage = document.getElementById('top-spender-banner-message');

// Maximum field lengths
const MAX_NAME_LENGTH = 25;
const MAX_MESSAGE_LENGTH = 300;

// Add character counter for name input
nameInput.addEventListener('input', function() {
    if (this.value.length > MAX_NAME_LENGTH) {
        this.value = this.value.substring(0, MAX_NAME_LENGTH);
    }
});

// Add character counter for message input
messageInput.addEventListener('input', function() {
    if (this.value.length > MAX_MESSAGE_LENGTH) {
        this.value = this.value.substring(0, MAX_MESSAGE_LENGTH);
    }
});

// Add tab switching functionality
const tabButtons = document.querySelectorAll('.tab-button');

// Load messages when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
});

// Handle form submission
postButton.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const amountValue = parseFloat(amountInput.value);
    
    if (!name || !message || isNaN(amountValue) || amountValue <= 0) {
        alert('Please fill in all fields with valid values.');
        return;
    }
    
    const newMessage = await postMessage(name, message, amountValue);
    if (newMessage) {
        // Clear form inputs
        nameInput.value = '';
        messageInput.value = '';
        amountInput.value = '';
        
        // Reload messages to update the display
        loadMessages();
    }
});
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Hide all tab contents
        tabContents.forEach(content => content.style.display = 'none');
        
        // Show the selected tab content
        const tabId = button.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).style.display = 'block';
    });
});

// Add event listener to the post button
postButton.addEventListener('click', function() {
    // Get input values
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const amount = parseFloat(amountInput.value);

    // Validate input
    if (!name || !message || isNaN(amount) || amount <= 0) {
        alert('Please fill out all fields with valid data.');
        return;
    }
    
    if (name.length > MAX_NAME_LENGTH) {
        alert(`Name is too long. Maximum length is ${MAX_NAME_LENGTH} characters.`);
        return;
    }
    
    if (message.length > MAX_MESSAGE_LENGTH) {
        alert(`Message is too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters.`);
        return;
    }

    // Create a new message object
    const newMessage = {
        name: name,
        message: message,
        amount: amount
    };

    // Send the message to the server
    fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMessage)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Play cha-ching sound
        chaChingSound.play().catch(e => console.log('Error playing cha-ching sound:', e));
        
        // Reload messages
        loadMessages();
        
        // Clear the form
        nameInput.value = '';
        messageInput.value = '';
        amountInput.value = '';
    })
    .catch(error => {
        console.error('Error posting message:', error);
        alert('There was an error posting your message. Please try again.');
    });
});

// Function to check if resets are needed
function checkTimeResets() {
    const now = new Date();
    
    // Check for daily reset (every 24 hours)
    if (now.getDate() !== lastDailyReset.getDate() || 
        now.getMonth() !== lastDailyReset.getMonth() || 
        now.getFullYear() !== lastDailyReset.getFullYear()) {
        dailyTopSpenders = [];
        lastDailyReset = now;
    }
    
    // Check for weekly reset (every 7 days)
    const daysSinceLastWeeklyReset = Math.floor((now - lastWeeklyReset) / (1000 * 60 * 60 * 24));
    if (daysSinceLastWeeklyReset >= 7) {
        weeklyTopSpenders = [];
        lastWeeklyReset = now;
    }
    
    // Check for monthly reset (first day of new month)
    if (now.getDate() === 1 && 
        (now.getMonth() !== lastMonthlyReset.getMonth() || 
         now.getFullYear() !== lastMonthlyReset.getFullYear())) {
        monthlyTopSpenders = [];
        lastMonthlyReset = now;
    }
}

// Function to update the top spenders lists for all time periods
function updateTopSpenders() {
    // Check if any time-based resets are needed
    checkTimeResets();
    
    // Get current time
    const now = new Date();
    
    // Process messages and update top spenders for each time period
    const dailySpenders = {};
    const weeklySpenders = {};
    const monthlySpenders = {};
    
    messages.forEach(msg => {
        const msgTime = new Date(msg.timestamp);
        
        // Add to daily spenders if message is from today
        if (msgTime.getDate() === now.getDate() &&
            msgTime.getMonth() === now.getMonth() &&
            msgTime.getFullYear() === now.getFullYear()) {
            
            if (!dailySpenders[msg.name] || dailySpenders[msg.name].amount < msg.amount) {
                dailySpenders[msg.name] = { name: msg.name, amount: msg.amount };
            }
        }
        
        // Add to weekly spenders if message is from this week (last 7 days)
        const daysDiff = Math.floor((now - msgTime) / (1000 * 60 * 60 * 24));
        if (daysDiff < 7) {
            if (!weeklySpenders[msg.name] || weeklySpenders[msg.name].amount < msg.amount) {
                weeklySpenders[msg.name] = { name: msg.name, amount: msg.amount };
            }
        }
        
        // Add to monthly spenders if message is from this month
        if (msgTime.getMonth() === now.getMonth() &&
            msgTime.getFullYear() === now.getFullYear()) {
            
            if (!monthlySpenders[msg.name] || monthlySpenders[msg.name].amount < msg.amount) {
                monthlySpenders[msg.name] = { name: msg.name, amount: msg.amount };
            }
        }
    });
    
    // Update the lists with the new data
    dailyTopSpenders = Object.values(dailySpenders)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
        
    weeklyTopSpenders = Object.values(weeklySpenders)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
        
    monthlyTopSpenders = Object.values(monthlySpenders)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);
    
    // Update the UI for top spenders lists
    updateTopSpendersUI('daily-top-spenders-list', dailyTopSpenders, 5);
    updateTopSpendersUI('weekly-top-spenders-list', weeklyTopSpenders, 5);
    updateTopSpendersUI('monthly-top-spenders-list', monthlyTopSpenders, 10);
}

// Helper function to update a specific top spenders list in the UI
function updateTopSpendersUI(listId, spenders, limit) {
    const spendersList = document.getElementById(listId);
    if (spendersList) {
        spendersList.innerHTML = '';
        
        if (spenders.length === 0) {
            const noSpendersItem = document.createElement('li');
            noSpendersItem.textContent = 'No spenders yet.';
            spendersList.appendChild(noSpendersItem);
        } else {
            spenders.slice(0, limit).forEach((spender, index) => {
                const spenderItem = document.createElement('li');
                spenderItem.className = 'spender-item';
                
                const rankSpan = document.createElement('span');
                rankSpan.className = 'spender-rank';
                rankSpan.textContent = `#${index + 1}`;
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'spender-name';
                nameSpan.textContent = spender.name;
                
                const amountSpan = document.createElement('span');
                amountSpan.className = 'spender-amount';
                amountSpan.textContent = `$${spender.amount.toFixed(2)}`;
                
                spenderItem.appendChild(rankSpan);
                spenderItem.appendChild(nameSpan);
                spenderItem.appendChild(amountSpan);
                spendersList.appendChild(spenderItem);
            });
        }
    }
}

// Load sounds
const celebrationSound = new Audio('celebration.mp3');
const chaChingSound = new Audio('cha-ching.mp3');

// Function to update the top spender display
function updateTopSpender(isNewTopSpender = false) {
    if (topSpender.name) {
        const topSpenderText = `${topSpender.name} ($${topSpender.amount.toFixed(2)})`;
        topSpenderMessage.textContent = topSpenderText;
        topSpenderBannerMessage.textContent = `Top Spender: ${topSpenderText}`;
        
        // Show the banner with the top spender's message
        const topSpenderMsg = messages.find(msg => 
            msg.name === topSpender.name && msg.amount === topSpender.amount
        );
        
        if (topSpenderMsg) {
            // Show full message in banner (no need to truncate since we have expand functionality)
            topSpenderBannerMessage.textContent = `"${topSpenderMsg.message}" - ${topSpender.name} ($${topSpender.amount.toFixed(2)})`;
            
            // Show expand indicator if message is long
            const banner = document.getElementById('top-spender-banner');
            if (topSpenderMsg.message.length > 100) {
                banner.querySelector('.expand-indicator').style.display = 'block';
            } else {
                banner.querySelector('.expand-indicator').style.display = 'none';
            }
        }
        
        // Play celebration animation and sound if this is a new top spender
        if (isNewTopSpender) {
            // Play sound
            celebrationSound.play().catch(e => console.log('Error playing sound:', e));
            
            // Add animation class to banner
            const banner = document.getElementById('top-spender-banner');
            banner.classList.add('celebrate');
            
            // Create container for raining coins
            const rainingCoinsContainer = document.createElement('div');
            rainingCoinsContainer.className = 'raining-coins-container';
            document.body.appendChild(rainingCoinsContainer);
            
            // Create and animate coins
            const numberOfCoins = 40;
            for (let i = 0; i < numberOfCoins; i++) {
                setTimeout(() => {
                    const coin = document.createElement('div');
                    coin.className = 'raining-coin';
                    
                    // Randomize starting position
                    const leftPos = Math.random() * 100;
                    coin.style.left = `${leftPos}%`;
                    
                    // Randomize size between 15px and 30px
                    const size = 15 + Math.random() * 15;
                    coin.style.width = `${size}px`;
                    coin.style.height = `${size}px`;
                    
                    // Randomize animation duration between 2-4 seconds
                    const duration = 2 + Math.random() * 2;
                    coin.style.animation = `coinFall ${duration}s linear forwards`;
                    
                    rainingCoinsContainer.appendChild(coin);
                    
                    // Remove coin after animation finishes
                    setTimeout(() => {
                        if (coin && coin.parentNode) {
                            coin.parentNode.removeChild(coin);
                        }
                    }, duration * 1000);
                }, i * 100); // Stagger the coin creation
            }
            
            // Show congratulations message with treasure chest
            const congratsMessage = document.createElement('div');
            congratsMessage.id = 'congrats-message';
            
            // Add treasure chest
            const treasureChest = document.createElement('div');
            treasureChest.className = 'treasure-chest';
            congratsMessage.appendChild(treasureChest);
            
            // Add text with enhanced content
            const congratsText = document.createElement('p');
            congratsText.textContent = 'Congratulations!';
            congratsMessage.appendChild(congratsText);
            
            const subText = document.createElement('p');
            subText.textContent = 'You are the new top spender!';
            congratsMessage.appendChild(subText);
            
            document.body.appendChild(congratsMessage);
            
            // Animate treasure chest to open after a short delay
            setTimeout(() => {
                treasureChest.classList.add('open');
            }, 500);
            
            // Remove animation, message, and coins container after animation completes
            setTimeout(() => {
                banner.classList.remove('celebrate');
                if (document.getElementById('congrats-message')) {
                    document.getElementById('congrats-message').remove();
                }
                if (document.querySelector('.raining-coins-container')) {
                    document.querySelector('.raining-coins-container').remove();
                }
            }, 5000);
        }
    } else {
        topSpenderMessage.textContent = 'No top spender yet.';
        topSpenderBannerMessage.textContent = 'No top spender yet.';
    }
}

// Function to load messages from the server
async function loadMessages() {
    try {
        console.log("Fetching messages from:", `${API_URL}/api/messages`);
        const response = await fetch(`${API_URL}/api/messages`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Messages loaded successfully:", data.length);
        messages = data;
        
        // Re-process messages to find the current top spender
        let currentTopSpender = { name: '', amount: 0 };
        messages.forEach(msg => {
            if (msg.amount > currentTopSpender.amount) {
                currentTopSpender = { name: msg.name, amount: msg.amount };
            }
        });
        
        topSpender = currentTopSpender;
        updateTopSpender();
        updateTopSpenders();
        displayMessages();
    } catch (error) {
        console.error("Error loading messages:", error);
        // Don't show alert to prevent annoying popups
        // Try again after a short delay
        setTimeout(loadMessages, 3000);
    }
}

// Function to post a message to the server
async function postMessage(name, message, amount) {
    try {
        console.log("Posting message to:", `${API_URL}/api/messages`, { name, message, amount });
        const response = await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, message, amount }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server error (${response.status}):`, errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        // Play cha-ching sound
        chaChingSound.play().catch(e => console.log('Error playing cha-ching sound:', e));
        
        const data = await response.json();
        console.log("Message posted successfully:", data);
        return data;
    } catch (error) {
        console.error("Error posting message:", error, "URL:", `${API_URL}/api/messages`);
        alert("Failed to post message. Please try again.");
        return null;
    }
}
// This is now handled by the async loadMessages function

// Function to display all messages
function displayMessages() {
    // Clear the current list
    messageList.innerHTML = '';
    
    // Create a copy of messages to work with
    const sortedMessages = [...messages];
    
    // Find the top spender's message
    const topSpenderMessageIndex = sortedMessages.findIndex(msg => 
        msg.name === topSpender.name && msg.amount === topSpender.amount
    );
    
    // If found, move the top spender's message to the top
    if (topSpenderMessageIndex !== -1) {
        const topSpenderMsg = sortedMessages.splice(topSpenderMessageIndex, 1)[0];
        sortedMessages.unshift(topSpenderMsg);
    }

    // Add each message to the list
    sortedMessages.forEach((msg) => {
        const messageItem = document.createElement('li');
        messageItem.className = 'message-item';
        
        // Add top-spender class to the top spender's message
        if (msg.name === topSpender.name && msg.amount === topSpender.amount) {
            messageItem.classList.add('top-spender');
        }

        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = msg.name;
        
        const amountSpan = document.createElement('span');
        amountSpan.className = 'message-amount';
        amountSpan.textContent = `$${msg.amount.toFixed(2)}`;
        
        messageHeader.appendChild(nameSpan);
        messageHeader.appendChild(amountSpan);

        const messageContent = document.createElement('p');
        messageContent.textContent = msg.message;

        messageItem.appendChild(messageHeader);
        messageItem.appendChild(messageContent);
        messageList.appendChild(messageItem);
    });
}

// Initialize with timestamp metadata for persistance if needed
function initializeTimestamps() {
    // Store the current time as the initial reset times
    lastDailyReset = new Date();
    lastWeeklyReset = new Date();
    lastMonthlyReset = new Date();
    
    // You could load these from localStorage if persistence is needed
    // This would be implemented here
}

// Make the top spender banner expandable
const topSpenderBanner = document.getElementById('top-spender-banner');
topSpenderBanner.addEventListener('click', function() {
    this.classList.toggle('expanded');
});

// Initialize the app
initializeTimestamps();
loadMessages(); // Load any existing messages from server

// Set up periodic checks for time-based resets (every hour)
setInterval(updateTopSpenders, 60 * 60 * 1000);
