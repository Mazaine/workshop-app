document.write(`
<nav class="bg-blue-600 text-white shadow-lg">
  <div class="container mx-auto px-4 py-3 flex justify-between items-center">
    <!-- Bal oldal: logó -->
    <h1 class="text-2xl font-bold">Egér Alkatrész Kezelő</h1>

    <!-- Jobb oldal: menü és hamburger külön flexben -->
    <div class="flex items-center space-x-2">
      <!-- Hamburger ikon mobilra -->
      <button id="menu-toggle" class=" ml-auto md:hidden text-3xl focus:outline-none">☰</button>

      <!-- Menü gombok desktopon -->
      <div id="menu-links" class="hidden md:flex md:space-x-4">
        <button onclick="window.location.href='add-part.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Alkatrész hozzáadása</button>
        <button onclick="window.location.href='parts-list.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Alkatrész lista</button>
        <button onclick="window.location.href='order.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Rendelések</button>
        <button onclick="window.location.href='create-workorder.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Munkalap generálása</button>
        <button onclick="window.location.href='workorders-list.html'" class="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Munkalapok</button>
      </div>
    </div>
  </div>

  <!-- Mobil menü: lefelé nyíló -->
  <div id="mobile-menu" class="md:hidden hidden px-4 pb-4 space-y-2">
    <button onclick="window.location.href='add-part.html'" class="w-full text-left px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Alkatrész hozzáadása</button>
    <button onclick="window.location.href='parts-list.html'" class="w-full text-left px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Alkatrész lista</button>
    <button onclick="window.location.href='order.html'" class="w-full text-left px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Rendelések</button>
    <button onclick="window.location.href='create-workorder.html'" class="w-full text-left px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Munkalap generálása</button>
    <button onclick="window.location.href='workorders-list.html'" class="w-full text-left px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800">Munkalapok</button>
  </div>

  <script>
    const toggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  </script>
</nav>
`);
