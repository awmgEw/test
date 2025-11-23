// JavaScript
// Telegram Clicker Pro v1.5.0
// Основной JavaScript файл

// Инициализация Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
    Telegram.WebApp.expand();
    Telegram.WebApp.ready();
}

// Глобальные переменные
let gameState = {
    count: 0,
    totalClicks: 0,
    streak: 0,
    maxStreak: 0,
    lastClickTime: 0,
    startTime: Date.now(),
    level: 1,
    xp: 0,
    timePlayed: 0,
    achievements: {},
    cloudData: null,
    clickSpeed: 0
};

let settings = {
    sound: true,
    vibration: true,
    particles: true,
    autosave: true,
    darkMode: false
};

let achievements = [
    { id: 'first_click', name: 'Первый шаг', desc: 'Сделать первый клик', icon: 'fas fa-mouse-pointer', rarity: 'bronze', condition: () => gameState.totalClicks >= 1 },
    { id: 'ten_clicks', name: 'Десять кликов', desc: 'Набрать 10 очков', icon: 'fas fa-tachometer-alt', rarity: 'bronze', condition: () => gameState.count >= 10 },
    { id: 'fifty_clicks', name: 'Пятьдесят очков', desc: 'Набрать 50 очков', icon: 'fas fa-fire', rarity: 'silver', condition: () => gameState.count >= 50 },
    { id: 'hundred_clicks', name: 'Сто очков', desc: 'Набрать 100 очков', icon: 'fas fa-trophy', rarity: 'gold', condition: () => gameState.count >= 100 },
    { id: 'streak_10', name: 'Серия 10', desc: 'Сделать 10 кликов подряд', icon: 'fas fa-bolt', rarity: 'silver', condition: () => gameState.streak >= 10 },
    { id: 'streak_25', name: 'Серия 25', desc: 'Сделать 25 кликов подряд', icon: 'fas fa-bolt', rarity: 'gold', condition: () => gameState.streak >= 25 },
    { id: 'level_5', name: 'Пятый уровень', desc: 'Достичь 5 уровня', icon: 'fas fa-star', rarity: 'gold', condition: () => gameState.level >= 5 },
    { id: 'minute_played', name: 'Минута игры', desc: 'Играть 1 минуту', icon: 'fas fa-clock', rarity: 'bronze', condition: () => gameState.timePlayed >= 60 },
    { id: 'five_minutes', name: 'Пять минут', desc: 'Играть 5 минут', icon: 'fas fa-hourglass-half', rarity: 'silver', condition: () => gameState.timePlayed >= 300 },
    { id: 'ten_minutes', name: 'Десять минут', desc: 'Играть 10 минут', icon: 'fas fa-hourglass', rarity: 'gold', condition: () => gameState.timePlayed >= 600 }
];

// DOM элементы
const elements = {
    counter: document.getElementById('counter-display'),
    streak: document.getElementById('streak-count'),
    level: document.getElementById('level-display'),
    timePlayed: document.getElementById('time-played'),
    xpProgress: document.getElementById('xp-progress'),
    currentXP: document.getElementById('current-xp'),
    nextLevelXP: document.getElementById('next-level-xp'),
    clickBtn: document.getElementById('click-btn'),
    resetBtn: document.getElementById('reset-btn'),
    shareBtn: document.getElementById('share-btn'),
    achievementsBtn: document.getElementById('achievements-btn'),
    cloudSyncBtn: document.getElementById('cloud-sync-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    clickSpeed: document.getElementById('click-speed'),
    particles: document.getElementById('particles'),
    confetti: document.getElementById('confetti-container'),
    achievementNotification: document.getElementById('achievement-notification'),
    achievementTitle: document.getElementById('achievement-title'),
    achievementDesc: document.getElementById('achievement-desc'),
    settingsModal: document.getElementById('settings-modal'),
    achievementsModal: document.getElementById('achievements-modal'),
    shareModal: document.getElementById('share-modal'),
    closeSettings: document.getElementById('close-settings'),
    closeAchievements: document.getElementById('close-achievements'),
    closeShare: document.getElementById('close-share'),
    saveSettings: document.getElementById('save-settings-btn'),
    resetSettings: document.getElementById('reset-settings-btn'),
    telegramShare: document.getElementById('telegram-share-btn'),
    copyLink: document.getElementById('copy-link-btn'),
    achievementsGrid: document.getElementById('achievements-grid'),
    unlockedCount: document.getElementById('unlocked-count'),
    goldCount: document.getElementById('gold-count'),
    silverCount: document.getElementById('silver-count'),
    bronzeCount: document.getElementById('bronze-count'),
    shareScore: document.getElementById('share-score'),
    shareLevel: document.getElementById('share-level'),
    shareMaxStreak: document.getElementById('share-max-streak'),
    shareTime: document.getElementById('share-time'),
    soundToggle: document.getElementById('sound-toggle'),
    vibrationToggle: document.getElementById('vibration-toggle'),
    particlesToggle: document.getElementById('particles-toggle'),
    autosaveToggle: document.getElementById('autosave-toggle'),
    darkModeToggle: document.getElementById('dark-mode-toggle')
};

// Инициализация аудио
let audioContext;
let clickSound;

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.2;
        gainNode.connect(audioContext.destination);

        clickSound = {
            play: () => {
                if (!settings.sound || !audioContext) return;

                const oscillator = audioContext.createOscillator();
                const envelope = audioContext.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.value = 800 + Math.random() * 200;

                envelope.gain.value = 0.1;
                envelope.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

                oscillator.connect(envelope);
                envelope.connect(gainNode);

                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
            }
        };
    } catch (e) {
        console.log('Web Audio API не поддерживается', e);
    }
}

