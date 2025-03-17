// Store messages and track the top spenders
let messages = [];
let topSpender = { name: '', amount: 0 };

// Track daily, weekly, and monthly top spenders
let dailyTopSpenders = [];
let weeklyTopSpenders = [];
let monthlyTopSpenders = [];
let alltimeTopSpenders = [];

// Track the reset times
let lastDailyReset = new Date();
let lastWeeklyReset = new Date();
let lastMonthlyReset = new Date();

// DOM elements
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const amountInput = document.getElementById('amount');

// Add input event listener to enforce limits
amountInput.addEventListener('input', function() {
    let value = parseFloat(this.value);
    if (value > 10) this.value = 10;
    if (value < 0) this.value = 0;
});

// Prevent arrow keys from going beyond limits
amountInput.addEventListener('keydown', function(e) {
    const value = parseFloat(this.value) || 0;
    if (e.key === 'ArrowUp' && value >= 10) {
        e.preventDefault();
        this.value = 10;
    }
    if (e.key === 'ArrowDown' && value <= 0) {
        e.preventDefault();
        this.value = 0;
    }
});
const postButton = document.getElementById('post-button');
const messageList = document.getElementById('message-list');
const topSpenderMessage = document.getElementById('top-spender-message');
const topSpenderBannerMessage = document.getElementById('top-spender-banner-message');

// Maximum message length
const MAX_MESSAGE_LENGTH = 300;

// Maximum name length
const MAX_NAME_LENGTH = 25;

// Add character counter for message input
messageInput.addEventListener('input', function() {
    if (this.value.length > MAX_MESSAGE_LENGTH) {
        this.value = this.value.substring(0, MAX_MESSAGE_LENGTH);
    }
});

// Add character limit for name input
nameInput.addEventListener('input', function() {
    if (this.value.length > MAX_NAME_LENGTH) {
        this.value = this.value.substring(0, MAX_NAME_LENGTH);
    }
});

// Add tab switching functionality

// Function to create falling coins effect
function createPixelConfetti() {
  const coinsContainer = document.createElement('div');
  coinsContainer.id = 'confetti-container';
  coinsContainer.style.position = 'fixed';
  coinsContainer.style.top = '0';
  coinsContainer.style.left = '0';
  coinsContainer.style.width = '100%';
  coinsContainer.style.height = '100%';
  coinsContainer.style.pointerEvents = 'none';
  coinsContainer.style.zIndex = '999';
  document.body.appendChild(coinsContainer);

  // Create falling coins
  const coinCount = 50;
  const coinTypes = [
    { color: '#ffcc00', symbol: '$' },
    { color: '#ddbb00', symbol: '¢' },
    { color: '#ffdd33', symbol: '$' }
  ];

  for (let i = 0; i < coinCount; i++) {
    setTimeout(() => {
      const coin = document.createElement('div');
      const size = Math.floor(Math.random() * 20) + 15;
      const coinType = coinTypes[Math.floor(Math.random() * coinTypes.length)];

      coin.style.position = 'absolute';
      coin.style.width = `${size}px`;
      coin.style.height = `${size}px`;
      coin.style.borderRadius = '50%';
      coin.style.backgroundColor = coinType.color;
      coin.style.boxShadow = `0 0 ${size/3}px ${coinType.color}, inset 0 0 ${size/6}px rgba(0,0,0,0.3)`;
      coin.style.left = `${Math.random() * 100}%`;
      coin.style.top = '-50px';
      coin.style.opacity = Math.random() * 0.4 + 0.6;
      coin.style.display = 'flex';
      coin.style.alignItems = 'center';
      coin.style.justifyContent = 'center';
      coin.style.color = '#996600';
      coin.style.fontWeight = 'bold';
      coin.style.fontSize = `${size/2}px`;
      coin.style.fontFamily = "'Press Start 2P', cursive";
      coin.textContent = coinType.symbol;

      coinsContainer.appendChild(coin);

      // Animate the coin falling
      const fallDuration = Math.random() * 3 + 2;
      const horizontalMovement = (Math.random() - 0.5) * 150;
      const rotations = Math.floor(Math.random() * 5) + 2;

      coin.animate([
        { transform: 'translateY(0) translateX(0) rotateY(0deg)', opacity: 1 },
        { transform: `translateY(${window.innerHeight + 50}px) translateX(${horizontalMovement}px) rotateY(${rotations * 360}deg)`, opacity: 0.2 }
      ], {
        duration: fallDuration * 1000,
        easing: 'cubic-bezier(0.2, 0.5, 0.3, 1)'
      });

      // Create coin "clink" effect occasionally
      if (Math.random() > 0.7) {
        setTimeout(() => {
          const clink = document.createElement('div');
          clink.style.position = 'absolute';
          clink.style.left = coin.style.left;
          clink.style.top = `${parseInt(coin.style.top) + 100}px`;
          clink.style.color = '#ffff33';
          clink.style.fontSize = '12px';
          clink.style.fontFamily = "'Press Start 2P', cursive";
          clink.style.textShadow = '0 0 5px #ffff33';
          clink.textContent = 'CLINK!';

          coinsContainer.appendChild(clink);

          clink.animate([
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(-30px)', opacity: 0 }
          ], {
            duration: 800,
            easing: 'ease-out'
          });

          setTimeout(() => clink.remove(), 800);
        }, fallDuration * 500);
      }

      // Remove the coin after animation
      setTimeout(() => {
        coin.remove();
      }, fallDuration * 1000);

    }, Math.random() * 2000); // Stagger coin creation
  }

  // Remove container after all animations complete
  setTimeout(() => {
    if (document.getElementById('confetti-container')) {
      document.getElementById('confetti-container').remove();
    }
  }, 6000);
}

