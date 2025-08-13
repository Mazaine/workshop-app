document.write(`
<nav class="bg-blue-600 text-white shadow-lg">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 class="text-2xl font-bold">Egér Alkatrész Kezelő</h1>
        
        <div class="flex items-center">
      
    <!-- Hamburger ikon mobilra -->
    <button id="menu-toggle" class="block md:hidden focus:outline-none text-3xl flex items-center"">
      ☰
    </button>

            <!-- Menü gombok -->
            <div id="menu-links" class="overflow-hidden max-h-0 md:max-h-none transition-all duration-500 ease-in-out md:flex md:space-x-4 flex-col md:flex-row mt-4 md:mt-0 ml-4">
                <button onclick="window.location.href='add-part.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Alkatrész hozzáadása</button>
                <button onclick="window.location.href='parts-list.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Alkatrész lista</button>
                <button onclick="window.location.href='order.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Rendelések</button>
                <button onclick="window.location.href='create-workorder.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Munkalap generálása</button>
                <button onclick="window.location.href='workorders-list.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Munkalapok</button>
            </div>
        </div>
    </div>
</nav>

<script>
document.getElementById('menu-toggle').addEventListener('click', function() {
    const menu = document.getElementById('menu-links');
    if (menu.style.maxHeight && menu.style.maxHeight !== '0px') {
        menu.style.maxHeight = '0px'; // Felcsúszik
    } else {
        menu.style.maxHeight = menu.scrollHeight + 'px'; // Lecsúszik
    }
});
</script>
`);
