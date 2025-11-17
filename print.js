class PrintManager {
    constructor() {
        this.subjects = [];
        this.imageMode = 'graphic';
    }

    setSubjects(subjects, imageMode) {
        this.subjects = subjects;
        this.imageMode = imageMode;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    async generateBingoCards(numSheets, rows, cols) {
        const totalCards = rows * cols;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sonō Bingo Cards</title>
                <style>
                    @page {
                        size: letter;
                        margin: 0.5in;
                    }
                    
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                    }
                    
                    .bingo-sheet {
                        page-break-after: always;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }
                    
                    .bingo-sheet:last-child {
                        page-break-after: auto;
                    }
                    
                    .bingo-title {
                        text-align: center;
                        font-size: 2em;
                        font-weight: bold;
                        margin-bottom: 20px;
                    }
                    
                    .bingo-grid {
                        display: grid;
                        grid-template-columns: repeat(${cols}, 1fr);
                        grid-template-rows: repeat(${rows}, 1fr);
                        gap: 10px;
                        max-width: 7in;
                        max-height: 7in;
                        width: 100%;
                    }
                    
                    .bingo-card {
                        border: 2px solid #333;
                        border-radius: 0.25in;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: white;
                        padding: 10px;
                    }
                    
                    .bingo-card img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                    }
                    
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
        `);

        for (let sheet = 0; sheet < numSheets; sheet++) {
            let selectedCards = [];
            
            if (this.subjects.length >= totalCards) {
                selectedCards = this.shuffleArray(this.subjects).slice(0, totalCards);
            } else {
                while (selectedCards.length < totalCards) {
                    selectedCards.push(...this.shuffleArray(this.subjects));
                }
                selectedCards = selectedCards.slice(0, totalCards);
            }
            
            printWindow.document.write(`
                <div class="bingo-sheet">
                    <div class="bingo-title">SONŌ BINGO</div>
                    <div class="bingo-grid">
            `);
            
            for (const subject of selectedCards) {
                const imagePath = `assets/images/${this.imageMode}/${subject}.png`;
                const fullImagePath = window.location.origin + window.location.pathname.replace('index.html', '') + imagePath;
                
                printWindow.document.write(`
                    <div class="bingo-card">
                        <img src="${fullImagePath}" alt="${subject.replace(/_/g, ' ')}" />
                    </div>
                `);
            }
            
            printWindow.document.write(`
                    </div>
                </div>
            `);
        }
        
        printWindow.document.write(`
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
            }, 500);
        };
    }

    async generateCueCards(cardSize = 4) {
        const printWindow = window.open('', '_blank');
        
        const cardsPerRow = cardSize === 3 ? 3 : 2;
        const cardsPerPage = cardsPerRow * cardsPerRow;
        const cardSizeIn = `${cardSize}in`;
        const fontSize = cardSize === 3 ? '14pt' : '18pt';
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sonō Cue Cards</title>
                <style>
                    @page {
                        size: letter;
                        margin: 0.25in;
                    }
                    
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                    }
                    
                    .cue-cards-page {
                        page-break-after: always;
                        width: 100%;
                        height: 100%;
                    }
                    
                    .cue-cards-page:last-child {
                        page-break-after: auto;
                    }
                    
                    .cue-cards-grid {
                        display: grid;
                        grid-template-columns: repeat(${cardsPerRow}, ${cardSizeIn});
                        grid-template-rows: repeat(${cardsPerRow}, ${cardSizeIn});
                        gap: 0.25in;
                    }
                    
                    .cue-card {
                        width: ${cardSizeIn};
                        height: ${cardSizeIn};
                        border: 2px solid #333;
                        border-radius: 0.25in;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: white;
                        padding: 0.25in;
                        box-sizing: border-box;
                    }
                    
                    .cue-card img {
                        max-width: 100%;
                        max-height: 80%;
                        object-fit: contain;
                    }
                    
                    .cue-card-label {
                        margin-top: 10px;
                        font-size: ${fontSize};
                        font-weight: bold;
                        text-align: center;
                    }
                    
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
        `);
        const totalPages = Math.ceil(this.subjects.length / cardsPerPage);
        
        for (let page = 0; page < totalPages; page++) {
            const startIdx = page * cardsPerPage;
            const endIdx = Math.min(startIdx + cardsPerPage, this.subjects.length);
            const pageSubjects = this.subjects.slice(startIdx, endIdx);
            
            printWindow.document.write(`
                <div class="cue-cards-page">
                    <div class="cue-cards-grid">
            `);
            
            for (const subject of pageSubjects) {
                const imagePath = `assets/images/${this.imageMode}/${subject}.png`;
                const fullImagePath = window.location.origin + window.location.pathname.replace('index.html', '') + imagePath;
                const label = subject.replace(/_/g, ' ');
                
                printWindow.document.write(`
                    <div class="cue-card">
                        <img src="${fullImagePath}" alt="${label}" />
                        <div class="cue-card-label">${label}</div>
                    </div>
                `);
            }
            
            printWindow.document.write(`
                    </div>
                </div>
            `);
        }
        
        printWindow.document.write(`
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
            }, 500);
        };
    }
}

const printManager = new PrintManager();
