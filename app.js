/** * ==========================================
 * 1. CONFIGURATION & SETUP
 * ==========================================
 */

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBA--GH1poSmBUu_N2XD5G_3gMurRH-Ga0",
    authDomain: "cinemaxhd-2a9c2.firebaseapp.com",
    projectId: "cinemaxhd-2a9c2",
    storageBucket: "cinemaxhd-2a9c2.firebasestorage.app",
    messagingSenderId: "694565000715",
    appId: "1:694565000715:web:3a3e4b9fd8984a9a53190e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// API & Constants
const TMDB_API_KEY = "28eab73ece076175064fa2fc6ef60726";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE_URL = "https://image.tmdb.org/t/p";
const PLACEHOLDER_POSTER = "https://placehold.co/500x750/111111/d4af37?text=Loading...";
const NO_IMG_POSTER = "https://placehold.co/40x60/111111/d4af37?text=No+Img";


/** * ==========================================
 * 2. UTILITY & HELPER FUNCTIONS
 * ==========================================
 */

// Global Toast Message
window.showToast = function(message) {
    const toast = document.getElementById("toast");
    if (toast) {
        toast.innerText = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3500);
    }
};

// TMDB API Fetch Helper
async function fetchTMDB(endpoint) {
    try {
        const res = await fetch(`${TMDB_BASE_URL}${endpoint}&api_key=${TMDB_API_KEY}`);
        if (!res.ok) throw new Error("Network response was not ok");
        return await res.json();
    } catch (error) {
        console.error("TMDB Fetch Error:", error);
        return null;
    }
}

