let wordList = [];
let currentWords = [];
let currentPassphrase = '';
let autocompleteIndex = -1;

const signResources = {
    lifeprint: { name: 'Lifeprint', domain: 'lifeprint.com', enabled: true },
    spreadthesign: { name: 'SpreadTheSign', domain: 'spreadthesign.com', enabled: true }
};

async function loadWordList() {
    const response = await fetch('words.json');
    const rawWordList = await response.json();
    
    wordList = rawWordList.map(word => ({
        word: word,
        source: 'lifeprint'
    }));
    
    try {
        const stsResponse = await fetch('spreadthesign_words.json');
        if (stsResponse.ok) {
            const stsWordList = await stsResponse.json();
            stsWordList.forEach(stsWord => {
                if (!wordList.some(w => w.word === stsWord.word)) {
                    wordList.push({
                        word: stsWord.word,
                        source: 'spreadthesign',
                        id: stsWord.id
                    });
                }
            });
        }
    } catch (e) {
        console.log('SpreadTheSign words not loaded:', e);
    }
    
    const savedResources = localStorage.getItem('signResources');
    if (savedResources) {
        Object.assign(signResources, JSON.parse(savedResources));
    }
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

function generatePassphrase(words) {
    const indices = words.map(wordObj => {
        const index = wordList.findIndex(w => w.word === wordObj.word);
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
        
        const decodedWords = indices.map(index => {
            if (index >= wordList.length) {
                throw new Error('Invalid word index');
            }
            return wordList[index];
        });
        
        return decodedWords;
    } catch (e) {
        console.error('Decode error:', e);
        throw new Error('Invalid passphrase');
    }
}

function renderWordList() {
    const container = document.getElementById('word-list');
    const emptyState = document.getElementById('empty-state');
    
    if (currentWords.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }
    
    const existingItems = container.querySelectorAll('.word-item');
    existingItems.forEach(item => item.remove());
    
    currentWords.slice().reverse().forEach((wordObj, reverseIndex) => {
        const index = currentWords.length - 1 - reverseIndex;
        const item = document.createElement('div');
        item.className = 'word-item';
        item.dataset.word = wordObj.word;
        
        const wordText = document.createElement('span');
        wordText.textContent = wordObj.word.replace(/_/g, ' ');
        
        const sourceSpan = document.createElement('span');
        sourceSpan.className = 'autocomplete-item-source';
        sourceSpan.textContent = `[${signResources[wordObj.source].domain}]`;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-word-btn';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', () => {
            removeWordWithAnimation(item, index);
        });
        
        item.appendChild(wordText);
        item.appendChild(sourceSpan);
        item.appendChild(removeBtn);
        container.appendChild(item);
    });
}

function removeWordWithAnimation(item, index) {
    gsap.to(item, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
            currentWords.splice(index, 1);
            renderWordList();
        }
    });
}

function renderSavedWordList() {
    const container = document.getElementById('saved-word-list');
    container.innerHTML = '';
    currentWords.forEach(wordObj => {
        const item = document.createElement('div');
        item.className = 'saved-word-item';
        
        const wordText = document.createElement('span');
        wordText.textContent = wordObj.word.replace(/_/g, ' ');

        const sourceSpan = document.createElement('span');
        sourceSpan.className = 'autocomplete-item-source';
        sourceSpan.textContent = `[${signResources[wordObj.source].domain}]`;

        item.appendChild(wordText);
        item.appendChild(sourceSpan);

        item.addEventListener('click', () => loadSignInIframe(wordObj));
        container.appendChild(item);
    });
}

function loadSignInIframe(wordObj) {
    let url;
    
    if (wordObj && wordObj.source === 'spreadthesign' && wordObj.id) {
        url = `https://spreadthesign.com/en.us/word/${wordObj.id}/${wordObj.word}/`;
    } else {
        const firstLetter = wordObj.word.charAt(0).toLowerCase();
        url = `https://lifeprint.com/asl101/pages-signs/${firstLetter}/${wordObj.word}.htm`;
    }
    
    document.getElementById('sign-iframe').src = url;
    
    document.querySelectorAll('.saved-word-item').forEach(item => {
        item.classList.remove('active');
        if (item.textContent.replace(/ /g, '_') === wordObj.word) {
            item.classList.add('active');
        }
    });
}