const tabButtons = document.querySelectorAll('.tab-button');
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
    const charity = document.getElementById('charity-select').value;

    // Track donations
    const donations = JSON.parse(localStorage.getItem('donations') || '{"nps": 0, "foa": 0}');
    donations[charity] += amount;
    localStorage.setItem('donations', JSON.stringify(donations));

    // Validate input
    if (!name || !message || isNaN(amount) || !charity) {
        alert(!charity ? 'Please select a charity to post.' : 'Please fill out all fields.');
        return;
    }
    
    if (amount < 1.00 || amount > 10.00) {
        alert('Amount must be between $1.00 and $10.00');
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
        amount: amount,
        timestamp: new Date()
    };

    // Check if user already exists and update their amount
    const existingMessageIndex = messages.findIndex(m => m.name.toLowerCase() === name.toLowerCase());

    if (existingMessageIndex !== -1) {
        const updatedAmount = messages[existingMessageIndex].amount + amount;
        newMessage.amount = updatedAmount;
        messages[existingMessageIndex] = newMessage;
    } else {
        messages.push(newMessage);
    }

    // Sort messages by amount (highest first)
    messages.sort((a, b) => b.amount - a.amount);

    // Update top spenders list
    updateTopSpenders();

    // Check if this is the new top spender
    if (amount > topSpender.amount) {
        topSpender = { name: name, amount: amount };
        updateTopSpender(true); // Pass true to indicate a new top spender
    }

    // Update the UI
    displayMessages();

    // Save data
    saveData();

    // Update UI elements
    updateTopSpenders();
    updateTopSpender();
    displayMessages();

    // Clear the form
    nameInput.value = '';
    messageInput.value = '';
    amountInput.value = '';
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
    const alltimeSpenders = {};

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

        // Add to all-time spenders
        if (!alltimeSpenders[msg.name] || alltimeSpenders[msg.name].amount < msg.amount) {
            alltimeSpenders[msg.name] = { name: msg.name, amount: msg.amount };
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

    alltimeTopSpenders = Object.values(alltimeSpenders)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);


    // Update the UI for top spenders lists
    updateTopSpendersUI('daily-top-spenders-list', dailyTopSpenders, 5);
    updateTopSpendersUI('weekly-top-spenders-list', weeklyTopSpenders, 5);
    updateTopSpendersUI('monthly-top-spenders-list', monthlyTopSpenders, 10);
    updateTopSpendersUI('alltime-top-spenders-list', alltimeTopSpenders, 10);

    // Save data
    saveData();
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

