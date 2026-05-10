
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLPdBGTyTDQmCOFdj236Ddei0t7hWhPHlHMeC4LpetTO2TjI6WBuPkOYq9KG2Lr8kH/exec';

document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Parallax
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / 700);
        }
    });

    // Secret View Logic
    let clickCount = 0;
    const namesHeader = document.getElementById('hero-names');
    if (namesHeader) {
        namesHeader.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 5) {
                alert("База данных: Google Sheets\nСтатистика доступна в таблице владельца.");
                clickCount = 0;
            }
        });
    }

    // Welcome Overlay Logic
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const openBtn = document.getElementById('open-invitation');
    const musicToggle = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-music');
    let isPlaying = false;

    if (openBtn && welcomeOverlay) {
        openBtn.addEventListener('click', () => {
            welcomeOverlay.classList.add('hidden');

            // Start music
            if (audio) {
                audio.play().then(() => {
                    isPlaying = true;
                    if (musicToggle) musicToggle.classList.add('playing');
                }).catch(e => console.log("Music play failed", e));
            }
        });
    }

    // Music Player Logic
    if (musicToggle && audio) {
        musicToggle.addEventListener('click', () => {
            if (isPlaying) {
                audio.pause();
                musicToggle.classList.remove('playing');
                musicToggle.classList.add('paused');
            } else {
                audio.play().catch(e => console.log("Play failed", e));
                musicToggle.classList.add('playing');
                musicToggle.classList.remove('paused');
            }
            isPlaying = !isPlaying;
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

