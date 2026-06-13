// Substitua pela URL do Render quando for publicar (Ex: 'https://hootka-backend.onrender.com')
const socket = io('https://quiz-fullstack-2nn9.onrender.com'); 

const screens = {
    lobby: document.getElementById('lobby-screen'),
    waiting: document.getElementById('waiting-screen'),
    game: document.getElementById('game-screen'),
    leaderboard: document.getElementById('leaderboard-screen')
};

function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// 1. LOBBY - Entrar no Jogo
document.getElementById('btn-join').addEventListener('click', () => {
    const name = document.getElementById('username').value.trim() || 'Dev' + Math.floor(Math.random()*100);
    const avatar = document.querySelector('input[name="avatar"]:checked').value;
    socket.emit('join_game', { name, avatar });
    showScreen('waiting');
});

// 2. SALA DE ESPERA
socket.on('update_players', (players) => {
    const list = document.getElementById('players-list');
    list.innerHTML = '';
    players.forEach(p => {
        list.innerHTML += `<div class="player-card">${p.avatar}<br>${p.name}</div>`;
    });
});

document.getElementById('btn-start').addEventListener('click', () => {
    socket.emit('start_game');
});

// 3. O JOGO
socket.on('new_question', (q) => {
    showScreen('game');
    document.getElementById('wait-message').classList.add('hidden');
    document.getElementById('question-counter').innerText = `Q: ${q.index}/${q.total}`;
    document.getElementById('question-text').innerText = q.pergunta;

    const optContainer = document.getElementById('options-container');
    const writContainer = document.getElementById('written-container');

    if (q.tipo === 'objetiva') {
        optContainer.classList.remove('hidden');
        writContainer.classList.add('hidden');
        optContainer.innerHTML = '';
        
        q.opcoes.forEach((opcao) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opcao.texto;
            // Quando clica, pinta de roxo para o jogador saber que clicou, e envia pro servidor
            btn.onclick = () => {
                const botoes = document.querySelectorAll('.option-btn');
                botoes.forEach(b => b.disabled = true); // Bloqueia outros botões
                btn.style.borderColor = "var(--neon-violet)";
                btn.style.backgroundColor = "rgba(138, 43, 226, 0.2)";
                enviarResposta(opcao.texto);
            };
            optContainer.appendChild(btn);
        });
    } else {
        optContainer.classList.add('hidden');
        writContainer.classList.remove('hidden');
        document.getElementById('written-answer').value = '';
    }
});

// Servidor avisa qual era a correta para pintar a tela
socket.on('answer_result', (data) => {
    if(data.tipo === 'objetiva') {
        const botoes = document.querySelectorAll('.option-btn');
        botoes.forEach(b => {
            if (b.innerText === data.correta) {
                b.classList.add('correct'); // Pinta a certa de verde
            } else if (b.style.borderColor === "var(--neon-violet)") {
                b.classList.add('incorrect'); // Se ele clicou na errada, fica vermelho
            }
        });
    } else {
        // Se for dissertativa, apenas mostra um alerta com o gabarito
        alert("Gabarito da Dissertativa: \n\n" + data.correta);
    }
});

function enviarResposta(respostaText) {
    socket.emit('submit_answer', respostaText);
    document.getElementById('wait-message').classList.remove('hidden');
    document.getElementById('written-container').classList.add('hidden');
}

document.getElementById('btn-submit-written').addEventListener('click', () => {
    const resp = document.getElementById('written-answer').value;
    enviarResposta(resp);
});

// 4. RANKING
socket.on('game_over', (rankedPlayers) => {
    showScreen('leaderboard');
    const list = document.getElementById('ranking-list');
    list.innerHTML = '';
    rankedPlayers.forEach((p, i) => {
        list.innerHTML += `
            <li>
                <span>${i+1}º ${p.avatar} ${p.name}</span>
                <span>${p.score} pts</span>
            </li>
        `;
    });
});

socket.on('error', (msg) => alert(msg));