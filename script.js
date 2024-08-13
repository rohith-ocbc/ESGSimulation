const sheetUrl = 'https://docs.google.com/spreadsheets/d/1-FyotIUSGGdKTDqso7ib8WGYU2eVzIxQfniBaS7y0Lk/export?format=csv&gid=0';

let stocksData = []; // To store the stock data including real names

function loadStocks() {
    Papa.parse(sheetUrl, {
        download: true,
        header: true,
        complete: function(results) {
            stocksData = results.data; // Store the data for later use
            const stocksGrid = document.getElementById('stocks-grid');
            stocksGrid.innerHTML = ''; // Clear the grid

            stocksData.forEach(stock => {
                const stockBox = document.createElement('div');
                stockBox.className = 'stock-box';
                stockBox.onclick = () => toggleSelection(stockBox);
                stockBox.setAttribute('data-esg', stock.ESG);
                stockBox.setAttribute('data-real-name', stock.RealName); // Store the real name

                stockBox.innerHTML = `
                    <img src="${stock.ImageURL}" alt="Stock Image">
                    <div class="stock-details">
                        <h3>${stock.Name}</h3>
                        <p class="return">1-year return: ${stock.Return}%</p>
                        <p class="esg">ESG Rating: ${stock.ESG}</p>
                    </div>
                `;

                stocksGrid.appendChild(stockBox);
            });
        }
    });
}

function toggleSelection(element) {
    const selectedBoxes = document.querySelectorAll('.stock-box.selected');
    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
    } else if (selectedBoxes.length < 4) {
        element.classList.add('selected');
    } else {
        alert('You can only select up to 4 stocks.');
    }
}

function fastForward() {
    const selectedBoxes = document.querySelectorAll('.stock-box.selected');
    if (selectedBoxes.length === 4) {
        const buttonColumn = document.getElementById('button-column');
        const loadingOverlay = document.getElementById('loading-overlay');
        buttonColumn.style.backgroundColor = 'black';
        loadingOverlay.style.display = 'flex';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            buttonColumn.style.backgroundColor = '';
            let totalValue = 0;
            let totalValueLeader = 0;
            selectedBoxes.forEach(box => {
                const esg = box.getAttribute('data-esg');
                if (esg === 'Leader') {
                    totalValue += 2500 * 1.20;
                } else if (esg === 'Average') {
                    totalValue += 2500 * 1.10;
                } else if (esg === 'Laggard') {
                    totalValue += 2500 * 0.92;
                }
            });

            totalValueLeader = 2500 * 4 * 1.20;

            const statementClass = totalValue >= 10000 ? 'positive' : 'negative';
            const totalValueColor = totalValue >= 10000 ? '#5a6268' : 'red';
            document.getElementById('portfolio-value').innerHTML = `
                <div class="statement-container">
                    <img src="https://i.imgur.com/vS8qeaZ.jpeg" alt="icon" class="icon">
                    <div class="statement ${statementClass}" style="background-color: #f0f0f0;">
                        $${totalValue.toLocaleString()} - Your portfolio value based on stock selections
                    </div>
                </div>
                <div class="statement-container">
                    <img src="https://i.imgur.com/Q9spnPI.jpeg" alt="icon" class="icon">
                    <div class="statement statement-leader">
                        $${totalValueLeader.toLocaleString()} - Portfolio growth if invested in ESG Leader stocks
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="portfolioChart"></canvas>
                </div>
            `;
            renderChart(totalValue, totalValueLeader);
        }, 4000);
    } else {
        alert('Please select exactly 4 stocks.');
    }
}

function resetPage() {
    const selectedBoxes = document.querySelectorAll('.stock-box.selected');
    selectedBoxes.forEach(box => box.classList.remove('selected'));
    document.getElementById('portfolio-value').innerText = '';

    // Reset stock names to initial values and clear ESG ratings
    const stockBoxes = document.querySelectorAll('.stock-box');
    stockBoxes.forEach(box => {
        const originalName = stocksData[Array.from(stockBoxes).indexOf(box)].Name;
        const h3 = box.querySelector('h3');
        h3.textContent = originalName; // Reset to original name
        const esg = box.querySelector('.esg');
        esg.textContent = 'ESG Rating: '; // Clear the ESG rating
    });

    shuffleStocks();
}

function shuffleStocks() {
    const grid = document.getElementById('stocks-grid');
    const boxes = Array.from(grid.children);
    boxes.sort(() => Math.random() - 0.5);
    boxes.forEach(box => grid.removeChild(box));
    boxes.forEach((box, index) => {
        setTimeout(() => {
            grid.appendChild(box);
        }, index * 100);
    });
    anime({
        targets: '.stock-box',
        translateX: () => anime.random(-10, 10),
        translateY: () => anime.random(-10, 10),
        duration: 1000,
        easing: 'easeInOutQuad',
        complete: () => {
            anime({
                targets: '.stock-box',
                translateX: 0,
                translateY: 0,
                duration: 1000,
                easing: 'easeInOutQuad',
            });
        }
    });
}

function renderChart(value1, value2) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    const data = {
        labels: ['Aug 2019', 'Aug 2024'],
        datasets: [
            {
                label: 'Your Selection',
                data: [10000, value1],
                borderColor: 'blue',
                borderWidth: 2,
                tension: 0.4, // Smooth the line
            },
            {
                label: 'ESG Leader Selection',
                data: [10000, value2],
                borderColor: 'green',
                borderWidth: 2,
                pointStyle: 'rectRot',
                pointBackgroundColor: 'green',
                pointBorderColor: 'green',
                hoverBorderColor: 'green',
                hoverBorderWidth: 4,
                tension: 0.4, // Smooth the line
            }
        ]
    };
    const options = {
        scales: {
            y: {
                beginAtZero: false
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `$${context.raw.toLocaleString()}`;
                    }
                }
            }
        }
    };
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
}

function revealRealNames() {
    const stockBoxes = document.querySelectorAll('.stock-box');
    stockBoxes.forEach(box => {
        const realName = box.getAttribute('data-real-name');
        const h3 = box.querySelector('h3');
        h3.textContent = realName; // Update the company name to the real name
    });
}

// Load stocks from Google Sheets on page load
window.onload = loadStocks;
