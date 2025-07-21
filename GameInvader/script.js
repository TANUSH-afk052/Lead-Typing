
const words = [
            // Level 1 - Easy (3-6 letters)
            ['cat', 'dog', 'run', 'jump', 'book', 'code', 'type', 'game', 'play', 'fun', 'fast', 'good'],
            // Level 2 - Medium (4-8 letters)
            ['computer', 'keyboard', 'program', 'function', 'variable', 'string', 'number', 'method', 'object', 'array'],
            // Level 3 - Hard (6-10 letters)
            ['javascript', 'algorithm', 'framework', 'interface', 'database', 'developer', 'programming', 'technology'],
            // Level 4 - Expert (8-12 letters)
            ['authentication', 'optimization', 'implementation', 'architecture', 'configuration', 'documentation'],
            // Level 5 - Master (10+ letters)
            ['internationalization', 'responsibilities', 'characteristics', 'synchronization', 'incomprehensible']
        ];

        let gameState = {
            isPlaying: false,
            score: 0,
            wordsTyped: 0,
            timeLeft: 30,
            activeWords: [],
            wordSpeed: 1.5,
            spawnRate: 2500,
            attempts: 0,
            level: 1,
            maxLevel: 5,
            wordsForNextLevel: 5
        };

        let gameInterval, spawnInterval, timerInterval;
        let highScore = parseInt(localStorage.getItem('typingGameHighScore')) || 0;

        const gameArea = document.getElementById('gameArea');
        const wordInput = document.getElementById('wordInput');
        const scoreElement = document.getElementById('score');
        const timerElement = document.getElementById('timer');
        const wordsTypedElement = document.getElementById('words-typed');
        const highScoreElement = document.getElementById('high-score');
        const levelElement = document.getElementById('level');
        const startScreen = document.querySelector('.start-screen');
        const gameOverScreen = document.getElementById('gameOverScreen');

        function startGame() {
            startScreen.classList.add('hidden');
            gameState.isPlaying = true;
            gameState.score = 0;
            gameState.wordsTyped = 0;
            gameState.timeLeft = 30;
            gameState.activeWords = [];
            gameState.attempts = 0;
            gameState.level = 1;
            gameState.wordSpeed = 1.5;
            gameState.spawnRate = 2500;
            gameState.wordsForNextLevel = 5;
            
            wordInput.disabled = false;
            wordInput.focus();
            
            updateDisplay();
            
            // Start game loops
            gameInterval = setInterval(updateGame, 50);
            spawnInterval = setInterval(spawnWord, gameState.spawnRate);
            timerInterval = setInterval(updateTimer, 1000);
            
            wordInput.addEventListener('input', handleInput);
        }

        function spawnWord() {
            if (!gameState.isPlaying) return;
            
            const currentLevel = Math.min(gameState.level, gameState.maxLevel);
            const levelWords = words[currentLevel - 1];
            const word = levelWords[Math.floor(Math.random() * levelWords.length)];
            
            const wordElement = document.createElement('div');
            wordElement.className = 'word';
            wordElement.textContent = word;
            wordElement.style.left = Math.random() * (gameArea.offsetWidth - 150) + 'px';
            wordElement.style.top = '0px';
            
            gameArea.appendChild(wordElement);
            gameState.activeWords.push({
                element: wordElement,
                word: word,
                y: 0
            });
        }

        function updateGame() {
            if (!gameState.isPlaying) return;
            
            gameState.activeWords = gameState.activeWords.filter(wordObj => {
                wordObj.y += gameState.wordSpeed;
                wordObj.element.style.top = wordObj.y + 'px';
                
                // Remove words that fall off screen
                if (wordObj.y > gameArea.offsetHeight - 100) {
                    wordObj.element.remove();
                    return false;
                }
                return true;
            });
        }

        function handleInput(e) {
            const inputValue = e.target.value.trim().toLowerCase();
            
            if (inputValue === '') return;
            
            // Check if input matches any active word
            const matchedWordIndex = gameState.activeWords.findIndex(
                wordObj => wordObj.word.toLowerCase() === inputValue
            );
            
            if (matchedWordIndex !== -1) {
                const matchedWord = gameState.activeWords[matchedWordIndex];
                
                // Add bonus time animation class
                matchedWord.element.classList.add('bonus-time');
                
                // Add floating +3s text
                showTimeBonusText(matchedWord.element);
                
                // Update score and stats
                gameState.score += 2;
                gameState.wordsTyped++;
                gameState.timeLeft = Math.min(gameState.timeLeft + 3, 99); // Cap at 99 seconds
                
                // Check for level up
                if (gameState.wordsTyped % gameState.wordsForNextLevel === 0 && gameState.level < gameState.maxLevel) {
                    levelUp();
                }
                
                // Remove word after animation
                setTimeout(() => {
                    matchedWord.element.remove();
                }, 500);
                
                // Remove from active words array
                gameState.activeWords.splice(matchedWordIndex, 1);
                
                // Clear input
                wordInput.value = '';
                
                updateDisplay();
            }
            
            gameState.attempts++;
        }

        function showTimeBonusText(wordElement) {
            const bonusText = document.createElement('div');
            bonusText.className = 'time-bonus-text';
            bonusText.textContent = '+3s';
            bonusText.style.left = wordElement.style.left;
            bonusText.style.top = wordElement.style.top;
            
            gameArea.appendChild(bonusText);
            
            setTimeout(() => {
                bonusText.remove();
            }, 1000);
        }

        function levelUp() {
            gameState.level++;
            gameState.wordSpeed += 0.5; // Increase speed
            gameState.spawnRate = Math.max(gameState.spawnRate - 300, 800); // Faster spawning, min 0.8s
            gameState.wordsForNextLevel += 2; // More words needed for next level
            
            // Restart spawn interval with new rate
            clearInterval(spawnInterval);
            spawnInterval = setInterval(spawnWord, gameState.spawnRate);
            
            // Show level up notification
            showLevelUpNotification();
        }

        function showLevelUpNotification() {
            const notification = document.createElement('div');
            notification.innerHTML = `🎉 LEVEL ${gameState.level} 🎉`;
            notification.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 2rem;
                font-weight: bold;
                color: #FFD700;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                z-index: 50;
                animation: celebration 2s ease-in-out;
            `;
            
            gameArea.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 2000);
        }

        function updateTimer() {
            gameState.timeLeft--;
            timerElement.textContent = gameState.timeLeft;
            
            if (gameState.timeLeft <= 10) {
                timerElement.classList.add('timer-warning');
            }
            
            if (gameState.timeLeft <= 0) {
                endGame();
            }
        }

        function updateDisplay() {
            scoreElement.textContent = gameState.score;
            wordsTypedElement.textContent = gameState.wordsTyped;
            levelElement.textContent = gameState.level;
            highScoreElement.textContent = highScore;
            
            // Animate high score if it's a new record
            if (gameState.score > highScore) {
                highScoreElement.classList.add('new-high-score');
                setTimeout(() => {
                    highScoreElement.classList.remove('new-high-score');
                }, 2000);
            }
        }

        function endGame() {
            gameState.isPlaying = false;
            
            // Clear intervals
            clearInterval(gameInterval);
            clearInterval(spawnInterval);
            clearInterval(timerInterval);
            
            // Disable input
            wordInput.disabled = true;
            wordInput.removeEventListener('input', handleInput);
            
            // Clear active words
            gameState.activeWords.forEach(wordObj => wordObj.element.remove());
            gameState.activeWords = [];
            
            // Check and save high score
            const isNewHighScore = gameState.score > highScore;
            if (isNewHighScore) {
                highScore = gameState.score;
                localStorage.setItem('typingGameHighScore', highScore.toString());
                document.getElementById('newHighScoreRow').style.display = 'flex';
            } else {
                document.getElementById('newHighScoreRow').style.display = 'none';
            }
            
            // Calculate stats
            const accuracy = gameState.attempts > 0 ? Math.round((gameState.wordsTyped / gameState.attempts) * 100) : 100;
            const wpm = Math.round(gameState.wordsTyped * 2); // 30 seconds = 0.5 minutes, so multiply by 2
            
            // Show game over screen
            document.getElementById('finalScore').textContent = gameState.score;
            document.getElementById('finalWords').textContent = gameState.wordsTyped;
            document.getElementById('finalLevel').textContent = gameState.level;
            document.getElementById('accuracy').textContent = accuracy + '%';
            document.getElementById('wpm').textContent = wpm;
            
            gameOverScreen.classList.remove('hidden');
        }

        function restartGame() {
            gameOverScreen.classList.add('hidden');
            timerElement.classList.remove('timer-warning');
            startScreen.classList.remove('hidden');
        }

        // Initialize high score display on page load
        document.addEventListener('DOMContentLoaded', function() {
            highScoreElement.textContent = highScore;
        });

        // Prevent form submission on Enter key
        wordInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });