// Asegúrate de usar tus propias credenciales de Firebase aquí
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Importa los módulos de Firebase usando la sintaxis de módulos ES6
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- CÓDIGO DE LA CUENTA ATRÁS ---
const countdownElement = document.getElementById('countdown');
const weddingDate = new Date('September 14, 2026 17:00:00').getTime(); // TU FECHA Y HORA

function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownElement.innerHTML = `Faltan: ${days}d ${hours}h ${minutes}m ${seconds}s`;

    if (distance < 0) {
        clearInterval(countdownInterval);
        countdownElement.innerHTML = "¡YA ESTAMOS CASADOS!";
    }
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown(); // Ejecutar inmediatamente para evitar un segundo de retraso

// --- LÓGICA DEL FORMULARIO RSVP ---
const rsvpForm = document.getElementById('rsvp-form');
const formMessage = document.getElementById('form-message');
const asistenciaSelect = document.getElementById('asistencia');
const acompananteGroup = document.getElementById('acompanante-group');

// Mostrar/ocultar campo de acompañante
asistenciaSelect.addEventListener('change', (event) => {
    if (event.target.value === 'si') {
        acompananteGroup.style.display = 'block';
    } else {
        acompananteGroup.style.display = 'none';
        document.getElementById('acompanante').value = ''; // Limpiar el campo si no asiste
    }
});


rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    const nombre = document.getElementById('nombre').value;
    const asistencia = document.getElementById('asistencia').value;
    const acompanante = document.getElementById('acompanante').value;
    const autobus = document.getElementById('autobus').value;
    const menu = document.getElementById('menu').value;

    if (!nombre || !asistencia) {
        formMessage.textContent = "Por favor, completa los campos obligatorios.";
        formMessage.style.color = "red";
        return;
    }

    try {
        await addDoc(collection(db, "invitados"), {
            nombre: nombre,
            asiste: asistencia === 'si', // Guarda como boolean
            acompanante: asistencia === 'si' ? acompanante : '', // Solo si asiste
            autobus: autobus === 'si', // Guarda como boolean
            menu: menu,
            timestamp: new Date() // Para saber cuándo confirmó
        });
        formMessage.textContent = "¡Gracias por confirmar tu asistencia!";
        formMessage.style.color = "green";
        rsvpForm.reset(); // Limpia el formulario
        acompananteGroup.style.display = 'none'; // Oculta de nuevo el acompañante
    } catch (error) {
        console.error("Error al guardar la confirmación: ", error);
        formMessage.textContent = "Hubo un error al enviar tu confirmación. Inténtalo de nuevo.";
        formMessage.style.color = "red";
    }
});