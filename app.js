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

// 🟢 TMDB API Logic 🟢
const TMDB_API_KEY = "28eab73ece076175064fa2fc6ef60726"; 

// 🟢 Live Auto-Suggest Logic (TMDB API) 🟢
const movieNameInput = document.getElementById("movieName");
const suggestionsList = document.getElementById("suggestionsList");
const yearInput = document.getElementById("year");
let debounceTimer;

movieNameInput.addEventListener("input", function() {
    clearTimeout(debounceTimer);
    const query = this.value.trim();
    
    if (query.length < 2) {
        suggestionsList.style.display = "none";
        return;
    }

    debounceTimer = setTimeout(async () => {
        try {
            const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
            const data = await res.json();
            
            suggestionsList.innerHTML = "";
            if (data.results && data.results.length > 0) {
                suggestionsList.style.display = "block";
                
                data.results.slice(0, 5).forEach(item => {
                    if(item.media_type !== 'movie' && item.media_type !== 'tv') return;
                    
                    const title = item.title || item.name;
                    const releaseDate = item.release_date || item.first_air_date || "";
                    const year = releaseDate.split("-")[0] || "N/A";
                    const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : "https://placehold.co/40x60/111111/d4af37?text=No+Img";

                    const li = document.createElement("li");
                    li.innerHTML = `
                        <img src="${posterUrl}" alt="poster">
                        <div class="sugg-info">
                            <span class="sugg-title">${title}</span>
                            <span class="sugg-year">${year} • ${item.media_type === 'movie' ? 'Movie' : 'TV Series'}</span>
                        </div>
                    `;
                    
                    li.addEventListener("click", () => {
                        movieNameInput.value = title;
                        yearInput.value = year !== "N/A" ? year : ""; 
                        suggestionsList.style.display = "none";
                    });
                    
                    suggestionsList.appendChild(li);
                });
                
                if(suggestionsList.innerHTML === "") { suggestionsList.style.display = "none"; }
            } else {
                suggestionsList.style.display = "none";
            }
        } catch (err) {
            console.error("Auto-suggest Error:", err);
        }
    }, 500); 
});

document.addEventListener("click", (e) => {
    if (!movieNameInput.contains(e.target) && !suggestionsList.contains(e.target)) {
        suggestionsList.style.display = "none";
    }
});

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

async function fetchPoster(movieName) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}`);
        const data = await res.json();
        if (data.results && data.results.length > 0 && data.results[0].poster_path) {
            return `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`;
        }
    } catch (error) {
        console.error("TMDB Error:", error);
    }
    return "https://placehold.co/500x750/111111/d4af37?text=No+Poster"; 
}

// 🟢 Load Live Requests 🟢
function loadLiveRequests() {
    const list = document.getElementById('moviesList');
    
    db.collection('requests').orderBy('timestamp', 'desc').limit(12).onSnapshot(async (snapshot) => {
        list.innerHTML = ""; 
        if (snapshot.empty) {
            list.innerHTML = "<p style='color: #bbb; text-align:center; grid-column: 1/-1;'>No requests yet.</p>";
            return;
        }

        const moviePromises = snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const movieYear = data.year ? data.year : "N/A";
            const statusClass = data.status === 'completed' ? 'completed' : 'pending';
            const statusText = data.status === 'completed' ? 'Completed ✅' : 'Pending ⏳';
            const posterUrl = await fetchPoster(data.movieName);
            const safeMovieName = data.movieName.replace(/'/g, "&apos;");

            return `
                <div class="movie-card tilt-card" data-title="${data.movieName.toLowerCase()}" data-language="${data.language}" onclick="openMovieModal('${safeMovieName}')" style="cursor: pointer;">
                    <img src="${posterUrl}" alt="${data.movieName}" class="poster-bg">
                    <div class="movie-info">
                        <h3>${data.movieName}</h3>
                        <p>${movieYear} • ${data.language}</p>
                        <span class="status ${statusClass}">${statusText}</span>
                    </div>
                </div>
            `;
        });

        const movieCards = await Promise.all(moviePromises);
        list.innerHTML = movieCards.join("");
        VanillaTilt.init(document.querySelectorAll(".tilt-card"), { max: 15, speed: 400, glare: true, "max-glare": 0.4 });
        filterMovies();
    });
}
loadLiveRequests();

// 🟢 Live Search & Filter Logic 🟢
const searchInput = document.getElementById("searchInput");
if(searchInput) { searchInput.addEventListener("input", filterMovies); }

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", function() {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        filterMovies();
    });
});

function filterMovies() {
    const input = document.getElementById("searchInput");
    if(!input) return;
    const searchText = input.value.toLowerCase();
    const activeBtn = document.querySelector(".filter-btn.active");
    const activeFilter = activeBtn ? activeBtn.getAttribute("data-filter") : "all";
    const cards = document.querySelectorAll(".movie-card");

    cards.forEach(card => {
        const title = card.getAttribute("data-title");
        const language = card.getAttribute("data-language");
        const matchesSearch = title.includes(searchText);
        const matchesFilter = activeFilter === "all" || language === activeFilter;

        card.style.display = (matchesSearch && matchesFilter) ? "flex" : "none";
    });
}

// 🟢 Back to Top Button Logic 🟢
const topBtn = document.getElementById("backToTop");
window.addEventListener('scroll', () => {
    topBtn.style.display = (window.scrollY > 300) ? "block" : "none";
});
topBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

// 🟢 Animated Counters Logic 🟢
const counters = document.querySelectorAll('.counter');
const animateCounters = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / 100;
            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 20);
            } else { counter.innerText = target; }
        };
        updateCount();
    });
};
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });
const statsSection = document.querySelector('.stats-section');
if (statsSection) { statsObserver.observe(statsSection); }

// 🟢 Movie Modal & Trailer Logic 🟢
const modal = document.getElementById("movieModal");
const closeBtn = document.querySelector(".close-btn");

if(closeBtn) {
    closeBtn.addEventListener("click", closeModal);
}
window.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

function closeModal() {
    modal.style.display = "none";
    document.getElementById("modalTrailer").src = ""; 
}

async function openMovieModal(movieName) {
    modal.style.display = "flex";
    document.getElementById("modalTitle").innerText = movieName;
    document.getElementById("modalPlot").innerText = "Searching for movie details...";
    document.getElementById("modalRating").innerText = "-";
    document.getElementById("modalPoster").src = "https://placehold.co/500x750/111111/d4af37?text=Loading...";
    document.getElementById("modalTrailer").src = ""; 

    try {
        const searchRes = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieName)}`);
        const searchData = await searchRes.json();
        
        if (searchData.results && searchData.results.length > 0) {
            const movie = searchData.results[0];
            const mediaType = movie.media_type || "movie";
            const movieId = movie.id;
            
            document.getElementById("modalPlot").innerText = movie.overview || "No synopsis available for this title.";
            document.getElementById("modalRating").innerText = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
            if (movie.poster_path) {
                document.getElementById("modalPoster").src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
            }

            const videoRes = await fetch(`https://api.themoviedb.org/3/${mediaType}/${movieId}/videos?api_key=${TMDB_API_KEY}`);
            const videoData = await videoRes.json();
            
            if (videoData.results && videoData.results.length > 0) {
                const trailer = videoData.results.find(v => v.type === "Trailer" && v.site === "YouTube") || videoData.results.find(v => v.site === "YouTube");
                if (trailer) {
                    document.getElementById("modalTrailer").src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
                }
            }
        } else {
            document.getElementById("modalPlot").innerText = "No details found for this title.";
        }
    } catch (error) {
        console.error("TMDB Details Error:", error);
        document.getElementById("modalPlot").innerText = "Failed to load movie details.";
    }
}

