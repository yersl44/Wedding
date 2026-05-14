
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLPdBGTyTDQmCOFdj236Ddei0t7hWhPHlHMeC4LpetTO2TjI6WBuPkOYq9KG2Lr8kH/exec';

document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = { threshold: 0.05 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .gallery-item, .fade-in, .text-reveal').forEach(el => observer.observe(el));

    // Countdown Timer Logic
    const weddingDate = new Date('July 26, 2026 17:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = days < 10 ? '0' + days : days;
        document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
        document.getElementById('minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById('seconds').innerText = seconds < 10 ? '0' + seconds : seconds;

        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById('countdown').innerHTML = "<h3>Той басталды!</h3>";
        }
    }

    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();

    // Calendar Generation
    const calendarEl = document.getElementById('calendar');
    const daysInMonth = 31; // July has 31 days
    const startDay = 2; // July 1, 2026 is Wednesday (Mon:0, Tue:1, Wed:2...)
    const weddingDay = 26;

    const dayNames = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн', 'Жс'];
    dayNames.forEach(day => {
        const dayHead = document.createElement('div');
        dayHead.className = 'calendar-day-head';
        dayHead.innerText = day;
        calendarEl.appendChild(dayHead);
    });

    for (let i = 0; i < startDay; i++) {
        const empty = document.createElement('div');
        calendarEl.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        if (d === weddingDay) dayEl.classList.add('wedding-day');
        dayEl.innerText = d;
        calendarEl.appendChild(dayEl);
    }

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Welcome Overlay Logic
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const openBtn = document.getElementById('open-invitation');
    const musicToggle = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-music');
    let isOpened = false;

    function openInvitation() {
        if (isOpened) return;
        isOpened = true;
        welcomeOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Start music immediately on user interaction
        if (audio) {
            audio.play().then(() => {
                if (musicToggle) musicToggle.classList.add('playing');
            }).catch(e => {
                console.log("Music play failed - browser might need more direct interaction", e);
                // Try again on any click if it failed
                document.addEventListener('click', () => {
                    audio.play();
                    if (musicToggle) musicToggle.classList.add('playing');
                }, { once: true });
            });
        }
        
        // Ensure we are at the top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Prevent scrolling when overlay is active
    document.body.style.overflow = 'hidden';

    // Click anywhere on overlay to open
    if (welcomeOverlay) {
        welcomeOverlay.addEventListener('click', openInvitation);
    }

    // Listen for scroll/wheel/touch to open
    window.addEventListener('wheel', (e) => {
        if (!isOpened && e.deltaY > 0) openInvitation();
    }, { passive: false });

    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    let touchStartY = 0;
    window.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        if (!isOpened && touchStartY > touchEndY + 30) openInvitation();
    }, { passive: true });

    // Music Player Logic (Toggle)
    if (musicToggle && audio) {
        musicToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent overlay click if already open
            if (!audio.paused) {
                audio.pause();
                musicToggle.classList.remove('playing');
                musicToggle.classList.add('paused');
            } else {
                audio.play().catch(e => console.log("Play failed", e));
                musicToggle.classList.add('playing');
                musicToggle.classList.remove('paused');
            }
        });
    }
});

async function submitRSVP(status) {
    const nameInput = document.getElementById('guest-name');
    const countInput = document.getElementById('guest-count');
    const name = nameInput ? nameInput.value.trim() : "";
    const count = countInput ? countInput.value : "1";
    const rsvpForm = document.querySelector('.rsvp-form');

    if (!name) {
        alert("Өтініш, есіміңізді жазыңыз!");
        nameInput.focus();
        return;
    }

    const data = {
        type: 'rsvp',
        name: name,
        status: status,
        count: count,
        timestamp: new Date().toLocaleString()
    };

    // Show loading
    const originalContent = rsvpForm.innerHTML;
    rsvpForm.innerHTML = '<div class="loading-msg">Жіберілуде... / Отправка...</div>';

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        rsvpForm.innerHTML = `
            <div class="thank-you-msg fade-in" style="opacity:1; transform:translateY(0); margin-top:20px;">
                <h3 style="color: var(--accent-color); font-size: 1.5rem;">Рахмет, ${name}! Жауабыңыз қабылданды.</h3>
            </div>
        `;
    } catch (error) {
        console.error('Error!', error.message);
        alert('Қате орын алды. Қайта көріңіз.');
        rsvpForm.innerHTML = originalContent;
    }
}

async function submitWish() {
    const nameInput = document.getElementById('wish-name');
    const textInput = document.getElementById('wish-text');
    const name = nameInput.value.trim();
    const text = textInput.value.trim();

    if (!name || !text) {
        alert("Өтініш, барлық өрістерді толтырыңыз!");
        return;
    }

    const data = {
        type: 'wish',
        name: name,
        message: text,
        timestamp: new Date().toLocaleString()
    };

    const submitBtn = document.querySelector('.wish-form-container button');
    submitBtn.innerText = "Жіберілуде...";
    submitBtn.disabled = true;

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        alert("Тілегіңіз қабылданды! Рахмет!");
        nameInput.value = "";
        textInput.value = "";
        submitBtn.innerText = "Тілек жіберу";
        submitBtn.disabled = false;
    } catch (error) {
        console.error('Error!', error.message);
        alert('Қате орын алды.');
        submitBtn.innerText = "Тілек жіберу";
        submitBtn.disabled = false;
    }
}

