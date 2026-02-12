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

const btnLogin = document.getElementById('btn-login');
const codeInput = document.getElementById('guest-code-input');
const loginScreen = document.getElementById('login-screen');
const mainContent = document.getElementById('main-content');
const errorMsg = document.getElementById('login-error');
const welcomeMsg = document.getElementById('welcome-message');

const showInvitation = (nombre) => {
    welcomeMsg.innerText = `¡Hola ${nombre}!`;
    loginScreen.style.display = 'none';
    mainContent.style.display = 'block';
    window.scrollTo(0, 0);
};

// AUTO-LOGIN SI YA ENTRÓ ANTES
window.addEventListener('load', async () => {
    const savedCode = sessionStorage.getItem('guestCode');
    if (savedCode) {
        const docRef = doc(db, "invitados", savedCode);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            currentGuestId = savedCode;
            showInvitation(docSnap.data().name); // Usamos .name de tu Firebase
        }
    }
});

// BOTÓN ENTRAR
btnLogin.addEventListener('click', async () => {
    const code = codeInput.value.trim(); // Nota: Los IDs de Firebase distinguen Mayúsculas/Minúsculas
    
    if (!code) return;

    btnLogin.innerText = "Verificando...";
    btnLogin.disabled = true;

    try {
        const docRef = doc(db, "invitados", code);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            currentGuestId = code;
            sessionStorage.setItem('guestCode', code);
            showInvitation(docSnap.data().name); // Usamos .name de tu Firebase
        } else {
            errorMsg.style.display = 'block';
            btnLogin.innerText = "Entrar";
            btnLogin.disabled = false;
        }
    } catch (e) {
        console.error(e);
        alert("Error de conexión.");
        btnLogin.disabled = false;
        btnLogin.innerText = "Entrar";
    }
});

// FORMULARIO RSVP
document.getElementById('rsvp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = e.target.querySelector('button');
    const asiste = document.getElementById('asistencia').value;
    const notas = document.getElementById('menu').value;

    btnSubmit.disabled = true;
    btnSubmit.innerText = "Enviando...";

    try {
        const guestRef = doc(db, "invitados", currentGuestId);
        await updateDoc(guestRef, {
            confirmed: true, // Actualiza el campo confirmed de tu Firebase
            asiste: asiste === 'si',
            menu: notas // Guarda las notas en el campo menu
        });
        document.getElementById('form-message').innerText = "¡Confirmado con éxito!";
        btnSubmit.innerText = "✓ Enviado";
    } catch (e) {
        alert("Error al guardar la confirmación.");
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Confirmar";
    }
});