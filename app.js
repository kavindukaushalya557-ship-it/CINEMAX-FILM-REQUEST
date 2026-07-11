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
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // 2. Preloader Remove Function
  window.addEventListener('load', function() {
      setTimeout(function() {
          document.getElementById('preloader').classList.add('hide-loader');
      }, 1500);
  });
  
  // 3. 🟢 Generate Background Particles 🟢
  function createParticles() {
      const container = document.getElementById('particles-container');
      const colors = ['#e50914', '#d4af37']; // Red and Gold
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
  
  // 4. 🟢 Scroll Fade-Up Animation 🟢
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if(entry.isIntersecting) {
              entry.target.classList.add('visible');
          }
      });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.fade-up').forEach((element) => {
      observer.observe(element);
  });
  
  // 5. 🟢 Show Toast Notification 🟢
  function showToast(message) {
      const toast = document.getElementById("toast");
      toast.innerText = message;
      toast.classList.add("show");
      setTimeout(function() {
          toast.classList.remove("show");
      }, 3500); // Hide after 3.5 seconds
  }
  
  // 6. Form Submit Event (Updated to use Toast)
  document.getElementById('movieForm').addEventListener('submit', async function(e) {
      e.preventDefault();
  
      const fullName = document.getElementById('fullName').value;
      const waNumber = document.getElementById('waNumber').value;
      const movieName = document.getElementById('movieName').value;
      const language = document.getElementById('language').value;
      const year = document.getElementById('year').value;
  
      const submitBtn = document.querySelector('.btn-submit');
      const originalText = submitBtn.innerText;
      submitBtn.innerText = "Submitting...";
  
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
  
          showToast("✅ Request Submitted Successfully!");
          document.getElementById('movieForm').reset();
  
      } catch (error) {
          console.error("Error: ", error);
          showToast("❌ Error! Please try again.");
      } finally {
          submitBtn.innerText = originalText;
      }
  });
  
  // 7. 🟢 Fetch Live Latest Requests from Firebase 🟢
  function loadLiveRequests() {
      const list = document.getElementById('moviesList');
      
      // Get the 3 most recent requests
      db.collection('requests').orderBy('timestamp', 'desc').limit(3).onSnapshot((snapshot) => {
          list.innerHTML = ""; // Clear loader
          
          if (snapshot.empty) {
              list.innerHTML = "<p style='color: #bbb; text-align:center; grid-column: 1/-1;'>No requests yet. Be the first to request!</p>";
              return;
          }
  
          snapshot.forEach((doc) => {
              const data = doc.data();
              const movieYear = data.year ? data.year : "N/A";
              
              const card = `
                  <div class="movie-card glass-panel">
                      <h3>${data.movieName}</h3>
                      <p>${movieYear} • ${data.language}</p>
                      <span class="status pending">Pending</span>
                  </div>
              `;
              list.innerHTML += card;
          });
      });
  }
  
  // Start fetching live data
  loadLiveRequests();
