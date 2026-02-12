import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFxn1ZUhd6HIF2Wj-dt6ohV2ZRH_EK4Uo",
  authDomain: "our13wedding.firebaseapp.com",
  projectId: "our13wedding",
  storageBucket: "our13wedding.firebasestorage.app",
  messagingSenderId: "365371427127",
  appId: "1:365371427127:web:0efb39f2e5f05d0eefb2b2",
  measurementId: "G-TXRVCYNGQQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentGuestId = null;

// LÓGICA DE ACCESO
document.getElementById('btn-login').addEventListener('click', async () => {
    const code = document.getElementById('guest-code-input').value.trim().toUpperCase();
    const errorMsg = document.getElementById('login-error');

    try {
        const docRef = doc(db, "invitados", code);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            currentGuestId = code;
            const data = docSnap.data();
            document.getElementById('welcome-message').innerText = `¡Hola ${data.nombre}!`;
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
        } else {
            errorMsg.style.display = 'block';
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión con Firebase.");
    }
});

// LÓGICA DE CONFIRMACIÓN
document.getElementById('rsvp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const asiste = document.getElementById('asistencia').value;
    const notas = document.getElementById('menu').value;

    try {
        const guestRef = doc(db, "invitados", currentGuestId);
        await updateDoc(guestRef, {
            confirmado: true,
            asiste: asiste === 'si',
            notas: notas
        });
        document.getElementById('form-message').innerText = "¡Gracias por confirmar!";
    } catch (e) {
        alert("Error al guardar.");
    }
});