// Загрузка настроек
function loadSettings() {
    const savedSettings = localStorage.getItem('clicker_pro_settings');
    if (savedSettings) {
        try {
            const parsed = JSON.parse(savedSettings);
            settings = { ...settings, ...parsed };

            // Применение темной темы
            if (settings.darkMode) {
                document.body.classList.add('dark-mode');
            }

            // Обновление UI
            updateSettingsUI();
        } catch (e) {
            console.log('Ошибка загрузки настроек', e);
        }
    }
}

// Сохранение настроек
function saveSettings() {
    localStorage.setItem('clicker_pro_settings', JSON.stringify(settings));
}

// Обновление UI настроек
function updateSettingsUI() {
    elements.soundToggle.checked = settings.sound;
    elements.vibrationToggle.checked = settings.vibration;
    elements.particlesToggle.checked = settings.particles;
    elements.autosaveToggle.checked = settings.autosave;
    elements.darkModeToggle.checked = settings.darkMode;
}

// Загрузка состояния игры
function loadGameState() {
    const savedState = localStorage.getItem('clicker_pro_state');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            gameState = { ...gameState, ...parsed };

            // Восстановление времени начала для правильного расчета
            if (!gameState.startTime) {
                gameState.startTime = Date.now();
            }
        } catch (e) {
            console.log('Ошибка загрузки состояния игры', e);
        }
    }

    // Загрузка достижений
    const savedAchievements = localStorage.getItem('clicker_pro_achievements');
    if (savedAchievements) {
        try {
            gameState.achievements = JSON.parse(savedAchievements);
        } catch (e) {
            console.log('Ошибка загрузки достижений', e);
        }
    }

    updateUI();
}

// Сохранение состояния игры
function saveGameState() {
    if (!settings.autosave) return;

    localStorage.setItem('clicker_pro_state', JSON.stringify({
        count: gameState.count,
        totalClicks: gameState.totalClicks,
        streak: gameState.streak,
        maxStreak: gameState.maxStreak,
        lastClickTime: gameState.lastClickTime,
        startTime: gameState.startTime,
        level: gameState.level,
        xp: gameState.xp,
        timePlayed: gameState.timePlayed
    }));

    localStorage.setItem('clicker_pro_achievements', JSON.stringify(gameState.achievements));
}

// Обновление UI
function updateUI() {
    elements.counter.textContent = gameState.count.toLocaleString();
    elements.streak.textContent = gameState.streak;
    elements.level.textContent = gameState.level;
    elements.currentXP.textContent = Math.floor(gameState.xp);
    elements.nextLevelXP.textContent = Math.floor(getNextLevelXP());

    // Обновление прогресса XP
    const xpPercentage = (gameState.xp / getNextLevelXP()) * 100;
    elements.xpProgress.style.width = `${Math.min(100, xpPercentage)}%`;

    // Обновление времени игры
    const minutes = Math.floor(gameState.timePlayed / 60);
    const seconds = gameState.timePlayed % 60;
    elements.timePlayed.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Обновление скорости кликов
    if (gameState.totalClicks > 0) {
        const timePlayed = (Date.now() - gameState.startTime) / 1000;
        gameState.clickSpeed = Math.round((gameState.totalClicks / timePlayed) * 10) / 10;
        elements.clickSpeed.textContent = gameState.clickSpeed.toFixed(1);
    }

    // Обновление данных для шеринга
    updateShareData();

    // Обновление достижений
    updateAchievementsUI();
}

