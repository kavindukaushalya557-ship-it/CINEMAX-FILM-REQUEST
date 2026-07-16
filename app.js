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
        setTimeout(() => toast.classList.remove("show"), 4000); 
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

// 🔥 Auto Sinhala Translator API 🔥
async function translateToSinhala(text) {
    if (!text) return "මෙම චිත්‍රපටය සඳහා විස්තරයක් හමුවුණේ නැත.";
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=si&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        let translatedText = "";
        data[0].forEach(item => {
            if (item[0]) translatedText += item[0] + " ";
        });
        return translatedText.trim();
    } catch (error) {
        console.error("Translation Error:", error);
        return text; 
    }
}


/** * ==========================================
 * 3. MODAL & GLOBAL ACTIONS
 * ==========================================
 */

window.openMovieModal = async function(movieName) {
    const modal = document.getElementById("movieModal");
    if (!modal) return;

    modal.style.display = "flex";
    document.getElementById("modalTitle").innerText = movieName;
    document.getElementById("modalPlot").innerHTML = "<i class='fas fa-spinner fa-spin'></i> තොරතුරු සොයමින් පවතී...";
    document.getElementById("modalRating").innerText = "-";
    document.getElementById("modalPoster").src = PLACEHOLDER_POSTER;
    document.getElementById("modalTrailer").src = ""; 

    const searchData = await fetchTMDB(`/search/multi?query=${encodeURIComponent(movieName)}`);
    
    if (searchData?.results?.length > 0) {
        const movie = searchData.results[0];
        const mediaType = movie.media_type || "movie";
        
        // 🔥 Sinhala Translation for Plot 🔥
        const englishPlot = movie.overview || "";
        if (englishPlot) {
            document.getElementById("modalPlot").innerHTML = "<i class='fas fa-language'></i> සිංහලට පරිවර්තනය වෙමින් පවතී... ⏳";
            
            const sinhalaPlot = await translateToSinhala(englishPlot);
            
            document.getElementById("modalPlot").innerHTML = `
                <div style="background: rgba(229,9,20,0.1); padding: 15px; border-left: 4px solid #e50914; border-radius: 8px; margin-top: 10px;">
                    <strong style="color: #d4af37; font-size: 1.05rem;"><i class="fas fa-book-open"></i> කතාවේ සාරාංශය:</strong><br>
                    <span style="color: #ddd; line-height: 1.7; display: block; margin-top: 8px; font-size: 0.95rem;">${sinhalaPlot}</span>
                </div>
            `;
        } else {
            document.getElementById("modalPlot").innerHTML = `<span style="color: #bbb;">මෙම චිත්‍රපටය සඳහා විස්තරයක් හමුවුණේ නැත.</span>`;
        }

        document.getElementById("modalRating").innerText = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
        
        if (movie.poster_path) {
            document.getElementById("modalPoster").src = `${IMG_BASE_URL}/w500${movie.poster_path}`;
        }

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
    if (trailer) trailer.src = ""; 
};


/** * ==========================================
 * 4. INITIALIZATION & EVENT LISTENERS
 * ==========================================
 */

document.addEventListener("DOMContentLoaded", function() {  

    initPreloader();
    initThemeToggle();    
    initCustomCursor();   
    initTypingEffect();   
    initParticles();
    initScrollAnimations();
    initAutoSuggest();
    initFormSubmit();
    initLiveRequests();
    initFilters();
    initBackToTop();
    initModalEvents();
    initVoiceSearch();
    initRippleEffect();
    initMobileFAB();
    
    // 🔥 අලුත් Function එක මෙතන කෝල් කරනවා 🔥
    initHeroAndTrending();

    // ====================================================
    // 🔥 1. Netflix Style Hero Banner & Trending Slider 🔥
    // ====================================================
    async function initHeroAndTrending() {
        const heroBanner = document.getElementById('heroBanner');
        const trendingSlider = document.getElementById('trendingSlider');
        if (!heroBanner || !trendingSlider) return;

        // TMDB එකෙන් අද දවසේ Trending Movies ටික ගන්නවා
        const data = await fetchTMDB('/trending/movie/day?language=en-US');
        
        if (data && data.results && data.results.length > 0) {
            const movies = data.results;
            
            // Hero Banner එක හැදීම (පළවෙනි ෆිල්ම් එකෙන්)
            const heroMovie = movies[0];
            const backdropUrl = `https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`;
            const safeHeroName = (heroMovie.title || heroMovie.name).replace(/'/g, "&apos;");
            
            heroBanner.style.backgroundImage = `url('${backdropUrl}')`;
            document.getElementById('heroTitle').innerText = heroMovie.title || heroMovie.name;
            document.getElementById('heroOverview').innerText = heroMovie.overview;
            
            document.getElementById('heroInfoBtn').onclick = () => window.openMovieModal(safeHeroName);

            // Trending Slider එක හැදීම (ඉතිරි ෆිල්ම්ස් වලින්)
            trendingSlider.innerHTML = "";
            movies.slice(1, 15).forEach(movie => {
                const title = movie.title || movie.name;
                const safeTitle = title.replace(/'/g, "&apos;");
                const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : NO_IMG_POSTER;
                
                const card = document.createElement('div');
                card.className = 'slider-card';
                card.onclick = () => window.openMovieModal(safeTitle);
                card.innerHTML = `<img src="${posterUrl}" alt="${title}" loading="lazy">`;
                
                trendingSlider.appendChild(card);
            });
        }
    }

    function initVoiceSearch() {
        const micBtn = document.getElementById("micBtn");
        const movieInput = document.getElementById("movieName");

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            if (micBtn) micBtn.style.display = 'none'; 
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US'; 

        if (micBtn) {
            micBtn.addEventListener("click", () => {
                recognition.start();
                micBtn.classList.remove('fa-microphone');
                micBtn.classList.add('fa-spinner', 'fa-spin', 'recording'); 
                window.showToast("🎤 Listening... Speak now!");
            });

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if(movieInput) {
                    movieInput.value = transcript;
                    movieInput.dispatchEvent(new Event('input')); 
                }
                window.showToast(`✅ Found: ${transcript}`);
            };

            recognition.onend = () => {
                micBtn.classList.remove('fa-spinner', 'fa-spin', 'recording');
                micBtn.classList.add('fa-microphone');
            };
        }
    }

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

    function initCustomCursor() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }

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
            
            const reqDropdown = document.getElementById("requestType");
            if(reqDropdown) {
                reqDropdown.disabled = false;
                reqDropdown.style.opacity = "1";
            }
            
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
                        
                        li.addEventListener("click", async () => {
                            movieNameInput.value = title;
                            if (yearInput) yearInput.value = year !== "N/A" ? year : ""; 
                            suggestionsList.style.display = "none";

                            const reqTypeDropdown = document.getElementById("requestType");
                            
                            if (item.media_type === 'tv' && reqTypeDropdown) {
                                window.showToast("⏳ Checking episodes limit...");
                                const tvDetails = await fetchTMDB(`/tv/${item.id}?`);
                                if (tvDetails && tvDetails.number_of_episodes) {
                                    const epCount = tvDetails.number_of_episodes;
                                    if (epCount > 12) {
                                        reqTypeDropdown.value = "paid_tv"; 
                                        window.showToast(`⚠️ Episodes ${epCount} ක් තියෙනවා! (Premium Series)`);
                                    } else {
                                        reqTypeDropdown.value = "movie"; 
                                        window.showToast(`✅ Episodes ${epCount} යි! (Free Series)`);
                                    }
                                    reqTypeDropdown.disabled = true;
                                    reqTypeDropdown.style.opacity = "0.7";
                                }
                            } else if (item.media_type === 'movie' && reqTypeDropdown) {
                                reqTypeDropdown.value = "movie";
                                reqTypeDropdown.disabled = true;
                                reqTypeDropdown.style.opacity = "0.7";
                            }
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
            
            submitBtn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Checking Data...";

            try {
                const fullName = document.getElementById('fullName').value;
                const waNumber = document.getElementById('waNumber').value;
                const movieName = document.getElementById('movieName').value.trim();
                const language = document.getElementById('language').value;
                const year = document.getElementById('year').value;
                const requestType = document.getElementById('requestType') ? document.getElementById('requestType').value : 'movie';

                if (requestType === "movie") {
                    const checkSnapshot = await db.collection('requests').where('movieName', '==', movieName).get();
                    let isRecentlyCompleted = false;
                    let isPending = false;

                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); 

                    checkSnapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.status === 'completed') {
                            const docDate = data.timestamp ? data.timestamp.toDate() : new Date(0);
                            if (docDate >= sevenDaysAgo) {
                                isRecentlyCompleted = true;
                            }
                        } 
                        else if (data.status === 'pending') {
                            isPending = true;
                        }
                    });

                    if (isRecentlyCompleted) {
                        window.showToast("⚠️ ඔබ සොයන චිත්‍රපටය පසුගිය දින 7 තුළ Group එකට Upload කර ඇත. කරුණාකර නැවත ඉල්ලීමට පෙර සමූහයේ Search කරන්න.");
                        submitBtn.innerHTML = originalText;
                        return; 
                    }
                    
                    if (isPending) {
                        window.showToast("⏳ මේ ෆිල්ම් එක දැනටමත් කෙනෙක් ඉල්ලලා තියෙන්නේ. අපි ඉක්මනින් Group එකට දානවා!");
                        submitBtn.innerHTML = originalText;
                        return; 
                    }
                }

                if (requestType === "paid_tv") {
                     const waMessage = `ආයුබෝවන්, මට මේ TV Series එක Buy කරන්න ඕනේ. 📺\n\n*Name:* ${movieName}\n*Language:* ${language}\n*Year:* ${year}\n*My Name:* ${fullName || "Not Provided"}\n*WhatsApp Number:* ${waNumber}\n\n💳 *දැනුවත් වීමට:*\n• Episodes 13-30: Rs. 200\n• Episodes 31-50: Rs. 350\n• Episodes 50+: Rs. 500+`;
                    const waUrl = `https://wa.me/94760595208?text=${encodeURIComponent(waMessage)}`;
                    
                    window.open(waUrl, "_blank"); 
                    window.showToast("✅ Redirecting to WhatsApp...");
                    movieForm.reset();
                    
                    if(document.getElementById('requestType')) {
                        document.getElementById('requestType').disabled = false;
                        document.getElementById('requestType').style.opacity = "1";
                    }
                    return; 
                }

                submitBtn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Submitting...";

                await db.collection('requests').add({
                    fullName: fullName,
                    waNumber: waNumber,
                    movieName: movieName,
                    language: language,
                    year: year,
                    requestType: requestType, 
                    status: 'pending',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                showEpicSuccessAnimation(movieName);

                movieForm.reset();
                
                if(document.getElementById('requestType')) {
                    document.getElementById('requestType').disabled = false;
                    document.getElementById('requestType').style.opacity = "1";
                }

            } catch (error) {
                console.error("Firebase Error:", error);
                window.showToast("❌ Error! Please try again.");
            } finally {
                submitBtn.innerHTML = originalText;
            }
        });
    }

    function showEpicSuccessAnimation(movieName) {
        const successBox = document.createElement('div');
        successBox.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); z-index: 10000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); animation: epicFadeIn 0.3s ease;">
                <div style="background: linear-gradient(135deg, #1a1a1a, #2a2a2a); padding: 40px 30px; border-radius: 20px; border: 2px solid #25D366; box-shadow: 0 0 30px rgba(37, 211, 102, 0.4); text-align: center; transform: scale(0); animation: epicPopUp 0.6s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width: 90%; width: 350px;">
                    <i class="fas fa-check-circle" style="font-size: 5rem; color: #25D366; margin-bottom: 20px; text-shadow: 0 0 20px rgba(37,211,102,0.6);"></i>
                    <h2 style="color: #fff; margin: 0; font-size: 1.8rem; font-family: 'Poppins', sans-serif;">Success!</h2>
                    <p style="color: #d4af37; margin: 10px 0 5px 0; font-size: 1.1rem; font-weight: bold;">${movieName}</p>
                    <p style="color: #bbb; margin: 0; font-size: 0.95rem;">has been added to the queue. 🍿</p>
                </div>
            </div>
            <style>
                @keyframes epicFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes epicPopUp { to { transform: scale(1); } }
            </style>
        `;
        document.body.appendChild(successBox);

        if(typeof confetti === "function") {
            var duration = 3000;
            var animationEnd = Date.now() + duration;
            var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 };

            function randomInRange(min, max) { return Math.random() * (max - min) + min; }

            var interval = setInterval(function() {
                var timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                var particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#25D366', '#d4af37', '#ffffff'] }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#e50914', '#d4af37', '#ffffff'] }));
            }, 250);
        }

        setTimeout(() => {
            successBox.firstElementChild.style.opacity = '0';
            successBox.firstElementChild.style.transition = 'opacity 0.5s ease';
            setTimeout(() => successBox.remove(), 500);
        }, 3500);
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
            
            let visibleCount = 0; 

            cards.forEach(card => {
                const title = card.getAttribute("data-title");
                const language = card.getAttribute("data-language");
                if (!title || !language) return;

                const matchesSearch = title.includes(searchText);
                const matchesFilter = activeFilter === "all" || language === activeFilter;

                if (matchesSearch && matchesFilter) {
                    card.style.display = "flex";
                    visibleCount++;
                } else {
                    card.style.display = "none";
                }
            });

            const list = document.getElementById('moviesList');
            let noResultsMsg = document.getElementById("noResultsMsg");
            
            if (visibleCount === 0) {
                if (!noResultsMsg && list) {
                    noResultsMsg = document.createElement("p");
                    noResultsMsg.id = "noResultsMsg";
                    noResultsMsg.style.cssText = "color: var(--text-color); font-weight: bold; text-align: center; grid-column: 1/-1; margin-top: 20px;";
                    noResultsMsg.innerHTML = "❌ No matching requests found! 🍿";
                    list.appendChild(noResultsMsg);
                }
            } else if (noResultsMsg) {
                noResultsMsg.remove();
            }
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

    function initRippleEffect() {
        document.querySelectorAll('.ripple-element').forEach(btn => {
            btn.addEventListener('click', function(e) {
                let ripple = document.createElement('span');
                ripple.classList.add('ripple-span');
                let rect = this.getBoundingClientRect();
                let x = e.clientX - rect.left;
                let y = e.clientY - rect.top;
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                let size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.marginTop = ripple.style.marginLeft = -(size / 2) + 'px';
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    function initMobileFAB() {
        window.addEventListener('scroll', () => {
            const fab = document.getElementById('mobileFab');
            const form = document.getElementById('requestForm');
            if(!fab || !form) return;
            
            const formRect = form.getBoundingClientRect();
            
            if(window.innerWidth <= 768) {
                if (formRect.top < window.innerHeight && formRect.bottom > 0) {
                    fab.style.display = 'none'; 
                } else {
                    fab.style.display = 'flex'; 
                }
            } else {
                fab.style.display = 'none'; 
            }
        });
    }

});
