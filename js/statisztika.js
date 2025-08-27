import { getWorksheets, getParts } from './firebase.js';

const profitCtx = document.getElementById('profitChart').getContext('2d');
const distributionCtx = document.getElementById('distributionChart').getContext('2d');

const profitChart = new Chart(profitCtx, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Profit', data: [], backgroundColor: '#3B82F6' }] },
    options: { responsive: true, maintainAspectRatio: false }
});

const distributionChart = new Chart(distributionCtx, {
    type: 'doughnut',
    data: { labels: ['Profit', 'Kiadás'], datasets: [{ data: [0,0], backgroundColor: ['#3B82F6', '#EF4444'] }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
});

async function loadStats(startDate=null, endDate=null) {
    const worksheets = await getWorksheets(startDate, endDate);
    const partsData = await getParts();

    let totalProfit = 0;
    let totalCost = 0;
    const partUsage = {};

    worksheets.forEach(ws => {
        if (ws.usedParts) {
            ws.usedParts.forEach(p => {
                const part = partsData[p.partId];
                if (part) {
                    const profit = (p.unitPrice - part.cost) * p.quantity;
                    totalProfit += profit;
                    totalCost += part.cost * p.quantity;
                    
                    partUsage[part.name] = (partUsage[part.name] || 0) + p.quantity;
                }
            });
        }
    });

    const mostUsedPart = Object.entries(partUsage).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-';

    document.getElementById('totalProfit').innerText = `Profit: ${totalProfit} Ft`;
    document.getElementById('totalCost').innerText = `Kiadás: ${totalCost} Ft`;
    document.getElementById('mostUsedPart').innerText = `Legtöbbet használt alkatrész: ${mostUsedPart}`;

    // Diagram adatok
    profitChart.data.labels = worksheets.map(ws => ws.date);
    profitChart.data.datasets[0].data = worksheets.map(ws => {
        let profit = 0;
        if (ws.usedParts) {
            ws.usedParts.forEach(p => {
                const part = partsData[p.partId];
                if (part) profit += (p.unitPrice - part.cost) * p.quantity;
            });
        }
        return profit;
    });
    profitChart.update();

    distributionChart.data.datasets[0].data = [totalProfit, totalCost];
    distributionChart.update();
}

document.getElementById('filterBtn').addEventListener('click', () => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    loadStats(startDate, endDate);
});

loadStats();
