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
        setTimeout(() => toast.classList.remove("show"), 4000); // වෙලාව ටිකක් වැඩි කළා මැසේජ් එක කියවන්න
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

    modal.style.display = "flex";
    document.getElementById("modalTitle").innerText = movieName;
    document.getElementById("modalPlot").innerText = "Searching for movie details...";
    document.getElementById("modalRating").innerText = "-";
    document.getElementById("modalPoster").src = PLACEHOLDER_POSTER;
    document.getElementById("modalTrailer").src = ""; 

    const searchData = await fetchTMDB(`/search/multi?query=${encodeURIComponent(movieName)}`);
    
    if (searchData?.results?.length > 0) {
        const movie = searchData.results[0];
        const mediaType = movie.media_type || "movie";
        
        document.getElementById("modalPlot").innerText = movie.overview || "No synopsis available for this title.";
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
    initTicketDownload();
    initRippleEffect();
    initMobileFAB();

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

    function initTicketDownload() {
        const downloadBtn = document.getElementById('downloadTicketBtn');
        const closeTicketBtn = document.querySelector('.close-ticket-btn');
        const ticketModal = document.getElementById('ticketModal');

        if(closeTicketBtn && ticketModal) {
            closeTicketBtn.addEventListener('click', () => ticketModal.style.display = 'none');
        }

        if(downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const ticketBox = document.getElementById('ticketBox');
                html2canvas(ticketBox, {backgroundColor: '#111'}).then(canvas => {
                    const link = document.createElement('a');
                    link.download = 'CINEMAX_Ticket.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    window.showToast("🎫 Ticket Downloaded!");
                });
            });
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

    // 🔥 Modified Form Submit with Duplicate & Spam Check 🔥
    function initFormSubmit() {
        const movieForm = document.getElementById('movieForm');
        if (!movieForm) return;

        movieForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = document.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            
            // Checking Message
            submitBtn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Checking Data...";

            try {
                const fullName = document.getElementById('fullName').value;
                const waNumber = document.getElementById('waNumber').value;
                const movieName = document.getElementById('movieName').value.trim(); // Trim extra spaces
                const language = document.getElementById('language').value;
                const year = document.getElementById('year').value;
                const requestType = document.getElementById('requestType') ? document.getElementById('requestType').value : 'movie';

                // 🔥 1. Duplicate & Spam Check Logic (දවස් 7ක් ඇතුළත දාලද බලනවා) 🔥
                if (requestType === "movie") {
                    const checkSnapshot = await db.collection('requests').where('movieName', '==', movieName).get();
                    let isRecentlyCompleted = false;
                    let isPending = false;

                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // අදින් දවස් 7කට කලින් දවස හදනවා

                    checkSnapshot.forEach(doc => {
                        const data = doc.data();
                        
                        // Status එක Completed නම්, දවස් 7ක් ඇතුළතද බලනවා
                        if (data.status === 'completed') {
                            const docDate = data.timestamp ? data.timestamp.toDate() : new Date(0);
                            if (docDate >= sevenDaysAgo) {
                                isRecentlyCompleted = true;
                            }
                        } 
                        // Status එක Pending නම්, කෙනෙක් දැනටමත් ඉල්ලලා තියෙන්නේ
                        else if (data.status === 'pending') {
                            isPending = true;
                        }
                    });

                    if (isRecentlyCompleted) {
                        window.showToast("⚠️ ඔබ සොයන චිත්‍රපටය පසුගිය දින 7 තුළ Group එකට Upload කර ඇත. කරුණාකර නැවත ඉල්ලීමට පෙර සමූහයේ Search කරන්න.");
                        submitBtn.innerHTML = originalText;
                        return; // මෙතනින් නවත්තනවා (Database එකට යන්නෙ නෑ)
                    }
                    
                    if (isPending) {
                        window.showToast("⏳ මේ ෆිල්ම් එක දැනටමත් කෙනෙක් ඉල්ලලා තියෙන්නේ. අපි ඉක්මනින් Group එකට දානවා!");
                        submitBtn.innerHTML = originalText;
                        return; // මෙතනින් නවත්තනවා
                    }
                }

                // 2. Paid TV Series Logic
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

                // Submitting Text
                submitBtn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Submitting...";

                // 3. Save to Firebase 
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
                
                window.showToast("✅ Request Submitted Successfully!");
                
                // Show Ticket Modal
                const tMovie = document.getElementById('t-movie');
                const tName = document.getElementById('t-name');
                const tDate = document.getElementById('t-date');
                const ticketModal = document.getElementById('ticketModal');

                if(tMovie) tMovie.innerText = movieName;
                if(tName) tName.innerText = fullName || "Awesome User";
                if(tDate) tDate.innerText = new Date().toLocaleDateString();
                if(ticketModal) ticketModal.style.display = 'flex';

                movieForm.reset();
                
                if(document.getElementById('requestType')) {
                    document.getElementById('requestType').disabled = false;
                    document.getElementById('requestType').style.opacity = "1";
                }

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
