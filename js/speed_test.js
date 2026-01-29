class SpeedTest {
    constructor() {
        this.questions = speedQuestions;
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.questions.length).fill(null);
        this.isAnswerChecked = false;
        this.wrongQuestions = [];
        this.startTime = Date.now();
        this.timeLeft = 20 * 60; // 20 минут в секундах
        
        this.initElements();
        this.loadQuestion();
        this.startTimer();
    }
    
    initElements() {
        // Основные элементы
        this.questionImage = document.getElementById('questionImage');
        this.questionText = document.getElementById('questionText');
        this.answersContainer = document.getElementById('answersContainer');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.finishBtn = document.getElementById('finishBtn');
        this.resultContainer = document.getElementById('resultContainer');
        this.questionContainer = document.getElementById('questionContainer');
        this.reviewContainer = document.getElementById('reviewContainer');
        this.reviewList = document.getElementById('reviewList');
        
        // Элементы прогресса
        this.progressFill = document.getElementById('progressFill');
        this.questionCounter = document.getElementById('questionCounter');
        this.progressPercent = document.getElementById('progressPercent');
        this.currentQuestion = document.getElementById('currentQuestion');
        this.imageCounter = document.getElementById('imageCounter');
        this.statusText = document.getElementById('statusText');
        
        // Элементы таймера
        this.timer = document.getElementById('timer');
        
        // Элементы результатов
        this.scoreValue = document.getElementById('scoreValue');
        this.scorePercentage = document.getElementById('scorePercentage');
        this.correctCount = document.getElementById('correctCount');
        this.wrongCount = document.getElementById('wrongCount');
        this.timeSpent = document.getElementById('timeSpent');
        this.resultMessage = document.getElementById('resultMessage');
        this.progressRing = document.querySelector('.progress-ring-fill');
        
        // Обработчики событий
        this.prevBtn.addEventListener('click', () => this.prevQuestion());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.finishBtn.addEventListener('click', () => this.finishTest());
        
        document.getElementById('restartBtn').addEventListener('click', () => this.restartTest());
        document.getElementById('returnBtn').addEventListener('click', () => {
            if (window.opener && !window.opener.closed) {
                window.opener.focus();
            }
            window.close();
        });
        
        document.getElementById('reviewBtn').addEventListener('click', () => this.showReview());
    }
    
    loadQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        
        // Загрузка изображения
        this.questionImage.src = question.image;
        this.questionImage.alt = `Вопрос ${question.id}`;
        
        // Загрузка текста вопроса
        this.questionText.textContent = question.question;
        
        // Обновление счетчиков
        this.currentQuestion.textContent = question.id;
        this.imageCounter.textContent = `${question.id}/${this.questions.length}`;
        
        // Очистка контейнера ответов
        this.answersContainer.innerHTML = '';
        
        // Создание вариантов ответов
        question.answers.forEach((answer, index) => {
            const answerElement = document.createElement('div');
            answerElement.className = 'answer-option';
            answerElement.dataset.index = index;
            
            // Буква ответа (A, B, C, ...)
            const letter = String.fromCharCode(65 + index);
            
            answerElement.innerHTML = `
                <div class="answer-letter">${letter}</div>
                <div class="answer-text">${answer}</div>
            `;
            
            // Выделение выбранного ответа
            if (this.userAnswers[this.currentQuestionIndex] === index) {
                answerElement.classList.add('selected');
            }
            
            // Обработчик клика
            answerElement.addEventListener('click', () => this.selectAnswer(index));
            this.answersContainer.appendChild(answerElement);
        });
        
        // Показ правильного ответа (если уже отвечали)
        if (this.userAnswers[this.currentQuestionIndex] !== null && this.isAnswerChecked) {
            this.showCorrectAnswer();
        }
        
        // Обновление навигации и прогресса
        this.updateNavigation();
        this.updateProgress();
    }
    
    selectAnswer(answerIndex) {
        if (this.isAnswerChecked) return;
        
        // Сохранение ответа пользователя
        this.userAnswers[this.currentQuestionIndex] = answerIndex;
        
        // Визуальное выделение выбранного ответа
        const answerElements = this.answersContainer.querySelectorAll('.answer-option');
        answerElements.forEach(el => el.classList.remove('selected'));
        answerElements[answerIndex].classList.add('selected');
        
        // Показ правильного ответа через задержку
        setTimeout(() => {
            this.showCorrectAnswer();
            this.isAnswerChecked = true;
            this.updateNavigation();
        }, 500);
    }
    
    showCorrectAnswer() {
        const question = this.questions[this.currentQuestionIndex];
        const answerElements = this.answersContainer.querySelectorAll('.answer-option');
        
        answerElements.forEach((element, index) => {
            if (index === question.correctAnswer) {
                element.classList.add('correct');
            } else if (index === this.userAnswers[this.currentQuestionIndex] && 
                      index !== question.correctAnswer) {
                element.classList.add('wrong');
            }
        });
    }
    
    updateNavigation() {
        // Кнопка "Назад"
        this.prevBtn.disabled = this.currentQuestionIndex === 0;
        
        // Проверка, последний ли вопрос
        const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;
        
        if (isLastQuestion) {
            this.nextBtn.style.display = 'none';
            this.finishBtn.style.display = 'flex';
        } else {
            this.nextBtn.style.display = 'flex';
            this.finishBtn.style.display = 'none';
        }
        
        // Блокировка кнопок если не ответили
        this.nextBtn.disabled = !this.isAnswerChecked && 
                               this.userAnswers[this.currentQuestionIndex] === null;
        
        // Проверка, все ли вопросы отвечены
        const allAnswered = this.userAnswers.every(answer => answer !== null);
        this.finishBtn.disabled = !allAnswered;
        
        // Обновление текста статуса
        if (this.userAnswers[this.currentQuestionIndex] === null) {
            this.statusText.textContent = 'Выберите ответ';
            this.statusText.style.color = '';
        } else if (this.isAnswerChecked) {
            const isCorrect = this.userAnswers[this.currentQuestionIndex] === 
                            this.questions[this.currentQuestionIndex].correctAnswer;
            this.statusText.textContent = isCorrect ? 'Правильно!' : 'Неверно!';
            this.statusText.style.color = isCorrect ? '#10b981' : '#ef4444';
        }
    }
    
    updateProgress() {
        // Расчет прогресса
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressPercent.textContent = `${Math.round(progress)}%`;
        
        // Обновление счетчика вопросов
        this.questionCounter.textContent = 
            `Вопрос ${this.currentQuestionIndex + 1} из ${this.questions.length}`;
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.finishTest();
                return;
            }
            
            this.timeLeft--;
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            this.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Изменение цвета при малом времени
            if (this.timeLeft <= 60) {
                this.timer.style.color = '#ef4444';
                this.timer.style.animation = 'pulse 1s infinite';
            }
        }, 1000);
    }
    
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.isAnswerChecked = this.userAnswers[this.currentQuestionIndex] !== null;
            this.loadQuestion();
        }
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1 && this.isAnswerChecked) {
            this.currentQuestionIndex++;
            this.isAnswerChecked = this.userAnswers[this.currentQuestionIndex] !== null;
            this.loadQuestion();
        }
    }
    
    finishTest() {
        // Остановка таймера
        clearInterval(this.timerInterval);
        
        // Расчет результатов
        const correctCount = this.calculateCorrectAnswers();
        const totalQuestions = this.questions.length;
        const percentage = Math.round((correctCount / totalQuestions) * 100);
        
        // Время прохождения теста
        const timeSpent = Date.now() - this.startTime;
        const minutes = Math.floor(timeSpent / 60000);
        const seconds = Math.floor((timeSpent % 60000) / 1000);
        
        // Сохранение неправильных вопросов
        this.wrongQuestions = [];
        this.questions.forEach((question, index) => {
            if (this.userAnswers[index] !== question.correctAnswer) {
                this.wrongQuestions.push({
                    question: question,
                    userAnswer: this.userAnswers[index],
                    correctAnswer: question.correctAnswer
                });
            }
        });
        
        // Обновление UI с результатами
        this.updateResultsUI(correctCount, totalQuestions, percentage, minutes, seconds);
        
        // Анимация прогресс-ринга
        this.animateProgressRing(percentage);
        
        // Показ контейнера с результатами
        this.questionContainer.style.display = 'none';
        this.resultContainer.style.display = 'block';
    }
    
    calculateCorrectAnswers() {
        let correct = 0;
        this.questions.forEach((question, index) => {
            if (this.userAnswers[index] === question.correctAnswer) {
                correct++;
            }
        });
        return correct;
    }
    
    updateResultsUI(correctCount, totalQuestions, percentage, minutes, seconds) {
        // Основные показатели
        this.scoreValue.textContent = correctCount;
        this.scorePercentage.textContent = `${percentage}%`;
        this.correctCount.textContent = correctCount;
        this.wrongCount.textContent = totalQuestions - correctCount;
        this.timeSpent.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Сообщение в зависимости от результата
        let message = '';
        if (percentage >= 90) {
            message = 'Отличный результат! Вы прекрасно знаете правила скорости движения.';
        } else if (percentage >= 70) {
            message = 'Хороший результат. Рекомендуем повторить сложные моменты.';
        } else if (percentage >= 50) {
            message = 'Удовлетворительный результат. Необходима дополнительная подготовка.';
        } else {
            message = 'Требуется серьезная подготовка. Рекомендуем изучить теорию заново.';
        }
        
        this.resultMessage.textContent = message;
    }
    
    animateProgressRing(percentage) {
        const radius = 90;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        
        // Установка начального состояния
        this.progressRing.style.strokeDasharray = circumference;
        this.progressRing.style.strokeDashoffset = circumference;
        
        // Анимация
        setTimeout(() => {
            this.progressRing.style.transition = 'stroke-dashoffset 1.5s ease';
            this.progressRing.style.strokeDashoffset = offset;
        }, 100);
    }
    
    showReview() {
        if (this.wrongQuestions.length === 0) {
            alert('У вас нет ошибок для просмотра!');
            return;
        }
        
        let html = '';
        this.wrongQuestions.forEach((wrong, index) => {
            const q = wrong.question;
            const userAnswer = q.answers[wrong.userAnswer];
            const correctAnswer = q.answers[wrong.correctAnswer];
            
            html += `
                <div class="review-item">
                    <div class="review-question">
                        ${q.id}. ${q.question}
                    </div>
                    <img src="${q.image}" alt="Вопрос ${q.id}" class="review-image">
                    <div class="review-answers">
                        <div class="review-answer wrong">
                            <div class="answer-label">Ваш ответ:</div>
                            <div>${userAnswer || 'Не отвечено'}</div>
                        </div>
                        <div class="review-answer correct">
                            <div class="answer-label">Правильный ответ:</div>
                            <div>${correctAnswer}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        this.reviewList.innerHTML = html;
        this.resultContainer.style.display = 'none';
        this.reviewContainer.style.display = 'block';
    }
    
    restartTest() {
        // Сброс всех данных
        this.currentQuestionIndex = 0;
        this.userAnswers.fill(null);
        this.isAnswerChecked = false;
        this.wrongQuestions = [];
        this.startTime = Date.now();
        this.timeLeft = 20 * 60;
        
        // Сброс UI
        this.questionContainer.style.display = 'block';
        this.resultContainer.style.display = 'none';
        this.reviewContainer.style.display = 'none';
        
        // Сброс таймера
        clearInterval(this.timerInterval);
        this.timer.textContent = '20:00';
        this.timer.style.color = '';
        this.timer.style.animation = '';
        this.startTimer();
        
        // Загрузка первого вопроса
        this.loadQuestion();
    }
}

// Инициализация теста при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new SpeedTest();
});