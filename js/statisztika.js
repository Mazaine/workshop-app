// statisztika.js
import { firestore } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Canvas elem
const distributionCtx = document.getElementById('distributionChart')?.getContext('2d');
if (!distributionCtx) {
    console.error("distributionChart canvas nem található!");
}

// Doughnut chart
const distributionChart = new Chart(distributionCtx, {
    type: 'doughnut',
    data: { labels: ['Profit', 'Kiadás'], datasets: [{ data: [0,0], backgroundColor: ['#3B82F6', '#EF4444'] }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
});

// Worksheets lekérése
async function getWorksheets() {
    const snap = await getDocs(collection(firestore, 'worksheets'));
    const data = [];
    snap.forEach(doc => data.push(doc.data())); // minden dokumentumot beteszünk
    console.log("Worksheets:", data);
    return data;
}

// Parts lekérése
async function getParts() {
    const snap = await getDocs(collection(firestore, 'parts'));
    const data = {};
    snap.forEach(doc => data[doc.id] = doc.data());
    console.log("Parts:", data);
    return data;
}

// Statisztika betöltése
async function loadStats() {
    const worksheets = await getWorksheets();
    const partsData = await getParts();

    let totalProfit = 0;
    let totalCost = 0;
    const partUsage = {};

    worksheets.forEach(ws => {
        totalProfit += ws.total || 0;

        if(ws.partsUsed){
            ws.partsUsed.forEach(p => {
                const part = partsData[p.partId];
                if(part){
                    totalCost += (part.purchasePrice || 0) * p.quantity;
                    partUsage[part.name] = (partUsage[part.name] || 0) + p.quantity;
                }
            });
        }
    });

    const mostUsedPart = Object.entries(partUsage).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-';

    // DOM frissítés
    document.getElementById('totalProfit').innerText = `Profit: ${totalProfit} Ft`;
    document.getElementById('totalCost').innerText = `Kiadás: ${totalCost} Ft`;
    document.getElementById('mostUsedPart').innerText = ` ${mostUsedPart}`;

    // Doughnut frissítése
    distributionChart.data.datasets[0].data = [totalProfit, totalCost];
    distributionChart.update();
}

// Szűrő gomb (egyszerűsített, dátumszűrés nélkül)
document.getElementById('filterBtn').addEventListener('click', () => {
    loadStats();
});

// Betöltés
loadStats();
