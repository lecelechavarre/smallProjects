class Calculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.history = [];
        this.isDarkTheme = false;
        
        this.initializeElements();
        this.loadFromLocalStorage();
        this.updateDisplay();
        this.setupEventListeners();
    }

    initializeElements() {
        this.currentOperationElement = document.getElementById('current-operation');
        this.previousOperationElement = document.getElementById('previous-operation');
        this.historyListElement = document.getElementById('history-list');
        this.themeToggle = document.getElementById('theme-toggle');
        this.clearHistoryButton = document.getElementById('clear-history');
    }

    setupEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.getAttribute('data-number'));
                this.addButtonPressEffect(button);
            });
        });

        // Operation buttons
        document.querySelectorAll('[data-operation]').forEach(button => {
            button.addEventListener('click', () => {
                this.chooseOperation(button.getAttribute('data-operation'));
                this.addButtonPressEffect(button);
            });
        });

        // Action buttons
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.getAttribute('data-action');
                if (action === 'clear') {
                    this.clear();
                } else if (action === 'delete') {
                    this.delete();
                } else if (action === 'calculate') {
                    this.calculate();
                }
                this.addButtonPressEffect(button);
            });
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Clear history
        this.clearHistoryButton.addEventListener('click', () => {
            this.clearHistory();
        });

        // Keyboard support
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardInput(event);
        });
    }

    addButtonPressEffect(button) {
        button.classList.add('btn-pressed');
        setTimeout(() => {
            button.classList.remove('btn-pressed');
        }, 200);
    }

    handleKeyboardInput(event) {
        // Prevent default behavior for calculator keys
        if (/[0-9+\-*/.=]|Enter|Escape|Backspace/.test(event.key)) {
            event.preventDefault();
        }
        
        if (/[0-9]/.test(event.key)) {
            this.appendNumber(event.key);
        } else if (event.key === '.') {
            this.appendNumber('.');
        } else if (['+', '-', '*', '/'].includes(event.key)) {
            let operation;
            switch(event.key) {
                case '+': operation = '+'; break;
                case '-': operation = '-'; break;
                case '*': operation = '×'; break;
                case '/': operation = '÷'; break;
            }
            this.chooseOperation(operation);
        } else if (event.key === 'Enter' || event.key === '=') {
            this.calculate();
        } else if (event.key === 'Escape') {
            this.clear();
        } else if (event.key === 'Backspace') {
            this.delete();
        }
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
        
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        
        if (this.previousOperand !== '') {
            this.calculate();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        
        this.updateDisplay();
    }

    calculate() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError("Cannot divide by zero!");
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Add to history
        const historyEntry = `${this.previousOperand} ${this.operation} ${this.currentOperand} = ${computation}`;
        this.history.unshift(historyEntry);
        if (this.history.length > 10) {
            this.history.pop();
        }
        
        this.currentOperand = this.formatResult(computation);
        this.operation = undefined;
        this.previousOperand = '';
        
        this.updateDisplay();
        this.updateHistory();
        this.saveToLocalStorage();
    }

    formatResult(result) {
        // Format the result to avoid long decimal numbers
        if (!Number.isInteger(result)) {
            return parseFloat(result.toFixed(8)).toString();
        }
        return result.toString();
    }

    showError(message) {
        this.currentOperand = "Error";
        this.updateDisplay();
        setTimeout(() => {
            this.clear();
        }, 1500);
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }

    updateDisplay() {
        this.currentOperationElement.textContent = this.currentOperand;
        
        if (this.operation != null) {
            this.previousOperationElement.textContent = 
                `${this.previousOperand} ${this.operation}`;
        } else {
            this.previousOperationElement.textContent = '';
        }
    }

    updateHistory() {
        this.historyListElement.innerHTML = '';
        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = item;
            this.historyListElement.appendChild(historyItem);
        });
    }

    clearHistory() {
        this.history = [];
        this.updateHistory();
        this.saveToLocalStorage();
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.body.classList.toggle('dark-theme', this.isDarkTheme);
        
        const icon = this.themeToggle.querySelector('i');
        if (this.isDarkTheme) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        
        localStorage.setItem('calculator-theme', this.isDarkTheme ? 'dark' : 'light');
    }

    saveToLocalStorage() {
        localStorage.setItem('calculator-history', JSON.stringify(this.history));
    }

    loadFromLocalStorage() {
        // Load history
        const savedHistory = localStorage.getItem('calculator-history');
        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
            this.updateHistory();
        }
        
        // Load theme
        const savedTheme = localStorage.getItem('calculator-theme');
        if (savedTheme === 'dark') {
            this.isDarkTheme = true;
            document.body.classList.add('dark-theme');
            const icon = this.themeToggle.querySelector('i');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});