// Function to update the top spender display
function updateTopSpender(isNewTopSpender = false) {
    // Calculate current highest total spender
    const userTotals = {};
    messages.forEach(msg => {
        if (!userTotals[msg.name]) userTotals[msg.name] = 0;
        userTotals[msg.name] += msg.amount;
    });

    // Find the highest total spender
    let highestTotal = 0;
    let currentTopSpender = '';
    Object.entries(userTotals).forEach(([name, total]) => {
        if (total > highestTotal) {
            highestTotal = total;
            currentTopSpender = name;
        }
    });

    // Check if there's a new overall top spender
    if (currentTopSpender && currentTopSpender !== topSpender.name) {
        isNewTopSpender = true;
        topSpender.name = currentTopSpender;
        topSpender.amount = highestTotal;
    }

    // Get the current all-time top spender
    if (alltimeTopSpenders && alltimeTopSpenders.length > 0) {
        const alltimeTopSpender = alltimeTopSpenders[0];
        topSpenderMessage.textContent = `${alltimeTopSpender.name} (Total: $${alltimeTopSpender.amount.toFixed(2)})`;

        // Get all messages from the all-time top spender and find the latest one
        const topSpenderMessages = messages.filter(msg => msg.name === alltimeTopSpender.name);
        const latestMessage = topSpenderMessages.length > 0 ? 
            topSpenderMessages.reduce((latest, current) => 
                new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
            ) : null;

        if (latestMessage) {
            // Update banner message with their latest message
            topSpenderBannerMessage.textContent = `"${latestMessage.message}" - ${alltimeTopSpender.name} (Total: $${alltimeTopSpender.amount.toFixed(2)})`;

            // If this is a new top spender, play the celebration animation
            if (isNewTopSpender) {
                const banner = document.getElementById('top-spender-banner');
                banner.classList.add('celebrate');

                // Create confetti effect
                createPixelConfetti();

                // Remove animation class after animation completes
                setTimeout(() => {
                    banner.classList.remove('celebrate');
                }, 6000);
            }

            // Show expand indicator if message is long
            const banner = document.getElementById('top-spender-banner');
            if (latestMessage.message.length > 100) {
                banner.querySelector('.expand-indicator').style.display = 'block';
            } else {
                banner.querySelector('.expand-indicator').style.display = 'none';
            }
        }

        // Play celebration animation if this is a new top spender
        if (isNewTopSpender) {
            // Add animation class to banner
            const banner = document.getElementById('top-spender-banner');
            banner.classList.add('celebrate');

            // Show congratulations message
            const congratsMessage = document.createElement('div');
            congratsMessage.id = 'congrats-message';

            // Create retro ASCII art treasure chest
            const dollarArt = document.createElement('div');
            dollarArt.innerHTML = `
                <pre style="font-size: 10px; line-height: 1; margin-bottom: 15px; color: #ffcc33;">
    .--------------.
    |**************|
    |**  ______  **|
    |** |      | **|
    |** | GOLD | **|
    |** |______| **|
   /|**          **|\\
  / |**  $$$$$$  **| \\
 |==|**  $$$$$$  **|==|
 |==|**          **|==|
 |==|**  @@@@@@  **|==|
 |==|**__@@@@@@__**|==|
    '-------------'
                </pre>
            `;

            congratsMessage.appendChild(dollarArt);

            const congratsText = document.createElement('div');
            congratsText.textContent = 'HIGH SCORE! NEW TOP SPENDER!';
            congratsMessage.appendChild(congratsText);

            document.body.appendChild(congratsMessage);

            // Create and play pixelated confetti effect
            createPixelConfetti();

            // Remove animation and message after animation completes
            setTimeout(() => {
                banner.classList.remove('celebrate');
                if (document.getElementById('congrats-message')) {
                    document.getElementById('congrats-message').remove();
                }
            }, 6000);
        }
    } else {
        topSpenderMessage.textContent = 'No top spender yet.';
        topSpenderBannerMessage.textContent = 'No top spender yet.';
    }

    // Save data
    saveData();
}

