import { firestore } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const form = document.getElementById('order-form');
const cardsContainer = document.getElementById('order-cards-container');
const ordersCollection = collection(firestore, 'orders');

function getStatusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'szállítás alatt': return 'bg-yellow-200 text-yellow-800';
    case 'átvettem': return 'bg-green-200 text-green-800';
    case 'szerelés alatt': return 'bg-blue-200 text-blue-800';
    case 'fizetve': return 'bg-purple-200 text-purple-800';
    case 'elküldve': return 'bg-gray-200 text-gray-800';
    default: return 'bg-gray-100 text-gray-600';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const proharderName = form['proharder-name'].value.trim();
  const issueDescription = form['issue-description'].value.trim();
  const device = form['device'].value.trim();
  const date = form['date'].value;
  const notes = form['notes'].value.trim();

  if (!proharderName || !issueDescription || !device || !date) {
    alert('Kérlek töltsd ki a kötelező mezőket!');
    return;
  }

  try {
    await addDoc(ordersCollection, {
      proharderName,
      issueDescription,
      device,
      date,
      notes,
      status: 'szállítás alatt',
      createdAt: new Date()
    });

    alert('Rendelés sikeresen leadva!');
    form.reset();
    loadOrders();
  } catch (error) {
    console.error('Hiba a rendelés mentésekor:', error);
    alert('Hiba történt a rendelés leadásakor.');
  }
});

// Új státusz frissítő függvény
async function updateStatus(docId, newStatus, selectElem) {
  try {
    const orderDoc = doc(firestore, 'orders', docId);
    await updateDoc(orderDoc, { status: newStatus });
    selectElem.className = `px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(newStatus)}`;
  } catch (error) {
    console.error('Hiba a státusz frissítésekor:', error);
    alert('Nem sikerült frissíteni a státuszt.');
  }
}

// Rendelések betöltése Firestore-ból
async function loadOrders() {
  cardsContainer.innerHTML = '<p>Betöltés...</p>';
  try {
    const q = query(ordersCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      cardsContainer.innerHTML = '<p>Nem található rendelés.</p>';
      return;
    }

    cardsContainer.innerHTML = '';

    querySnapshot.forEach(docSnap => {
      const order = docSnap.data();
      const status = order.status || 'szállítás alatt';
      const statusClass = getStatusColor(status);

      const card = document.createElement('div');
      card.className = 'bg-white shadow-md rounded-lg p-6 mb-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300';

      // Legördülő státuszválasztó
      card.innerHTML = `
        <h3 class="text-xl font-semibold mb-3 text-blue-700">Rendelés adatai</h3>
        <p><strong>Proharder név:</strong> <span class="text-gray-800">${order.proharderName}</span></p>
        <p><strong>Hibaleírás:</strong> <span class="text-gray-700">${order.issueDescription}</span></p>
        <p><strong>Javítandó eszköz:</strong> <span class="text-gray-700">${order.device}</span></p>
        <p><strong>Dátum:</strong> <span class="text-gray-600">${order.date}</span></p>
        <p><strong>Megjegyzés:</strong> <span class="text-gray-600">${order.notes ? order.notes : '-'}</span></p>
        <label for="status-select-${docSnap.id}" class="block mt-4 font-semibold">Státusz:</label>
        <select id="status-select-${docSnap.id}" class="px-3 py-1 rounded-full text-sm font-semibold ${statusClass}">
          <option value="szállítás alatt" ${status === 'szállítás alatt' ? 'selected' : ''}>Szállítás alatt</option>
          <option value="átvettem" ${status === 'átvettem' ? 'selected' : ''}>Átvettem</option>
          <option value="szerelés alatt" ${status === 'szerelés alatt' ? 'selected' : ''}>Szerelés alatt</option>
          <option value="fizetve" ${status === 'fizetve' ? 'selected' : ''}>Fizetve</option>
          <option value="elküldve" ${status === 'elküldve' ? 'selected' : ''}>Elküldve</option>
        </select>
      `;

      cardsContainer.appendChild(card);

      // Eseményfigyelő a státuszváltoztatásra
      const selectElem = document.getElementById(`status-select-${docSnap.id}`);
      selectElem.addEventListener('change', () => {
        updateStatus(docSnap.id, selectElem.value, selectElem);
      });
    });
  } catch (error) {
    console.error('Hiba a rendelések betöltésekor:', error);
    cardsContainer.innerHTML = '<p>Hiba történt a rendelések betöltésekor.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
});
