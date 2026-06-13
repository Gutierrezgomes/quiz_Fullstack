const socket = io('https://quiz-fullstack-2nn9.onrender.com'); 

// Gera um ID de sessão único que sobrevive ao F5
let playerId = sessionStorage.getItem('hootka_playerId');
if (!playerId) {
    playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('hootka_playerId', playerId);
}

const screens = {
    lobby: document.getElementById('lobby-screen'),
    waiting: document.getElementById('waiting-screen'),
    game: document.getElementById('game-screen'),
    leaderboard: document.getElementById('leaderboard-screen')
};

let timerInterval;

function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// 1. LOBBY - Entrar no Jogo
document.getElementById('btn-join').addEventListener('click', () => {
    const name = document.getElementById('username').value.trim() || 'Dev' + Math.floor(Math.random()*100);
    const avatar = document.querySelector('input[name="avatar"]:checked').value;
    socket.emit('join_game', { playerId, name, avatar });
    showScreen('waiting');
});

// RECONEXÃO (Caso dê F5)
socket.on('reconnected', (data) => {
    if (data.gameState === 'PLAYING' || data.gameState === 'WAITING_ANSWERS' || data.gameState === 'SHOWING_RESULT') {
        showScreen('game');
        
        // Restaura a interface da pergunta atual
        if(data.currentQuestion) {
            renderQuestion(data.currentQuestion.tipo, data.currentQuestion.pergunta, data.currentQuestion.opcoes, data.questionIndex, data.totalQuestions, data.timeLeft);
            
            // Se já respondeu antes de cair, bloqueia
            if(data.hasAnswered) {
                const botoes = document.querySelectorAll('.option-btn');
                botoes.forEach(b => b.disabled = true);
                document.getElementById('wait-message').classList.remove('hidden');
                document.getElementById('written-container').classList.add('hidden');
            }
        }
    } else if (data.gameState === 'LEADERBOARD') {
        showScreen('leaderboard');
    } else {
        showScreen('waiting');
    }
});

// 2. SALA DE ESPERA
socket.on('update_players', (players) => {
    const list = document.getElementById('players-list');
    list.innerHTML = '';
    
    players.forEach(p => {
        if (!p.online) return; // Não mostra os desconectados
        const readyStyle = p.isReady ? 'border-color: #00ff00; box-shadow: 0 0 10px #00ff00;' : 'border-color: var(--neon-violet);';
        const readyText = p.isReady ? '<br><span style="color: #00ff00; font-size: 0.8rem; font-weight: bold;">✔ PRONTO</span>' : '<br><span style="color: #888; font-size: 0.8rem">Aguardando...</span>';
        list.innerHTML += `<div class="player-card" style="${readyStyle}">${p.avatar}<br>${p.name}${readyText}</div>`;
    });
});

const btnStart = document.getElementById('btn-start');
btnStart.addEventListener('click', (e) => {
    socket.emit('toggle_ready'); 
    if(e.target.innerText === "ESTOU PRONTO!") {
        e.target.innerText = "CANCELAR PRONTO";
        e.target.style.borderColor = "var(--neon-carmine)";
        e.target.style.color = "var(--neon-carmine)";
    } else {
        e.target.innerText = "ESTOU PRONTO!";
        e.target.style.borderColor = "var(--neon-cyan)";
        e.target.style.color = "var(--neon-cyan)";
    }
});

// 3. O JOGO E O TEMPORIZADOR
socket.on('game_started', () => {
    showScreen('game');
    btnStart.innerText = "ESTOU PRONTO!";
    btnStart.style.borderColor = "var(--neon-cyan)";
    btnStart.style.color = "var(--neon-cyan)";
});

socket.on('new_question', (q) => {
    showScreen('game');
    renderQuestion(q.tipo, q.pergunta, q.opcoes, q.index - 1, q.total, q.duration);
});