// Function to display all messages
function displayMessages() {
    // Clear the current list
    messageList.innerHTML = '';

    // Create a copy of messages to work with
    const sortedMessages = [...messages];
    
    // Show placeholder if no messages
    if (sortedMessages.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'message-item';
        emptyMessage.textContent = 'No messages yet. Be the first to post!';
        messageList.appendChild(emptyMessage);
        return;
    }

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

        // Add CHA-CHING animation for non-top spender posts
        if (msg.name !== topSpender.name || msg.amount !== topSpender.amount) {
            const chaChing = document.createElement('div');
            chaChing.className = 'cha-ching';
            chaChing.textContent = 'CHA-CHING';
            messageItem.appendChild(chaChing);

            // Create coins
            for (let i = 0; i < 3; i++) {
                const coin = document.createElement('div');
                coin.className = 'coin';
                coin.textContent = '$';
                messageItem.appendChild(coin);
            }
        }
    });
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('messages', JSON.stringify(messages));
    localStorage.setItem('topSpender', JSON.stringify(topSpender));
    localStorage.setItem('dailyTopSpenders', JSON.stringify(dailyTopSpenders));
    localStorage.setItem('weeklyTopSpenders', JSON.stringify(weeklyTopSpenders));
    localStorage.setItem('monthlyTopSpenders', JSON.stringify(monthlyTopSpenders));
    localStorage.setItem('alltimeTopSpenders', JSON.stringify(alltimeTopSpenders));
    localStorage.setItem('lastDailyReset', lastDailyReset.toString());
    localStorage.setItem('lastWeeklyReset', lastWeeklyReset.toString());
    localStorage.setItem('lastMonthlyReset', lastMonthlyReset.toString());
}

// Load data from localStorage
function loadData() {
    // Load messages
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
        // Convert string timestamps back to Date objects
        messages.forEach(msg => {
            msg.timestamp = new Date(msg.timestamp);
        });
    }

    // Load top spender
    const savedTopSpender = localStorage.getItem('topSpender');
    if (savedTopSpender) {
        topSpender = JSON.parse(savedTopSpender);
    }

    // Load spender lists
    const savedDailyTopSpenders = localStorage.getItem('dailyTopSpenders');
    if (savedDailyTopSpenders) {
        dailyTopSpenders = JSON.parse(savedDailyTopSpenders);
    }

    const savedWeeklyTopSpenders = localStorage.getItem('weeklyTopSpenders');
    if (savedWeeklyTopSpenders) {
        weeklyTopSpenders = JSON.parse(savedWeeklyTopSpenders);
    }

    const savedMonthlyTopSpenders = localStorage.getItem('monthlyTopSpenders');
    if (savedMonthlyTopSpenders) {
        monthlyTopSpenders = JSON.parse(savedMonthlyTopSpenders);
    }

    const savedAlltimeTopSpenders = localStorage.getItem('alltimeTopSpenders');
    if (savedAlltimeTopSpenders) {
        alltimeTopSpenders = JSON.parse(savedAlltimeTopSpenders);
    }

    // Load reset timestamps
    const savedDailyReset = localStorage.getItem('lastDailyReset');
    if (savedDailyReset) {
        lastDailyReset = new Date(savedDailyReset);
    } else {
        lastDailyReset = new Date();
    }

    const savedWeeklyReset = localStorage.getItem('lastWeeklyReset');
    if (savedWeeklyReset) {
        lastWeeklyReset = new Date(savedWeeklyReset);
    } else {
        lastWeeklyReset = new Date();
    }

    const savedMonthlyReset = localStorage.getItem('lastMonthlyReset');
    if (savedMonthlyReset) {
        lastMonthlyReset = new Date(savedMonthlyReset);
    } else {
        lastMonthlyReset = new Date();
    }
}

// Initialize with timestamp metadata for persistence
function initializeTimestamps() {
    // Load data from localStorage first
    loadData();

    // Check if resets are needed
    checkTimeResets();
}

// Make the top spender banner expandable
const topSpenderBanner = document.getElementById('top-spender-banner');
topSpenderBanner.addEventListener('click', function() {
    this.classList.toggle('expanded');
});

// Initialize the app
initializeTimestamps();
updateTopSpenders();
updateTopSpender();
displayMessages(); // Add immediate display of messages

// Set up periodic checks for time-based resets (every hour)
setInterval(updateTopSpenders, 60 * 60 * 1000);