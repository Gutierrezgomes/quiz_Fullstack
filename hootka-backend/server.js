const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// "Banco de dados" temporário em JSON (Memória)
let players = {}; 
let gameState = 'LOBBY'; // LOBBY, PLAYING, LEADERBOARD
let currentQuestionIndex = 0;
let currentQuestions = [];

// COLE AQUI O ARRAY 'questoesDB' COM AS 80 QUESTÕES DO CÓDIGO ANTERIOR
const questoesDB = [ 
    /* ... cole as 80 questões aqui ... */ 
];

function generateSimulado() {
    const objetivas = questoesDB.filter(q => q.tipo === 'objetiva').sort(() => 0.5 - Math.random()).slice(0, 10);
    const dissertativas = questoesDB.filter(q => q.tipo === 'dissertativa').sort(() => 0.5 - Math.random()).slice(0, 4);
    return [...objetivas, ...dissertativas].sort(() => 0.5 - Math.random());
}

io.on('connection', (socket) => {
    console.log('Novo jogador conectado:', socket.id);

    // Jogador entra na sala
    socket.on('join_game', (data) => {
        if (gameState !== 'LOBBY') {
            socket.emit('error', 'O jogo já começou!');
            return;
        }
        players[socket.id] = {
            id: socket.id,
            name: data.name,
            avatar: data.avatar,
            score: 0,
            answered: false
        };
        io.emit('update_players', Object.values(players));
    });

    // Iniciar o jogo (Pode ser clicado pelo primeiro que entrar, ou um "Host")
    socket.on('start_game', () => {
        if (Object.keys(players).length === 0) return;
        gameState = 'PLAYING';
        currentQuestions = generateSimulado();
        currentQuestionIndex = 0;
        
        // Zera pontuações
        for(let id in players) players[id].score = 0;

        sendQuestion();
    });

    // Receber resposta
    socket.on('submit_answer', (answer) => {
        const player = players[socket.id];
        if (!player || player.answered) return;

        const question = currentQuestions[currentQuestionIndex];
        player.answered = true;

        if (question.tipo === 'objetiva') {
            if (answer === question.correta) {
                player.score += 100; // 100 pontos por acerto
            }
        } else {
            // Para dissertativas, no modo automático, damos 50 pontos pela participação
            if (answer.trim().length > 5) {
                player.score += 50; 
            }
        }
        
        // Verifica se todos responderam
        const allAnswered = Object.values(players).every(p => p.answered);
        if (allAnswered) {
            setTimeout(nextQuestion, 2000); // Espera 2s e vai pra próxima
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('update_players', Object.values(players));
        if (Object.keys(players).length === 0) gameState = 'LOBBY';
    });
});

function sendQuestion() {
    for(let id in players) players[id].answered = false; // Reseta status
    
    const q = currentQuestions[currentQuestionIndex];
    // Não enviamos a resposta correta para o frontend evitar trapaças!
    const questionToClient = {
        index: currentQuestionIndex + 1,
        total: currentQuestions.length,
        tipo: q.tipo,
        pergunta: q.pergunta,
        opcoes: q.opcoes ? q.opcoes : null
    };
    
    io.emit('new_question', questionToClient);
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= currentQuestions.length) {
        gameState = 'LEADERBOARD';
        io.emit('game_over', Object.values(players).sort((a, b) => b.score - a.score));
        gameState = 'LOBBY'; // Reseta para próxima
    } else {
        sendQuestion();
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Hootka Backend rodando na porta ${PORT}`));