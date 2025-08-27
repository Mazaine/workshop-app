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
  <td class="editable px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-id="${key}" data-field="name">${p.name}</td>
  <td class="editable px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-id="${key}" data-field="type">${p.type}</td>
  <td class="editable px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-id="${key}" data-field="purchasePrice">${p.purchasePrice ?? '-'}</td>
  <td class="editable px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-id="${key}" data-field="price">${p.price} Ft</td>
  <td class="editable px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-id="${key}" data-field="quantity">${p.quantity} db</td>
  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center space-x-2">
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

//Módósítás logika
document.addEventListener('dblclick', (e) => {
  if (e.target.classList.contains('editable')) {
    const td = e.target;
    const key = td.getAttribute('data-id');
    const field = td.getAttribute('data-field');
    const oldValue = td.textContent.replace(' Ft', '').replace(' db', '').trim();

    // input létrehozása
    const input = document.createElement('input');
    input.type = (field === 'price' || field === 'purchasePrice' || field === 'quantity') ? 'number' : 'text';
    input.value = oldValue;
    input.className = "border px-1 py-0.5 w-full";

    td.innerHTML = '';
    td.appendChild(input);
    input.focus();

    // mentés Enterre vagy blur-re
    const save = async () => {
      const newValue = input.value.trim();
      if (newValue === oldValue) {
        td.textContent = formatValue(field, oldValue);
        return;
      }

      try {
        const partDocRef = doc(firestore, "parts", key);
        await updateDoc(partDocRef, { [field]: (field === 'price' || field === 'purchasePrice' || field === 'quantity') ? Number(newValue) : newValue });

        td.textContent = formatValue(field, newValue);
      } catch (err) {
        console.error('Hiba frissítéskor:', err);
        td.textContent = formatValue(field, oldValue);
      }
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        input.blur();
      } else if (event.key === 'Escape') {
        td.textContent = formatValue(field, oldValue);
      }
    });
  }
});

// értékek szépen formázva jelenjenek meg
function formatValue(field, value) {
  if (field === 'price' || field === 'purchasePrice') return value + ' Ft';
  if (field === 'quantity') return value + ' db';
  return value;
}