// 🟢 AI Movie Recommender Logic (Google Gemini + TMDB) 🟢
const GEMINI_API_KEY = "AQ.Ab8RN6L4-OteHU-DWZstLGOFQ2Nc1cUpWv5jOHtbdxaQTI5r7w"; // ඔයාගේ Key එක මෙතන දාලා තියෙන්නේ

const aiBtn = document.getElementById("aiBtn");
const aiPrompt = document.getElementById("aiPrompt");
const aiResults = document.getElementById("aiResults");
const aiStatus = document.getElementById("aiStatus");

if (aiBtn) {
    aiBtn.addEventListener("click", async () => {
        const prompt = aiPrompt.value.trim();
        if (!prompt) {
            showToast("⚠️ Please enter a movie description!");
            return;
        }

        aiBtn.innerText = "AI is thinking... 🧠";
        aiBtn.style.opacity = "0.7";
        aiResults.style.display = "grid";
        aiResults.innerHTML = `<p style="text-align: center; color: #fff; grid-column: 1/-1;">Analyzing your request...</p>`;

       try {
    const aiInstruction = `You are a movie expert. Recommend exactly 4 movies based on this description: "${prompt}". Return ONLY a valid JSON array of strings containing the English movie names. No other text, no markdown. Example: ["Inception", "Interstellar", "Gravity", "The Martian"]`;
    
    // --- මෙතනින් පල්ලෙහාට තියෙන පරණ fetch කෑල්ල මකලා, අලුත් එක දාන්න ---
    
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const geminiRes = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: aiInstruction }] }]
        })
    });

    const geminiData = await geminiRes.json();
    
    // මේ Check එක අනිවාර්යයෙන්ම දාන්න (TypeError එක නවත්තන්න)
    if (!geminiData.candidates || !geminiData.candidates[0].content) {
        console.error("AI Response Error:", geminiData);
        aiResults.innerHTML = `<p style="text-align: center; color: red; grid-column: 1/-1;">❌ API Error: Invalid response. Check your API Key.</p>`;
        return;
    }
    
    // --- මෙතනින් පස්සේ ඔයාගේ පරණ කෝඩ් එකේ තියෙන ඉතුරු ටික (aiText = ... පේළියට පස්සේ එන ටික) ඒ විදිහටම තියෙන්න දෙන්න ---

            let aiText = geminiData.candidates[0].content.parts[0].text;
            aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
            const movieNames = JSON.parse(aiText);

            aiResults.innerHTML = ""; 

            for (const name of movieNames) {
                const poster = await fetchPoster(name);
                const safeName = name.replace(/'/g, "&apos;");

                aiResults.innerHTML += `
                    <div class="movie-card tilt-card" onclick="document.getElementById('movieName').value='${safeName}'; window.location.hash='#requestForm'; showToast('Scroll down to submit! 👇');" style="cursor: pointer; border: 1px solid var(--accent-gold);">
                        <img src="${poster}" class="poster-bg">
                        <div class="movie-info" style="background: rgba(212, 175, 55, 0.9); padding: 15px;">
                            <h3 style="color: #000; text-shadow: none;">${name}</h3>
                            <p style="color: #222; font-weight: bold;">🎯 Click to Request</p>
                        </div>
                    </div>
                `;
            }

            VanillaTilt.init(document.querySelectorAll("#aiResults .tilt-card"), { max: 15, speed: 400, glare: true, "max-glare": 0.4 });

        } catch (error) {
            console.error("AI Error:", error);
            aiResults.innerHTML = `<p style="text-align: center; color: red; grid-column: 1/-1;">❌ AI is resting right now. Try again later!</p>`;
        } finally {
            aiBtn.innerText = "Ask AI ✨";
            aiBtn.style.opacity = "1";
        }
    });
}
