const defaultSettings = {
    gridSize: 6,
    visualMode: 'photos',
    cardBehavior: 'remove',
    masterVolume: 0.7,
    feedbackVolume: 0.5,
    audioIndicator: 'pulse',
    cueing: {
        enabled: false,
        delay: 3000,
        intensity: 'gentle',
        type: 'glow'
    },
    successSound: true,
    errorSound: true
};

class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('sono-settings');
        if (saved) {
            try {
                return { ...defaultSettings, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Error loading settings:', e);
                return { ...defaultSettings };
            }
        }
        return { ...defaultSettings };
    }

    saveSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('sono-settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        audioManager.setMasterVolume(this.settings.masterVolume);
        audioManager.setFeedbackVolume(this.settings.feedbackVolume);
    }

    getSettings() {
        return { ...this.settings };
    }

    resetSettings() {
        this.settings = { ...defaultSettings };
        localStorage.removeItem('sono-settings');
        this.applySettings();
    }
}

const settingsManager = new SettingsManager();

function initSettingsPanel() {
    const gridSizeSelect = document.getElementById('grid-size-select');
    const visualModeSelect = document.getElementById('visual-mode-select');
    const cardBehaviorSelect = document.getElementById('card-behavior-select');
    const masterVolumeSlider = document.getElementById('master-volume-slider');
    const feedbackVolumeSlider = document.getElementById('feedback-volume-slider');
    const audioIndicatorSelect = document.getElementById('audio-indicator-select');
    const cueingEnabledCheckbox = document.getElementById('cueing-enabled-checkbox');
    const cueDelaySlider = document.getElementById('cue-delay-slider');
    const cueIntensitySelect = document.getElementById('cue-intensity-select');
    const cueTypeSelect = document.getElementById('cue-type-select');
    const successSoundCheckbox = document.getElementById('success-sound-checkbox');
    const errorSoundCheckbox = document.getElementById('error-sound-checkbox');

    const settings = settingsManager.getSettings();

    if (gridSizeSelect) gridSizeSelect.value = settings.gridSize;
    if (visualModeSelect) visualModeSelect.value = settings.visualMode;
    if (cardBehaviorSelect) cardBehaviorSelect.value = settings.cardBehavior;
    if (masterVolumeSlider) masterVolumeSlider.value = settings.masterVolume * 100;
    if (feedbackVolumeSlider) feedbackVolumeSlider.value = settings.feedbackVolume * 100;
    if (audioIndicatorSelect) audioIndicatorSelect.value = settings.audioIndicator;
    if (cueingEnabledCheckbox) cueingEnabledCheckbox.checked = settings.cueing.enabled;
    if (cueDelaySlider) cueDelaySlider.value = settings.cueing.delay;
    if (cueIntensitySelect) cueIntensitySelect.value = settings.cueing.intensity;
    if (cueTypeSelect) cueTypeSelect.value = settings.cueing.type;
    if (successSoundCheckbox) successSoundCheckbox.checked = settings.successSound;
    if (errorSoundCheckbox) errorSoundCheckbox.checked = settings.errorSound;

    if (gridSizeSelect) {
        gridSizeSelect.addEventListener('change', (e) => {
            settingsManager.saveSettings({ gridSize: parseInt(e.target.value) });
        });
    }

    if (visualModeSelect) {
        visualModeSelect.addEventListener('change', (e) => {
            settingsManager.saveSettings({ visualMode: e.target.value });
        });
    }

    if (cardBehaviorSelect) {
        cardBehaviorSelect.addEventListener('change', (e) => {
            settingsManager.saveSettings({ cardBehavior: e.target.value });
        });
    }

    if (masterVolumeSlider) {
        masterVolumeSlider.addEventListener('input', (e) => {
            settingsManager.saveSettings({ masterVolume: e.target.value / 100 });
        });
    }

    if (feedbackVolumeSlider) {
        feedbackVolumeSlider.addEventListener('input', (e) => {
            settingsManager.saveSettings({ feedbackVolume: e.target.value / 100 });
        });
    }

    if (audioIndicatorSelect) {
        audioIndicatorSelect.addEventListener('change', (e) => {
            settingsManager.saveSettings({ audioIndicator: e.target.value });
        });
    }

    if (cueingEnabledCheckbox) {
        cueingEnabledCheckbox.addEventListener('change', (e) => {
            const cueing = { ...settings.cueing, enabled: e.target.checked };
            settingsManager.saveSettings({ cueing });
        });
    }

    if (cueDelaySlider) {
        cueDelaySlider.addEventListener('input', (e) => {
            const cueing = { ...settings.cueing, delay: parseInt(e.target.value) };
            settingsManager.saveSettings({ cueing });
        });
    }

    if (cueIntensitySelect) {
        cueIntensitySelect.addEventListener('change', (e) => {
            const cueing = { ...settings.cueing, intensity: e.target.value };
            settingsManager.saveSettings({ cueing });
        });
    }

    if (cueTypeSelect) {
        cueTypeSelect.addEventListener('change', (e) => {
            const cueing = { ...settings.cueing, type: e.target.value };
            settingsManager.saveSettings({ cueing });
        });
    }

    if (successSoundCheckbox) {
        successSoundCheckbox.addEventListener('change', (e) => {
            settingsManager.saveSettings({ successSound: e.target.checked });
        });
    }

    if (errorSoundCheckbox) {
        errorSoundCheckbox.addEventListener('change', (e) => {
            settingsManager.saveSettings({ errorSound: e.target.checked });
        });
    }
}
