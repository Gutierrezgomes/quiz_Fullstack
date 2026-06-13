// Banco de dados com as 80 questões do documento
// TODAS as 80 questões estão no formato objetivo (múltipla escolha) com alternativas completas.

// ATENÇÃO: Troque esta URL pela URL do Render quando colocar o backend no ar.
// Exemplo: const socket = io('https://hootka-backend.onrender.com');
const socket = io('http://localhost:3000'); 

// Mapeamento de Telas
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

// --- LÓGICA DO LOBBY ---
document.getElementById('btn-join').addEventListener('click', () => {
    const name = document.getElementById('username').value.trim() || 'Jogador' + Math.floor(Math.random()*1000);
    const avatar = document.querySelector('input[name="avatar"]:checked').value;
    
    socket.emit('join_game', { name, avatar });
    showScreen('waiting');
});

// --- LÓGICA DA SALA DE ESPERA ---
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

// --- LÓGICA DO JOGO ---
let myScore = 0;

socket.on('game_started', () => {
    showScreen('game');
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
        
        q.opcoes.forEach((opcao, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opcao;
            btn.onclick = () => enviarResposta(index, btn);
            optContainer.appendChild(btn);
        });
    } else {
        optContainer.classList.add('hidden');
        writContainer.classList.remove('hidden');
        document.getElementById('written-answer').value = '';
    }
});

function enviarResposta(resposta, btnClicado = null) {
    if (btnClicado) {
        // Pinta a opção selecionada para dar feedback visual temporário
        const botoes = document.querySelectorAll('.option-btn');
        botoes.forEach(b => b.disabled = true);
        btnClicado.style.borderColor = "var(--neon-violet)";
        btnClicado.style.backgroundColor = "rgba(138, 43, 226, 0.2)";
    }

    socket.emit('submit_answer', resposta);
    document.getElementById('wait-message').classList.remove('hidden');
    document.getElementById('options-container').classList.add('hidden');
    document.getElementById('written-container').classList.add('hidden');
}

document.getElementById('btn-submit-written').addEventListener('click', () => {
    const resp = document.getElementById('written-answer').value;
    enviarResposta(resp);
});

// Atualiza placar em tempo real (baseado no que o servidor disser depois, opcional)
// Para simplificar, só mostramos no fim.

// --- LÓGICA DO LEADERBOARD ---
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

socket.on('error', (msg) => {
    alert(msg);
});

