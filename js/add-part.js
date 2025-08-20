// js/add-part.js
import { firestore } from './firebase.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const addPartForm = document.getElementById('add-part-form');

if (addPartForm) {
  addPartForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const partName = document.getElementById('part-name').value.trim();
    const partType = document.getElementById('part-type').value;
    const partPurchasePrice = document.getElementById('part-purchase-price').value;
    const partPrice = parseInt(document.getElementById('part-price').value) || 0;
    const partQuantity = parseInt(document.getElementById('part-quantity').value) || 0;

    try {
      await addDoc(collection(firestore, "parts"), {
        name: partName,
        type: partType,
        purchasePrice: partPurchasePrice,
        price: partPrice,
        quantity: partQuantity
      });
      alert('Alkatrész sikeresen hozzáadva!');
      addPartForm.reset();
    } catch (err) {
      console.error('Hiba a mentés során:', err);
      alert('Hiba történt a mentés során!');
    }
  });
}
