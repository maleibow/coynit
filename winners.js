
// API base URL - always use the same origin approach as in script.js
const API_URL = window.location.origin;

console.log("Winners page using API URL:", API_URL);

// Function to fetch top spenders from server
function getTopSpenders() {
    return fetch(`${API_URL}/api/top-spenders`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Sort by amount and return top 3
            return data.sort((a, b) => b.amount - a.amount).slice(0, 3);
        })
        .catch(error => {
            console.error('Error fetching top spenders:', error);
            return []; // Return empty array on error
        });
}

// Function to update the podium with top spenders
function updatePodium() {
    getTopSpenders().then(topSpenders => {
        // Update first place (if exists)
        if (topSpenders.length > 0) {
            document.getElementById('first-place-name').textContent = topSpenders[0].name;
            document.getElementById('first-place-amount').textContent = `$${topSpenders[0].amount.toFixed(2)}`;
        }
        
        // Update second place (if exists)
        if (topSpenders.length > 1) {
            document.getElementById('second-place-name').textContent = topSpenders[1].name;
            document.getElementById('second-place-amount').textContent = `$${topSpenders[1].amount.toFixed(2)}`;
        }
        
        // Update third place (if exists)
        if (topSpenders.length > 2) {
            document.getElementById('third-place-name').textContent = topSpenders[2].name;
            document.getElementById('third-place-amount').textContent = `$${topSpenders[2].amount.toFixed(2)}`;
        }
    });
}

// Initialize the podium when the page loads
document.addEventListener('DOMContentLoaded', function() {
    updatePodium();
});
