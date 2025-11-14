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
    }

    async init() {
        await this.selectImageVariants();
        this.renderCards();
        this.enableSettingsButton(false);
        this.hideGameCompleteSection();
        this.startTime = Date.now();
        this.playNextSound();
    }

    async selectImageVariants() {
        const imageMode = this.settings.visualMode || 'graphic';
        
        const promises = this.subjects.map(async (subject) => {
            const basePath = `assets/images/${imageMode}/${subject}`;
            const candidates = [
                `${basePath}.png`,
                `${basePath}0.png`,
                `${basePath}1.png`,
                `${basePath}2.png`,
                `${basePath}3.png`,
                `${basePath}4.png`,
                `${basePath}5.png`,
                `${basePath}6.png`,
                `${basePath}7.png`,
                `${basePath}8.png`,
                `${basePath}9.png`
            ];

            const checks = candidates.map(async (path) => {
                try {
                    const response = await fetch(path, { method: 'HEAD' });
                    if (response.ok) return path;
                } catch (e) {
                }
                return null;
            });

            const results = await Promise.all(checks);
            const available = results.filter(path => path !== null);

            if (available.length > 0) {
                const randomIndex = Math.floor(Math.random() * available.length);
                this.subjectImageVariants[subject] = available[randomIndex];
            } else {
                this.subjectImageVariants[subject] = `${basePath}.png`;
            }
        });

        await Promise.all(promises);
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
            img.style.display = 'none';
            const label = document.createElement('div');
            label.className = 'card-label';
            label.textContent = subject.replace(/_/g, ' ');
            card.appendChild(label);
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
        const subject = cardElement.dataset.subject;
        const card = this.cards.find(c => c.subject === subject);
        if (card) {
            card.element.classList.remove('cue', 'cue-glow', 'cue-wiggle', 'cue-bounce', 'cue-subtle', 'cue-gentle', 'cue-obvious');
        }
        
        cardElement.classList.add('correct');
        
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
        this.endTime = Date.now();
        const timeTaken = Math.round((this.endTime - this.startTime) / 1000);
        const accuracy = this.totalAttempts > 0 
            ? Math.round((this.correctCount / this.totalAttempts) * 100) 
            : 0;
        const incorrectCount = this.totalAttempts - this.correctCount;
        
        this.enableSettingsButton(true);
        showToast(t('gameComplete') + ` ${accuracy}%`, 'success', 3000);
        
        setTimeout(() => {
            this.showGameCompleteSection(timeTaken, accuracy, incorrectCount);
        }, 1000);
    }

    destroy() {
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
        const audioIndicator = document.getElementById('audio-indicator');

        if (section && statsDisplay && grid) {
            grid.classList.add('hidden');
            if (audioIndicator) audioIndicator.classList.add('hidden');

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
            `;
            
            section.classList.remove('hidden');
            section.classList.add('center-flex');
        }
    }

    hideGameCompleteSection() {
        const section = document.getElementById('game-complete-section');
        const grid = document.getElementById('card-grid');
        const audioIndicator = document.getElementById('audio-indicator');
        
        if (section && grid) {
            section.classList.add('hidden');
            section.classList.remove('center-flex');
            grid.classList.remove('hidden');
            if (audioIndicator) audioIndicator.classList.remove('hidden');
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
    const audioIndicator = document.getElementById('audio-indicator');
    
    if (completeSection && grid) {
        completeSection.classList.add('hidden');
        completeSection.classList.remove('center-flex');
        grid.classList.remove('hidden');
        if (audioIndicator) audioIndicator.classList.remove('hidden');
    }
    
    currentGame = new CardGame(subjects, settings);
    await currentGame.init();
}