const questoesDB = [
    // CONFIGURAÇÃO DO AMBIENTE
    { id: 1, tipo: 'objetiva', pergunta: "Qual ferramenta é recomendada para instalar e gerenciar múltiplas versões do Node.js?", opcoes: ["O npm (Node Package Manager).", "O nvm (Node Version Manager). No Linux/Mac instala-se via curl e permite trocar de versão facilmente com nvm use --lts.", "O npx, utilizado para executar dependências temporárias.", "O Yarn, que substitui o Node.js."], correta: 1 },
    { id: 2, tipo: 'objetiva', pergunta: "Qual versão do JDK é utilizada nos projetos com Spring Boot do livro, e qual distribuição é recomendada?", opcoes: ["JDK 11 na distribuição Oracle.", "JDK 17 na distribuição OpenJDK.", "JDK 21 (LTS) na distribuição Eclipse Temurin, disponível em adoptium.net.", "JDK 8 na distribuição Amazon Corretto."], correta: 2 },
    { id: 3, tipo: 'objetiva', pergunta: "Qual é a ferramenta de build padrão para projetos Java usada no livro, e o que ela faz?", opcoes: ["Gradle. Compila o código em C++ nativo.", "Ant. Serve apenas para empacotar o projeto em .jar.", "O Maven. Ele gerencia dependências, compila o código, executa testes e empacota a aplicação.", "NPM. Baixa bibliotecas do Spring Boot via repositórios globais."], correta: 2 },
    { id: 4, tipo: 'objetiva', pergunta: "Qual banco de dados é utilizado em todos os três projetos do livro?", opcoes: ["MySQL Server 8.0.", "MongoDB.", "PostgreSQL (versão 16 ou superior), um banco de dados relacional de código aberto.", "SQLite."], correta: 2 },
    { id: 5, tipo: 'objetiva', pergunta: "Quais ferramentas de cliente HTTP o livro recomenda para testar APIs REST?", opcoes: ["Apenas o Postman por ser padrão de mercado.", "Swagger UI e GraphQL Playground.", "Postman, Insomnia ou Thunder Client. O livro recomenda o Insomnia por ser leve e intuitivo.", "Curl via terminal de comando exclusivamente."], correta: 2 },

    // HTML E CSS
    { id: 6, tipo: 'objetiva', pergunta: "O que são tags semânticas do HTML5? Cite três exemplos.", opcoes: ["Tags que descrevem o significado do conteúdo, tornando o código mais legível e acessível. Exemplos: header, nav, main, article, section, footer.", "Tags exclusivas para estilização de texto. Exemplos: b, i, u.", "Tags que executam funções de banco. Exemplos: sql, query, fetch.", "Tags que substituem CSS. Exemplos: color, font, align."], correta: 0 },
    { id: 7, tipo: 'objetiva', pergunta: "Qual é a diferença entre HTML e CSS?", opcoes: ["HTML compila o código, CSS executa o comportamento.", "HTML define a estrutura (o que é cada elemento), enquanto CSS define a apresentação (cor, tamanho, posição, animação).", "HTML é backend, CSS é frontend.", "Não há diferença estrutural."], correta: 1 },
    { id: 8, tipo: 'objetiva', pergunta: "O que é o Bootstrap e qual versão é usada nos projetos?", opcoes: ["Biblioteca de ícones / versão 4.", "Framework CSS com classes prontas. O livro usa Bootstrap 5, que abandonou o jQuery e é baseado em flexbox e CSS Grid.", "Motor de templates / versão 3.", "Banco de dados NoSQL / versão 6."], correta: 1 },
    { id: 9, tipo: 'objetiva', pergunta: "Como funciona o sistema de grid responsivo do Bootstrap?", opcoes: ["Usa atributos de tabela (colspan).", "Usa classes como col-md-4 dentro de um row. Três divs com col-md-4 formam três colunas em telas médias e se empilham em telas pequenas.", "Usa exclusivamente position: absolute.", "Usa media queries manuais no style.css."], correta: 1 },
    { id: 10, tipo: 'objetiva', pergunta: "Quais são os três tipos de seletores CSS exemplificados no livro?", opcoes: ["Por id, por valor e por estado.", "Por tag (p {}), por classe (.destaque {}) e por id (#principal {}). O livro também mostra Flexbox com display: flex.", "Por herança, por pseudo-classe e por animação.", "Por variável, por const e por let."], correta: 1 },

    // JAVASCRIPT
    { id: 11, tipo: 'objetiva', pergunta: "Qual é a diferença entre const e let em JavaScript?", opcoes: ["const é global, let é restrita.", "const declara uma constante (não pode ser reatribuída). let declara uma variável mutável. Ambas têm escopo de bloco.", "const aceita apenas números, let aceita strings.", "let sofre hoisting para o topo do código, const não."], correta: 1 },
    { id: 12, tipo: 'objetiva', pergunta: "Cite três métodos de arrays em JavaScript mostrados no livro e explique cada um.", opcoes: ["push() adiciona; pop() remove; shift() move.", "map() transforma cada elemento retornando novo array; filter() filtra elementos por condição; reduce() acumula valores em um único resultado.", "sort() ordena; reverse() inverte; splice() corta.", "concat() junta; slice() fatia; join() une em string."], correta: 1 },
    { id: 13, tipo: 'objetiva', pergunta: "O que é uma arrow function? Dê um exemplo.", opcoes: ["Função nativa para desenhar vetores.", "Método de iteração inversa.", "Sintaxe moderna para funções, mais concisa. Ex: const multiplicar = (a,b) => a * b; mais concisa que function multiplicar(a,b).", "Função do React para alterar estados."], correta: 2 },
    { id: 14, tipo: 'objetiva', pergunta: "O que são async/await em JavaScript e para que servem?", opcoes: ["Compiladores de código JS em binário.", "Palavras-chave para operações assíncronas de forma legível. async marca a função e await pausa até uma Promise ser resolvida.", "Substitutos para if/else.", "Funções do Node para excluir arquivos."], correta: 1 },
    { id: 15, tipo: 'objetiva', pergunta: "O que é o método fetch() e como é usado no projeto 1?", opcoes: ["API do browser para requisições HTTP. No projeto 1: const response = await fetch com a URL, seguido de response.json() para obter os dados.", "Comando SQL abstraído no JavaScript.", "Método do Express para ler arquivos estáticos.", "Função padrão do Node para buscar hardware."], correta: 0 },

    // NODE.JS E EXPRESS
    { id: 16, tipo: 'objetiva', pergunta: "O que é Node.js e qual é sua principal vantagem?", opcoes: ["Framework frontend SPA.", "Banco de dados orientado a grafos.", "Runtime JavaScript baseado no motor V8 do Chrome. Principal vantagem: ecossistema npm com mais de 2 milhões de pacotes para criar APIs, CLIs e servidores.", "Servidor Apache embutido em JS."], correta: 2 },
    { id: 17, tipo: 'objetiva', pergunta: "No projeto 1, qual é a estrutura de pastas do backend?", opcoes: ["models/, views/ e controllers/.", "src/server.js (entrada), src/routes/ (rotas), src/db/ (conexão). Arquivos estáticos do frontend ficam em public/.", "app/, config/ e templates/.", "bin/, lib/ e pages/."], correta: 1 },
    { id: 18, tipo: 'objetiva', pergunta: "O que são middlewares no Express? Quais são usados no projeto 1?", opcoes: ["Bibliotecas de segurança de banco.", "Funções que processam requisições antes dos handlers. Projeto 1 usa: cors(), express.json(), express.urlencoded() e express.static().", "Plugins do frontend para conectar no backend.", "Ferramentas de ORM similares ao Prisma."], correta: 1 },
    { id: 19, tipo: 'objetiva', pergunta: "O que é pool de conexões no PostgreSQL com Node.js e por que é importante?", opcoes: ["Serviço de cache Redis acoplado.", "Reutiliza conexões abertas ao banco, evitando o custo de abrir uma nova a cada requisição. Melhora performance e escalabilidade.", "Estratégia nativa de backup em múltiplos discos.", "Protocolo que criptografa os dados em trânsito."], correta: 1 },
    { id: 20, tipo: 'objetiva', pergunta: "O que são queries parametrizadas e por que são usadas?", opcoes: ["Queries otimizadas para rotinas batch.", "Consultas SQL com valores separados como parâmetros. Protegem contra ataques SQL Injection.", "Subconsultas complexas que retornam JSON.", "Procedures armazenadas que não aceitam parâmetros externos."], correta: 1 },

    // APIS REST
    { id: 21, tipo: 'objetiva', pergunta: "Quais são os 5 endpoints da API REST de tarefas no projeto 1?", opcoes: ["GET /all, POST /add, PUT /update, DELETE /remove, OPTIONS /check.", "GET /api/tarefas (listar), GET /api/tarefas/:id (buscar), POST /api/tarefas (criar), PATCH /api/tarefas/:id (atualizar), DELETE /api/tarefas/:id (excluir).", "FETCH /tasks, SEND /tasks, READ /tasks/:id, UPDATE /tasks, DROP /tasks.", "GET /api/list, POST /api/new, PUT /api/edit, DELETE /api/del, PATCH /api/status."], correta: 1 },
    { id: 22, tipo: 'objetiva', pergunta: "Como o projeto 1 lida com variáveis sensíveis como credenciais do banco?", opcoes: ["Armazena nas strings de conexão em server.js.", "Usa variáveis de ambiente com o pacote dotenv. As credenciais ficam em .env (não commitado) e são acessadas via process.env.NOME_VARIAVEL.", "Salva no localStorage do navegador.", "Criptografa no banco de dados e descriptografa em runtime."], correta: 1 },
    { id: 23, tipo: 'objetiva', pergunta: "O que é REST e quais são os cinco verbos HTTP de uma API REST?", opcoes: [
        "Protocolo de comunicação de rede. Verbos: TCP, UDP, HTTP, FTP, SMTP.",
        "REST (Representational State Transfer) é um estilo arquitetural. Verbos: GET (buscar), POST (criar), PUT (atualizar completo), PATCH (parcial), DELETE (excluir).",
        "Linguagem de manipulação de dados. Verbos: CREATE, READ, UPDATE, DELETE, MERGE.",
        "Framework backend padronizado. Verbos: FETCH, PUSH, PULL, COMMIT, REVERT."
    ], correta: 1 },
    { id: 24, tipo: 'objetiva', pergunta: "Qual é a diferença entre PUT e PATCH?", opcoes: [
        "Não existe diferença no HTTP 1.1.",
        "PUT insere dado novo; PATCH deleta se estiver obsoleto.",
        "PUT atualiza o recurso completo (todos os campos). PATCH atualiza apenas os campos informados (atualização parcial).",
        "PUT é assíncrono; PATCH é síncrono."
    ], correta: 2 },
    { id: 25, tipo: 'objetiva', pergunta: "O que é o endpoint de saúde (health check) criado no projeto 1?", opcoes: [
        "GET /api/saude retorna status ok com timestamp. Serve para verificar se o servidor está funcionando, útil para monitoramento.",
        "POST /api/check reinicia o banco de dados.",
        "GET /api/error lista as pilhas de erro dos últimos 30 dias.",
        "DELETE /api/health interrompe os processos pendentes para evitar sobrecarga."
    ], correta: 0 },

    // POSTGRESQL
    { id: 26, tipo: 'objetiva', pergunta: "Quais são as quatro operações básicas de SQL demonstradas no livro?", opcoes: ["FETCH ROW, PUSH DATA, PULL REFS, MERGE TABLES", "GRANT ACCESS, REVOKE RIGHTS, COMMIT TRANS, ROLLBACK ERROR", "CREATE TABLE (criar tabela), INSERT INTO (inserir), SELECT (consultar), UPDATE (atualizar) e DELETE (excluir).", "INNER JOIN, UNION ALL, INTERSECT ROWS, EXCEPT DATA"], correta: 2 },
    { id: 27, tipo: 'objetiva', pergunta: "O que significa SERIAL PRIMARY KEY em PostgreSQL?", opcoes: ["Garante salvamento em formato JSON serializado.", "Obriga relacionamento sequencial.", "SERIAL cria uma sequência auto-incrementada. PRIMARY KEY define essa coluna como chave primária da tabela.", "Cria índice em árvore B para exclusões rápidas."], correta: 2 },
    { id: 28, tipo: 'objetiva', pergunta: "O que são índices e por que o projeto 3 os cria nas tabelas de produtos?", opcoes: [
        "Aceleram consultas evitando varredura completa. No projeto 3 são criados em categoria_id e ativo, campos usados frequentemente em filtros.",
        "Mecanismos de criptografia de senhas no banco.",
        "Gatilhos (triggers) para backups automáticos.",
        "Visualizações materializadas (views) com somatórios."
    ], correta: 0 },
    { id: 29, tipo: 'objetiva', pergunta: "Por que o projeto 3 guarda nome e preço na tabela itens_pedido ao invés de apenas o id do produto?", opcoes: [
        "Para reduzir a complexidade no Node.js.",
        "Para acelerar o carregamento da página de produtos.",
        "Para preservar um snapshot no momento da compra. Se o preço ou nome mudar depois, o histórico de pedidos permanece correto.",
        "Exigência técnica do driver JDBC para OneToMany."
    ], correta: 2 },
    { id: 30, tipo: 'objetiva', pergunta: "O que é a restrição UNIQUE (usuario_id, produto_id) na tabela carrinho_itens?", opcoes: [
        "Garante que cada usuário tenha no máximo um registro por produto no carrinho. Adicionar o mesmo produto duas vezes vira UPDATE, não duplicata.",
        "Garante que o mesmo produto não seja visto por dois usuários.",
        "Apaga do carrinho qualquer produto com alteração de preço.",
        "Impede compras repetidas com o mesmo cartão."
    ], correta: 0 },

    // SPRING BOOT
    { id: 31, tipo: 'objetiva', pergunta: "Quais são as seis camadas da arquitetura Spring Boot usadas no projeto 2?", opcoes: [
        "View, Route, Component, Hook, DB, Auth.",
        "Entity (modelo), Repository (acesso ao banco), Service (lógica de negócio), Controller (endpoints HTTP), DTO (dados em trânsito) e Config (configurações).",
        "Frontend, Backend, Cache, Queue, Database, Gateway.",
        "Model, View, Template, Reducer, Store, Action."
    ], correta: 1 },
    { id: 32, tipo: 'objetiva', pergunta: "O que é o Spring Initializr?", opcoes: [
        "Plugin obrigatório na IDE Eclipse.",
        "Gerador web em start.spring.io que cria o ZIP do projeto Spring Boot com as dependências selecionadas.",
        "Módulo de autenticação pré-configurado.",
        "Ferramenta de CLI para análise de memória."
    ], correta: 1 },
    { id: 33, tipo: 'objetiva', pergunta: "Qual é a diferença entre application.properties e application.yml?", opcoes: [
        "O formato properties não suporta injeção nativa.",
        "Ambos configuram a aplicação, mas YAML usa indentação hierárquica, tornando-o mais legível. O livro migra para .yml por legibilidade.",
        "YAML é apenas para nuvem, properties para local.",
        "Não há diferença, são variações de XML."
    ], correta: 1 },
    { id: 34, tipo: 'objetiva', pergunta: "O que faz ddl-auto: update no Hibernate e por que não deve ser usado em produção?", opcoes: [
        "Atualiza versão do Java. Consome muita rede.",
        "Cria e atualiza tabelas automaticamente. Em produção é perigoso pois uma renomeação de campo pode causar perda de dados. Use validate com Flyway ou Liquibase.",
        "Apaga os dados a cada reinicialização da JVM (exclusivo para TDD).",
        "Executa migrations SQL brutas em tempo de compilação."
    ], correta: 1 },
    { id: 35, tipo: 'objetiva', pergunta: "O que é o Maven Wrapper (mvnw) e qual é sua vantagem?", opcoes: [
        "Biblioteca que zippa a pasta target no deploy.",
        "Script incluído no projeto que baixa a versão correta do Maven automaticamente, garantindo que todos usem a mesma versão sem instalação global.",
        "Módulo Spring Cloud para microserviços.",
        "Interface visual para comandos do Maven."
    ], correta: 1 },

    // JPA E HIBERNATE
    { id: 36, tipo: 'objetiva', pergunta: "O que significa a anotação @Entity em uma classe Java?", opcoes: ["Marca para injeção de dependência.", "Converte em DTO.", "Marca a classe como uma entidade JPA, ou seja, ela é mapeada para uma tabela no banco de dados.", "Bloqueia a herança da classe."], correta: 2 },
    { id: 37, tipo: 'objetiva', pergunta: "O que fazem @PrePersist e @PreUpdate em uma entidade JPA?", opcoes: ["Valida regras de negócios complexas.", "Limpa cache de L2.", "@PrePersist executa antes de inserir o registro. @PreUpdate executa antes de atualizar. Usados para preencher criadoEm e atualizadoEm automaticamente.", "Força commit explícito na transação."], correta: 2 },
    { id: 38, tipo: 'objetiva', pergunta: "Qual é a diferença entre FetchType.LAZY e FetchType.EAGER?", opcoes: ["LAZY em lotes, EAGER um por um.", "LAZY carrega dados relacionados só quando acessados (mais performático). EAGER carrega junto com a entidade principal (pode causar N+1 queries).", "LAZY em ManyToOne, EAGER em OneToMany.", "Obsoletos no Spring Boot 3."], correta: 1 },
    { id: 39, tipo: 'objetiva', pergunta: "Como o Spring Data JPA gera consultas a partir do nome do método?", opcoes: ["Mapeia para procedures.", "Lê o nome do método e gera a query automaticamente. Ex: findByEmail gera SELECT FROM usuario WHERE email = ?. Funciona com findBy, existsBy, countBy e deleteBy.", "Usa @GenerateQuery em cada assinatura.", "Usa Reflection puro sem SQL."], correta: 1 },
    { id: 40, tipo: 'objetiva', pergunta: "O que é JPQL e quando o livro recomenda usá-lo?", opcoes: ["JS Persistence Layer.", "Biblioteca de streams paralelos.", "JPA Query Language, parecida com SQL mas usa entidades e atributos Java. Usada via @Query quando o nome de método derivado ficaria complexo demais.", "Formato superior ao JSON."], correta: 2 },

    // RELACIONAMENTOS E LOMBOK
    { id: 41, tipo: 'objetiva', pergunta: "Como funciona o @ManyToMany entre Post e Tag no projeto 2?", opcoes: [
        "Usa foreign keys normais sem tabela intermediária.",
        "Usa arrays nativos do PostgreSQL ignorando o JPA.",
        "Usa @JoinTable com a tabela intermediária post_tags com colunas post_id e tag_id. Cascade PERSIST e MERGE salvam tags novas automaticamente.",
        "Usa triggers complexas no banco de dados."
    ], correta: 2 },
    { id: 42, tipo: 'objetiva', pergunta: "O que é o Lombok? Cite quatro anotações dele usadas no livro.", opcoes: [
        "Reduz boilerplate Java. Anotações: @Getter e @Setter, @NoArgsConstructor, @AllArgsConstructor, @Builder.",
        "Framework de logs. Anotações: @Log, @Info, @Warn, @Error.",
        "Módulo de segurança. Anotações: @Secured, @RolesAllowed, @PermitAll, @DenyAll.",
        "Ferramenta de testes. Anotações: @Test, @Before, @After, @Mock."
    ], correta: 0 },

    // DTOS E VALIDAÇÃO
    { id: 43, tipo: 'objetiva', pergunta: "Por que o livro usa DTOs separados das entidades JPA?", opcoes: ["Aumentar o número de classes.", "Para não expor detalhes internos como hash de senha, permitir validações específicas por endpoint e evoluir a API independentemente do banco.", "O React exige formato DTO.", "Lombok não funciona em entidades puras."], correta: 1 },
    { id: 44, tipo: 'objetiva', pergunta: "Quais anotações de Bean Validation são usadas no UsuarioRegistroDTO?", opcoes: ["@NotNull, @Min, @Max.", "@NotEmpty, @Pattern, @Past.", "@NotBlank (campo não pode ser vazio), @Size (limite de tamanho) e @Email (formato de e-mail válido). Ativadas com @Valid no controller.", "@Required, @Length, @ValidEmail."], correta: 2 },
    { id: 45, tipo: 'objetiva', pergunta: "Como o projeto 2 trata erros de validação de forma centralizada?", opcoes: ["If/else em controllers.", "Página 500 HTML.", "Usa GlobalExceptionHandler com @RestControllerAdvice. Captura MethodArgumentNotValidException e retorna mapa com erros de cada campo com status 400.", "Frontend trata todos os erros."], correta: 2 },

    // SPRING SECURITY
    { id: 46, tipo: 'objetiva', pergunta: "O que é Spring Security e qual é sua função nos projetos 2 e 3?", opcoes: ["Monitoramento DDoS.", "Módulo padrão do Spring para autenticação e autorização. Projeto 2 usa sessões HTTP; projeto 3 usa JWT stateless.", "Criptografia de backups.", "Filtro CORS exclusivo."], correta: 1 },
    { id: 47, tipo: 'objetiva', pergunta: "Por que nunca armazenar senhas em texto puro? Qual algoritmo o livro usa?", opcoes: ["Economizar espaço / Base64.", "Senhas expostas se o banco for comprometido. O livro usa BCrypt via PasswordEncoder, que gera hashes resistentes a força bruta.", "Regra do Postgres / MD5.", "Frontend não ler / SHA-256."], correta: 1 },
    { id: 48, tipo: 'objetiva', pergunta: "O que é o UserDetailsService e como é implementado no projeto 2?", opcoes: ["Controller CRUD de usuários.", "Interface que o Spring Security usa para carregar usuários por username. A implementação busca por email no banco e retorna User com roles.", "Tabela de sessões ativas.", "Filtro decodificador JWT."], correta: 1 },
    { id: 49, tipo: 'objetiva', pergunta: "Como o projeto 2 configura rotas públicas e protegidas?", opcoes: ["@RequestMapping(secure=true).", "Em application.yml.", "Via SecurityFilterChain com authorizeHttpRequests. As rotas de autenticação e leitura de posts são permitAll. Criar, editar e excluir requerem authenticated.", "Verificação manual no Service."], correta: 2 },
    { id: 50, tipo: 'objetiva', pergunta: "O que é CORS e como o projeto 2 o configura?", opcoes: ["Cross-Origin Resource Sharing controla quais origens acessam a API. O projeto 2 configura via CorsConfigurationSource, permitindo localhost:8080 e localhost:3000.", "Versionamento de rotas @ApiVersion.", "Criptografia Response Objects.", "Gateway Spring Cloud."], correta: 0 },

    // JWT
    { id: 51, tipo: 'objetiva', pergunta: "O que é JWT e como funciona no projeto 3?", opcoes: ["Transferência de arquivos FTP.", "JSON Web Token assinado digitalmente. O usuário faz login, o backend gera JWT; o frontend armazena e envia em cada requisição no header Authorization: Bearer token.", "Biblioteca React modais.", "Sessão no PostgreSQL por clique."], correta: 1 },
    { id: 52, tipo: 'objetiva', pergunta: "Qual é a diferença entre autenticação por sessão (projeto 2) e JWT stateless (projeto 3)?", opcoes: ["Sessão não usa cookies; JWT usa.", "Com sessões o backend guarda estado em memória. Com JWT stateless toda informação está no token, permitindo escalar horizontalmente sem compartilhar estado.", "Sessão expira em 5min; JWT não expira.", "Nenhuma diferença prática."], correta: 1 },
    { id: 53, tipo: 'objetiva', pergunta: "Por que o JWT não deve conter dados sensíveis no payload?", opcoes: ["Excede limite HTTP 256 bytes.", "JWT não é criptografado, apenas assinado. Qualquer pessoa que intercepte o token consegue ler o conteúdo, por exemplo usando jwt.io.", "Banco recusa strings extensas.", "React não decodifica aninhados."], correta: 1 },
    { id: 54, tipo: 'objetiva', pergunta: "Qual biblioteca Java é usada para manipular JWT no projeto 3?", opcoes: ["Spring Native Tokenizer.", "A biblioteca JJWT (io.jsonwebtoken), adicionada no pom.xml com três artefatos: jjwt-api, jjwt-impl (runtime) e jjwt-jackson (runtime).", "java.security.Token.", "Apache Commons Auth."], correta: 1 },
    { id: 55, tipo: 'objetiva', pergunta: "Qual é o tempo de expiração do JWT no projeto 3 e como é configurado?", opcoes: ["30 minutos fixos em código.", "Não expira em dev, 1h em prod.", "86400000 milissegundos (24 horas), configurado em app.jwt.expiracao-ms no application.yml. A chave secreta deve vir de variável de ambiente em produção.", "Aleatório a cada login."], correta: 2 },

    // REACT
    { id: 56, tipo: 'objetiva', pergunta: "O que é React e qual é sua principal ideia arquitetural?", opcoes: ["Linguagem tipada backend.", "Biblioteca JavaScript para interfaces de usuário. Ideia principal: dividir a UI em componentes reutilizáveis com estado próprio. É declarativo.", "Framework CSS dark theme.", "NoSQL no navegador."], correta: 1 },
    { id: 57, tipo: 'objetiva', pergunta: "O que é uma SPA e como o projeto 3 a implementa?", opcoes: ["Sistema Processamento Assíncrono.", "Single Page Application carrega uma página e atualiza conteúdo dinamicamente. Projeto 3 usa React com Vite na porta 5173, separado do backend Spring Boot na porta 8080.", "Secure Protocol Access routes.", "SEO de recarregamento total."], correta: 1 },
    { id: 58, tipo: 'objetiva', pergunta: "O que é o hook useState e como é exemplificado no livro?", opcoes: ["Acessa window.state.", "Gerencia rotas e navegação.", "Gerencia estado local em componentes funcionais. Exemplo: const [valor, setValor] = useState(0) retorna o estado atual e uma função para atualizá-lo.", "Faz requisições HTTP onMount."], correta: 2 },
    { id: 59, tipo: 'objetiva', pergunta: "Qual ferramenta de build é usada no projeto 3 para o frontend React?", opcoes: ["Webpack manual.", "Gulp assets.", "Create React App.", "Vite, que serve a aplicação React na porta 5173 por padrão em desenvolvimento."], correta: 3 },
    { id: 60, tipo: 'objetiva', pergunta: "O que são rotas protegidas no frontend React?", opcoes: ["Páginas encriptadas via VPN.", "Rotas que redirecionam usuário não autenticado para o login. No projeto 3 protegem checkout, histórico de pedidos e painel administrativo.", "Rotas processadas pelo Spring.", "Caminhos OS bloqueados."], correta: 1 },

    // PROJETO 1, 2, 3 E AVANÇADOS
    { id: 61, tipo: 'objetiva', pergunta: "Quais são as tecnologias usadas no Projeto 1?", opcoes: ["Django, SQLite, Vue.", "Backend: Node.js com Express. Banco: PostgreSQL. Frontend: HTML, CSS, Bootstrap e JavaScript puro.", "PHP, MySQL, jQuery.", "Ruby on Rails, MariaDB, Angular."], correta: 1 },
    { id: 62, tipo: 'objetiva', pergunta: "Quais são os filtros disponíveis na interface do Gerenciador de Tarefas do Projeto 1?", opcoes: ["Cor de tag.", "Três filtros via tabs: Todas, Pendentes e Concluídas. Fazem requisições à API com o parâmetro de status correspondente.", "Data e Prioridade.", "Ordem alfabética apenas."], correta: 1 },
    { id: 63, tipo: 'objetiva', pergunta: "Como o Projeto 1 implementa a persistência de dados?", opcoes: ["CSV local.", "IndexedDB.", "Dados armazenados no PostgreSQL. Cada operação faz requisição à API REST que executa a query correspondente via pool de conexões.", "Variáveis globais Node."], correta: 2 },
    { id: 64, tipo: 'objetiva', pergunta: "O que é a função escapeHtml() usada no frontend e por que é importante?", opcoes: ["Comprime HTML de rede.", "Converte caracteres especiais HTML em entidades seguras. Previne ataques XSS ao exibir conteúdo inserido pelo usuário no DOM.", "Impede quebra de layout de divs.", "Traduz para navegadores antigos."], correta: 1 },
    { id: 65, tipo: 'objetiva', pergunta: "Quais são as melhorias sugeridas pelo livro para o Projeto 1?", opcoes: ["Migrar para MongoDB e GraphQL.", "Data de vencimento para tarefas; marcar como importantes; busca por palavra-chave; categorias e tags; arrastar e soltar com SortableJS; substituir alert por toasts Bootstrap.", "Criar um app nativo em React Native.", "Implementar WebSockets para chat."], correta: 1 },
    { id: 66, tipo: 'objetiva', pergunta: "Quais são as tecnologias do Projeto 2 e a principal mudança em relação ao Projeto 1?", opcoes: ["Python/Flask. Mudou de relacional para NoSQL.", "Backend: Java com Spring Boot. Banco: PostgreSQL. Frontend: HTML, Bootstrap e JS puro. Mudança principal: migração do backend de Node.js/Express para Java/Spring Boot.", "C#/ASP.NET. Mudou layout para Tailwind.", "GoLang. Mudou o banco para Redis."], correta: 1 },
    { id: 67, tipo: 'objetiva', pergunta: "Quais são as cinco tabelas principais do banco de dados do blog (Projeto 2)?", opcoes: ["users, roles, permissions, sessions, logs.", "usuarios, posts, comentarios, tags e post_tags (tabela de junção para o relacionamento muitos-para-muitos entre posts e tags).", "artigos, categorias, imagens, autores, views.", "admin, publicacoes, curtidas, mensagens, config."], correta: 1 },
    { id: 68, tipo: 'objetiva', pergunta: "O que é um slug e como o Projeto 2 o gera automaticamente?", opcoes: ["Compressão de imagens de capa.", "ID gerado pelo Postgres.", "Versão amigável para URL do título. O PostService usa Normalizer para remover acentos, converte para minúsculas e substitui espaços por hífens.", "Token de rascunho."], correta: 2 },
    { id: 69, tipo: 'objetiva', pergunta: "Como o Projeto 2 implementa paginação nos posts?", opcoes: ["Cortes em arrays JS.", "Usa a interface Pageable do Spring Data. O controller recebe @PageableDefault com size 10 e chama o service que retorna um objeto Page com metadados de paginação.", "Comandos nativos LIMIT e OFFSET em JDBC puro.", "Rolagem infinita via cursores."], correta: 1 },
    { id: 70, tipo: 'objetiva', pergunta: "Quais são as funcionalidades do sistema de blog do Projeto 2?", opcoes: ["Apenas ler e escrever artigos simples anônimos.", "Cadastro e login, perfil com bio e avatar, criação e edição de posts pelo autor, listagem pública, comentários, tags, paginação e busca por palavra-chave.", "Fórum de discussão estilo Reddit.", "Plataforma de cursos com vídeos."], correta: 1 },
    { id: 71, tipo: 'objetiva', pergunta: "Quais são as tecnologias do Projeto 3?", opcoes: ["PHP, MySQL, Vue.", "Backend: Java com Spring Boot e JWT. Frontend: React com Vite. Banco: PostgreSQL. Axios é usado para chamadas HTTP no React.", "Node.js, MongoDB, Angular.", "Python, SQLite, Svelte."], correta: 1 },
    { id: 72, tipo: 'objetiva', pergunta: "Quais são as funcionalidades principais do e-commerce do Projeto 3?", opcoes: ["Apenas vitrine sem compra.", "Catálogo paginado com busca e filtro por categoria, carrinho persistido no backend, checkout, autenticação JWT, rotas protegidas, painel administrativo e histórico de pedidos.", "Marketplace para múltiplos vendedores.", "Sistema de leilões online."], correta: 1 },
    { id: 73, tipo: 'objetiva', pergunta: "Quais são os status possíveis de um pedido no Projeto 3?", opcoes: ["NOVO, AVALIADO, CONCLUÍDO.", "PENDENTE, PAGO, ENVIADO, ENTREGUE e CANCELADO. Definidos como enum Status dentro da entidade Pedido.", "CARRINHO, FATURADO, FECHADO.", "1, 2, 3, 4, 5."], correta: 1 },
    { id: 74, tipo: 'objetiva', pergunta: "Qual é a diferença arquitetural entre o Projeto 2 e o Projeto 3 no frontend?", opcoes: ["Proj 2 usa CSS puro, Proj 3 usa Tailwind.", "Proj 2 é mobile, Proj 3 é desktop.", "No projeto 2 o Spring Boot servia os arquivos HTML estáticos. No projeto 3 o React é uma SPA independente na porta 5173 que se comunica com o backend na porta 8080 via REST e JWT.", "Proj 2 não tinha frontend, apenas CLI."], correta: 2 },
    { id: 75, tipo: 'objetiva', pergunta: "O que é o painel administrativo do Projeto 3 e quem pode acessá-lo?", opcoes: ["Área pública de relatórios.", "Dashboard do PostgreSQL.", "Área para gerenciar produtos, categorias e pedidos. Acessível apenas a usuários com papel ADMIN, protegido no frontend com rotas React e no backend com Spring Security.", "Painel de edição CMS para marketing."], correta: 2 },
    { id: 76, tipo: 'objetiva', pergunta: "O que é Inversão de Controle (IoC) e Injeção de Dependência no Spring Boot?", opcoes: ["IoC desliga o servidor em erros. DI injeta falhas controladas para testes.", "IoC significa que o framework controla o ciclo de vida dos objetos. Injeção de Dependência: o Spring fornece dependências automaticamente via @Autowired ou construtor com @RequiredArgsConstructor.", "Ambas se referem a rotinas exclusivas de controle de concorrência em bancos SQL.", "São padrões visuais utilizados exclusivamente para montar as páginas HTML."], correta: 1 },
    { id: 77, tipo: 'objetiva', pergunta: "O que é escalabilidade horizontal e como o JWT a facilita?", opcoes: ["Aumentar a memória RAM do servidor.", "Dividir tabelas do banco em shards.", "Adicionar mais instâncias do servidor. JWT facilita por ser stateless: toda informação de autenticação está no token, qualquer instância pode atender qualquer requisição sem compartilhar estado em memória.", "Geração de gráficos de crescimento pelo JWT."], correta: 2 },
    { id: 78, tipo: 'objetiva', pergunta: "O que é @RestControllerAdvice e qual é seu papel no projeto 2?", opcoes: ["Desligamento de rotas em emergência.", "Log bruto de disco.", "Anotação que define tratamento global de exceções. O GlobalExceptionHandler a usa para capturar exceções e retornar respostas HTTP padronizadas sem try/catch espalhados pelo código.", "Aviso por e-mail a administradores."], correta: 2 },
    { id: 79, tipo: 'objetiva', pergunta: "O que é Flyway ou Liquibase e por que o livro os menciona para produção?", opcoes: ["Hospedagem em nuvem gratuita.", "Bibliotecas CSS responsivas.", "Ferramentas de migration que versionam alterações de schema. Em produção são superiores ao ddl-auto update, evitando perda de dados e permitindo reversão de mudanças.", "Padrões de multithreading Java."], correta: 2 },
    { id: 80, tipo: 'objetiva', pergunta: "Qual é a lição pedagógica do livro ao apresentar três projetos com complexidade crescente?", opcoes: ["Provar que Java é sempre superior a Node.js.", "Ensinar a instalar programas no Linux.", "Mostrar como os mesmos conceitos (CRUD, banco, autenticação, frontend e backend) se aplicam em diferentes stacks, crescendo de Node.js simples até React mais Spring Boot mais JWT para projetos reais.", "Focar exclusivamente na criação de layouts modernos com CSS."], correta: 2 }
];


