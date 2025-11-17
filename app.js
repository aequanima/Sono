let subjectList = [];
let currentSubjects = [];
let currentPassphrase = '';
let autocompleteIndex = -1;

async function loadSubjectList() {
    const response = await fetch('subjects.json');
    subjectList = await response.json();
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

const passphraseWords = [
    'alpha', 'bravo', 'coast', 'delta', 'eagle', 'flame', 'grace', 'heart', 'iris', 'jazz',
    'kite', 'light', 'moon', 'nova', 'olive', 'pearl', 'quest', 'river', 'sun', 'tide',
    'unity', 'vista', 'wave', 'amber', 'bird', 'coral', 'dawn', 'echo', 'frost', 'glow',
    'haze', 'jade', 'kelp', 'leaf', 'mint', 'nest', 'opal', 'pine', 'quartz', 'rain',
    'sage', 'teal', 'violet', 'willow', 'ash', 'blaze', 'cedar', 'dusk', 'elm', 'fern',
    'grove', 'haven', 'indigo', 'lotus', 'meadow', 'nectar', 'ocean', 'petal', 'rose', 'silk',
    'terra', 'crystal', 'shadow', 'breeze', 'spark', 'zenith', 'aurora', 'comet', 'glacier', 'harmony',
    'karma', 'lagoon', 'mystic', 'nebula', 'orchid', 'prism', 'ripple', 'serenity', 'thunder', 'velvet',
    'whisper', 'zephyr', 'azure', 'bronze', 'cascade', 'ember', 'galaxy', 'horizon', 'ivory', 'jasmine',
    'lava', 'marble', 'nimbus', 'onyx', 'phoenix', 'quasar', 'radiance', 'sapphire', 'topaz', 'universe',
    'vortex', 'waterfall', 'xenon', 'yarrow', 'zodiac', 'abyss', 'beacon', 'citrus', 'driftwood', 'eclipse',
    'firefly', 'granite', 'hurricane', 'iceberg', 'jungle', 'kayak', 'lightning', 'meteor', 'nautilus', 'obsidian',
    'parrot', 'quicksand', 'rainbow', 'starlight', 'tsunami', 'ultramarine', 'volcano', 'windmill', 'xylophone', 'yellowstone',
    'anchor', 'bamboo', 'canyon', 'dolphin', 'equinox', 'flamingo', 'geyser', 'hummingbird', 'igloo', 'jellyfish',
    'koala', 'lantern', 'magnolia', 'narwhal', 'osprey', 'peacock', 'quokka', 'redwood', 'seahorse', 'toucan',
    'umbrella', 'valkyrie', 'walrus', 'xylograph', 'yucca', 'zircon', 'acorn', 'blossom', 'cobalt', 'daisy',
    'emerald', 'falcon', 'garnet', 'hyacinth', 'iris', 'juniper', 'kestrel', 'lavender', 'marigold', 'nightingale',
    'otter', 'pansy', 'quail', 'raven', 'sparrow', 'tangerine', 'urchin', 'violet', 'wren', 'xerus',
    'yak', 'zebra', 'agate', 'beryl', 'clover', 'dragonfly', 'egret', 'firefly', 'goldfish', 'heron',
    'ibex', 'jackal', 'kiwi', 'llama', 'mantis', 'newt', 'orchid', 'panther', 'quetzal', 'rhino',
    'salmon', 'tiger', 'unicorn', 'viper', 'whale', 'xerus', 'yellowfin', 'zebu', 'albatross', 'beetle',
    'cobra', 'dove', 'eagle', 'fox', 'gazelle', 'hawk', 'impala', 'jaguar', 'kingfisher', 'leopard',
    'macaw', 'nightjar', 'owl', 'puffin', 'quoll', 'raccoon', 'swan', 'turtle', 'urial', 'vulture',
    'wolf', 'yeti', 'zebrafish', 'ant', 'bee', 'crane', 'deer', 'eel', 'finch', 'goose',
    'hare', 'iguana', 'jay', 'kite', 'lynx', 'mole', 'newt', 'orca', 'pike', 'quail',
    'rat', 'seal', 'toad', 'urchin', 'vole', 'wasp'
];

function generatePassphrase(subjects) {
    const indices = subjects.map(subject => {
        const index = subjectList.findIndex(s => s === subject);
        return index === -1 ? 0 : index;
    });
    
    let number = BigInt(0);
    const base = BigInt(2048);
    
    for (let i = 0; i < indices.length; i++) {
        number = number * base + BigInt(indices[i]);
    }
    
    number = number * BigInt(2048) + BigInt(indices.length);
    
    const passphraseWordList = [];
    const passphraseBase = BigInt(passphraseWords.length);
    
    if (number === BigInt(0)) {
        return passphraseWords[0];
    }
    
    while (number > BigInt(0)) {
        const remainder = Number(number % passphraseBase);
        passphraseWordList.unshift(passphraseWords[remainder]);
        number = number / passphraseBase;
    }
    
    return passphraseWordList.join('-');
}

function decodePassphrase(passphrase) {
    try {
        if (!passphrase || passphrase.trim() === '') {
            return [];
        }
        const parts = passphrase.split('-');
        let number = BigInt(0);
        const passphraseBase = BigInt(passphraseWords.length);
        
        for (const part of parts) {
            const wordIndex = passphraseWords.indexOf(part.toLowerCase());
            if (wordIndex === -1) {
                throw new Error(`Invalid word in passphrase: ${part}`);
            }
            number = number * passphraseBase + BigInt(wordIndex);
        }
        
        const wordCount = Number(number % BigInt(2048));
        number = number / BigInt(2048);
        
        const indices = [];
        const base = BigInt(2048);
        
        for (let i = 0; i < wordCount; i++) {
            const index = Number(number % base);
            indices.unshift(index);
            number = number / base;
        }
        
        const decodedSubjects = indices.map(index => {
            if (index >= subjectList.length) {
                throw new Error('Invalid subject index');
            }
            return subjectList[index];
        });
        
        return decodedSubjects;
    } catch (e) {
        console.error('Decode error:', e);
        throw new Error('Invalid passphrase');
    }
}

async function getSubjectImagePath(subject) {
    const imageMode = settingsManager.getSettings().visualMode || 'graphic';
    return `assets/images/${imageMode}/${subject}.png`;
}

async function renderSubjectList() {
    const container = document.getElementById('subject-list');
    const emptyState = document.getElementById('empty-state');
    
    if (currentSubjects.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }
    
    const existingItems = container.querySelectorAll('.subject-item');
    existingItems.forEach(item => item.remove());
    
    for (const [reverseIndex, subject] of currentSubjects.slice().reverse().entries()) {
        const index = currentSubjects.length - 1 - reverseIndex;
        const item = document.createElement('div');
        item.className = 'subject-item';
        item.dataset.subject = subject;
        
        const imagePath = await getSubjectImagePath(subject);
        const img = document.createElement('img');
        img.src = imagePath;
        img.className = 'subject-item-image';
        img.alt = subject;
        img.addEventListener('click', () => previewSubjectSound(subject));

        const subjectText = document.createElement('span');
        subjectText.textContent = subject.replace(/_/g, ' ');
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-subject-btn';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', () => {
            removeSubjectWithAnimation(item, index);
        });
        
        item.appendChild(img);
        item.appendChild(subjectText);
        item.appendChild(removeBtn);
        container.appendChild(item);
    }
    
    updateSubjectCount();
}

function removeSubjectWithAnimation(item, index) {
    gsap.to(item, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
            currentSubjects.splice(index, 1);
            renderSubjectList();
        }
    });
}

async function previewSubjectSound(subject) {
    try {
        await audioManager.playSoundForSubject(subject);
    } catch (error) {
        console.error('Error playing sound:', error);
        showToast(t('errorPlayingSound'), 'error');
    }
}

function updateSubjectCount() {
    const countDisplay = document.getElementById('subject-count');
    if (countDisplay) {
        countDisplay.textContent = `${currentSubjects.length} ${currentSubjects.length === 1 ? t('subject') : t('subjects')}`;
        countDisplay.classList.add('count-changed');
        setTimeout(() => countDisplay.classList.remove('count-changed'), 400);
    }
}


function showAutocomplete(value) {
    const container = document.getElementById('autocomplete-container');
    
    if (!value) {
        container.classList.remove('active');
        return;
    }
    
    const normalizedValue = value.toLowerCase().replace(/ /g, '_');
    const matches = subjectList.filter(subject => 
        subject.toLowerCase().startsWith(normalizedValue)
    ).slice(0, 10);
    
    if (matches.length === 0) {
        container.classList.remove('active');
        return;
    }
    
    container.innerHTML = '';
    matches.forEach((subject, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        
        const subjectSpan = document.createElement('span');
        subjectSpan.className = 'autocomplete-item-word';
        subjectSpan.textContent = subject.replace(/_/g, ' ');
        
        item.appendChild(subjectSpan);
        item.style.opacity = '0';
        item.addEventListener('click', () => {
            addSubject(subject);
            document.getElementById('subject-input').value = '';
            container.classList.remove('active');
        });
        container.appendChild(item);
        
        gsap.to(item, {
            opacity: 1,
            duration: 0.2,
            delay: index * 0.05,
            ease: 'power2.out'
        });
    });
    
    container.classList.add('active');
    autocompleteIndex = -1;
}

