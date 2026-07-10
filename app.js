// 1. Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBA--GH1poSmBUu_N2XD5G_3gMurRH-Ga0",
  authDomain: "cinemaxhd-2a9c2.firebaseapp.com",
  projectId: "cinemaxhd-2a9c2",
  storageBucket: "cinemaxhd-2a9c2.firebasestorage.app",
  messagingSenderId: "694565000715",
  appId: "1:694565000715:web:3a3e4b9fd8984a9a53190e",
  measurementId: "G-X936Z760W7"
};

// 2. Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 3. Form Submit Event
document.getElementById('movieForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // පිටුව Reload වීම නවත්වන ප්‍රධාන පේළිය

    // Data ලබාගැනීම
    const fullName = document.getElementById('fullName').value;
    const waNumber = document.getElementById('waNumber').value;
    const movieName = document.getElementById('movieName').value;
    const language = document.getElementById('language').value;
    const year = document.getElementById('year').value;

    const submitBtn = document.querySelector('.btn-submit');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Submitting..."; // Loading බව පෙන්වීම

    try {
        await db.collection('requests').add({
            fullName: fullName,
            waNumber: waNumber,
            movieName: movieName,
            language: language,
            year: year,
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        const successMsg = document.getElementById('successMessage');
        successMsg.classList.remove('hidden');
        document.getElementById('movieForm').reset();
        
        setTimeout(() => {
            successMsg.classList.add('hidden');
        }, 5000);

    } catch (error) {
        console.error("Firebase Error: ", error);
        alert("Error! කරුණාකර නැවත උත්සාහ කරන්න.");
    } finally {
        submitBtn.innerText = originalBtnText;
    }
});
