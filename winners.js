
function updateWinners() {
    // Get monthly top spenders from localStorage
    const monthlyTopSpenders = JSON.parse(localStorage.getItem('monthlyTopSpenders')) || [];
    
    // Update winners display
    const positions = ['first', 'second', 'third'];
    positions.forEach((pos, index) => {
        if (monthlyTopSpenders[index]) {
            const winner = monthlyTopSpenders[index];
            document.querySelector(`.${pos}-place .name`).textContent = winner.name;
            document.querySelector(`.${pos}-place .amount`).textContent = 
                `$${winner.amount.toFixed(2)}`;
        }
    });
}

// Update winners immediately and every minute
updateWinners();
setInterval(updateWinners, 60000);