// Fetch Poster Helper
async function fetchPoster(movieName) {
    const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(movieName)}`);
    if (data?.results?.length > 0 && data.results[0].poster_path) {
        return `${IMG_BASE_URL}/w500${data.results[0].poster_path}`;
    }
    return PLACEHOLDER_POSTER.replace("Loading...", "No+Poster");
}


/** * ==========================================
 * 3. MODAL & GLOBAL ACTIONS
 * ==========================================
 */

window.openMovieModal = async function(movieName) {
    const modal = document.getElementById("movieModal");
    if (!modal) return;

    // Set Loading State
    modal.style.display = "flex";
    document.getElementById("modalTitle").innerText = movieName;
    document.getElementById("modalPlot").innerText = "Searching for movie details...";
    document.getElementById("modalRating").innerText = "-";
    document.getElementById("modalPoster").src = PLACEHOLDER_POSTER;
    document.getElementById("modalTrailer").src = ""; 

    // Fetch Details
    const searchData = await fetchTMDB(`/search/multi?query=${encodeURIComponent(movieName)}`);
    
    if (searchData?.results?.length > 0) {
        const movie = searchData.results[0];
        const mediaType = movie.media_type || "movie";
        
        document.getElementById("modalPlot").innerText = movie.overview || "No synopsis available for this title.";
        document.getElementById("modalRating").innerText = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
        
        if (movie.poster_path) {
            document.getElementById("modalPoster").src = `${IMG_BASE_URL}/w500${movie.poster_path}`;
        }

        // Fetch Trailer
        const videoData = await fetchTMDB(`/${mediaType}/${movie.id}/videos?`);
        if (videoData?.results?.length > 0) {
            const trailer = videoData.results.find(v => v.type === "Trailer" && v.site === "YouTube") 
                         || videoData.results.find(v => v.site === "YouTube");
            if (trailer) {
                document.getElementById("modalTrailer").src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
            }
        }
    } else {
        document.getElementById("modalPlot").innerText = "No details found for this title.";
    }
};

window.closeModal = function() {
    const modal = document.getElementById("movieModal");
    const trailer = document.getElementById("modalTrailer");
    if (modal) modal.style.display = "none";
    if (trailer) trailer.src = ""; // Stop video playback
};


/** * ==========================================
 * 4. INITIALIZATION & EVENT LISTENERS
 * ==========================================
 */

document.addEventListener("DOMContentLoaded", function() {  

    initPreloader();
    initThemeToggle();    // 🔥 අලුත් Theme Toggle එක
    initCustomCursor();   // 🔥 අලුත් Glowing Cursor එක
    initTypingEffect();   // 🔥 අලුත් Auto Typing එක
    initParticles();
    initScrollAnimations();
    initAutoSuggest();
    initFormSubmit();
    initLiveRequests();
    initFilters();
    initBackToTop();
    initModalEvents();

    // --- Sub-functions for cleaner initialization ---

    // 🔥 1. Theme Toggle Logic 🔥
    function initThemeToggle() {
        const themeToggle = document.getElementById("themeToggle");
        if (!themeToggle) return;
        
        if (localStorage.getItem("theme") === "light") {
            document.body.classList.add("light-mode");
            themeToggle.innerText = "🌙";
        }
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");
            if (document.body.classList.contains("light-mode")) {
                localStorage.setItem("theme", "light");
                themeToggle.innerText = "🌙";
            } else {
                localStorage.setItem("theme", "dark");
                themeToggle.innerText = "☀️";
            }
        });
    }

    // 🔥 2. Custom Cursor Logic 🔥
    function initCustomCursor() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }

    // 🔥 3. Auto Typing Logic 🔥
    function initTypingEffect() {
        const textToType = "Request Your Favorite Movies & TV Series";
        const typingElement = document.getElementById("typing-text");
        if (!typingElement) return;
        
        let typeIndex = 0;
        function typeEffect() {
            if (typeIndex < textToType.length) {
                typingElement.innerHTML = textToType.substring(0, typeIndex + 1) + '<span class="typing-cursor"></span>';
                typeIndex++;
                setTimeout(typeEffect, 100);
            } else {
                typingElement.innerHTML = textToType + '<span class="typing-cursor"></span>';
            }
        }
        setTimeout(typeEffect, 1500);
    }

    function initPreloader() {
        window.addEventListener('load', () => {
            const preloader = document.getElementById('preloader');
            if (preloader) setTimeout(() => preloader.classList.add('hide-loader'), 1500);
        });
    }

    function initParticles() {
        const container = document.getElementById('particles-container');
        if (!container) return;
        const colors = ['#e50914', '#d4af37']; 
        
        for (let i = 0; i < 40; i++) {
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

    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            const statsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        document.querySelectorAll('.counter').forEach(counter => {
                            const updateCount = () => {
                                const target = +counter.getAttribute('data-target');
                                const count = +counter.innerText;
                                const inc = target / 100;
                                if (count < target) {
                                    counter.innerText = Math.ceil(count + inc);
                                    setTimeout(updateCount, 20);
                                } else {
                                    counter.innerText = target;
                                }
                            };
                            updateCount();
                        });
                        statsObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            statsObserver.observe(statsSection);
        }
    }

    function initAutoSuggest() {
        const movieNameInput = document.getElementById("movieName");
        const suggestionsList = document.getElementById("suggestionsList");
        const yearInput = document.getElementById("year");
        let debounceTimer;

        if (!movieNameInput || !suggestionsList) return;

        movieNameInput.addEventListener("input", function() {
            clearTimeout(debounceTimer);
            const query = this.value.trim();
            
            if (query.length < 2) {
                suggestionsList.style.display = "none";
                return;
            }

            debounceTimer = setTimeout(async () => {
                const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(query)}`);
                suggestionsList.innerHTML = "";
                
                if (data?.results?.length > 0) {
                    suggestionsList.style.display = "block";
                    
                    data.results.slice(0, 5).forEach(item => {
                        if (item.media_type !== 'movie' && item.media_type !== 'tv') return;
                        
                        const title = item.title || item.name;
                        const releaseDate = item.release_date || item.first_air_date || "";
                        const year = releaseDate.split("-")[0] || "N/A";
                        const posterUrl = item.poster_path ? `${IMG_BASE_URL}/w92${item.poster_path}` : NO_IMG_POSTER;

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
                            if (yearInput) yearInput.value = year !== "N/A" ? year : ""; 
                            suggestionsList.style.display = "none";
                        });
                        
                        suggestionsList.appendChild(li);
                    });
                } else {
                    suggestionsList.style.display = "none";
                }
            }, 500); 
        });

        document.addEventListener("click", (e) => {
            if (!movieNameInput.contains(e.target) && !suggestionsList.contains(e.target)) {
                suggestionsList.style.display = "none";
            }
        });
    }

    function initFormSubmit() {
        const movieForm = document.getElementById('movieForm');
        if (!movieForm) return;

        movieForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = document.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Submitting...";

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
                
                window.showToast("✅ Request Submitted Successfully!");
                movieForm.reset();

                // 🔥 4. Celebration Confetti Animation! 🔥
                if(typeof confetti === "function") {
                    confetti({
                        particleCount: 150,
                        spread: 80,
                        origin: { y: 0.6 },
                        colors: ['#e50914', '#d4af37', '#ffffff']
                    });
                }

            } catch (error) {
                console.error("Firebase Error:", error);
                window.showToast("❌ Error! Please try again.");
            } finally {
                submitBtn.innerHTML = originalText;
            }
        });
    }

    function initLiveRequests() {
        const list = document.getElementById('moviesList');
        if (!list) return;

        db.collection('requests').orderBy('timestamp', 'desc').limit(09).onSnapshot(async (snapshot) => {
            if (snapshot.empty) {
                list.innerHTML = "<p style='color: #bbb; text-align:center; grid-column: 1/-1;'>No requests yet.</p>";
                return;
            }

            const moviePromises = snapshot.docs.map(async (doc) => {
                const data = doc.data();
                const movieYear = data.year || "N/A";
                const isCompleted = data.status === 'completed';
                const statusClass = isCompleted ? 'completed' : 'pending';
                const statusText = isCompleted ? 'Completed ✅' : 'Pending ⏳';
                const posterUrl = await fetchPoster(data.movieName);
                const safeMovieName = data.movieName.replace(/'/g, "&apos;");

                return `
                    <div class="movie-card tilt-card" data-title="${data.movieName.toLowerCase()}" data-language="${data.language}" onclick="window.openMovieModal('${safeMovieName}')" style="cursor: pointer;">
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
            
            if (typeof VanillaTilt !== "undefined") {
                VanillaTilt.init(document.querySelectorAll(".tilt-card"), { max: 15, speed: 400, glare: true, "max-glare": 0.4 });
            }
            
            const filterEvt = new Event("input");
            const searchInput = document.getElementById("searchInput");
            if (searchInput) searchInput.dispatchEvent(filterEvt);
        });
    }

    function initFilters() {
        const searchInput = document.getElementById("searchInput");
        const filterBtns = document.querySelectorAll(".filter-btn");

        const applyFilters = () => {
            if (!searchInput) return;
            const searchText = searchInput.value.toLowerCase();
            const activeBtn = document.querySelector(".filter-btn.active");
            const activeFilter = activeBtn ? activeBtn.getAttribute("data-filter") : "all";
            const cards = document.querySelectorAll(".movie-card");

            cards.forEach(card => {
                const title = card.getAttribute("data-title");
                const language = card.getAttribute("data-language");
                if (!title || !language) return;

                const matchesSearch = title.includes(searchText);
                const matchesFilter = activeFilter === "all" || language === activeFilter;

                card.style.display = (matchesSearch && matchesFilter) ? "flex" : "none";
            });
        };

        if (searchInput) searchInput.addEventListener("input", applyFilters);

        filterBtns.forEach(btn => {
            btn.addEventListener("click", function() {
                filterBtns.forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                applyFilters();
            });
        });
    }

    function initBackToTop() {
        const topBtn = document.getElementById("backToTop");
        if (!topBtn) return;

        window.addEventListener('scroll', () => {
            topBtn.style.display = (window.scrollY > 300) ? "block" : "none";
        });
        
        topBtn.addEventListener('click', () => { 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        });
    }

    function initModalEvents() {
        const modal = document.getElementById("movieModal");
        const closeBtn = document.querySelector(".close-btn");

        if (closeBtn) closeBtn.addEventListener("click", window.closeModal);
        window.addEventListener("click", (e) => { 
            if (e.target === modal) window.closeModal(); 
        });
    }

});
