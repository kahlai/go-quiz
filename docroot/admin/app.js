var app = new Vue({
    el: '#app',

    data: {
        screen: 'start',
        list: { quizzes: null, games: null, sessions: null },
        message: { text: '', next: ''},
        quiz: {
            name: '',
            questionDuration: 20,
            questions: [
                {
                    question: '',
                    answers: ['', '', '', ''],
                    correct: 0
                }
            ]
        },
        editgame: { pin: 0, questionindex:0, gamestate: 0 },
    },

    mounted: function() {
        this.showScreen('start')
    },

    methods: {

        showScreen: function(screen) {
            if (screen == 'start') {
                this.loadQuizzes()
                this.loadGames()
                this.loadSessions()
            }
            this.screen = screen
        },

        loadQuizzes: function() {
            let that = this
            this.webRequest('GET', '/api/quiz', null, function(resp) {
                try {
                    that.list.quizzes = JSON.parse(resp)
                } catch (err) {
                    that.showMessage(err, '')
                }
            })
        },

        loadGames: function() {
            let that = this
            this.webRequest('GET', '/api/game', null, function(resp) {
                try {
                    that.list.games = JSON.parse(resp)
                } catch (err) {
                    that.showMessage(err, '')
                }
            })
        },

        loadSessions: function() {
            let that = this
            this.webRequest('GET', '/api/session', null, function(resp) {
                try {
                    that.list.sessions = JSON.parse(resp)
                } catch (err) {
                    that.showMessage(err, '')
                }
            })
        },

        deleteQuiz: function(id) {
            let that = this
            this.webRequest('DELETE', '/api/quiz/' + id, null, function(resp) {
                try {
                    let data = JSON.parse(resp)
                    if (data.success) {
                        that.showMessage('Quiz successfully deleted', 'start')
                        return
                    }
                    that.showMessage(data.error, 'start')
                } catch (err) {
                    that.showMessage(err, 'start')
                }
            })
        },

        deleteGame: function(pin) {
            let that = this
            this.webRequest('DELETE', '/api/game/' + pin, null, function(resp) {
                try {
                    let data = JSON.parse(resp)
                    if (data.success) {
                        that.showMessage('Game successfully deleted', 'start')
                        return
                    }
                    that.showMessage(data.error, 'start')
                } catch (err) {
                    that.showMessage(err, 'start')
                }
            })
        },

        deleteSession: function(id) {
            let that = this
            this.webRequest('DELETE', '/api/session/' + id, null, function(resp) {
                try {
                    let data = JSON.parse(resp)
                    if (data.success) {
                        that.showMessage('Session successfully deleted', 'start')
                        return
                    }
                    that.showMessage(data.error, 'start')
                } catch (err) {
                    that.showMessage(err, 'start')
                }
            })
        },

        newQuiz: function() {
            this.quiz = {
                name: '',
                questionDuration: 20,
                questions: [
                    {
                        question: '',
                        answers: ['', '', '', ''],
                        correct: 0
                    }
                ]
            }
            this.showScreen('creator')
        },

        editQuiz: function(index) {
            let copy = JSON.parse(JSON.stringify(this.list.quizzes[index]))

            // ensure that there are 4 answers for every question
            copy.questions.forEach(function (question, index) {
                while (question.answers.length < 4) {
                    question.answers.push('')
                }
            })
            this.quiz = copy
            this.showScreen('creator')
        },

        addQuestion: function() {
            this.quiz.questions.push({
                question: '',
                answers: ['', '', '', ''],
                correct: 0
            })
        },

        deleteQuestion: function(index) {
            this.quiz.questions.splice(index, 1)
        },

        updateQuiz: function() {
            if (this.quiz.name == '') {
                this.showMessage('Please fill in the quiz title', 'creator')
                return
            }

            // remove empty answers
            let errors = []
            let copy = JSON.parse(JSON.stringify(this.quiz))
            copy.questions.forEach(function (question, index) {
                while (question.answers.length > 0 && question.answers[question.answers.length-1] == '') {
                    question.answers.splice(-1, 1)
                }
                if (question.correct < 0 || question.correct >= question.answers.length) {
                    errors.push("Invalid correct field for question " + index)
                }
            })

            if (errors.length > 0) {
                this.showMessage(errors.join(', '), 'creator')
                return
            }

            let that = this
            this.webRequest('PUT', '/api/quiz', copy, function(resp) {
                try {
                    let data = JSON.parse(resp)
                    if (data.success) {
                        that.showMessage('Quiz added', 'start')
                    } else {
                        that.showMessage(data.error, '')
                    }
                } catch (err) {
                    that.showMessage(err, '')
                }
            })
        },

        cancelQuiz: function() {
            this.showScreen('start')
        },

        editGame: function(index) {
            this.editgame = JSON.parse(JSON.stringify(this.list.games[index]))
            this.showScreen('editgame')
        },

        updateGame: function() {
            let that = this
            this.webRequest('PUT', '/api/game', this.editgame, function(resp) {
                try {
                    let data = JSON.parse(resp)
                    if (data.success) {
                        that.showMessage('Updated game', 'start')
                    } else {
                        that.showMessage(data.error, 'start')
                    }
                } catch (err) {
                    that.showMessage(err, 'start')
                }
            })
        },

        showMessage: function(message, next) {
            this.message.text = message
            this.message.next = next
            this.showScreen('message')
        },

        dismissMessage: function() {
            if (this.message.next != '') {
                this.showScreen(this.message.next)
                this.message.next = ''
            }
            this.message.text = ''
        },

        webRequest: function(method, url, body, callback) {
            let xhr = new XMLHttpRequest()
            let that = this
            xhr.onreadystatechange = function() {
                if (this.readyState == 4) {
                    callback(xhr.responseText)
                }
            }
            xhr.open(method, url)
            if (body == null) {
                xhr.send()
            } else {
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
                xhr.send(JSON.stringify(body))
            }
        },
    }
})