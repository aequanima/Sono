const defaultSettings = {
    gridSize: 6,
    visualMode: 'photos',
    cardBehavior: 'remove',
    masterVolume: 0.7,
    feedbackVolume: 0.5,
    audioIndicator: 'pulse',
    cueing: {
        enabled: false,
        delay: 3,
        intensity: 'gentle',
        type: 'glow'
    },
    successSound: true,
    errorSound: true,
    autoAdvance: {
        enabled: false,
        delay: 10000,
        mode: 'interactive'
    }
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
    const cueingEnabledCheckbox = document.getElementById('cueing-enabled-checkbox');
    const cueDelaySlider = document.getElementById('cue-delay-slider');
    const cueIntensitySelect = document.getElementById('cue-intensity-select');
    const cueTypeSelect = document.getElementById('cue-type-select');
    const autoAdvanceEnabledCheckbox = document.getElementById('auto-advance-enabled-checkbox');
    const autoAdvanceDelaySlider = document.getElementById('auto-advance-delay-slider');
    const autoAdvanceModeSelect = document.getElementById('auto-advance-mode-select');

    const settings = settingsManager.getSettings();

    if (gridSizeSelect) gridSizeSelect.value = settings.gridSize;
    if (visualModeSelect) visualModeSelect.value = settings.visualMode;
    if (cardBehaviorSelect) cardBehaviorSelect.value = settings.cardBehavior;
    if (masterVolumeSlider) masterVolumeSlider.value = settings.masterVolume * 100;
    if (feedbackVolumeSlider) feedbackVolumeSlider.value = settings.feedbackVolume * 100;
    if (cueingEnabledCheckbox) cueingEnabledCheckbox.checked = settings.cueing.enabled;
    if (cueDelaySlider) cueDelaySlider.value = settings.cueing.delay / 1000;
    if (cueIntensitySelect) cueIntensitySelect.value = settings.cueing.intensity;
    if (cueTypeSelect) cueTypeSelect.value = settings.cueing.type;
    if (autoAdvanceEnabledCheckbox) autoAdvanceEnabledCheckbox.checked = settings.autoAdvance.enabled;
    if (autoAdvanceDelaySlider) autoAdvanceDelaySlider.value = settings.autoAdvance.delay / 1000;
    if (autoAdvanceModeSelect) autoAdvanceModeSelect.value = settings.autoAdvance.mode;

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

    if (cueingEnabledCheckbox) {
        cueingEnabledCheckbox.addEventListener('change', (e) => {
            const cueing = { ...settings.cueing, enabled: e.target.checked };
            settingsManager.saveSettings({ cueing });
        });
    }

    if (cueDelaySlider) {
        cueDelaySlider.addEventListener('input', (e) => {
            const cueing = { ...settings.cueing, delay: parseInt(e.target.value) * 1000 };
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

    if (autoAdvanceEnabledCheckbox) {
        autoAdvanceEnabledCheckbox.addEventListener('change', (e) => {
            const autoAdvance = { ...settings.autoAdvance, enabled: e.target.checked };
            settingsManager.saveSettings({ autoAdvance });
        });
    }

    if (autoAdvanceDelaySlider) {
        autoAdvanceDelaySlider.addEventListener('input', (e) => {
            const autoAdvance = { ...settings.autoAdvance, delay: parseInt(e.target.value) * 1000 };
            settingsManager.saveSettings({ autoAdvance });
        });
    }

    if (autoAdvanceModeSelect) {
        autoAdvanceModeSelect.addEventListener('change', (e) => {
            const autoAdvance = { ...settings.autoAdvance, mode: e.target.value };
            settingsManager.saveSettings({ autoAdvance });
        });
    }
}