function addSubject(subject) {
    const inputRow = document.querySelector('.input-row');
    const subjects = subject.split(',').map(s => s.trim().toLowerCase().replace(/ /g, '_')).filter(s => s !== '');

    if (subjects.length === 0) {
        return;
    }

    const addedSubjects = [];
    const invalidSubjects = [];
    const duplicates = [];

    subjects.forEach(s => {
        if (subjectList.includes(s)) {
            if (!currentSubjects.includes(s)) {
                addedSubjects.push(s);
            } else {
                duplicates.push(s);
            }
        } else {
            invalidSubjects.push(s);
        }
    });

    if (invalidSubjects.length > 0) {
        inputRow.classList.add('error');
        setTimeout(() => inputRow.classList.remove('error'), 500);
        showToast(t('invalidSubject'), 'error');
        return;
    }

    if (duplicates.length > 0) {
        inputRow.classList.add('error');
        setTimeout(() => inputRow.classList.remove('error'), 500);
        showToast(t('duplicateSubject'), 'error');
        return;
    }

    if (addedSubjects.length > 0) {
        currentSubjects.push(...addedSubjects);
        renderSubjectList();
        updateSubjectCount();
        inputRow.classList.add('success');
        setTimeout(() => inputRow.classList.remove('success'), 500);
    }
}


function showPassphraseModal() {
    currentPassphrase = generatePassphrase(currentSubjects);
    document.getElementById('passphrase-display').textContent = currentPassphrase;
    document.getElementById('passphrase-modal').classList.remove('hidden');
}

