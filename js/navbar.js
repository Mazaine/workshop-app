// js/navbar.js
document.write(`
<nav class="bg-blue-600 text-white shadow-lg">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 class="text-2xl font-bold">Egér Alkatrész Kezelő</h1>
        <div class="space-x-4">
            <button onclick="window.location.href='add-part.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Alkatrész hozzáadása</button>
            <button onclick="window.location.href='parts-list.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Alkatrész lista</button>
            <button onclick="window.location.href='order.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Rendelések</button>
            <button onclick="window.location.href='create-workorder.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Munkalap generálása</button>
            <button onclick="window.location.href='workorders-list.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Munkalapok</button>
        </div>
    </div>
</nav>
`);
