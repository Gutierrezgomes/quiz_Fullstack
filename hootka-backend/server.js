const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// Configuração de CORS para permitir requisições do seu Github Pages
app.use(cors({
    origin: "https://gutierrezgomes.github.io",
    methods: ["GET", "POST"]
}));

const server = http.createServer(app);

// Configuração do Socket.IO com CORS
const io = new Server(server, {
    cors: { 
        origin: "https://gutierrezgomes.github.io",
        methods: ["GET", "POST"]
    }
});

// Estado em memória do jogo
let players = {}; 
let gameState = 'LOBBY'; 
let currentQuestionIndex = 0;
let currentQuestions = [];

// BANCO DE DADOS - AS 80 QUESTÕES COMPLETAS E REVISADAS
const questoesDB = [
    { id: 1, tipo: 'objetiva', pergunta: "Qual ferramenta é recomendada para instalar e gerenciar múltiplas versões do Node.js?", opcoes: ["O npm (Node Package Manager).", "O nvm (Node Version Manager). No Linux/Mac instala-se via curl e permite trocar de versão facilmente com nvm use --lts.", "O npx, para executar pacotes temporários.", "O pm2, para gerenciamento de processos."], correta: 1 },
    { id: 2, tipo: 'objetiva', pergunta: "Qual versão do JDK é utilizada nos projetos com Spring Boot do livro, e qual distribuição é recomendada?", opcoes: ["JDK 11 / Oracle", "JDK 17 / OpenJDK", "JDK 21 (LTS) na distribuição Eclipse Temurin (anteriormente AdoptOpenJDK), disponível em adoptium.net.", "JDK 8 / Amazon Corretto"], correta: 2 },
    { id: 3, tipo: 'objetiva', pergunta: "Qual é a ferramenta de build padrão para projetos Java usada no livro, e o que ela faz?", opcoes: ["Gradle. Compila o código nativo.", "Ant. Empacota o projeto em .jar.", "O Maven. Ele gerencia dependências, compila o código, executa testes e empacota a aplicação.", "NPM. Baixa bibliotecas do Node."], correta: 2 },
    { id: 4, tipo: 'objetiva', pergunta: "Qual banco de dados é utilizado em todos os três projetos do livro?", opcoes: ["MySQL", "MongoDB", "PostgreSQL (versão 16 ou superior), um banco de dados relacional de código aberto.", "SQLite"], correta: 2 },
    { id: 5, tipo: 'dissertativa', pergunta: "Quais ferramentas de cliente HTTP o livro recomenda para testar APIs REST?", respostaExata: "Postman, Insomnia ou Thunder Client (extensão do VS Code). O livro recomenda o Insomnia por ser leve e intuitivo." },
    { id: 6, tipo: 'objetiva', pergunta: "O que são tags semânticas do HTML5? Cite três exemplos.", opcoes: ["Tags que descrevem o significado do conteúdo, tornando o código mais legível e acessível. Exemplos: header, nav, main, article, section, footer.", "Tags exclusivas para estilo. Exemplos: b, i, u.", "Tags de banco de dados. Exemplos: sql, query.", "Tags que substituem CSS. Exemplos: color, align."], correta: 0 },
    { id: 7, tipo: 'objetiva', pergunta: "Qual é a diferença entre HTML e CSS?", opcoes: ["HTML compila código, CSS executa no navegador.", "HTML define a estrutura (o que é cada elemento), enquanto CSS define a apresentação (cor, tamanho, posição, animação).", "HTML é backend, CSS é frontend.", "Não há diferença estrutural."], correta: 1 },
    { id: 8, tipo: 'objetiva', pergunta: "O que é o Bootstrap e qual versão é usada nos projetos?", opcoes: ["Biblioteca de ícones vetoriais.", "Motor de templates (versão 3).", "Framework CSS com classes prontas para componentes comuns. O livro usa Bootstrap 5, que abandonou o jQuery e é baseado em flexbox e CSS Grid.", "Banco de dados NoSQL (versão 6)."], correta: 2 },
    { id: 9, tipo: 'objetiva', pergunta: "Como funciona o sistema de grid responsivo do Bootstrap?", opcoes: ["Usa atributos colspan e rowspan.", "Usa classes como col-md-4 dentro de um row. Três divs com col-md-4 formam três colunas em telas médias e se empilham em telas pequenas.", "Usa exclusivamente a tag grid combinada com position absolute.", "Usa media queries em style.css."], correta: 1 },
    { id: 10, tipo: 'dissertativa', pergunta: "Quais são os três tipos de seletores CSS exemplificados no livro?", respostaExata: "Por tag (p {}), por classe (.destaque {}) e por id (#principal {}). O livro também mostra Flexbox com display: flex." },
    { id: 11, tipo: 'objetiva', pergunta: "Qual é a diferença entre const e let em JavaScript?", opcoes: ["const é global, let é local.", "const declara uma constante (não pode ser reatribuída). let declara uma variável mutável. Ambas têm escopo de bloco.", "const aceita números, let aceita strings.", "let é içada (hoisted) e const não."], correta: 1 },
    { id: 12, tipo: 'dissertativa', pergunta: "Cite três métodos de arrays em JavaScript mostrados no livro e explique cada um.", respostaExata: "map() transforma cada elemento retornando novo array; filter() filtra elementos por condição; reduce() acumula valores em um único resultado." },
    { id: 13, tipo: 'objetiva', pergunta: "O que é uma arrow function? Dê um exemplo.", opcoes: ["Função para desenhar vetores.", "Método de iteração inversa.", "Sintaxe moderna para funções. Ex: const multiplicar = (a,b) => a * b; mais concisa que function multiplicar(a, b) { return a * b; }.", "Função do framework React."], correta: 2 },
    { id: 14, tipo: 'objetiva', pergunta: "O que são async/await em JavaScript e para que servem?", opcoes: ["Compiladores de código JS em binário.", "Palavras-chave para operações assíncronas de forma legível. async marca a função e await pausa até uma Promise ser resolvida.", "Laços de repetição tradicionais.", "Funções do Node.js para disco."], correta: 1 },
    { id: 15, tipo: 'objetiva', pergunta: "O que é o método fetch() e como é usado no projeto 1?", opcoes: ["API do browser para requisições HTTP. No projeto 1: const response = await fetch com a URL, seguido de response.json() para obter os dados.", "Comando SQL abstraído no Javascript.", "Método do Express para ler arquivos.", "Função do Node para hardware."], correta: 0 },
    { id: 16, tipo: 'objetiva', pergunta: "O que é Node.js e qual é sua principal vantagem?", opcoes: ["Framework CSS mobile.", "Banco de dados relacional.", "Runtime JavaScript baseado no motor V8 do Chrome. Principal vantagem: ecossistema npm com mais de 2 milhões de pacotes para criar APIs, CLIs e servidores.", "Servidor Apache embutido."], correta: 2 },
    { id: 17, tipo: 'objetiva', pergunta: "No projeto 1, qual é a estrutura de pastas do backend?", opcoes: ["models/, views/, controllers/.", "src/server.js (entrada), src/routes/ (rotas), src/db/ (conexão). Arquivos estáticos do frontend ficam em public/.", "app/, config/, public/ no Docker.", "bin/, lib/, src/ com HTML misturado."], correta: 1 },
    { id: 18, tipo: 'dissertativa', pergunta: "O que são middlewares no Express? Quais são usados no projeto 1?", respostaExata: "Funções que processam requisições antes dos handlers. Projeto 1 usa: cors(), express.json(), express.urlencoded() e express.static()." },
    { id: 19, tipo: 'objetiva', pergunta: "O que é pool de conexões no PostgreSQL com Node.js e por que é importante?", opcoes: ["Serviço de cache do Redis.", "Reutiliza conexões abertas ao banco, evitando o custo de abrir uma nova a cada requisição. Melhora performance e escalabilidade.", "Estratégia de backup redundante.", "Criptografia de ponta a ponta."], correta: 1 },
    { id: 20, tipo: 'objetiva', pergunta: "O que são queries parametrizadas e por que são usadas?", opcoes: ["Queries em lote noturnas.", "Consultas SQL com valores separados como parâmetros. Protegem contra ataques SQL Injection.", "Subconsultas aninhadas de leitura.", "Procedures em memória RAM."], correta: 1 },
    { id: 21, tipo: 'dissertativa', pergunta: "Quais são os 5 endpoints da API REST de tarefas no projeto 1?", respostaExata: "GET /api/tarefas (listar), GET /api/tarefas/:id (buscar), POST /api/tarefas (criar), PATCH /api/tarefas/:id (atualizar), DELETE /api/tarefas/:id (excluir)." },
    { id: 22, tipo: 'objetiva', pergunta: "Como o projeto 1 lida com variáveis sensíveis como credenciais do banco?", opcoes: ["Texto puro no server.js.", "Usa variáveis de ambiente com o pacote dotenv. As credenciais ficam em .env (não commitado) e são acessadas via process.env.NOME_VARIAVEL.", "localStorage do navegador.", "JSON estático em public/."], correta: 1 },
    { id: 23, tipo: 'objetiva', pergunta: "O que é REST e quais são os cinco verbos HTTP de uma API REST?", opcoes: ["Linguagem de programação.", "REST (Representational State Transfer) é um estilo arquitetural. Verbos: GET (buscar), POST (criar), PUT (atualizar completo), PATCH (parcial), DELETE (excluir).", "Protocolo seguro SMTP.", "Framework Javascript de MERGE."], correta: 1 },
    { id: 24, tipo: 'objetiva', pergunta: "Qual é a diferença entre PUT e PATCH?", opcoes: ["PUT deleta suavemente, PATCH permanentemente.", "PUT atualiza o recurso completo (todos os campos). PATCH atualiza apenas os campos informados (atualização parcial).", "PUT cria, PATCH exclui lógica.", "PUT assíncrono, PATCH síncrono."], correta: 1 },
    { id: 25, tipo: 'objetiva', pergunta: "O que é o endpoint de saúde (health check) criado no projeto 1?", opcoes: ["GET /api/saude retorna status ok com timestamp. Serve para verificar se o servidor está funcionando, útil para monitoramento.", "POST /api/check para forçar login.", "GET /api/error lista os bugs.", "DELETE /api/health para desligar servidor."], correta: 0 },
    { id: 26, tipo: 'objetiva', pergunta: "Quais são as quatro operações básicas de SQL demonstradas no livro?", opcoes: ["FETCH, PUSH, PULL, MERGE", "GRANT, REVOKE, COMMIT, ROLLBACK", "CREATE TABLE (criar tabela), INSERT INTO (inserir), SELECT (consultar), UPDATE (atualizar) e DELETE (excluir).", "JOIN, UNION, INTERSECT, EXCEPT"], correta: 2 },
    { id: 27, tipo: 'objetiva', pergunta: "O que significa SERIAL PRIMARY KEY em PostgreSQL?", opcoes: ["Chave estrangeira por data.", "Chave composta de texto.", "SERIAL cria uma sequência auto-incrementada. PRIMARY KEY define essa coluna como chave primária da tabela.", "Índice que impede deleções."], correta: 2 },
    { id: 28, tipo: 'objetiva', pergunta: "O que são índices e por que o projeto 3 os cria nas tabelas de produtos?", opcoes: ["Aceleram consultas evitando varredura completa. No projeto 3 são criados em categoria_id e ativo, campos usados frequentemente em filtros.", "Criptografam senhas.", "Fazem backup do banco.", "Geram relatórios em PDF."], correta: 0 },
    { id: 29, tipo: 'objetiva', pergunta: "Por que o projeto 3 guarda nome e preço na tabela itens_pedido ao invés de apenas o id do produto?", opcoes: ["Ocupar espaço em disco.", "Evitar cláusulas JOIN lentas.", "Para preservar um snapshot no momento da compra. Se o preço ou nome mudar depois, o histórico de pedidos permanece correto.", "Exigência de integração do React."], correta: 2 },
    { id: 30, tipo: 'objetiva', pergunta: "O que é a restrição UNIQUE (usuario_id, produto_id) na tabela carrinho_itens?", opcoes: ["Garante que cada usuário tenha no máximo um registro por produto no carrinho. Adicionar o mesmo produto duas vezes vira UPDATE, não duplicata.", "Impede que dois comprem a mesma peça.", "Apaga duplicados no checkout.", "Bloqueia compras repetidas."], correta: 0 },
    { id: 31, tipo: 'dissertativa', pergunta: "Quais são as seis camadas da arquitetura Spring Boot usadas no projeto 2?", respostaExata: "Entity (modelo), Repository (acesso ao banco), Service (lógica de negócio), Controller (endpoints HTTP), DTO (dados em trânsito) e Config (configurações)." },
    { id: 32, tipo: 'objetiva', pergunta: "O que é o Spring Initializr?", opcoes: ["IDE oficial da Oracle.", "Gerador web em start.spring.io que cria o ZIP do projeto Spring Boot com as dependências selecionadas.", "Ferramenta de monitoramento do banco.", "Plugin embutido no Maven wrapper."], correta: 1 },
    { id: 33, tipo: 'objetiva', pergunta: "Qual é a diferença entre application.properties e application.yml?", opcoes: ["Properties é obsoleto e incompatível com Java 21.", "Ambos configuram a aplicação, mas YAML usa indentação hierárquica, tornando-o mais legível. O livro migra para .yml por legibilidade.", "Properties compila mais rápido no Docker.", "Não há diferença sintática."], correta: 1 },
    { id: 34, tipo: 'objetiva', pergunta: "O que faz ddl-auto: update no Hibernate e por que não deve ser usado em produção?", opcoes: ["Atualiza pacotes da build.", "Cria e atualiza tabelas automaticamente. Em produção é perigoso pois uma renomeação de campo pode causar perda de dados. Use validate com Flyway ou Liquibase.", "Limpa o banco a cada restart.", "Otimiza queries com alto uso de CPU."], correta: 1 },
    { id: 35, tipo: 'objetiva', pergunta: "O que é o Maven Wrapper (mvnw) e qual é sua vantagem?", opcoes: ["Dependência para interfaces UI.", "Script incluído no projeto que baixa a versão correta do Maven automaticamente, garantindo que todos usem a mesma versão sem instalação global.", "Plugin de segurança de módulos.", "Framework para testes automatizados."], correta: 1 },
    { id: 36, tipo: 'objetiva', pergunta: "O que significa a anotação @Entity em uma classe Java?", opcoes: ["Transforma objeto em JSON.", "Marca a classe como DTO.", "Marca a classe como uma entidade JPA, ou seja, ela é mapeada para uma tabela no banco de dados.", "Define regra de negócio protegida."], correta: 2 },
    { id: 37, tipo: 'objetiva', pergunta: "O que fazem @PrePersist e @PreUpdate em uma entidade JPA?", opcoes: ["Validam dados antes do HTTP.", "Limpam cache em memória.", "@PrePersist executa antes de inserir o registro. @PreUpdate executa antes de atualizar. Usados para preencher criadoEm e atualizadoEm automaticamente.", "Fazem logs via SELECT."], correta: 2 },
    { id: 38, tipo: 'objetiva', pergunta: "Qual é a diferença entre FetchType.LAZY e FetchType.EAGER?", opcoes: ["LAZY para inserção, EAGER leitura.", "LAZY carrega dados relacionados só quando acessados (mais performático). EAGER carrega junto com a entidade principal (pode causar N+1 queries).", "LAZY é mais lento em JOIN simples.", "LAZY consome mais memória no servidor."], correta: 1 },
    { id: 39, tipo: 'objetiva', pergunta: "Como o Spring Data JPA gera consultas a partir do nome do método?", opcoes: ["Usa IA adaptativa do Hibernate.", "Lê o nome do método e gera a query automaticamente. Ex: findByEmail gera SELECT FROM usuario WHERE email = ?. Funciona com findBy, existsBy, countBy e deleteBy.", "Exige arquivo XML complementar.", "Via anotações @Sql nativas."], correta: 1 },
    { id: 40, tipo: 'objetiva', pergunta: "O que é JPQL e quando o livro recomenda usá-lo?", opcoes: ["Java Performance Query Library.", "Biblioteca externa de requisições.", "JPA Query Language, parecida com SQL mas usa entidades e atributos Java. Usada via @Query quando o nome de método derivado ficaria complexo demais.", "Ferramenta de limpeza de JSONs."], correta: 2 },
    { id: 41, tipo: 'dissertativa', pergunta: "Como funciona o @ManyToMany entre Post e Tag no projeto 2?", respostaExata: "Usa @JoinTable com a tabela intermediária post_tags com colunas post_id e tag_id. Cascade PERSIST e MERGE salvam tags novas automaticamente." },
    { id: 42, tipo: 'dissertativa', pergunta: "O que é o Lombok? Cite quatro anotações dele usadas no livro.", respostaExata: "Reduz boilerplate Java. Anotações: @Getter e @Setter, @NoArgsConstructor (construtor vazio), @AllArgsConstructor (todos os args), @Builder." },
    { id: 43, tipo: 'objetiva', pergunta: "Por que o livro usa DTOs separados das entidades JPA?", opcoes: ["Otimizar processamento do disco nativo.", "Para não expor detalhes internos como hash de senha, permitir validações específicas por endpoint e evoluir a API independentemente do banco.", "Economizar linhas de código explicitamente.", "Exigência mandatória do Java 21 LTS."], correta: 1 },
    { id: 44, tipo: 'dissertativa', pergunta: "Quais anotações de Bean Validation são usadas no UsuarioRegistroDTO?", respostaExata: "@NotBlank (campo não pode ser vazio), @Size (limite de tamanho) e @Email (formato de e-mail válido). Ativadas com @Valid no controller." },
    { id: 45, tipo: 'objetiva', pergunta: "Como o projeto 2 trata erros de validação de forma centralizada?", opcoes: ["Inserindo try/catch nos controllers.", "Redirecionando para erro HTML.", "Usa GlobalExceptionHandler com @RestControllerAdvice. Captura MethodArgumentNotValidException e retorna mapa com erros de cada campo com status 400.", "Ocultando silenciosamente em logs."], correta: 2 },
    { id: 46, tipo: 'objetiva', pergunta: "O que é Spring Security e qual é sua função nos projetos 2 e 3?", opcoes: ["Antivírus para a JVM.", "Módulo padrão do Spring para autenticação e autorização. Projeto 2 usa sessões HTTP; projeto 3 usa JWT stateless.", "Interface de criptografia nativa em disco.", "Firewall acoplado no Tomcat."], correta: 1 },
    { id: 47, tipo: 'objetiva', pergunta: "Por que nunca armazenar senhas em texto puro? Qual algoritmo o livro usa?", opcoes: ["O livro usa MD5 rudimentar.", "Usa SHA-1 nativo estrito.", "Senhas expostas se o banco for comprometido. O livro usa BCrypt via PasswordEncoder, que gera hashes resistentes a força bruta.", "Usa AES-256 com chave local."], correta: 2 },
    { id: 48, tipo: 'objetiva', pergunta: "O que é o UserDetailsService e como é implementado no projeto 2?", opcoes: ["Serviço para renderizar views HTML.", "Interface que o Spring Security usa para carregar usuários por username. A implementação busca por email no banco e retorna User com roles.", "Módulo de envio de emails.", "Tabela secundária para auditoria."], correta: 1 },
    { id: 49, tipo: 'objetiva', pergunta: "Como o projeto 2 configura rotas públicas e protegidas?", opcoes: ["Via arquivos XML estáticos.", "Com anotação @Public nas controllers.", "Via SecurityFilterChain com authorizeHttpRequests. As rotas de autenticação e leitura de posts são permitAll. Criar, editar e excluir requerem authenticated.", "Middlewares diretos no gateway."], correta: 2 },
    { id: 50, tipo: 'objetiva', pergunta: "O que é CORS e como o projeto 2 o configura?", opcoes: ["Cross-Origin Resource Sharing controla quais origens acessam a API. O projeto 2 configura via CorsConfigurationSource, permitindo localhost:8080 e localhost:3000.", "Criptografia de fluxos trafegados.", "Gerenciamento de cache do Spring.", "Ferramenta para rotear links no React."], correta: 0 },
    { id: 51, tipo: 'objetiva', pergunta: "O que é JWT e como funciona no projeto 3?", opcoes: ["Sessão baseada em cookies físicos no backend.", "JSON Web Token assinado digitalmente. O usuário faz login, o backend gera JWT; o frontend armazena e envia em cada requisição no header Authorization: Bearer token.", "Biblioteca para renderizar HTML dinâmico.", "Roteamento de links longos do React."], correta: 1 },
    { id: 52, tipo: 'objetiva', pergunta: "Qual é a diferença entre autenticação por sessão e JWT stateless?", opcoes: ["Sessão opera apenas no front-end.", "Com sessões o backend guarda estado em memória. Com JWT stateless toda informação está no token, permitindo escalar horizontalmente sem compartilhar estado.", "JWT é mais lento e menos seguro.", "JWT obriga cookies fixos atrelados."], correta: 1 },
    { id: 53, tipo: 'objetiva', pergunta: "Por que o JWT não deve conter dados sensíveis no payload?", opcoes: ["Excede limite HTTP.", "JWT não é criptografado, apenas assinado. Qualquer pessoa que intercepte o token consegue ler o conteúdo, por exemplo usando jwt.io.", "Spring Security veta e proíbe.", "Expira de forma obrigatória em 2 minutos."], correta: 1 },
    { id: 54, tipo: 'objetiva', pergunta: "Qual biblioteca Java é usada para manipular JWT no projeto 3?", opcoes: ["Auth0 Secure.", "Nimbus JOSE.", "A biblioteca JJWT (io.jsonwebtoken), adicionada no pom.xml com três artefatos: jjwt-api, jjwt-impl (runtime) e jjwt-jackson (runtime).", "Spring Auth Token Standard."], correta: 2 },
    { id: 55, tipo: 'objetiva', pergunta: "Qual é o tempo de expiração do JWT no projeto 3 e como é configurado?", opcoes: ["1 hora engessada no código.", "86400000 milissegundos (24 horas), configurado em app.jwt.expiracao-ms no application.yml. A chave secreta deve vir de variável de ambiente em produção.", "7 dias setados no backend.", "Nunca expira sozinho."], correta: 1 },
    { id: 56, tipo: 'objetiva', pergunta: "O que é React e qual é sua principal ideia arquitetural?", opcoes: ["Framework CSS mobile.", "Biblioteca JavaScript para interfaces de usuário. Ideia principal: dividir a UI em componentes reutilizáveis com estado próprio. É declarativo.", "Linguagem focada em backend.", "Banco de dados residente em cache."], correta: 1 },
    { id: 57, tipo: 'objetiva', pergunta: "O que é uma SPA e como o projeto 3 a implementa?", opcoes: ["Múltiplas Páginas com PHP.", "Single Page Application carrega uma página e atualiza conteúdo dinamicamente. Projeto 3 usa React com Vite na porta 5173, separado do backend Spring Boot na porta 8080.", "Proxy embutido nativo.", "Componente estático offline."], correta: 1 },
    { id: 58, tipo: 'objetiva', pergunta: "O que é o hook useState e como é exemplificado no livro?", opcoes: ["Faz chamadas HTTP.", "Gerencia estado local em componentes funcionais. Exemplo: const [valor, setValor] = useState(0) retorna o estado atual e uma função para atualizá-lo.", "Bloqueia fluxo de formulários.", "Acessa o DOM raiz diretamente."], correta: 1 },
    { id: 59, tipo: 'objetiva', pergunta: "Qual ferramenta de build é usada no projeto 3 para o frontend React?", opcoes: ["Webpack.", "Create React App (CRA).", "Vite, que serve a aplicação React na porta 5173 por padrão em desenvolvimento.", "Babel puro."], correta: 2 },
    { id: 60, tipo: 'objetiva', pergunta: "O que são rotas protegidas no frontend React?", opcoes: ["Rotas bloqueadas pelo firewall nativo.", "Rotas que redirecionam usuário não autenticado para o login. No projeto 3 protegem checkout, histórico de pedidos e painel administrativo.", "Caminhos ofuscados puramente locais.", "Links absolutos HTTPS."], correta: 1 },
    { id: 61, tipo: 'dissertativa', pergunta: "Quais são as tecnologias usadas no Projeto 1 (Gerenciador de Tarefas)?", respostaExata: "Backend: Node.js com Express. Banco: PostgreSQL. Frontend: HTML, CSS, Bootstrap e JavaScript puro." },
    { id: 62, tipo: 'objetiva', pergunta: "Quais são os filtros disponíveis na interface do Gerenciador de Tarefas do Projeto 1?", opcoes: ["Filtros por Data e Idade.", "Filtros por Urgente e Normal.", "Três filtros via tabs: Todas, Pendentes e Concluídas. Fazem requisições à API com o parâmetro de status correspondente.", "Apenas ativas e inativas."], correta: 2 },
    { id: 63, tipo: 'objetiva', pergunta: "Como o Projeto 1 implementa a persistência de dados?", opcoes: ["Salva em arquivos locais JSON.", "Usa matrizes em memória global.", "Dados armazenados no PostgreSQL. Cada operação faz requisição à API REST que executa a query correspondente via pool de conexões.", "Apenas LocalStorage."], correta: 2 },
    { id: 64, tipo: 'objetiva', pergunta: "O que é a função escapeHtml() usada no frontend e por que é importante?", opcoes: ["Formata visualmente as cores.", "Comprime imagens renderizadas.", "Converte caracteres especiais HTML em entidades seguras. Previne ataques XSS ao exibir conteúdo inserido pelo usuário no DOM.", "Limpa o cache do navegador."], correta: 2 },
    { id: 65, tipo: 'dissertativa', pergunta: "Cite quatro melhorias sugeridas pelo livro para o Projeto 1.", respostaExata: "Data de vencimento para tarefas; marcar como importantes; busca por palavra-chave; categorias e tags; arrastar e soltar com SortableJS; substituir alert por toasts Bootstrap." },
    { id: 66, tipo: 'dissertativa', pergunta: "Quais são as tecnologias do Projeto 2 e a principal mudança em relação ao Projeto 1?", respostaExata: "Backend: Java com Spring Boot. Banco: PostgreSQL. Front: HTML, Bootstrap e JS puro. A mudança principal é a migração do backend de Node.js/Express para Java/Spring Boot." },
    { id: 67, tipo: 'dissertativa', pergunta: "Quais são as cinco tabelas principais do banco de dados do blog no Projeto 2?", respostaExata: "usuarios, posts, comentarios, tags e post_tags (a tabela de junção para o relacionamento muitos-para-muitos entre posts e tags)." },
    { id: 68, tipo: 'objetiva', pergunta: "O que é um slug e como o Projeto 2 o gera automaticamente?", opcoes: ["Código numérico hexagonal.", "Versão amigável para URL do título. Por exemplo, Meu Post vira meu-post. O PostService usa Normalizer para remover acentos, converte para minúsculas e substitui espaços por hífens.", "Miniatura renderizada.", "Backup do cache do servidor."], correta: 1 },
    { id: 69, tipo: 'objetiva', pergunta: "Como o Projeto 2 implementa paginação nos posts?", opcoes: ["Filtros em arrays JS gigantes.", "Comandos nativos LIMIT e OFFSET injetados via JDBC.", "Usa a interface Pageable do Spring Data. O controller recebe @PageableDefault com size 10 e chama o service que retorna um objeto Page com metadados de paginação.", "Não implementa paginação."], correta: 2 },
    { id: 70, tipo: 'dissertativa', pergunta: "Quais são as funcionalidades do sistema de blog do Projeto 2?", respostaExata: "Cadastro e login, perfil com bio e avatar, criação e edição de posts pelo autor, listagem pública, comentários, tags, paginação e busca por palavra-chave." },
    { id: 71, tipo: 'dissertativa', pergunta: "Quais são as tecnologias do Projeto 3?", respostaExata: "Backend: Java com Spring Boot e JWT. Frontend: React com Vite. Banco: PostgreSQL. Axios é usado para chamadas HTTP no React." },
    { id: 72, tipo: 'dissertativa', pergunta: "Quais são as funcionalidades principais do e-commerce do Projeto 3?", respostaExata: "Catálogo paginado com busca e filtro por categoria, carrinho persistido no backend, checkout, autenticação JWT, rotas protegidas, painel administrativo e histórico de pedidos." },
    { id: 73, tipo: 'objetiva', pergunta: "Quais são os status possíveis de um pedido no Projeto 3?", opcoes: ["NOVO, AVALIADO, REJEITADO.", "PENDENTE, PAGO, ENVIADO, ENTREGUE e CANCELADO. Definidos como enum Status dentro da entidade Pedido.", "INICIO, DESPACHO, FINAL.", "ETAPA_1, ETAPA_2, ETAPA_3."], correta: 1 },
    { id: 74, tipo: 'dissertativa', pergunta: "Qual é a diferença arquitetural entre o Projeto 2 e o Projeto 3 no frontend?", respostaExata: "No projeto 2 o Spring Boot servia os arquivos HTML estáticos. No projeto 3 o React é uma SPA independente na porta 5173 que se comunica com o backend na porta 8080 via REST e JWT." },
    { id: 75, tipo: 'objetiva', pergunta: "O que é o painel administrativo do Projeto 3 e quem pode acessá-lo?", opcoes: ["Painel aberto na página principal.", "Área para gerenciar produtos, categorias e pedidos. Acessível apenas a usuários com papel ADMIN, protegido no frontend com rotas React e no backend com Spring Security.", "Acesso direto as chaves de banco de dados nativas.", "Área pública mediante criação simples de senha."], correta: 1 },
    { id: 76, tipo: 'dissertativa', pergunta: "O que é Inversão de Controle (IoC) e Injeção de Dependência no Spring Boot?", respostaExata: "IoC significa que o framework controla o ciclo de vida dos objetos. Injeção de Dependência: o Spring fornece dependências automaticamente via @Autowired ou construtor com @RequiredArgsConstructor." },
    { id: 77, tipo: 'objetiva', pergunta: "O que é escalabilidade horizontal e como o JWT a facilita?", opcoes: ["Aumentar memória e disco da máquina local.", "Dividir dados fisicamente no banco.", "Adicionar mais instâncias do servidor. JWT facilita por ser stateless: toda informação de autenticação está no token, qualquer instância pode atender qualquer requisição.", "Gerar logs em paralelo por rotinas noturnas."], correta: 2 },
    { id: 78, tipo: 'objetiva', pergunta: "O que é @RestControllerAdvice e qual é seu papel no projeto 2?", opcoes: ["Uma forma genérica de declarar views.", "Função assíncrona para envio de disparo em massa.", "Anotação que define tratamento global de exceções. O GlobalExceptionHandler a usa para capturar exceções e retornar respostas HTTP padronizadas sem try/catch espalhados pelo código.", "Responsável pelos rastros físicos no banco de dados."], correta: 2 },
    { id: 79, tipo: 'objetiva', pergunta: "O que é Flyway ou Liquibase e por que o livro os menciona para produção?", opcoes: ["Frameworks visuais de carregamento front-end.", "Estruturas de cache em disco.", "Sistemas puramente de cloud nativo com paralelismo.", "Ferramentas de migration que versionam alterações de schema. Em produção são superiores ao ddl-auto update, evitando perda de dados e permitindo reversão de mudanças."], correta: 3 },
    { id: 80, tipo: 'dissertativa', pergunta: "Qual é a lição pedagógica do livro ao apresentar três projetos com complexidade crescente?", respostaExata: "Mostrar como os mesmos conceitos (CRUD, banco, autenticação, frontend e backend) se aplicam em diferentes stacks, crescendo de Node.js simples até React mais Spring Boot mais JWT para projetos reais." }
];