// Получение XP для следующего уровня
function getNextLevelXP() {
    return 100 * Math.pow(gameState.level, 1.5);
}

// Добавление XP
function addXP(amount) {
    gameState.xp += amount;
    const nextLevelXP = getNextLevelXP();

    if (gameState.xp >= nextLevelXP) {
        gameState.level++;
        gameState.xp -= nextLevelXP;
        showLevelUpNotification();
    }

    updateUI();
}

// Уведомление о повышении уровня
function showLevelUpNotification() {
    showAchievement(`🎉 Уровень ${gameState.level}!`, `Вы достигли нового уровня!`, 'success');

    // Эффект конфетти
    createConfetti();

    // Вибрация
    if (settings.vibration && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

// Обработчик клика
function handleClick() {
    const now = Date.now();

    // Обновление стрика
    if (now - gameState.lastClickTime < 1000) {
        gameState.streak++;
        if (gameState.streak > gameState.maxStreak) {
            gameState.maxStreak = gameState.streak;
        }
    } else {
        gameState.streak = 1;
    }

    gameState.lastClickTime = now;

    // Увеличение счетчика
    gameState.count++;
    gameState.totalClicks++;

    // Добавление XP за клик
    addXP(10 + gameState.streak * 2);

    // Анимация счетчика
    elements.counter.classList.add('counter-animation');
    setTimeout(() => {
        elements.counter.classList.remove('counter-animation');
    }, 300);

    // Звук и вибрация
    if (settings.sound && clickSound) {
        clickSound.play();
    }

    if (settings.vibration && navigator.vibrate) {
        navigator.vibrate(30);
    }

    // Частицы
    if (settings.particles) {
        createParticles();
    }

    // Проверка достижений
    checkAchievements();

    // Сохранение состояния
    saveGameState();

    updateUI();
}

// Создание частиц
function createParticles() {
    const rect = elements.clickBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Очистка старых частиц
    elements.particles.innerHTML = '';

    const colors = ['#2962ff', '#00c853', '#ffab00', '#ff5252', '#651fff'];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const size = Math.random() * 8 + 4;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 5 + 2;
        const duration = Math.random() * 1000 + 500;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.boxShadow = `0 0 ${size}px ${color}`;

        elements.particles.appendChild(particle);

        const moveX = Math.cos(angle) * velocity * 30;
        const moveY = Math.sin(angle) * velocity * 30;

        setTimeout(() => {
            particle.style.transition = `all ${duration}ms cubic-bezier(0,0,0.2,1)`;
            particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
            particle.style.opacity = '0';

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, duration);
        }, 10);
    }
}

// Создание конфетти
function createConfetti() {
    elements.confetti.innerHTML = '';

    const colors = ['#2962ff', '#00c853', '#ffab00', '#ff5252', '#651fff', '#ffd700'];
    const confettiCount = 150;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';

        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;
        const left = Math.random() * 100;
        const delay = Math.random() * 1000;
        const duration = Math.random() * 2000 + 2000;
        const rotation = Math.random() * 720;

        confetti.style.backgroundColor = color;
        confetti.style.left = `${left}%`;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size * 1.5}px`;
        confetti.style.transform = `rotate(${rotation}deg)`;
        confetti.style.opacity = '0';

        elements.confetti.appendChild(confetti);

        setTimeout(() => {
            confetti.style.transition = `all ${duration}ms cubic-bezier(0.1, 0.8, 0.2, 1)`;
            confetti.style.opacity = '0.8';
            confetti.style.top = '100%';
            confetti.style.transform = `rotate(${rotation + 360}deg)`;

            setTimeout(() => {
                confetti.style.opacity = '0';
            }, duration - 500);

            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, duration);
        }, delay);
    }
}

// Показать достижение
function showAchievement(title, description, type = 'info') {
    elements.achievementTitle.textContent = title;
    elements.achievementDesc.textContent = description;

    elements.achievementNotification.className = 'achievement-notification';
    elements.achievementNotification.classList.add('show');

    if (type === 'success') {
        elements.achievementNotification.style.background = 'linear-gradient(45deg, var(--success), #00e676)';
    } else if (type === 'warning') {
        elements.achievementNotification.style.background = 'linear-gradient(45deg, var(--warning), #ffea00)';
    } else {
        elements.achievementNotification.style.background = 'linear-gradient(45deg, var(--primary), #651fff)';
    }

    setTimeout(() => {
        elements.achievementNotification.classList.remove('show');
    }, 4000);
}

// Проверка достижений
function checkAchievements() {
    let newAchievements = 0;

    achievements.forEach(achievement => {
        if (!gameState.achievements[achievement.id] && achievement.condition()) {
            gameState.achievements[achievement.id] = {
                unlocked: true,
                timestamp: Date.now(),
                rarity: achievement.rarity
            };

            showAchievement(achievement.name, achievement.desc, 'success');
            newAchievements++;
        }
    });

    if (newAchievements > 0) {
        saveGameState();
        updateAchievementsUI();
    }
}

// Обновление UI достижений
function updateAchievementsUI() {
    elements.achievementsGrid.innerHTML = '';

    let unlocked = 0;
    let gold = 0;
    let silver = 0;
    let bronze = 0;

    achievements.forEach(achievement => {
        const isUnlocked = gameState.achievements[achievement.id]?.unlocked;
        if (isUnlocked) {
            unlocked++;
            switch (achievement.rarity) {
                case 'gold': gold++; break;
                case 'silver': silver++; break;
                case 'bronze': bronze++; break;
            }
        }

        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement-item ${achievement.rarity} ${isUnlocked ? 'unlocked' : ''}`;

        achievementElement.innerHTML = `
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        `;

        elements.achievementsGrid.appendChild(achievementElement);
    });

    elements.unlockedCount.textContent = unlocked;
    elements.goldCount.textContent = gold;
    elements.silverCount.textContent = silver;
    elements.bronzeCount.textContent = bronze;
}