function hidePassphraseModal() {
    document.getElementById('passphrase-modal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, starting app...');
    
    const loadingOverlay = document.getElementById('loading-overlay');
    let showLoader = false;
    
    const loaderTimeout = setTimeout(() => {
        showLoader = true;
        loadingOverlay.style.opacity = '1';
    }, 500);
    
    initLocalization();
    
    try {
        await loadSubjectList();
        console.log('Subject list loaded:', subjectList.length, 'subjects');
        
        initLanguagePanel();
        initSettingsPanel();
        
        clearTimeout(loaderTimeout);
        
        if (showLoader) {
            gsap.to(loadingOverlay, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    loadingOverlay.classList.add('hidden');
                }
            });
        } else {
            loadingOverlay.classList.add('hidden');
        }
        
        checkForPassphraseInURL();
    } catch (error) {
        console.error('Failed to load word list:', error);
        clearTimeout(loaderTimeout);
        loadingOverlay.classList.add('hidden');
        showToast('CRITICAL ERROR: Could not load the subject list.', 'error', 5000);
        return;
    }
    
    const createBtn = document.getElementById('create-btn');
    createBtn.addEventListener('click', (e) => {
        currentSubjects = [];
        showScreen('entry-screen');
        updateSubjectCount();
        setTimeout(() => {
            document.getElementById('subject-input').focus();
        }, 100);
    });
    
    document.getElementById('retrieve-btn').addEventListener('click', () => {
        document.getElementById('passphrase-input-container').classList.remove('hidden');
    });
    
    document.getElementById('load-btn').addEventListener('click', async () => {
        const passphrase = document.getElementById('passphrase-input').value.trim().replace(/ /g, '-');
        try {
            currentSubjects = decodePassphrase(passphrase);
            
            const gridSize = settingsManager.getSettings().gridSize;
            if (currentSubjects.length < gridSize) {
                showToast(`${t('needMoreSubjects')} ${gridSize} ${t('forGridSize')}`, 'error');
                return;
            }
            
            showScreen('game-screen');
            showToast(t('loadingGame'), 'info');
            await startGame(currentSubjects, settingsManager.getSettings());
        } catch (e) {
            showToast(t('invalidPassphrase'), 'error');
        }
    });
    
    const subjectInput = document.getElementById('subject-input');
    subjectInput.addEventListener('input', (e) => {
        showAutocomplete(e.target.value);
    });
    
    subjectInput.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('save-btn').click();
            return;
        }
        
        const container = document.getElementById('autocomplete-container');
        const items = container.querySelectorAll('.autocomplete-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (items.length > 0) {
                autocompleteIndex = Math.min(autocompleteIndex + 1, items.length - 1);
                items.forEach((item, i) => {
                    item.classList.toggle('selected', i === autocompleteIndex);
                });
                if (autocompleteIndex >= 0) {
                    items[autocompleteIndex].scrollIntoView({ block: 'nearest' });
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (items.length > 0) {
                if (autocompleteIndex === -1) {
                    autocompleteIndex = 0;
                } else {
                    autocompleteIndex = Math.max(autocompleteIndex - 1, 0);
                }
                items.forEach((item, i) => {
                    item.classList.toggle('selected', i === autocompleteIndex);
                });
                items[autocompleteIndex].scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (autocompleteIndex >= 0 && items[autocompleteIndex]) {
                items[autocompleteIndex].click();
            } else if (items.length === 1) {
                items[0].click();
            } else {
                addSubject(subjectInput.value);
                subjectInput.value = '';
                container.classList.remove('active');
            }
        }
    });
    
    document.getElementById('enter-btn').addEventListener('click', () => {
        const subject = subjectInput.value;
        addSubject(subject);
        subjectInput.value = '';
        document.getElementById('autocomplete-container').classList.remove('active');
    });
    
    document.getElementById('save-btn').addEventListener('click', () => {
        if (currentSubjects.length === 0) {
            showToast(t('addAtLeastOneSubject'), 'error');
            return;
        }
        
        const gridSize = settingsManager.getSettings().gridSize;
        if (currentSubjects.length < gridSize) {
            showToast(`${t('needMoreSubjects')} ${gridSize} ${t('forGridSize')}`, 'error');
            return;
        }
        
        showPassphraseModal();
    });
    
    const copyBtn = document.getElementById('copy-btn');
    copyBtn.addEventListener('click', async () => {
        const originalText = copyBtn.textContent;
        try {
            await navigator.clipboard.writeText(currentPassphrase);
            copyBtn.textContent = '✓ Copied!';
            copyBtn.style.pointerEvents = 'none';
            showToast(t('passphraseCopied'), 'success');
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.pointerEvents = 'auto';
            }, 2000);
        } catch (e) {
            prompt(t('copyPassphrase'), currentPassphrase);
        }
    });
    
    document.getElementById('share-btn').addEventListener('click', async () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?passphrase=${currentPassphrase}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Sonō - Sound Set',
                    text: 'Check out this sound matching game!',
                    url: shareUrl
                });
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.error('Error sharing:', e);
                    window.open(shareUrl, '_blank');
                }
            }
        } else {
            window.open(shareUrl, '_blank');
        }
    });
    
    document.getElementById('proceed-btn').addEventListener('click', async () => {
        hidePassphraseModal();
        showScreen('game-screen');
        showToast(t('loadingGame'), 'info');
        await startGame(currentSubjects, settingsManager.getSettings());
    });
    
    document.getElementById('modal-close-btn').addEventListener('click', () => {
        hidePassphraseModal();
    });
    
    document.getElementById('entry-settings-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('settings-modal').classList.remove('hidden');
    });
    
    document.getElementById('audio-indicator')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (currentGame) {
            await currentGame.replayCurrentSound();
        }
    });
    
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'play-again-btn' || e.target.closest('#play-again-btn')) {
            showToast(t('loadingGame'), 'info');
            await startGame(currentSubjects, settingsManager.getSettings());
        }
    });
    
    document.getElementById('logo-btn').addEventListener('click', () => {
        window.open('https://dndrt.com', '_blank');
    });
    
    document.getElementById('localization-btn').addEventListener('click', () => {
        const panel = document.getElementById('language-panel');
        panel.classList.toggle('open');
    });
    
    document.getElementById('language-panel-close').addEventListener('click', () => {
        document.getElementById('language-panel').classList.remove('open');
    });
    
    document.getElementById('vision-btn').addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        localStorage.setItem('high-contrast', isHighContrast);
    });
    
    if (localStorage.getItem('high-contrast') === 'true') {
        document.body.classList.add('high-contrast');
    }
    
    document.getElementById('settings-modal-close')?.addEventListener('click', () => {
        document.getElementById('settings-modal').classList.add('hidden');
    });
    
    document.getElementById('print-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        printManager.setSubjects(currentSubjects, settingsManager.getSettings().visualMode);
        document.getElementById('print-modal').classList.remove('hidden');
    });
    
    document.getElementById('print-modal-close')?.addEventListener('click', () => {
        document.getElementById('print-modal').classList.add('hidden');
    });
    
    document.getElementById('print-type-select')?.addEventListener('change', (e) => {
        const bingoOptions = document.getElementById('bingo-options');
        if (e.target.value === 'bingo') {
            bingoOptions.style.display = 'block';
        } else {
            bingoOptions.style.display = 'none';
        }
    });
    
    document.getElementById('generate-print-btn')?.addEventListener('click', async () => {
        const printType = document.getElementById('print-type-select').value;
        
        if (printType === 'bingo') {
            const numSheets = parseInt(document.getElementById('num-sheets').value);
            const rows = parseInt(document.getElementById('print-grid-rows').value);
            const cols = parseInt(document.getElementById('print-grid-cols').value);
            const totalCards = rows * cols;
            
            if (currentSubjects.length < totalCards) {
                showToast(`Need at least ${totalCards} subjects for ${rows}×${cols} grid`, 'error');
                return;
            }
            
            await printManager.generateBingoCards(numSheets, rows, cols);
        } else if (printType === 'cue3') {
            await printManager.generateCueCards(3);
        } else if (printType === 'cue4') {
            await printManager.generateCueCards(4);
        }
        
        document.getElementById('print-modal').classList.add('hidden');
    });
    
    document.addEventListener('click', (e) => {
        const languagePanel = document.getElementById('language-panel');
        const localizationBtn = document.getElementById('localization-btn');
        if (languagePanel.classList.contains('open') && 
            !languagePanel.contains(e.target) && 
            !localizationBtn.contains(e.target)) {
            languagePanel.classList.remove('open');
        }
        
    });
});

function initLanguagePanel() {
    const languageList = document.getElementById('language-list');
    const languages = getAvailableLanguages();
    
    languages.forEach(lang => {
        const item = document.createElement('div');
        item.className = 'language-item';
        item.textContent = lang.name;
        item.dataset.lang = lang.code;
        
        if (lang.code === currentLanguage) {
            item.classList.add('active');
        }
        
        item.addEventListener('click', () => {
            document.querySelectorAll('.language-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            setLanguage(lang.code);
            
            setTimeout(() => {
                document.getElementById('language-panel').classList.remove('open');
            }, 300);
        });
        
        languageList.appendChild(item);
    });
}


async function checkForPassphraseInURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const passphraseParam = urlParams.get('passphrase');
    
    if (passphraseParam) {
        try {
            currentSubjects = decodePassphrase(passphraseParam);
            
            const gridSize = settingsManager.getSettings().gridSize;
            if (currentSubjects.length < gridSize) {
                showToast(`${t('needMoreSubjects')} ${gridSize} ${t('forGridSize')}`, 'error');
                return;
            }
            
            showScreen('game-screen');
            showToast(t('loadingGame'), 'info');
            await startGame(currentSubjects, settingsManager.getSettings());
        } catch (e) {
            console.error('Invalid passphrase in URL:', e);
            showToast(t('invalidPassphrase'), 'error');
        }
    }
}