function renderQuestion(tipo, pergunta, opcoes, index, total, duration) {
    document.getElementById('wait-message').classList.add('hidden');
    document.getElementById('question-counter').innerText = `Q: ${index + 1}/${total}`;
    document.getElementById('question-text').innerText = pergunta;

    startTimer(duration);

    const optContainer = document.getElementById('options-container');
    const writContainer = document.getElementById('written-container');

    if (tipo === 'objetiva') {
        optContainer.classList.remove('hidden');
        writContainer.classList.add('hidden');
        optContainer.innerHTML = '';
        
        opcoes.forEach((opcao) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opcao; 
            
            btn.onclick = () => {
                const botoes = document.querySelectorAll('.option-btn');
                botoes.forEach(b => b.disabled = true); 
                btn.style.borderColor = "var(--neon-violet)";
                btn.style.backgroundColor = "rgba(138, 43, 226, 0.2)";
                enviarResposta(opcao); 
            };
            optContainer.appendChild(btn);
        });
    } else {
        optContainer.classList.add('hidden');
        writContainer.classList.remove('hidden');
        document.getElementById('written-answer').value = '';
    }
}

function startTimer(duration) {
    let timeLeft = duration;
    const bar = document.getElementById('timer-bar');
    const text = document.getElementById('timer-text');
    clearInterval(timerInterval);
    
    bar.style.width = '100%';
    bar.classList.remove('warning');

    timerInterval = setInterval(() => {
        timeLeft--;
        const percentage = (timeLeft / duration) * 100;
        bar.style.width = `${percentage}%`;
        text.innerText = `${timeLeft}s`;

        if (timeLeft <= 10) bar.classList.add('warning');
        if (timeLeft <= 0) clearInterval(timerInterval);
    }, 1000);
}

socket.on('answer_result', (data) => {
    clearInterval(timerInterval);

    // ==========================================
    // CORREÇÃO: Atualiza os pontos em tempo real na tela!
    // ==========================================
    if (data.players) {
        const me = data.players.find(p => p.id === playerId);
        if (me) {
            document.getElementById('my-score').innerText = `Pontos: ${me.score}`;
        }
    }

    if(data.tipo === 'objetiva') {
        const botoes = document.querySelectorAll('.option-btn');
        botoes.forEach(b => {
            if (b.innerText === data.correta) {
                b.classList.add('correct'); 
            } else if (b.style.borderColor === "var(--neon-violet)") {
                b.classList.add('incorrect'); 
            }
        });
    } else {
        // Exibe o gabarito sem interromper com alert
        document.getElementById('wait-message').innerHTML = `Gabarito Oficial:<br><span style="color:var(--neon-violet);">${data.correta}</span>`;
        document.getElementById('wait-message').classList.remove('hidden');
    }
});

function enviarResposta(respostaText) {
    socket.emit('submit_answer', respostaText);
    document.getElementById('wait-message').innerText = "Aguardando outros jogadores...";
    document.getElementById('wait-message').classList.remove('hidden');
    document.getElementById('written-container').classList.add('hidden');
}

document.getElementById('btn-submit-written').addEventListener('click', () => {
    const resp = document.getElementById('written-answer').value;
    enviarResposta(resp);
});

// 4. RANKING E PÓDIO
socket.on('game_over', (rankedPlayers) => {
    clearInterval(timerInterval);
    showScreen('leaderboard');
    
    // Atualiza a lista completa
    const list = document.getElementById('ranking-list');
    list.innerHTML = '';
    
    // Esconde o pódio inicialmente
    document.querySelectorAll('.podium-place').forEach(p => { p.classList.add('hidden'); p.innerHTML = ''; });

    rankedPlayers.forEach((p, i) => {
        // Renderiza o Top 3 no pódio visual
        if (i < 3) {
            let podId = i === 0 ? 'podium-1' : (i === 1 ? 'podium-2' : 'podium-3');
            let position = i === 0 ? '1º' : (i === 1 ? '2º' : '3º');
            let podiumEl = document.getElementById(podId);
            podiumEl.innerHTML = `<span class="avatar">${p.avatar}</span><span class="name">${p.name}</span><span class="score">${p.score}</span><span>${position}</span>`;
            podiumEl.classList.remove('hidden');
        } else {
            // Do 4º em diante, exibe apenas na lista abaixo
            list.innerHTML += `<li><span>${i+1}º ${p.avatar} ${p.name}</span><span>${p.score} pts</span></li>`;
        }
    });
});

// Jogar Novamente
document.getElementById('btn-play-again').addEventListener('click', () => {
    socket.emit('join_game', { playerId, name: "Reconectando...", avatar: "👾" });
    showScreen('waiting');
});

socket.on('error', (msg) => alert(msg));