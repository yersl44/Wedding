
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

    document.querySelectorAll('.reveal:not(.hero *), .gallery-item, .fade-in:not(.hero *), .text-reveal:not(.hero *)').forEach(el => observer.observe(el));

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

    // Music Auto-Play on first user interaction
    const musicToggle = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-music');
    let hasInteracted = false;

    function initAudio() {
        if (hasInteracted || !audio) return;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                hasInteracted = true;
                if (musicToggle) {
                    musicToggle.classList.add('playing');
                    musicToggle.classList.remove('paused');
                }
                // Clean up all listeners
                window.removeEventListener('scroll', initAudio);
                window.removeEventListener('touchmove', initAudio);
                window.removeEventListener('touchstart', initAudio);
                window.removeEventListener('click', initAudio);
            }).catch(() => {
                // Browser blocked — will retry on next gesture
            });
        }
    }

    // Desktop: scroll event
    window.addEventListener('scroll', initAudio, { passive: true });
    // Mobile: touchmove fires DURING swipe — reliable on iOS/Android
    window.addEventListener('touchmove', initAudio, { passive: true });
    // Fallback: any tap or click
    window.addEventListener('touchstart', initAudio, { passive: true });
    window.addEventListener('click', initAudio, { passive: true });

    // Trigger Hero Animations immediately since overlay is removed
    setTimeout(() => {
        document.querySelectorAll('.hero .text-reveal, .hero .fade-in').forEach(el => {
            el.classList.add('active');
        });
    }, 100);

    // Music Player Logic (Toggle)
    if (musicToggle && audio) {
        musicToggle.addEventListener('click', (e) => {
            e.stopPropagation();
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

async function submitRSVP() {
    const nameInput = document.getElementById('guest-name');
    const name = nameInput ? nameInput.value.trim() : "";
    const rsvpForm = document.querySelector('.rsvp-form');

    if (!name) {
        alert("Өтініш, есіміңізді жазыңыз!");
        nameInput.focus();
        return;
    }

    const selectedOption = document.querySelector('input[name="rsvp-status"]:checked');
    if (!selectedOption) {
        alert("Өтініш, жауап нұсқасын таңдаңыз!");
        return;
    }

    const statusValue = selectedOption.value;
    let count = "1";
    if (statusValue === "Жұбайыммен келеміз") {
        count = "2";
    } else if (statusValue === "Өкінішке орай, келе алмаймын") {
        count = "0";
    }

    const data = {
        type: 'rsvp',
        name: name,
        status: statusValue,
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
    submitBtn.innerText = "ЖІБЕРІЛУДЕ...";
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
        submitBtn.innerText = "ТІЛЕК ЖІБЕРУ";
        submitBtn.disabled = false;
    } catch (error) {
        console.error('Error!', error.message);
        alert('Қате орын алды.');
        submitBtn.innerText = "ТІЛЕК ЖІБЕРУ";
        submitBtn.disabled = false;
    }
}