// --- CÓDIGO DA LÓGICA DO SERVIDOR MULTIPLAYER ABAIXO ---

// Função para embaralhar os arrays usando Fisher-Yates
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Sorteia e retorna 10 questões objetivas e 4 dissertativas
function generateSimulado() {
    let objetivas = questoesDB.filter(q => q.tipo === 'objetiva');
    let dissertativas = questoesDB.filter(q => q.tipo === 'dissertativa');

    // Embaralha as questões de forma segura
    objetivas = shuffleArray(objetivas);
    dissertativas = shuffleArray(dissertativas);

    // Pega 10 objetivas e 4 dissertativas
    const selecionadas = [
        ...objetivas.slice(0, 10),
        ...dissertativas.slice(0, 4)
    ];

    // Embaralha a prova final para misturar os tipos de questão na tela
    return shuffleArray(selecionadas);
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// Configuração de CORS para permitir requisições do seu Github Pages
app.use(cors({
    origin: "https://gutierrezgomes.github.io",
    methods: ["GET", "POST"]
}));

const server = http.createServer(app);

// Configuração do Socket.IO com CORS
const io = new Server(server, {
    cors: { 
        origin: "https://gutierrezgomes.github.io",
        methods: ["GET", "POST"]
    }
});

// Estado em memória do jogo
let players = {}; 
let gameState = 'LOBBY'; 
let currentQuestionIndex = 0;
let currentQuestions = [];

io.on('connection', (socket) => {
    socket.on('join_game', (data) => {
        if (gameState !== 'LOBBY') return socket.emit('error', 'O jogo já começou! Espere a próxima partida.');
        
        players[socket.id] = { 
            id: socket.id, 
            name: data.name, 
            avatar: data.avatar, 
            score: 0, 
            answered: false,
            isReady: false 
        };
        io.emit('update_players', Object.values(players));
    });

    socket.on('toggle_ready', () => {
        const player = players[socket.id];
        if (!player) return;

        player.isReady = !player.isReady;
        io.emit('update_players', Object.values(players));

        const playersList = Object.values(players);
        // O jogo só inicia se houverem jogadores na sala E se todos estiverem prontos
        const allReady = playersList.length > 0 && playersList.every(p => p.isReady);

        if (allReady && gameState === 'LOBBY') {
            gameState = 'PLAYING';
            currentQuestions = generateSimulado();
            currentQuestionIndex = 0;
            
            // Reseta a pontuação e os status para o início do jogo
            for(let id in players) {
                players[id].score = 0;
                players[id].isReady = false; 
            }
            
            io.emit('game_started');
            sendQuestion();
        }
    });

    socket.on('submit_answer', (answerText) => {
        const player = players[socket.id];
        if (!player || player.answered) return;
        
        player.answered = true;
        const q = currentQuestions[currentQuestionIndex];

        if (q.tipo === 'objetiva') {
            const textoCorreto = q.opcoes[q.correta];
            // Validação exata por string
            if (answerText === textoCorreto) player.score += 100;
        } else {
            // Se for dissertativa, o jogador ganha 50 pontos de participação apenas por enviar uma resposta coerente em tamanho
            if (answerText.trim().length > 5) player.score += 50; 
        }
        
        const allAnswered = Object.values(players).every(p => p.answered);
        if (allAnswered) {
            const gabarito = q.tipo === 'objetiva' ? q.opcoes[q.correta] : q.respostaExata;
            // Avisa o frontend de qual era a resposta correta
            io.emit('answer_result', { tipo: q.tipo, correta: gabarito });
            
            // Pausa de 4 segundos na tela para os jogadores lerem o gabarito
            setTimeout(nextQuestion, 4000); 
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('update_players', Object.values(players));
        if (Object.keys(players).length === 0) gameState = 'LOBBY';
    });
});

function sendQuestion() {
    for(let id in players) players[id].answered = false;
    const q = currentQuestions[currentQuestionIndex];
    
    let opcoesEmbaralhadas = null;
    if (q.tipo === 'objetiva') {
        const opcoesObjetos = q.opcoes.map((texto, index) => ({ texto, isCorreta: index === q.correta }));
        opcoesEmbaralhadas = shuffleArray(opcoesObjetos);
    }

    // O Frontend NÃO recebe a marcação de qual é a correta para evitar trapaças
    io.emit('new_question', {
        index: currentQuestionIndex + 1,
        total: currentQuestions.length,
        tipo: q.tipo,
        pergunta: q.pergunta,
        opcoes: q.tipo === 'objetiva' ? opcoesEmbaralhadas.map(o => o.texto) : null 
    });
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= currentQuestions.length) {
        gameState = 'LEADERBOARD';
        io.emit('game_over', Object.values(players).sort((a, b) => b.score - a.score));
        gameState = 'LOBBY';
    } else {
        sendQuestion();
    }
}

// Inicia o servidor e se prepara para as conexões web
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor Hootka rodando e aguardando conexões na porta ${PORT}`));