import { firestore } from './firebase.js';
import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

async function loadPartsToTable() {
  const partsTableBody = document.getElementById('parts-table-body');
  if (!partsTableBody) return;

  try {
    const querySnapshot = await getDocs(collection(firestore, "parts"));
    partsTableBody.innerHTML = '';

    querySnapshot.forEach((docSnap) => {
      const p = docSnap.data();
      const key = docSnap.id;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${p.name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.type}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.price} Ft</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.quantity} db</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center space-x-2">
          <button class="px-2 py-1 bg-green-500 text-white rounded" onclick="updatePartQuantity('${key}', ${p.quantity}, 1)">+</button>
          <button class="px-2 py-1 bg-yellow-500 text-white rounded" onclick="updatePartQuantity('${key}', ${p.quantity}, -1)">-</button>
          <button class="px-2 py-1 bg-red-500 text-white rounded" onclick="deletePart('${key}')">Törlés</button>
        </td>
      `;
      partsTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error('Hiba alkatrészek betöltésekor:', err);
  }
}

window.updatePartQuantity = async function(key, currentQuantity, change) {
  const newQuantity = currentQuantity + change;
  if (newQuantity < 0) return;

  try {
    const partDocRef = doc(firestore, "parts", key);
    await updateDoc(partDocRef, { quantity: newQuantity });
    loadPartsToTable(); // újratöltjük a táblát a változás után
  } catch (err) {
    console.error('Hiba frissítéskor:', err);
  }
};

window.deletePart = async function(key) {
  if (!confirm('Biztosan törölni szeretnéd ezt az alkatrészt?')) return;

  try {
    const partDocRef = doc(firestore, "parts", key);
    await deleteDoc(partDocRef);
    loadPartsToTable(); // újratöltjük a táblát törlés után
  } catch (err) {
    console.error('Hiba törléskor:', err);
  }
};

document.addEventListener('DOMContentLoaded', loadPartsToTable);