const quizContainer = document.getElementById('quiz-container');
const btnTodas = document.getElementById('btn-todas');
const btnSimulado = document.getElementById('btn-simulado');
const statusPanel = document.getElementById('status-panel');

// Algoritmo de embaralhamento seguro (Fisher-Yates)
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Renderizar questão como múltipla escolha
function renderObjetiva(q, index) {
    const card = document.createElement('div');
    card.className = 'question-card';
    
    let optionsHtml = '';
    // Mapeia opções para salvar quem é a correta antes de embaralhar
    const opcoesComIndex = q.opcoes.map((opcao, idx) => ({ texto: opcao, correto: idx === q.correta }));
    
    // Embaralha as alternativas (A, B, C, D) para evitar decoreba visual
    const opcoesEmbaralhadas = shuffleArray(opcoesComIndex);

    opcoesEmbaralhadas.forEach((opcao) => {
        optionsHtml += `<button class="option-btn" data-correct="${opcao.correto}" data-q-id="${q.id}">${opcao.texto}</button>`;
    });

    card.innerHTML = `
        <div class="question-header">
            <span>Questão ${index} (Múltipla Escolha)</span>
            <span>ID Livro: ${q.id}</span>
        </div>
        <h3 class="question-title">${q.pergunta}</h3>
        <div class="options-grid">
            ${optionsHtml}
        </div>
    `;
    return card;
}

// Renderizar questão (objetiva de origem) como DISSERTATIVA no simulado
function renderDissertativa(q, index) {
    const card = document.createElement('div');
    card.className = 'question-card';
    
    // O gabarito oficial é o texto exato da alternativa correta original da questão
    const gabaritoOficial = q.opcoes[q.correta];

    card.innerHTML = `
        <div class="question-header">
            <span>Questão ${index} (Dissertativa)</span>
            <span>ID Livro: ${q.id}</span>
        </div>
        <h3 class="question-title">${q.pergunta}</h3>
        <textarea class="dissertativa-input" placeholder="Digite sua resposta de forma clara baseada nos conceitos aprendidos..."></textarea>
        <button class="action-btn btn-revelar" data-resposta="true">Revelar Gabarito Oficial</button>
        <div class="gabarito-box hidden">
            <strong>Gabarito Oficial (Baseado no Documento):</strong> <br/><br/>
            ${gabaritoOficial}
        </div>
    `;
    return card;
}

// Escuta cliques no container para validação de respostas
quizContainer.addEventListener('click', (e) => {
    // Clique em botão de alternativa
    if (e.target.classList.contains('option-btn')) {
        const btnClicado = e.target;
        const grid = btnClicado.parentElement;
        const isCorrect = btnClicado.dataset.correct === "true";
        const botoes = grid.querySelectorAll('.option-btn');
        
        // Bloqueia todos os botões desta questão e revela a cor correta
        botoes.forEach(b => {
            b.disabled = true;
            if (b.dataset.correct === "true") {
                b.classList.add('correct'); // Pinta o certo de verde
            }
        });

        // Se clicou na errada, pinta ela de vermelho
        if (!isCorrect) {
            btnClicado.classList.add('incorrect');
        }
    }

    // Clique no botão revelar gabarito
    if (e.target.classList.contains('btn-revelar')) {
        const btn = e.target;
        const gabaritoBox = btn.nextElementSibling;
        gabaritoBox.classList.remove('hidden'); // Exibe a caixa de texto
        btn.classList.add('hidden'); // Some com o botão "Revelar"
    }
});

