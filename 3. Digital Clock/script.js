// script.js
/**
 * Time Master Application
 * Digital Clock + Timer + Stopwatch
 * Senior Developer Implementation
 */

// Module Pattern for better organization and avoiding global scope pollution
const TimeMasterApp = (function() {
    // DOM Elements
    const elements = {
        // Tabs
        tabButtons: document.querySelectorAll('.tab-button'),
        tabPanes: document.querySelectorAll('.tab-pane'),
        
        // Clock
        clockDisplay: document.getElementById('clockDisplay'),
        dateDisplay: document.getElementById('dateDisplay'),
        timezoneDisplay: document.getElementById('timezoneDisplay'),
        themeToggle: document.getElementById('themeToggle'),
        
        // Timer
        timerDisplay: document.getElementById('timerDisplay'),
        minutesInput: document.getElementById('minutesInput'),
        secondsInput: document.getElementById('secondsInput'),
        timerStart: document.getElementById('timerStart'),
        timerPause: document.getElementById('timerPause'),
        timerReset: document.getElementById('timerReset'),
        timerAlert: document.getElementById('timerAlert'),
        timerAlertSound: document.getElementById('timerAlertSound'),
        
        // Stopwatch
        stopwatchDisplay: document.getElementById('stopwatchDisplay'),
        stopwatchStart: document.getElementById('stopwatchStart'),
        stopwatchPause: document.getElementById('stopwatchPause'),
        stopwatchReset: document.getElementById('stopwatchReset'),
        stopwatchLap: document.getElementById('stopwatchLap'),
        lapsList: document.getElementById('lapsList'),
        
        // Footer
        currentYear: document.getElementById('currentYear')
    };

    // State management
    const state = {
        // Clock
        currentTheme: localStorage.getItem('theme') || 'light',
        
        // Timer
        timer: {
            intervalId: null,
            totalSeconds: 0,
            isRunning: false,
            isExpired: false
        },
        
        // Stopwatch
        stopwatch: {
            intervalId: null,
            elapsedTime: 0,
            isRunning: false,
            startTime: 0,
            laps: [],
            lastLapTime: 0
        }
    };

    // Utility functions
    const utils = {
        // Format time with leading zeros
        formatTime: (value) => value.toString().padStart(2, '0'),
        
        // Format milliseconds to MM:SS:MS
        formatMilliseconds: (ms) => {
            const hours = Math.floor(ms / 3600000);
            const minutes = Math.floor((ms % 3600000) / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            const milliseconds = Math.floor((ms % 1000) / 10);
            
            if (hours > 0) {
                return `${utils.formatTime(hours)}:${utils.formatTime(minutes)}:${utils.formatTime(seconds)}`;
            }
            
            return `${utils.formatTime(minutes)}:${utils.formatTime(seconds)}.${utils.formatTime(milliseconds)}`;
        },
        
        // Format seconds to HH:MM:SS
        formatSeconds: (totalSeconds) => {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            if (hours > 0) {
                return `${utils.formatTime(hours)}:${utils.formatTime(minutes)}:${utils.formatTime(seconds)}`;
            }
            
            return `${utils.formatTime(minutes)}:${utils.formatTime(seconds)}`;
        },
        
        // Debounce function to limit rapid fire events
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // Clock module
    const clockModule = {
        init: () => {
            // Set initial theme
            document.documentElement.setAttribute('data-theme', state.currentTheme);
            clockModule.updateThemeButton();
            
            // Update clock immediately and then every second
            clockModule.updateClock();
            setInterval(clockModule.updateClock, 1000);
            
            // Set current year in footer
            elements.currentYear.textContent = new Date().getFullYear();
            
            // Theme toggle event
            elements.themeToggle.addEventListener('click', clockModule.toggleTheme);
        },
        
        updateClock: () => {
            const now = new Date();
            
            // Format time
            const hours = utils.formatTime(now.getHours());
            const minutes = utils.formatTime(now.getMinutes());
            const seconds = utils.formatTime(now.getSeconds());
            
            // Update time display
            elements.clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;
            
            // Update date display
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            elements.dateDisplay.textContent = now.toLocaleDateString('en-US', options);
            
            // Update timezone display
            elements.timezoneDisplay.textContent = `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
        },
        
        toggleTheme: () => {
            state.currentTheme = state.currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', state.currentTheme);
            localStorage.setItem('theme', state.currentTheme);
            clockModule.updateThemeButton();
        },
        
        updateThemeButton: () => {
            const icon = elements.themeToggle.querySelector('i');
            const text = state.currentTheme === 'light' ? 'Dark Mode' : 'Light Mode';
            icon.className = state.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            elements.themeToggle.innerHTML = `${icon.outerHTML} ${text}`;
        }
    };

    // Timer module
    const timerModule = {
        init: () => {
            // Set initial timer display
            timerModule.updateTimerDisplay(5 * 60); // 5 minutes default
            
            // Event listeners
            elements.timerStart.addEventListener('click', timerModule.startTimer);
            elements.timerPause.addEventListener('click', timerModule.pauseTimer);
            elements.timerReset.addEventListener('click', timerModule.resetTimer);
            
            // Input validation
            elements.minutesInput.addEventListener('input', timerModule.validateInputs);
            elements.secondsInput.addEventListener('input', timerModule.validateInputs);
            
            // Update timer display when inputs change
            elements.minutesInput.addEventListener('change', timerModule.updateTimerFromInputs);
            elements.secondsInput.addEventListener('change', timerModule.updateTimerFromInputs);
        },
        
        validateInputs: () => {
            // Ensure inputs stay within valid ranges
            if (parseInt(elements.minutesInput.value) > 60) elements.minutesInput.value = 60;
            if (parseInt(elements.minutesInput.value) < 0) elements.minutesInput.value = 0;
            if (parseInt(elements.secondsInput.value) > 59) elements.secondsInput.value = 59;
            if (parseInt(elements.secondsInput.value) < 0) elements.secondsInput.value = 0;
        },
        
        updateTimerFromInputs: () => {
            const minutes = parseInt(elements.minutesInput.value) || 0;
            const seconds = parseInt(elements.secondsInput.value) || 0;
            state.timer.totalSeconds = minutes * 60 + seconds;
            timerModule.updateTimerDisplay(state.timer.totalSeconds);
            timerModule.updateAlertMessage();
        },
        
        updateTimerDisplay: (totalSeconds) => {
            elements.timerDisplay.textContent = utils.formatSeconds(totalSeconds);
            
            // Add warning class when time is low
            if (totalSeconds <= 10 && totalSeconds > 0) {
                elements.timerDisplay.classList.add('timer-expired');
            } else {
                elements.timerDisplay.classList.remove('timer-expired');
            }
        },
        
        updateAlertMessage: () => {
            const minutes = Math.floor(state.timer.totalSeconds / 60);
            const seconds = state.timer.totalSeconds % 60;
            
            let message = `Timer set for `;
            if (minutes > 0) message += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
            if (minutes > 0 && seconds > 0) message += ' and ';
            if (seconds > 0) message += `${seconds} second${seconds !== 1 ? 's' : ''}`;
            message += `. Click start to begin.`;
            
            elements.timerAlert.textContent = message;
        },
        
        startTimer: () => {
            if (state.timer.isRunning) return;
            
            // If timer is expired or hasn't been set, get values from inputs
            if (state.timer.isExpired || state.timer.totalSeconds === 0) {
                timerModule.updateTimerFromInputs();
            }
            
            if (state.timer.totalSeconds <= 0) return;
            
            state.timer.isRunning = true;
            state.timer.isExpired = false;
            
            // Update button states
            elements.timerStart.disabled = true;
            elements.timerPause.disabled = false;
            elements.minutesInput.disabled = true;
            elements.secondsInput.disabled = true;
            
            // Start the timer interval
            state.timer.intervalId = setInterval(() => {
                state.timer.totalSeconds--;
                timerModule.updateTimerDisplay(state.timer.totalSeconds);
                
                // Check if timer has finished
                if (state.timer.totalSeconds <= 0) {
                    timerModule.timerFinished();
                }
            }, 1000);
            
            elements.timerAlert.textContent = 'Timer started...';
            elements.timerAlert.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
            elements.timerAlert.style.color = 'var(--secondary-color)';
        },
        
        pauseTimer: () => {
            if (!state.timer.isRunning) return;
            
            clearInterval(state.timer.intervalId);
            state.timer.isRunning = false;
            
            // Update button states
            elements.timerStart.disabled = false;
            elements.timerPause.disabled = true;
            
            elements.timerAlert.textContent = 'Timer paused';
            elements.timerAlert.style.backgroundColor = 'rgba(243, 156, 18, 0.1)';
            elements.timerAlert.style.color = 'var(--warning-color)';
        },
        
        resetTimer: () => {
            // Clear interval if running
            if (state.timer.isRunning) {
                clearInterval(state.timer.intervalId);
            }
            
            // Reset state
            state.timer.isRunning = false;
            state.timer.isExpired = false;
            
            // Reset button states
            elements.timerStart.disabled = false;
            elements.timerPause.disabled = true;
            elements.minutesInput.disabled = false;
            elements.secondsInput.disabled = false;
            
            // Reset to input values
            timerModule.updateTimerFromInputs();
            
            elements.timerAlert.textContent = 'Timer reset';
            elements.timerAlert.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
            elements.timerAlert.style.color = 'var(--primary-color)';
            elements.timerDisplay.classList.remove('timer-expired');
        },
        
        timerFinished: () => {
            clearInterval(state.timer.intervalId);
            state.timer.isRunning = false;
            state.timer.isExpired = true;
            
            // Update button states
            elements.timerStart.disabled = false;
            elements.timerPause.disabled = true;
            elements.minutesInput.disabled = false;
            elements.secondsInput.disabled = false;
            
            // Play alert sound
            elements.timerAlertSound.play().catch(e => console.log("Audio play failed:", e));
            
            // Update UI
            elements.timerAlert.textContent = 'Time\'s up! Timer finished.';
            elements.timerAlert.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
            elements.timerAlert.style.color = 'var(--danger-color)';
            
            // Flash the display
            let flashCount = 0;
            const flashInterval = setInterval(() => {
                elements.timerDisplay.classList.toggle('timer-expired');
                flashCount++;
                
                if (flashCount >= 10) {
                    clearInterval(flashInterval);
                }
            }, 500);
        }
    };

    // Stopwatch module
    const stopwatchModule = {
        init: () => {
            // Event listeners
            elements.stopwatchStart.addEventListener('click', stopwatchModule.startStopwatch);
            elements.stopwatchPause.addEventListener('click', stopwatchModule.pauseStopwatch);
            elements.stopwatchReset.addEventListener('click', stopwatchModule.resetStopwatch);
            elements.stopwatchLap.addEventListener('click', stopwatchModule.recordLap);
            
            // Load laps from localStorage
            stopwatchModule.loadLaps();
        },
        
        startStopwatch: () => {
            if (state.stopwatch.isRunning) return;
            
            state.stopwatch.isRunning = true;
            state.stopwatch.startTime = Date.now() - state.stopwatch.elapsedTime;
            state.stopwatch.lastLapTime = state.stopwatch.elapsedTime;
            
            // Update button states
            elements.stopwatchStart.disabled = true;
            elements.stopwatchPause.disabled = false;
            elements.stopwatchReset.disabled = true;
            elements.stopwatchLap.disabled = false;
            
            // Start the stopwatch interval (update every 10ms for millisecond accuracy)
            state.stopwatch.intervalId = setInterval(() => {
                state.stopwatch.elapsedTime = Date.now() - state.stopwatch.startTime;
                elements.stopwatchDisplay.textContent = utils.formatMilliseconds(state.stopwatch.elapsedTime);
            }, 10);
        },
        
        pauseStopwatch: () => {
            if (!state.stopwatch.isRunning) return;
            
            clearInterval(state.stopwatch.intervalId);
            state.stopwatch.isRunning = false;
            
            // Update button states
            elements.stopwatchStart.disabled = false;
            elements.stopwatchPause.disabled = true;
            elements.stopwatchReset.disabled = false;
            elements.stopwatchLap.disabled = true;
        },
        
        resetStopwatch: () => {
            if (state.stopwatch.isRunning) {
                clearInterval(state.stopwatch.intervalId);
            }
            
            state.stopwatch.elapsedTime = 0;
            state.stopwatch.isRunning = false;
            state.stopwatch.startTime = 0;
            state.stopwatch.lastLapTime = 0;
            
            // Update display and button states
            elements.stopwatchDisplay.textContent = '00:00:00.00';
            elements.stopwatchStart.disabled = false;
            elements.stopwatchPause.disabled = true;
            elements.stopwatchReset.disabled = true;
            elements.stopwatchLap.disabled = true;
            
            // Clear laps
            state.stopwatch.laps = [];
            stopwatchModule.renderLaps();
            stopwatchModule.saveLaps();
        },
        
        recordLap: () => {
            if (!state.stopwatch.isRunning) return;
            
            const currentTime = state.stopwatch.elapsedTime;
            const lapTime = currentTime - state.stopwatch.lastLapTime;
            state.stopwatch.lastLapTime = currentTime;
            
            // Add lap to array
            state.stopwatch.laps.unshift({
                lapNumber: state.stopwatch.laps.length + 1,
                lapTime: lapTime,
                totalTime: currentTime,
                timestamp: new Date().toLocaleTimeString()
            });
            
            // Keep only last 20 laps
            if (state.stopwatch.laps.length > 20) {
                state.stopwatch.laps.pop();
            }
            
            // Update UI and save to localStorage
            stopwatchModule.renderLaps();
            stopwatchModule.saveLaps();
        },
        
        renderLaps: () => {
            // Clear current laps
            elements.lapsList.innerHTML = '';
            
            // Add each lap to the list
            state.stopwatch.laps.forEach((lap, index) => {
                const li = document.createElement('li');
                li.className = `lap-item ${index === 0 ? 'current' : ''}`;
                
                li.innerHTML = `
                    <span>Lap ${lap.lapNumber}</span>
                    <span>${utils.formatMilliseconds(lap.lapTime)}</span>
                    <span>${utils.formatMilliseconds(lap.totalTime)}</span>
                `;
                
                elements.lapsList.appendChild(li);
            });
            
            // If no laps, show message
            if (state.stopwatch.laps.length === 0) {
                const li = document.createElement('li');
                li.className = 'lap-item';
                li.textContent = 'No lap times recorded yet. Click "Lap" to record a lap time.';
                elements.lapsList.appendChild(li);
            }
        },
        
        saveLaps: () => {
            try {
                localStorage.setItem('stopwatchLaps', JSON.stringify(state.stopwatch.laps));
            } catch (e) {
                console.warn('Could not save laps to localStorage:', e);
            }
        },
        
        loadLaps: () => {
            try {
                const savedLaps = localStorage.getItem('stopwatchLaps');
                if (savedLaps) {
                    state.stopwatch.laps = JSON.parse(savedLaps);
                    stopwatchModule.renderLaps();
                }
            } catch (e) {
                console.warn('Could not load laps from localStorage:', e);
            }
        }
    };

    // Tab switching module
    const tabModule = {
        init: () => {
            // Add click event to all tab buttons
            elements.tabButtons.forEach(button => {
                button.addEventListener('click', tabModule.switchTab);
            });
        },
        
        switchTab: (event) => {
            const targetTab = event.currentTarget.getAttribute('data-tab');
            
            // Update active tab button
            elements.tabButtons.forEach(button => {
                button.classList.remove('active');
            });
            event.currentTarget.classList.add('active');
            
            // Show selected tab pane, hide others
            elements.tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetTab) {
                    pane.classList.add('active');
                }
            });
            
            // Pause any running timers/stopwatches when switching tabs
            if (targetTab !== 'timer' && state.timer.isRunning) {
                timerModule.pauseTimer();
            }
            
            if (targetTab !== 'stopwatch' && state.stopwatch.isRunning) {
                stopwatchModule.pauseStopwatch();
            }
        }
    };

    // Public API
    return {
        init: () => {
            // Initialize all modules
            clockModule.init();
            timerModule.init();
            stopwatchModule.init();
            tabModule.init();
            
            // Log initialization
            console.log('Time Master App initialized successfully.');
        }
    };
})();

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', TimeMasterApp.init);