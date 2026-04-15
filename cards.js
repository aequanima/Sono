class CardGame {
    constructor(subjects, settings) {
        this.subjects = subjects;
        this.settings = settings;
        this.currentSubject = null;
        this.cards = [];
        this.isPlaying = false;
        this.isProcessingAnswer = false;
        this.correctCount = 0;
        this.totalAttempts = 0;
        this.subjectImageVariants = {};
        this.startTime = null;
        this.endTime = null;
        this.autoAdvanceTimer = null;
        this.autoAdvancedCount = 0;
        this.autoAdvancePaused = false;
        this.countdownAnimation = null;
        this.autoAdvanceStartTime = null;
        this.autoAdvanceRemainingTime = 0;
        this.gameStartedFirstSound = true;
    }

    triggerHaptic(type = 'medium') {
        if (navigator.vibrate) {
            switch(type) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(20);
                    break;
                case 'heavy':
                    navigator.vibrate(40);
                    break;
                case 'success':
                    navigator.vibrate([20, 50, 20]);
                    break;
                case 'error':
                    navigator.vibrate([10, 30, 10, 30, 10]);
                    break;
            }
        }
    }

    async init() {
        await this.selectImageVariants();
        this.renderCards();
        this.enableSettingsButton(false);
        this.hideGameCompleteSection();
        this.startTime = Date.now();

        if (this.settings.autoAdvance && this.settings.autoAdvance.enabled) {
            // Start paused so the user isn't startled by immediate sound
            this.showPausedIndicator();
        } else {
            this.playNextSound();
        }
    }

    showPausedIndicator() {
        const speakerIcon = document.getElementById('speaker-icon');
        const pauseIcon = document.getElementById('pause-icon');
        const playIcon = document.getElementById('play-icon');

        if (speakerIcon) speakerIcon.classList.add('indicator-icon-hidden');
        if (pauseIcon) pauseIcon.classList.add('indicator-icon-hidden');
        if (playIcon) playIcon.classList.remove('indicator-icon-hidden');

        this.autoAdvancePaused = true;
        this.gameStartedFirstSound = false;
    }

    async selectImageVariants() {
        const imageMode = this.settings.visualMode || 'graphic';
        
        this.subjects.forEach(subject => {
            const basePath = `assets/images/${imageMode}/${subject}`;
            this.subjectImageVariants[subject] = `${basePath}.png`;
        });
    }

    renderCards() {
        const container = document.getElementById('card-grid');
        container.innerHTML = '';
        container.className = `card-grid grid-${this.settings.gridSize}`;

        this.cards = this.subjects.map(subject => ({
            subject: subject,
            element: this.createCardElement(subject),
            removed: false
        }));

        this.cards.forEach(card => {
            container.appendChild(card.element);
        });
    }

    createCardElement(subject) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.subject = subject;

        const imagePath = this.subjectImageVariants[subject];

        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = subject;
        img.onerror = () => {
            const imageMode = this.settings.visualMode || 'graphic';
            const basePath = `assets/images/${imageMode}/${subject}.png`;
            
            if (img.src !== window.location.origin + window.location.pathname.replace('index.html', '') + basePath) {
                img.src = basePath;
            } else {
                img.style.display = 'none';
                const label = document.createElement('div');
                label.className = 'card-label';
                label.textContent = subject.replace(/_/g, ' ');
                card.appendChild(label);
            }
        };

        card.appendChild(img);

        card.addEventListener('click', () => this.handleCardClick(subject, card));

        return card;
    }

    async playNextSound() {
        if (this.isPlaying) return;

        const activeCards = this.cards.filter(c => !c.removed);
        if (activeCards.length === 0) {
            this.onGameComplete();
            return;
        }

        this.currentSubject = activeCards[Math.floor(Math.random() * activeCards.length)].subject;
        this.isPlaying = true;

        try {
            this.showAudioIndicator();
            await audioManager.playSoundForSubject(this.currentSubject);
            this.hideAudioIndicator();

            if (this.settings.cueing.enabled) {
                setTimeout(() => {
                    this.showCue(this.currentSubject);
                }, this.settings.cueing.delay);
            }
        } catch (error) {
            console.error('Error playing sound:', error);
            showToast(t('errorPlayingSound'), 'error');
        }

        this.isPlaying = false;
        this.updateProgress();

        if (this.settings.autoAdvance && this.settings.autoAdvance.enabled) {
            this.startAutoAdvanceCountdown();
        }
    }

    async replayCurrentSound() {
        if (this.isPlaying || !this.currentSubject || this.isProcessingAnswer) return;

        const activeCards = this.cards.filter(c => !c.removed);
        if (activeCards.length === 0) return;

        this.isPlaying = true;

        try {
            this.showAudioIndicator();
            await audioManager.playSoundForSubject(this.currentSubject);
            this.hideAudioIndicator();
        } catch (error) {
            console.error('Error replaying sound:', error);
            showToast(t('errorPlayingSound'), 'error');
        }

        this.isPlaying = false;
    }

    updateProgress() {
        const activeCards = this.cards.filter(c => !c.removed);
        const progressDisplay = document.getElementById('game-progress');
        if (progressDisplay) {
            progressDisplay.textContent = `${activeCards.length} ${t('cardsRemaining')}`;
        }
    }

    async handleCardClick(subject, cardElement) {
        if (this.isPlaying || !this.currentSubject || this.isProcessingAnswer) return;
        if (this.settings.autoAdvance && this.settings.autoAdvance.enabled && this.settings.autoAdvance.mode === 'handsFree') return;

        this.triggerHaptic('light');
        this.totalAttempts++;

        if (subject === this.currentSubject) {
            this.isProcessingAnswer = true;
            this.correctCount++;
            await this.handleCorrectAnswer(cardElement);
            this.isProcessingAnswer = false;
        } else {
            await this.handleIncorrectAnswer(cardElement);
        }
    }

    async handleCorrectAnswer(cardElement) {
        this.clearAutoAdvanceTimer();
        const subject = cardElement.dataset.subject;
        const card = this.cards.find(c => c.subject === subject);
        if (card) {
            card.element.classList.remove('cue', 'cue-glow', 'cue-wiggle', 'cue-bounce', 'cue-subtle', 'cue-gentle', 'cue-obvious');
        }
        
        cardElement.classList.add('correct');
        this.triggerHaptic('success');
        
        if (this.settings.successSound) {
            await audioManager.playSuccessTone();
        }

        gsap.to(cardElement, {
            scale: 1.1,
            duration: 0.2,
            ease: 'back.out(2)',
            onComplete: () => {
                gsap.to(cardElement, {
                    scale: 1,
                    duration: 0.2
                });
            }
        });

        await new Promise(resolve => setTimeout(resolve, 800));

        if (this.settings.cardBehavior === 'remove') {
            this.removeCard(cardElement);
        } else {
            this.crossOutCard(cardElement);
        }

        cardElement.classList.remove('correct');
        
        setTimeout(() => {
            this.playNextSound();
        }, 500);
    }

    async handleIncorrectAnswer(cardElement) {
        cardElement.classList.add('incorrect');
        this.triggerHaptic('error');
        
        if (this.settings.errorSound) {
            await audioManager.playErrorTone();
        }

        gsap.to(cardElement, {
            x: -10,
            duration: 0.1,
            repeat: 3,
            yoyo: true,
            ease: 'power2.inOut',
            onComplete: () => {
                gsap.set(cardElement, { x: 0 });
                cardElement.classList.remove('incorrect');
            }
        });
    }

    removeCard(cardElement) {
        const subject = cardElement.dataset.subject;
        const card = this.cards.find(c => c.subject === subject);
        if (card) card.removed = true;

        gsap.to(cardElement, {
            scale: 0,
            opacity: 0,
            duration: 0.3,
            ease: 'back.in(2)',
            onComplete: () => {
                cardElement.style.visibility = 'hidden';
                this.updateProgress();
            }
        });
    }

    crossOutCard(cardElement) {
        const subject = cardElement.dataset.subject;
        const card = this.cards.find(c => c.subject === subject);
        if (card) card.removed = true;

        cardElement.classList.add('crossed-out');
        cardElement.style.pointerEvents = 'none';
        this.updateProgress();
    }

    showCue(subject) {
        const card = this.cards.find(c => c.subject === subject);
        if (!card || card.removed) return;

        const element = card.element;
        const cueType = this.settings.cueing.type || 'glow';
        const intensity = this.settings.cueing.intensity || 'gentle';

        element.classList.add('cue', `cue-${cueType}`, `cue-${intensity}`);

        setTimeout(() => {
            element.classList.remove('cue', `cue-${cueType}`, `cue-${intensity}`);
        }, 2000);
    }

    // --- Auto-Advance Methods ---

    startAutoAdvanceCountdown() {
        this.clearAutoAdvanceTimer();
        this.autoAdvancePaused = false;

        const delay = this.settings.autoAdvance.delay;
        this.autoAdvanceRemainingTime = delay;
        this.autoAdvanceStartTime = Date.now();

        // Show countdown ring and swap to pause icon
        const ring = document.getElementById('countdown-ring');
        const progress = document.getElementById('countdown-ring-progress');
        const speakerIcon = document.getElementById('speaker-icon');
        const pauseIcon = document.getElementById('pause-icon');
        const playIcon = document.getElementById('play-icon');

        if (ring) ring.classList.add('active');
        if (speakerIcon) speakerIcon.classList.add('indicator-icon-hidden');
        if (pauseIcon) pauseIcon.classList.remove('indicator-icon-hidden');
        if (playIcon) playIcon.classList.add('indicator-icon-hidden');

        // Animate the SVG ring (stroke-dashoffset from 0 to full circumference)
        const circumference = 2 * Math.PI * 36; // ~226.19
        if (progress) {
            gsap.set(progress, { strokeDashoffset: 0 });
            this.countdownAnimation = gsap.to(progress, {
                strokeDashoffset: circumference,
                duration: delay / 1000,
                ease: 'linear'
            });
        }

        this.autoAdvanceTimer = setTimeout(() => {
            this.autoAdvanceCard();
        }, delay);
    }

    isAutoAdvanceCountdownActive() {
        return this.autoAdvanceTimer !== null || this.autoAdvancePaused;
    }

    toggleAutoAdvancePause() {
        if (this.autoAdvancePaused) {
            // Check if this is the initial start (no sound played yet)
            if (this.gameStartedFirstSound === false) {
                this.autoAdvancePaused = false;
                this.gameStartedFirstSound = true;
                this.resetCountdownUI();
                this.playNextSound();
                return;
            }

            // Resume existing countdown
            this.autoAdvancePaused = false;
            this.autoAdvanceStartTime = Date.now();

            const pauseIcon = document.getElementById('pause-icon');
            const playIcon = document.getElementById('play-icon');
            if (pauseIcon) pauseIcon.classList.remove('indicator-icon-hidden');
            if (playIcon) playIcon.classList.add('indicator-icon-hidden');

            if (this.countdownAnimation) {
                this.countdownAnimation.resume();
            }

            this.autoAdvanceTimer = setTimeout(() => {
                this.autoAdvanceCard();
            }, this.autoAdvanceRemainingTime);
        } else {
            // Pause
            this.autoAdvancePaused = true;
            const elapsed = Date.now() - this.autoAdvanceStartTime;
            this.autoAdvanceRemainingTime = Math.max(0, this.autoAdvanceRemainingTime - elapsed);

            if (this.autoAdvanceTimer) {
                clearTimeout(this.autoAdvanceTimer);
                this.autoAdvanceTimer = null;
            }

            if (this.countdownAnimation) {
                this.countdownAnimation.pause();
            }

            const pauseIcon = document.getElementById('pause-icon');
            const playIcon = document.getElementById('play-icon');
            if (pauseIcon) pauseIcon.classList.add('indicator-icon-hidden');
            if (playIcon) playIcon.classList.remove('indicator-icon-hidden');
        }
    }

    async autoAdvanceCard() {
        if (!this.currentSubject || this.isProcessingAnswer) return;

        this.isProcessingAnswer = true;
        this.autoAdvancedCount++;

        // Reset countdown UI
        this.resetCountdownUI();

        // Find the correct card
        const card = this.cards.find(c => c.subject === this.currentSubject && !c.removed);
        if (!card) {
            this.isProcessingAnswer = false;
            return;
        }

        const cardElement = card.element;

        // Remove cue classes
        cardElement.classList.remove('cue', 'cue-glow', 'cue-wiggle', 'cue-bounce', 'cue-subtle', 'cue-gentle', 'cue-obvious');

        // Flash the card 3 times
        cardElement.classList.add('auto-advance-flash');
        await new Promise(resolve => {
            gsap.fromTo(cardElement, { opacity: 1 }, {
                opacity: 0.2,
                duration: 0.25,
                repeat: 5,
                yoyo: true,
                ease: 'power1.inOut',
                onComplete: () => {
                    gsap.set(cardElement, { opacity: 1 });
                    resolve();
                }
            });
        });

        cardElement.classList.remove('auto-advance-flash');

        // Remove or cross out the card
        if (this.settings.cardBehavior === 'remove') {
            this.removeCard(cardElement);
        } else {
            this.crossOutCard(cardElement);
        }

        this.isProcessingAnswer = false;

        setTimeout(() => {
            this.playNextSound();
        }, 500);
    }

    clearAutoAdvanceTimer() {
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }
        if (this.countdownAnimation) {
            this.countdownAnimation.kill();
            this.countdownAnimation = null;
        }
        this.autoAdvancePaused = false;
        this.autoAdvanceRemainingTime = 0;
        this.resetCountdownUI();
    }

    resetCountdownUI() {
        const ring = document.getElementById('countdown-ring');
        const progress = document.getElementById('countdown-ring-progress');
        const speakerIcon = document.getElementById('speaker-icon');
        const pauseIcon = document.getElementById('pause-icon');
        const playIcon = document.getElementById('play-icon');

        if (ring) ring.classList.remove('active');
        if (progress) gsap.set(progress, { strokeDashoffset: 0 });
        if (speakerIcon) speakerIcon.classList.remove('indicator-icon-hidden');
        if (pauseIcon) pauseIcon.classList.add('indicator-icon-hidden');
        if (playIcon) playIcon.classList.add('indicator-icon-hidden');
    }

    showAudioIndicator() {
        const indicator = document.getElementById('audio-indicator');
        if (indicator) {
            indicator.classList.add('playing');
        }
    }

    hideAudioIndicator() {
        const indicator = document.getElementById('audio-indicator');
        if (indicator) {
            indicator.classList.remove('playing');
        }
    }

    onGameComplete() {
        this.clearAutoAdvanceTimer();
        this.endTime = Date.now();
        const timeTaken = Math.round((this.endTime - this.startTime) / 1000);
        const accuracy = this.totalAttempts > 0
            ? Math.round((this.correctCount / this.totalAttempts) * 100)
            : 0;
        const incorrectCount = this.totalAttempts - this.correctCount;

        this.enableSettingsButton(true);
        this.createConfetti();

        setTimeout(() => {
            this.showGameCompleteSection(timeTaken, accuracy, incorrectCount);
        }, 1000);
    }

    createConfetti() {
        const celebration = document.createElement('div');
        celebration.className = 'game-complete-celebration';
        document.body.appendChild(celebration);

        const colors = ['#6b9bd1', '#a8c5e6', '#5cb85c', '#fc8181', '#ffd700', '#ff69b4'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                confetti.style.animationDuration = (Math.random() * 4 + 4) + 's';
                celebration.appendChild(confetti);
            }, i * 30);
        }

        setTimeout(() => {
            celebration.remove();
        }, 8000);
    }

    destroy() {
        this.clearAutoAdvanceTimer();
        audioManager.stop();
        this.enableSettingsButton(true);
        const container = document.getElementById('card-grid');
        if (container) {
            container.innerHTML = '';
        }
    }

    enableSettingsButton(enabled) {
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            if (enabled) {
                settingsBtn.classList.remove('disabled');
            } else {
                settingsBtn.classList.add('disabled');
            }
        }
    }

    showGameCompleteSection(timeTaken, accuracy, incorrectCount) {
        const section = document.getElementById('game-complete-section');
        const statsDisplay = document.getElementById('game-stats');
        const grid = document.getElementById('card-grid');
        const audioIndicatorWrapper = document.getElementById('audio-indicator-wrapper');

        if (section && statsDisplay && grid) {
            grid.classList.add('hidden');
            if (audioIndicatorWrapper) audioIndicatorWrapper.classList.add('hidden');

            const minutes = Math.floor(timeTaken / 60);
            const seconds = timeTaken % 60;
            const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
            
            statsDisplay.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Time:</span>
                    <span class="stat-value">${timeStr}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Accuracy:</span>
                    <span class="stat-value">${accuracy}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Correct:</span>
                    <span class="stat-value">${this.correctCount}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Incorrect:</span>
                    <span class="stat-value">${incorrectCount}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Attempts:</span>
                    <span class="stat-value">${this.totalAttempts}</span>
                </div>
                ${this.autoAdvancedCount > 0 ? `
                <div class="stat-item">
                    <span class="stat-label">${t('autoAdvanced')}:</span>
                    <span class="stat-value">${this.autoAdvancedCount}</span>
                </div>` : ''}
            `;
            
            section.classList.remove('hidden');
            section.classList.add('center-flex');
        }
    }

    hideGameCompleteSection() {
        const section = document.getElementById('game-complete-section');
        const grid = document.getElementById('card-grid');
        const audioIndicatorWrapper = document.getElementById('audio-indicator-wrapper');

        if (section && grid) {
            section.classList.add('hidden');
            section.classList.remove('center-flex');
            grid.classList.remove('hidden');
            if (audioIndicatorWrapper) audioIndicatorWrapper.classList.remove('hidden');
        }
    }
}

let currentGame = null;

async function startGame(subjects, settings) {
    if (currentGame) {
        currentGame.destroy();
    }

    const completeSection = document.getElementById('game-complete-section');
    const grid = document.getElementById('card-grid');
    const audioIndicatorWrapper = document.getElementById('audio-indicator-wrapper');

    if (completeSection && grid) {
        completeSection.classList.add('hidden');
        completeSection.classList.remove('center-flex');
        grid.classList.remove('hidden');
        if (audioIndicatorWrapper) audioIndicatorWrapper.classList.remove('hidden');
    }
    
    currentGame = new CardGame(subjects, settings);
    await currentGame.init();
}