// Renderiza aba "Banco de Questões" (As 80 como objetivas)
function carregarTodasQuestoes() {
    quizContainer.innerHTML = '';
    statusPanel.classList.add('hidden');
    btnTodas.classList.add('active');
    btnSimulado.classList.remove('active');

    questoesDB.forEach((q, index) => {
        quizContainer.appendChild(renderObjetiva(q, index + 1));
    });
}

// Renderiza aba "Simulado" (20 Aleatórias: 17 de marcar, 3 de escrever)
function gerarSimulado() {
    quizContainer.innerHTML = '';
    statusPanel.classList.remove('hidden');
    document.getElementById('simulado-stats').innerText = 'Simulado Aleatório Gerado (17 Objetivas | 3 Dissertativas)';
    btnSimulado.classList.add('active');
    btnTodas.classList.remove('active');

    // Embaralha o banco inteiro
    const bancoEmbaralhado = shuffleArray(questoesDB);

    // Pega as 20 primeiras questões do banco embaralhado
    const selecionadas = bancoEmbaralhado.slice(0, 20);

    // Renderiza a prova
    selecionadas.forEach((q, index) => {
        // Se for uma das 3 últimas do sorteio (índices 17, 18, 19), renderiza como dissertativa
        if (index >= 17) {
            quizContainer.appendChild(renderDissertativa(q, index + 1));
        } else {
            // As 17 primeiras renderizam como múltipla escolha padrão
            quizContainer.appendChild(renderObjetiva(q, index + 1));
        }
    });
    
    // Rola para o topo automaticamente
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Atrelando funções aos botões do Menu
btnTodas.addEventListener('click', carregarTodasQuestoes);
btnSimulado.addEventListener('click', gerarSimulado);

// Inicia automaticamente na aba "Banco de Questões"
carregarTodasQuestoes();