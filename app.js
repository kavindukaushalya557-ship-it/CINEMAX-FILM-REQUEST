// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBA--GH1poSmBUu_N2XD5G_3gMurRH-Ga0",
    authDomain: "cinemaxhd-2a9c2.firebaseapp.com",
    projectId: "cinemaxhd-2a9c2",
    storageBucket: "cinemaxhd-2a9c2.firebasestorage.app",
    messagingSenderId: "694565000715",
    appId: "1:694565000715:web:3a3e4b9fd8984a9a53190e"
};
  
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
  
// Preloader Remove
window.addEventListener('load', function() {
    setTimeout(() => { document.getElementById('preloader').classList.add('hide-loader'); }, 1500);
});

// Particles
function createParticles() {
    const container = document.getElementById('particles-container');
    const colors = ['#e50914', '#d4af37']; 
    for(let i = 0; i < 40; i++) {
        let particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.animationDuration = (Math.random() * 4 + 3) + 's';
        particle.style.animationDelay = (Math.random() * 2) + 's';
        container.appendChild(particle);
    }
}
createParticles();

// Scroll Fade-Up Animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach((element) => observer.observe(element));

// Toast Notification
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => { toast.classList.remove("show"); }, 3500); 
}

// Form Submit
document.getElementById('movieForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Submitting...";

    try {
        await db.collection('requests').add({
            fullName: document.getElementById('fullName').value,
            waNumber: document.getElementById('waNumber').value,
            movieName: document.getElementById('movieName').value,
            language: document.getElementById('language').value,
            year: document.getElementById('year').value,
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast("✅ Request Submitted Successfully!");
        document.getElementById('movieForm').reset();
    } catch (error) {
        showToast("❌ Error! Please try again.");
    } finally {
        submitBtn.innerText = originalText;
    }
});

// 🟢 Fetch Live Requests, Dynamic Status, 3D Tilt & TMDB POSTERS 🟢
const TMDB_API_KEY = "ENTER_YOUR_API_KEY_HERE"; // <--- ඔයාගේ API Key එක මෙතන දාන්න

async function fetchPoster(movieName) {
    if (TMDB_API_KEY === "ENTER_YOUR_API_KEY_HERE") {
        return "https://via.placeholder.com/500x750/111111/d4af37?text=No+API+Key";
    }
    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}`);
        const data = await res.json();
        if (data.results && data.results.length > 0 && data.results[0].poster_path) {
            return `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`;
        }
    } catch (error) {
        console.error("TMDB Error:", error);
    }
    return "https://via.placeholder.com/500x750/111111/d4af37?text=No+Poster"; 
}

function loadLiveRequests() {
    const list = document.getElementById('moviesList');
    
    db.collection('requests').orderBy('timestamp', 'desc').limit(4).onSnapshot(async (snapshot) => {
        list.innerHTML = ""; 
        if (snapshot.empty) {
            list.innerHTML = "<p style='color: #bbb; text-align:center; grid-column: 1/-1;'>No requests yet.</p>";
            return;
        }

        const moviePromises = snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const movieYear = data.year ? data.year : "N/A";
            
            // Status Logic
            const statusClass = data.status === 'completed' ? 'completed' : 'pending';
            const statusText = data.status === 'completed' ? 'Completed ✅' : 'Pending ⏳';
            
            // TMDB එකෙන් පෝස්ටර් එක ගන්නවා
            const posterUrl = await fetchPoster(data.movieName);

            return `
                <div class="movie-card tilt-card">
                    <img src="${posterUrl}" alt="${data.movieName}" class="poster-bg">
                    <div class="movie-info">
                        <h3>${data.movieName}</h3>
                        <p>${movieYear} • ${data.language}</p>
                        <span class="status ${statusClass}">${statusText}</span>
                    </div>
                </div>
            `;
        });

        // කාඩ් ඔක්කොම ලෝඩ් වෙනකම් ඉඳලා පෙන්නන්න (Promis.all)
        const movieCards = await Promise.all(moviePromises);
        list.innerHTML = movieCards.join("");

        // Initialize 3D Tilt for dynamically loaded cards
        VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.4
        });
    });
}
loadLiveRequests();

// 🟢 Back to Top Button Logic 🟢
const topBtn = document.getElementById("backToTop");
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) { topBtn.style.display = "block"; }
    else { topBtn.style.display = "none"; }
});
topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
