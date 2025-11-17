class AudioManager {
    constructor() {
        this.audioContext = null;
        this.currentSource = null;
        this.masterVolume = 0.7;
        this.feedbackVolume = 0.5;
        this.isPlaying = false;
    }

    async init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    async findAvailableSound(subject) {
        return `assets/sounds/${subject}.mp3`;
    }

    async playSoundForSubject(subject) {
        const soundPath = await this.findAvailableSound(subject);
        return this.playSound(soundPath);
    }

    async playSound(soundPath) {
        await this.init();
        
        if (this.currentSource) {
            this.currentSource.stop();
        }

        try {
            const response = await fetch(soundPath);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = audioBuffer;
            gainNode.gain.value = this.masterVolume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            this.currentSource = source;
            this.isPlaying = true;

            return new Promise((resolve) => {
                source.onended = () => {
                    this.isPlaying = false;
                    this.currentSource = null;
                    resolve();
                };
                source.start(0);
            });
        } catch (error) {
            console.error('Error playing sound:', error);
            this.isPlaying = false;
            throw error;
        }
    }

    stop() {
        if (this.currentSource) {
            this.currentSource.stop();
            this.currentSource = null;
            this.isPlaying = false;
        }
    }

    async playSuccessTone() {
        await this.init();
        
        const now = this.audioContext.currentTime;
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        oscillator1.frequency.setValueAtTime(523.25, now);
        oscillator2.frequency.setValueAtTime(659.25, now);

        gainNode.gain.setValueAtTime(this.feedbackVolume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator1.start(now);
        oscillator2.start(now + 0.1);
        oscillator1.stop(now + 0.4);
        oscillator2.stop(now + 0.5);
    }

    async playErrorTone() {
        await this.init();
        
        const now = this.audioContext.currentTime;
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        oscillator1.frequency.setValueAtTime(196.00, now);
        oscillator2.frequency.setValueAtTime(174.61, now);

        gainNode.gain.setValueAtTime(this.feedbackVolume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator1.start(now);
        oscillator2.start(now + 0.1);
        oscillator1.stop(now + 0.3);
        oscillator2.stop(now + 0.4);
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    setFeedbackVolume(volume) {
        this.feedbackVolume = Math.max(0, Math.min(1, volume));
    }
}

const audioManager = new AudioManager();
