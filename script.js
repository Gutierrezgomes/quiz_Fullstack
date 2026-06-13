// Substitua pela URL do Render quando for publicar
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

// 2. SALA DE ESPERA (Agora com status de Pronto)
socket.on('update_players', (players) => {
    const list = document.getElementById('players-list');
    list.innerHTML = '';
    
    players.forEach(p => {
        // Se o jogador estiver pronto, pinta a borda de verde e escreve PRONTO
        const readyStyle = p.isReady ? 'border-color: #00ff00; box-shadow: 0 0 10px #00ff00;' : 'border-color: var(--neon-violet);';
        const readyText = p.isReady ? '<br><span style="color: #00ff00; font-size: 0.8rem; font-weight: bold;">✔ PRONTO</span>' : '<br><span style="color: #888; font-size: 0.8rem">Aguardando...</span>';
        
        list.innerHTML += `<div class="player-card" style="${readyStyle}">${p.avatar}<br>${p.name}${readyText}</div>`;
    });
});

// O botão que era de Start agora é de Pronto
const btnStart = document.getElementById('btn-start');
btnStart.innerText = "ESTOU PRONTO!";

btnStart.addEventListener('click', (e) => {
    socket.emit('toggle_ready'); // Avisa o servidor
    
    // Altera o visual do próprio botão para o jogador poder cancelar se quiser
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

// 3. O JOGO
socket.on('game_started', () => {
    showScreen('game');
    // Reseta o botão de pronto para o final da partida
    btnStart.innerText = "ESTOU PRONTO!";
    btnStart.style.borderColor = "var(--neon-cyan)";
    btnStart.style.color = "var(--neon-cyan)";
});

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
});

socket.on('answer_result', (data) => {
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