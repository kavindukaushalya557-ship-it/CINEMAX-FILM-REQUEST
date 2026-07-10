// 1. ඔයාගේ Firebase Configuration එක
const firebaseConfig = {
  apiKey: "AIzaSyBA--GH1poSmBUu_N2XD5G_3gMurRH-Ga0",
  authDomain: "cinemaxhd-2a9c2.firebaseapp.com",
  projectId: "cinemaxhd-2a9c2",
  storageBucket: "cinemaxhd-2a9c2.firebasestorage.app",
  messagingSenderId: "694565000715",
  appId: "1:694565000715:web:3a3e4b9fd8984a9a53190e",
  measurementId: "G-X936Z760W7"
};

// 2. Firebase සහ Database Initialize කිරීම
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 3. Form එක Submit කරද්දී සිදුවන ක්‍රියාවලිය
document.getElementById('movieForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // පිටුව Reload වීම නවත්වයි

    // Form එකේ තියෙන Data ටික ලබාගැනීම
    const fullName = document.getElementById('fullName').value;
    const waNumber = document.getElementById('waNumber').value;
    const movieName = document.getElementById('movieName').value;
    const language = document.getElementById('language').value;
    const year = document.getElementById('year').value;

    // බොත්තමේ text එක 'Submitting...' කියලා මාරු කිරීම (යන බව පෙන්වන්න)
    const submitBtn = document.querySelector('.btn-submit');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Submitting...";

    try {
        // Firebase Firestore එකේ 'requests' කියන Collection එකට Data එකතු කිරීම
        await db.collection('requests').add({
            fullName: fullName,
            waNumber: waNumber,
            movieName: movieName,
            language: language,
            year: year,
            status: 'pending', // මුලින්ම request එක pending විදිහට වැටේ
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // සාර්ථක පණිවිඩය පෙන්වීම
        const successMsg = document.getElementById('successMessage');
        successMsg.classList.remove('hidden');
        
        // Form එක Reset කිරීම (හිස් කිරීම)
        document.getElementById('movieForm').reset();
        
        // තත්පර 5කට පසු පණිවිඩය නැවත සැඟවීම
        setTimeout(() => {
            successMsg.classList.add('hidden');
        }, 5000);

    } catch (error) {
        console.error("Error adding document: ", error);
        alert("රිකවෙස්ට් එක යැවීමේදී දෝෂයක් සිදුවුණා. කරුණාකර නැවත උත්සාහ කරන්න! අනිවාර්යයෙන්ම Firestore Database එක Test Mode එකෙන් හදලා තියෙන්න ඕනේ.");
    } finally {
        // වැඩේ ඉවර වුණාම බොත්තම නැවත සාමාන්‍ය තත්වයට පත් කිරීම
        submitBtn.innerText = originalBtnText;
    }
});