function showAutocomplete(value) {
    const container = document.getElementById('autocomplete-container');
    
    if (!value) {
        container.classList.remove('active');
        return;
    }
    
    const normalizedValue = value.toLowerCase().replace(/ /g, '_');
    const matches = wordList.filter(wordObj => 
        signResources[wordObj.source].enabled && 
        wordObj.word.toLowerCase().startsWith(normalizedValue)
    ).slice(0, 10);
    
    if (matches.length === 0) {
        container.classList.remove('active');
        return;
    }
    
    container.innerHTML = '';
    matches.forEach((wordObj, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        
        const wordSpan = document.createElement('span');
        wordSpan.className = 'autocomplete-item-word';
        wordSpan.textContent = wordObj.word.replace(/_/g, ' ');
        
        const sourceSpan = document.createElement('span');
        sourceSpan.className = 'autocomplete-item-source';
        sourceSpan.textContent = `[${signResources[wordObj.source].domain}]`;
        
        item.appendChild(wordSpan);
        item.appendChild(sourceSpan);
        item.style.opacity = '0';
        item.addEventListener('click', () => {
            addWord(wordObj.word);
            document.getElementById('word-input').value = '';
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

function addWord(word) {
    const inputRow = document.querySelector('.input-row');
    const words = word.split(',').map(w => w.trim().toLowerCase().replace(/ /g, '_')).filter(w => w !== '');

    if (words.length === 0) {
        return;
    }

    const addedWords = [];
    const invalidWords = [];

    words.forEach(w => {
        const wordObj = wordList.find(wo => wo.word === w);
        if (wordObj) {
            if (!currentWords.some(cw => cw.word === w)) {
                addedWords.push(wordObj);
            }
        } else {
            invalidWords.push(w);
        }
    });


    if (invalidWords.length > 0) {
        inputRow.classList.add('error');
        setTimeout(() => inputRow.classList.remove('error'), 500);
        return;
    }

    if (addedWords.length > 0) {
        currentWords.push(...addedWords);
        renderWordList();
        inputRow.classList.add('success');
        setTimeout(() => inputRow.classList.remove('success'), 500);
    }
}

function animateWordAddition(word) {
    const wordListContainer = document.getElementById('word-list');
    const existingItems = Array.from(wordListContainer.querySelectorAll('.word-item'));

    renderWordList();
    
    const newItem = wordListContainer.firstChild;
    
    if (!newItem) return;

    const itemHeight = newItem.offsetHeight;
    const gap = 12;

    gsap.set(newItem, {
        opacity: 0
    });

    if (existingItems.length > 0) {
        gsap.set(existingItems, {
        });
    }

    gsap.to(newItem, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out'
    });
}

function showPassphraseModal() {
    currentPassphrase = generatePassphrase(currentWords);
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
        await loadWordList();
        console.log('Word list loaded:', wordList.length, 'words');
        
        initLanguagePanel();
        initResourcesPanel();
        
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
        showToast('CRITICAL ERROR: Could not load the word list.', 'error', 5000);
        return;
    }
    
    const createBtn = document.getElementById('create-btn');
    console.log('Create button element:', createBtn);
    createBtn.addEventListener('click', (e) => {
        console.log('Create button clicked', e);
        currentWords = [];
        showScreen('entry-screen');
        setTimeout(() => {
            document.getElementById('word-input').focus();
        }, 100);
    });
    
    document.getElementById('retrieve-btn').addEventListener('click', () => {
        console.log('Retrieve button clicked');
        document.getElementById('passphrase-input-container').classList.remove('hidden');
    });
    
    document.getElementById('load-btn').addEventListener('click', () => {
        const passphrase = document.getElementById('passphrase-input').value.trim().replace(/ /g, '-');
        try {
            currentWords = decodePassphrase(passphrase);
            renderSavedWordList();
            showScreen('list-view-screen');
            setTimeout(() => {
                const sidebar = document.querySelector('.sidebar');
                sidebar.classList.add('slide-in');
                if (window.innerWidth > 768) {
                    sidebar.classList.remove('mobile-open');
                }
            }, 50);
        } catch (e) {
            showToast(t('invalidPassphrase'), 'error');
        }
    });
    
    const wordInput = document.getElementById('word-input');
    wordInput.addEventListener('input', (e) => {
        showAutocomplete(e.target.value);
    });
    
    wordInput.addEventListener('keydown', (e) => {
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
                addWord(wordInput.value);
                wordInput.value = '';
                container.classList.remove('active');
            }
        }
    });
    
    document.getElementById('enter-btn').addEventListener('click', () => {
        const word = wordInput.value;
        addWord(word);
        wordInput.value = '';
        document.getElementById('autocomplete-container').classList.remove('active');
    });
    
    document.getElementById('save-btn').addEventListener('click', () => {
        if (currentWords.length === 0) {
            showToast(t('addAtLeastOneWord'), 'error');
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
        const shareUrl = `https://dndrt.com/signs/${currentPassphrase}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Sign Share - ASL Word List',
                    text: 'Check out this ASL word list!',
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
    
    document.getElementById('proceed-btn').addEventListener('click', () => {
        hidePassphraseModal();
        renderSavedWordList();
        showScreen('list-view-screen');
        setTimeout(() => {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.add('slide-in');
            if (window.innerWidth > 768) {
                sidebar.classList.remove('mobile-open');
            }
        }, 50);
    });
    
    document.getElementById('modal-close-btn').addEventListener('click', () => {
        hidePassphraseModal();
    });
    
    document.getElementById('passphrase-btn').addEventListener('click', () => {
        showPassphraseModal();
    });
    
    document.getElementById('edit-btn').addEventListener('click', () => {
        renderWordList();
        showScreen('entry-screen');
        setTimeout(() => {
            document.getElementById('word-input').focus();
        }, 100);
    });
    
    document.getElementById('hamburger-btn').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('mobile-open');
    });
    
    document.querySelector('.iframe-container').addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            document.querySelector('.sidebar').classList.remove('mobile-open');
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
    
    document.getElementById('entry-settings-btn').addEventListener('click', () => {
        const panel = document.getElementById('resources-panel');
        panel.classList.toggle('open');
    });
    
    document.getElementById('resources-panel-close').addEventListener('click', () => {
        document.getElementById('resources-panel').classList.remove('open');
    });
    
    document.addEventListener('click', (e) => {
        const languagePanel = document.getElementById('language-panel');
        const localizationBtn = document.getElementById('localization-btn');
        if (languagePanel.classList.contains('open') && 
            !languagePanel.contains(e.target) && 
            !localizationBtn.contains(e.target)) {
            languagePanel.classList.remove('open');
        }
        
        const resourcesPanel = document.getElementById('resources-panel');
        const entrySettingsBtn = document.getElementById('entry-settings-btn');
        if (resourcesPanel && resourcesPanel.classList.contains('open') && 
            !resourcesPanel.contains(e.target) && 
            entrySettingsBtn && !entrySettingsBtn.contains(e.target)) {
            resourcesPanel.classList.remove('open');
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

function initResourcesPanel() {
    const resourcesList = document.getElementById('resources-list');
    
    Object.keys(signResources).forEach(resourceKey => {
        const resource = signResources[resourceKey];
        const item = document.createElement('div');
        item.className = 'language-item';
        item.textContent = resource.name;
        item.dataset.resource = resourceKey;
        
        if (resource.enabled) {
            item.classList.add('active');
        }
        
        item.addEventListener('click', () => {
            resource.enabled = !resource.enabled;
            item.classList.toggle('active');
            
            localStorage.setItem('signResources', JSON.stringify(signResources));
        });
        
        resourcesList.appendChild(item);
    });
}

function checkForPassphraseInURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const passphraseParam = urlParams.get('passphrase');
    
    if (passphraseParam) {
        try {
            currentWords = decodePassphrase(passphraseParam);
            renderSavedWordList();
            showScreen('list-view-screen');
            setTimeout(() => {
                const sidebar = document.querySelector('.sidebar');
                sidebar.classList.add('slide-in');
                if (window.innerWidth > 768) {
                    sidebar.classList.remove('mobile-open');
                }
            }, 50);
        } catch (e) {
            console.error('Invalid passphrase in URL:', e);
            showToast(t('invalidPassphrase'), 'error');
        }
    }
    
    const pathMatch = window.location.pathname.match(/\/signs\/([a-z-]+)/);
    if (pathMatch && pathMatch[1]) {
        try {
            currentWords = decodePassphrase(pathMatch[1]);
            renderSavedWordList();
            showScreen('list-view-screen');
            setTimeout(() => {
                const sidebar = document.querySelector('.sidebar');
                sidebar.classList.add('slide-in');
                if (window.innerWidth > 768) {
                    sidebar.classList.remove('mobile-open');
                }
            }, 50);
        } catch (e) {
            console.error('Invalid passphrase in path:', e);
            showToast(t('invalidPassphrase'), 'error');
        }
    }
}