// Обновление данных для шеринга
function updateShareData() {
    elements.shareScore.textContent = gameState.count.toLocaleString();
    elements.shareLevel.textContent = gameState.level;
    elements.shareMaxStreak.textContent = gameState.maxStreak;

    const minutes = Math.floor(gameState.timePlayed / 60);
    const seconds = gameState.timePlayed % 60;
    elements.shareTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Сброс игры
function resetGame() {
    if (gameState.count === 0 && gameState.totalClicks === 0) return;

    if (confirm('Вы уверены, что хотите сбросить прогресс? Это действие нельзя отменить!')) {
        gameState = {
            count: 0,
            totalClicks: 0,
            streak: 0,
            maxStreak: 0,
            lastClickTime: 0,
            startTime: Date.now(),
            level: 1,
            xp: 0,
            timePlayed: 0,
            achievements: {},
            clickSpeed: 0
        };

        updateUI();
        saveGameState();
        showAchievement('🔄 Прогресс сброшен!', 'Все данные удалены', 'success');
    }
}

// Сохранение в облако (Telegram)
function saveToCloud() {
    if (!window.Telegram || !window.Telegram.WebApp) {
        showAchievement('❌ Ошибка', 'Функция доступна только в Telegram', 'warning');
        return;
    }

    try {
        const cloudData = {
            version: '1.5.0',
            count: gameState.count,
            totalClicks: gameState.totalClicks,
            maxStreak: gameState.maxStreak,
            level: gameState.level,
            xp: gameState.xp,
            achievements: gameState.achievements,
            timestamp: Date.now()
        };

        Telegram.WebApp.sendData(JSON.stringify({
            type: 'save_game',
            data: cloudData
        }));

        showAchievement('✅ Сохранено в облако!', 'Все данные сохранены', 'success');
        gameState.cloudData = cloudData;
    } catch (e) {
        console.error('Ошибка сохранения в облако', e);
        showAchievement('❌ Ошибка сохранения', 'Не удалось сохранить данные', 'warning');
    }
}

// Обновление времени игры
function updateTime() {
    if (gameState.totalClicks > 0) {
        const elapsedSeconds = Math.floor((Date.now() - gameState.startTime) / 1000);
        gameState.timePlayed = elapsedSeconds;
        updateUI();
    }
}

// Инициализация приложения
function init() {
    // Инициализация аудио
    initAudio();

    // Загрузка настроек
    loadSettings();

    // Загрузка состояния игры
    loadGameState();

    // Обработчики событий
    elements.clickBtn.addEventListener('click', handleClick);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.shareBtn.addEventListener('click', () => showModal(elements.shareModal));
    elements.achievementsBtn.addEventListener('click', () => showModal(elements.achievementsModal));
    elements.cloudSyncBtn.addEventListener('click', saveToCloud);
    elements.settingsBtn.addEventListener('click', () => showModal(elements.settingsModal));

    elements.closeSettings.addEventListener('click', () => hideModal(elements.settingsModal));
    elements.closeAchievements.addEventListener('click', () => hideModal(elements.achievementsModal));
    elements.closeShare.addEventListener('click', () => hideModal(elements.shareModal));

    elements.saveSettings.addEventListener('click', saveSettingsFromUI);
    elements.resetSettings.addEventListener('click', resetAppSettings);

    elements.telegramShare.addEventListener('click', shareToTelegram);
    elements.copyLink.addEventListener('click', copyShareLink);

    // Обработчики переключателей
    elements.soundToggle.addEventListener('change', (e) => {
        settings.sound = e.target.checked;
        saveSettings();
    });

    elements.vibrationToggle.addEventListener('change', (e) => {
        settings.vibration = e.target.checked;
        saveSettings();
    });

    elements.particlesToggle.addEventListener('change', (e) => {
        settings.particles = e.target.checked;
        saveSettings();
    });

    elements.autosaveToggle.addEventListener('change', (e) => {
        settings.autosave = e.target.checked;
        saveSettings();
    });

    elements.darkModeToggle.addEventListener('change', (e) => {
        settings.darkMode = e.target.checked;
        document.body.classList.toggle('dark-mode', settings.darkMode);
        saveSettings();
    });

    // Обработчик клика вне модального окна
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });

    // Обновление времени игры каждую секунду
    setInterval(updateTime, 1000);

    // Проверка достижений при загрузке
    checkAchievements();

    // Приветственное сообщение
    setTimeout(() => {
        showAchievement('🚀 Добро пожаловать!', 'Telegram Clicker Pro v1.5.0', 'success');
    }, 1000);
}

// Показать модальное окно
function showModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Скрыть модальное окно
function hideModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Сохранение настроек из UI
function saveSettingsFromUI() {
    settings.sound = elements.soundToggle.checked;
    settings.vibration = elements.vibrationToggle.checked;
    settings.particles = elements.particlesToggle.checked;
    settings.autosave = elements.autosaveToggle.checked;
    settings.darkMode = elements.darkModeToggle.checked;

    saveSettings();
    updateSettingsUI();

    showAchievement('✅ Настройки сохранены!', 'Изменения применены', 'success');
    hideModal(elements.settingsModal);
}

// Сброс настроек приложения
function resetAppSettings() {
    if (confirm('Сбросить все настройки до значений по умолчанию?')) {
        settings = {
            sound: true,
            vibration: true,
            particles: true,
            autosave: true,
            darkMode: false
        };

        saveSettings();
        updateSettingsUI();

        showAchievement('✅ Настройки сброшены!', 'Все настройки восстановлены', 'success');
    }
}

// Отправка в Telegram
function shareToTelegram() {
    if (!window.Telegram || !window.Telegram.WebApp) {
        showAchievement('❌ Ошибка', 'Функция доступна только в Telegram', 'warning');
        return;
    }

    try {
        const message = `🎮 Я набрал ${gameState.count.toLocaleString()} очков в Telegram Clicker Pro v1.5.0!
🔥 Мой уровень: ${gameState.level}, Макс. стрик: ${gameState.maxStreak}
⏰ Время игры: ${Math.floor(gameState.timePlayed / 60)}:${(gameState.timePlayed % 60).toString().padStart(2, '0')}

Попробуй побить мой рекорд!`;

        Telegram.WebApp.sendData(JSON.stringify({
            type: 'share_result',
            score: gameState.count,
            level: gameState.level,
            maxStreak: gameState.maxStreak,
            timePlayed: gameState.timePlayed,
            message: message
        }));

        showAchievement('✅ Отправлено!', 'Результат отправлен в Telegram', 'success');
        hideModal(elements.shareModal);
    } catch (e) {
        console.error('Ошибка отправки в Telegram', e);
        showAchievement('❌ Ошибка отправки', 'Не удалось отправить результат', 'warning');
    }
}

// Копирование ссылки
function copyShareLink() {
    const link = `https://t.me/your_clicker_bot?start=score_${gameState.count}_level_${gameState.level}`;

    navigator.clipboard.writeText(link).then(() => {
        showAchievement('✅ Скопировано!', 'Ссылка скопирована в буфер', 'success');
    }).catch(err => {
        console.error('Ошибка копирования', err);
        showAchievement('❌ Ошибка', 'Не удалось скопировать ссылку', 'warning');
    });
}

// Запуск приложения при загрузке
document.addEventListener('DOMContentLoaded', init);

// Сохранение при закрытии
window.addEventListener('beforeunload', () => {
    saveGameState();
});

console.log('Telegram Clicker Pro v1.5.0 загружен!');