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

// BANCO DE DADOS - AS 80 QUESTÕES COMPLETAS
const questoesDB = [
    { id: 1, tipo: 'objetiva', pergunta: "Qual ferramenta é recomendada para instalar e gerenciar múltiplas versões do Node.js?", opcoes: ["O npm (Node Package Manager), que gerencia os pacotes localmente.", "O nvm (Node Version Manager). No Linux/Mac instala-se via curl e permite trocar de versão facilmente com nvm use --lts.", "O npx, utilizado para executar dependências temporárias sem instalação.", "O Yarn, que substitui o Node.js em ambientes de produção."], correta: 1 },
    { id: 2, tipo: 'objetiva', pergunta: "Qual versão do JDK é utilizada nos projetos com Spring Boot do livro, e qual distribuição é recomendada?", opcoes: ["JDK 11 na distribuição Oracle Standard Edition.", "JDK 17 (LTS) na distribuição OpenJDK pura.", "JDK 21 (LTS) na distribuição Eclipse Temurin (anteriormente AdoptOpenJDK), disponível em adoptium.net.", "JDK 8 na distribuição Amazon Corretto."], correta: 2 },
    { id: 3, tipo: 'objetiva', pergunta: "Qual é a ferramenta de build padrão para projetos Java usada no livro, e o que ela faz?", opcoes: ["Gradle. Ele compila o código em C++ nativo e otimiza a memória.", "Ant. Ele serve apenas para empacotar o projeto em um arquivo .jar estático.", "Maven. Ele gerencia dependências, compila o código, executa testes e empacota a aplicação.", "NPM. Ele baixa as bibliotecas do Spring Boot via repositórios do Node."], correta: 2 },
    { id: 4, tipo: 'objetiva', pergunta: "Qual banco de dados é utilizado em todos os três projetos do livro?", opcoes: ["MySQL Server 8.0, um banco de dados relacional voltado para nuvem.", "MongoDB, um banco de dados NoSQL orientado a documentos.", "PostgreSQL (versão 16 ou superior), um banco de dados relacional de código aberto.", "SQLite, por ser leve e rodar diretamente na memória RAM."], correta: 2 },
    { id: 5, tipo: 'dissertativa', pergunta: "Quais ferramentas de cliente HTTP o livro recomenda para testar APIs REST?", respostaExata: "Postman, Insomnia ou Thunder Client (extensão do VS Code). O livro recomenda o Insomnia por ser leve e intuitivo." },
    { id: 6, tipo: 'objetiva', pergunta: "O que são tags semânticas do HTML5? Cite três exemplos.", opcoes: ["Tags que descrevem o significado do conteúdo, tornando o código mais legível e acessível. Exemplos: header, nav, main, article, section, footer.", "Tags exclusivas para estilização visual de texto. Exemplos: b, i, u.", "Tags que executam funções de banco de dados diretamente no DOM. Exemplos: sql, query, fetch.", "Tags que substituem o uso de CSS em interfaces modernas. Exemplos: color, font, align."], correta: 0 },
    { id: 7, tipo: 'objetiva', pergunta: "Qual é a diferença entre HTML e CSS?", opcoes: ["HTML compila o código fonte, enquanto CSS executa o comportamento no navegador.", "HTML define a estrutura (o que é cada elemento), enquanto CSS define a apresentação (cor, tamanho, posição, animação).", "HTML é utilizado exclusivamente no backend, enquanto CSS é renderizado no frontend.", "Não há diferença estrutural, ambos são linguagens de programação orientadas a objetos."], correta: 1 },
    { id: 8, tipo: 'objetiva', pergunta: "O que é o Bootstrap e qual versão é usada nos projetos?", opcoes: ["Uma biblioteca de ícones vetoriais interativos baseada no Bootstrap 4.", "Um motor de templates que renderiza HTML no servidor com a versão 3.", "Um framework CSS com classes prontas. O livro usa Bootstrap 5, que abandonou o jQuery e é baseado em flexbox e CSS Grid.", "Um banco de dados NoSQL acoplado ao Node.js na versão 6."], correta: 2 },
    { id: 9, tipo: 'objetiva', pergunta: "Como funciona o sistema de grid responsivo do Bootstrap?", opcoes: ["Usa atributos de tabela clássicos como colspan e rowspan em divs estáticas.", "Usa classes como col-md-4 dentro de um row. Três divs com col-md-4 formam três colunas em telas médias e se empilham em telas pequenas.", "Usa exclusivamente a tag <grid> do HTML5 combinada com position: absolute.", "Usa media queries escritas manualmente no arquivo style.css do projeto."], correta: 1 },
    { id: 10, tipo: 'dissertativa', pergunta: "Quais são os três tipos de seletores CSS exemplificados no livro?", respostaExata: "Por tag (p {}), por classe (.destaque {}) e por id (#principal {}). O livro também mostra Flexbox com display: flex." },
    { id: 11, tipo: 'objetiva', pergunta: "Qual é a diferença entre const e let em JavaScript?", opcoes: ["const é acessada globalmente em todo o arquivo, let é restrita a funções específicas.", "const declara uma constante (não pode ser reatribuída). let declara uma variável mutável. Ambas têm escopo de bloco.", "const só aceita números inteiros ou flutuantes, let aceita qualquer tipo de string ou objeto.", "let é içada (hoisted) no início do código e const não sofre hoisting."], correta: 1 },
    { id: 12, tipo: 'dissertativa', pergunta: "Cite três métodos de arrays em JavaScript mostrados no livro e explique cada um.", respostaExata: "map() transforma cada elemento retornando novo array; filter() filtra elementos por condição; reduce() acumula valores em um único resultado." },
    { id: 13, tipo: 'objetiva', pergunta: "O que é uma arrow function? Dê um exemplo.", opcoes: ["Uma função nativa para desenhar vetores no canvas do HTML5.", "Um método de array que percorre itens na direção inversa.", "Sintaxe moderna para funções, mais concisa. Ex: const multiplicar = (a,b) => a * b;", "Uma função atrelada exclusivamente ao framework React para alterar o estado virtual."], correta: 2 },
    { id: 14, tipo: 'objetiva', pergunta: "O que são async/await em JavaScript e para que servem?", opcoes: ["Ferramentas para compilar código síncrono em binário no Node.js.", "Palavras-chave para operações assíncronas de forma legível. async marca a função e await pausa até uma Promise ser resolvida.", "Métodos de laço de repetição que substituem o uso do for e while tradicionais.", "Funções do Express para deletar arquivos físicos do disco."], correta: 1 },
    { id: 15, tipo: 'objetiva', pergunta: "O que é o método fetch() e como é usado no projeto 1?", opcoes: ["API do browser para requisições HTTP. No projeto 1: const response = await fetch com a URL, seguido de response.json() para obter os dados.", "Um comando de terminal exclusivo do PostgreSQL para buscar registros.", "Método do Express para ler arquivos HTML estáticos na pasta public.", "Função padrão do Node.js para buscar informações de hardware."], correta: 0 },
    { id: 16, tipo: 'objetiva', pergunta: "O que é Node.js e qual é sua principal vantagem?", opcoes: ["Um framework de estilização CSS avançado focado em aplicações móveis.", "Um sistema gerenciador de banco de dados relacional de alta velocidade.", "Um runtime JavaScript baseado no motor V8 do Chrome. Principal vantagem: ecossistema npm com mais de 2 milhões de pacotes para criar APIs, CLIs e servidores.", "Um servidor Apache embutido para hospedar páginas estáticas com segurança nativa."], correta: 2 },
    { id: 17, tipo: 'objetiva', pergunta: "No projeto 1, qual é a estrutura de pastas do backend?", opcoes: ["models/, views/ e controllers/, seguindo o padrão estrito MVC para páginas.", "src/server.js (entrada), src/routes/ (rotas), src/db/ (conexão). Arquivos estáticos do frontend ficam em public/.", "app/, config/ e public/ distribuídos em contêineres Docker independentes.", "bin/, lib/ e src/ com os arquivos HTML misturados aos códigos de banco de dados."], correta: 1 },
    { id: 18, tipo: 'dissertativa', pergunta: "O que são middlewares no Express? Quais são usados no projeto 1?", respostaExata: "Funções que processam requisições antes dos handlers. Projeto 1 usa: cors(), express.json(), express.urlencoded() e express.static()." },
    { id: 19, tipo: 'objetiva', pergunta: "O que é pool de conexões no PostgreSQL com Node.js e por que é importante?", opcoes: ["Um serviço de cache distribuído em memória semelhante ao Redis.", "Reutiliza conexões abertas ao banco, evitando o custo de abrir uma nova a cada requisição. Melhora performance e escalabilidade.", "Estratégia de backup redundante que copia dados para servidores diferentes.", "Um protocolo de criptografia ponta a ponta nativo exigido pelo Node.js."], correta: 1 },
    { id: 20, tipo: 'objetiva', pergunta: "O que são queries parametrizadas e por que são usadas?", opcoes: ["Queries mais lentas processadas em lote durante a madrugada.", "Consultas SQL com valores separados como parâmetros. Protegem contra ataques SQL Injection.", "Subconsultas aninhadas utilizadas apenas para leitura de tabelas relacionadas.", "Procedures nativas que rodam exclusivamente na memória RAM do servidor."], correta: 1 },
    { id: 21, tipo: 'dissertativa', pergunta: "Quais são os 5 endpoints da API REST de tarefas no projeto 1?", respostaExata: "GET /api/tarefas (listar), GET /api/tarefas/:id (buscar), POST /api/tarefas (criar), PATCH /api/tarefas/:id (atualizar), DELETE /api/tarefas/:id (excluir)." },
    { id: 22, tipo: 'objetiva', pergunta: "Como o projeto 1 lida com variáveis sensíveis como credenciais do banco?", opcoes: ["Salva as credenciais em texto puro no topo do arquivo server.js.", "Usa variáveis de ambiente com o pacote dotenv. As credenciais ficam em .env e são acessadas via process.env.NOME_VARIAVEL.", "Guarda todas as credenciais no localStorage do navegador do administrador.", "Criptografa as senhas nativamente dentro de um arquivo JSON estático."], correta: 1 },
    { id: 23, tipo: 'objetiva', pergunta: "O que é REST e quais são os cinco verbos HTTP de uma API REST?", opcoes: ["Uma linguagem de programação de baixo nível. Verbos: GET, POST, DELETE, READ, WRITE.", "REST (Representational State Transfer) é um estilo arquitetural. Verbos: GET (buscar), POST (criar), PUT (atualizar completo), PATCH (parcial), DELETE (excluir).", "Um protocolo de camada de rede seguro e fechado. Verbos: TCP, UDP, HTTP, FTP, SMTP.", "Um framework Javascript. Verbos: CREATE, READ, UPDATE, DELETE, MERGE."], correta: 1 },
    { id: 24, tipo: 'objetiva', pergunta: "Qual é a diferença entre PUT e PATCH?", opcoes: ["O PUT é usado para deletar de forma suave, enquanto PATCH remove permanentemente.", "PUT atualiza o recurso completo (todos os campos). PATCH atualiza apenas os campos informados (atualização parcial).", "PUT é para criação de novos dados, PATCH é para exclusão lógica de registros.", "PUT é processado de forma assíncrona, enquanto PATCH bloqueia sincronicamente."], correta: 1 },
    { id: 25, tipo: 'objetiva', pergunta: "O que é o endpoint de saúde (health check) criado no projeto 1?", opcoes: ["GET /api/saude retorna status ok com timestamp. Serve para verificar se o servidor está funcionando, útil para monitoramento.", "POST /api/check que serve para forçar a reautenticação de todos os usuários.", "GET /api/error que serve unicamente para listar os logs de bugs.", "DELETE /api/health utilizado em casos de emergência para desligar o servidor."], correta: 0 },
    { id: 26, tipo: 'objetiva', pergunta: "Quais são as quatro operações básicas de SQL demonstradas no livro?", opcoes: ["FETCH, PUSH, PULL e MERGE", "GRANT, REVOKE, COMMIT e ROLLBACK", "CREATE TABLE (criar tabela), INSERT INTO (inserir), SELECT (consultar), UPDATE (atualizar) e DELETE (excluir).", "JOIN, UNION, INTERSECT e EXCEPT"], correta: 2 },
    { id: 27, tipo: 'objetiva', pergunta: "O que significa SERIAL PRIMARY KEY em PostgreSQL?", opcoes: ["Define uma chave estrangeira condicional baseada na data.", "Cria uma chave composta de texto com letras e números.", "SERIAL cria uma sequência auto-incrementada. PRIMARY KEY define essa coluna como chave primária da tabela.", "Gera um índice de performance que impede deleções em cascata."], correta: 2 },
    { id: 28, tipo: 'objetiva', pergunta: "O que são índices e por que o projeto 3 os cria nas tabelas de produtos?", opcoes: ["Aceleram consultas evitando varredura completa. No projeto 3 são criados em categoria_id e ativo, campos usados frequentemente em filtros.", "Eles criptografam as senhas para maior segurança.", "São scripts que fazem backup automático do banco a cada hora.", "Formatam e geram relatórios automáticos em PDF."], correta: 0 },
    { id: 29, tipo: 'objetiva', pergunta: "Por que o projeto 3 guarda nome e preço na tabela itens_pedido ao invés de apenas o id do produto?", opcoes: ["Para ocupar mais espaço em disco.", "Para evitar a utilização de cláusulas JOIN, que são nativamente lentas.", "Para preservar um snapshot no momento da compra. Se o preço mudar depois, o histórico de pedidos permanece correto.", "Porque a integração em React exige dados estáticos e imutáveis."], correta: 2 },
    { id: 30, tipo: 'objetiva', pergunta: "O que é a restrição UNIQUE (usuario_id, produto_id) na tabela carrinho_itens?", opcoes: ["Garante que cada usuário tenha no máximo um registro por produto no carrinho. Adicionar o mesmo produto vira UPDATE, não duplicata.", "Impede que dois usuários diferentes comprem a mesma peça.", "Apaga automaticamente produtos duplicados por erro no checkout.", "Bloqueia temporariamente compras sucessivas repetidas."], correta: 0 },
    { id: 31, tipo: 'dissertativa', pergunta: "Quais são as seis camadas da arquitetura Spring Boot usadas no projeto 2?", respostaExata: "Entity (modelo), Repository (acesso ao banco), Service (lógica de negócio), Controller (endpoints HTTP), DTO (dados em trânsito) e Config (configurações)." },
    { id: 32, tipo: 'objetiva', pergunta: "O que é o Spring Initializr?", opcoes: ["Uma IDE oficial da Oracle.", "Gerador web em start.spring.io que cria o ZIP do projeto Spring Boot com as dependências selecionadas.", "Ferramenta de monitoramento de logs do banco.", "Plugin padrão incorporado no Maven wrapper."], correta: 1 },
    { id: 33, tipo: 'objetiva', pergunta: "Qual é a diferença entre application.properties e application.yml?", opcoes: ["Properties é um formato obsoleto incompatível com Java 21.", "Ambos configuram a aplicação, mas YAML usa indentação hierárquica, tornando-o mais legível. O livro migra para .yml por legibilidade.", "O Properties compila mais rápido em contêineres Docker.", "Não há absolutamente nenhuma diferença prática."], correta: 1 },
    { id: 34, tipo: 'objetiva', pergunta: "O que faz ddl-auto: update no Hibernate e por que não deve ser usado em produção?", opcoes: ["Atualiza pacotes da build no deploy, quebrando a compilação.", "Cria e atualiza tabelas automaticamente. Em produção é perigoso pois uma renomeação de campo causa perda de dados. Use Flyway ou Liquibase.", "Limpa o banco inteiro a cada restart do sistema.", "Otimiza queries em tempo real mas consome 100% da CPU."], correta: 1 },
    { id: 35, tipo: 'objetiva', pergunta: "O que é o Maven Wrapper (mvnw) e qual é sua vantagem?", opcoes: ["Dependência para interfaces de usuário.", "Script incluído no projeto que baixa a versão correta do Maven automaticamente, garantindo a mesma versão sem instalação global.", "Plugin de segurança de pacotes na aplicação.", "Framework para criar testes unitários automatizados."], correta: 1 },
    { id: 36, tipo: 'objetiva', pergunta: "O que significa a anotação @Entity em uma classe Java?", opcoes: ["Transforma o objeto em string JSON.", "Marca expressamente a classe como DTO.", "Marca a classe como uma entidade JPA, mapeada para uma tabela no banco de dados.", "Define internamente uma regra de negócio protegida."], correta: 2 },
    { id: 37, tipo: 'objetiva', pergunta: "O que fazem @PrePersist e @PreUpdate em uma entidade JPA?", opcoes: ["Validam os dados na ponta inicial antes da requisição HTTP.", "Limpam automaticamente o cache residente em memória.", "Executa antes de inserir o registro (@PrePersist) e antes de atualizar (@PreUpdate). Usados para preencher criadoEm e atualizadoEm.", "Fazem logs de acessos via comando SELECT simples."], correta: 2 },
    { id: 38, tipo: 'objetiva', pergunta: "Qual é a diferença entre FetchType.LAZY e FetchType.EAGER?", opcoes: ["LAZY deve ser usado exclusivamente para inserção de dados.", "LAZY carrega dados relacionados só quando acessados. EAGER carrega junto com a entidade principal (pode causar N+1 queries).", "LAZY é sempre mais lento em consultas com JOIN.", "LAZY consome muita memória operacional residente."], correta: 1 },
    { id: 39, tipo: 'objetiva', pergunta: "Como o Spring Data JPA gera consultas a partir do nome do método?", opcoes: ["Usando inteligência artificial do Hibernate.", "Lê o nome do método e gera a query automaticamente. Ex: findByEmail gera SELECT FROM usuario WHERE email = ?.", "Exige um arquivo XML com as queries manuais.", "Através de anotações @Sql nativas no repositório."], correta: 1 },
    { id: 40, tipo: 'objetiva', pergunta: "O que é JPQL e quando o livro recomenda usá-lo?", opcoes: ["Java Performance Query Library, para cache rápido.", "Biblioteca externa de requisições assíncronas.", "JPA Query Language, parecida com SQL mas usa entidades Java. Usada via @Query quando o nome do método derivado fica complexo.", "Ferramenta de formatação e limpeza de JSONs."], correta: 2 },
    { id: 41, tipo: 'dissertativa', pergunta: "Como funciona o @ManyToMany entre Post e Tag no projeto 2?", respostaExata: "Usa @JoinTable com a tabela intermediária post_tags com colunas post_id e tag_id. Cascade PERSIST e MERGE salvam tags novas automaticamente." },
    { id: 42, tipo: 'dissertativa', pergunta: "O que é o Lombok? Cite quatro anotações dele usadas no livro.", respostaExata: "Reduz boilerplate Java. Anotações: @Getter e @Setter (getters/setters), @NoArgsConstructor (construtor vazio), @AllArgsConstructor, @Builder." },
    { id: 43, tipo: 'objetiva', pergunta: "Por que o livro usa DTOs separados das entidades JPA?", opcoes: ["Para otimizar operações no disco do banco de dados.", "Para não expor detalhes internos como hash de senha, permitir validações específicas por endpoint e evoluir a API independentemente do banco.", "Para economizar linhas de código no projeto.", "Porque é exigência do Java 21 LTS."], correta: 1 },
    { id: 44, tipo: 'dissertativa', pergunta: "Quais anotações de Bean Validation são usadas no UsuarioRegistroDTO?", respostaExata: "@NotBlank (não pode ser vazio), @Size (limite de tamanho) e @Email (formato válido). Ativadas com @Valid no controller." },
    { id: 45, tipo: 'objetiva', pergunta: "Como o projeto 2 trata erros de validação de forma centralizada?", opcoes: ["Blocos try/catch espalhados em cada controller.", "Redirecionando para uma página estática de erro HTML.", "Usa GlobalExceptionHandler com @RestControllerAdvice. Retorna mapa com erros de cada campo e status 400.", "Ocultando silenciosamente em logs do sistema."], correta: 2 },
    { id: 46, tipo: 'objetiva', pergunta: "O que é Spring Security e qual é sua função nos projetos 2 e 3?", opcoes: ["Antivírus para ecossistema Spring.", "Módulo padrão do Spring para autenticação e autorização. Projeto 2 usa sessões; projeto 3 usa JWT stateless.", "Interface de criptografia em disco.", "Firewall embutido no Tomcat."], correta: 1 },
    { id: 47, tipo: 'objetiva', pergunta: "Por que nunca armazenar senhas em texto puro? Qual algoritmo o livro usa?", opcoes: ["O livro usa MD5 por ser mais rápido.", "Usa SHA-1 nativo estrito.", "Senhas expostas se o banco for comprometido. Usa BCrypt via PasswordEncoder, que gera hashes resistentes a força bruta.", "Usa AES-256 com chave local."], correta: 2 },
    { id: 48, tipo: 'objetiva', pergunta: "O que é o UserDetailsService e como é implementado no projeto 2?", opcoes: ["Serviço para renderizar as views do usuário.", "Interface que o Spring Security usa para carregar usuários por username. Busca por email no banco e retorna User com roles.", "Serviço agendado para envio massivo de e-mails.", "Tabela secundária de logs de segurança."], correta: 1 },
    { id: 49, tipo: 'objetiva', pergunta: "Como o projeto 2 configura rotas públicas e protegidas?", opcoes: ["Via arquivos XML antigos.", "Ignorando o uso de filtros centrais.", "Via SecurityFilterChain com authorizeHttpRequests. Rotas de autenticação e leitura são permitAll. O resto exige autenticação.", "Através de middlewares diretos configurados no Nginx."], correta: 2 },
    { id: 50, tipo: 'objetiva', pergunta: "O que é CORS e como o projeto 2 o configura?", opcoes: ["Cross-Origin Resource Sharing. Configurado via CorsConfigurationSource, permitindo acessos de origens externas como localhost:3000.", "Protocolo de criptografia de pacotes.", "Sistema de cache de banco de dados do Spring.", "Ferramenta para rotear links locais no React."], correta: 0 },
    { id: 51, tipo: 'objetiva', pergunta: "O que é JWT e como funciona no projeto 3?", opcoes: ["Sessão baseada em cookies físicos no servidor.", "JSON Web Token assinado digitalmente. O backend gera JWT; o frontend armazena e envia em cada requisição no header Authorization: Bearer.", "Biblioteca nativa de renderização HTML.", "Caminhos fixos de links roteados."], correta: 1 },
    { id: 52, tipo: 'objetiva', pergunta: "Qual é a diferença entre autenticação por sessão e JWT stateless?", opcoes: ["A sessão opera apenas no front-end.", "Com sessões o backend guarda estado em memória. Com JWT stateless toda informação está no token, permitindo escalar sem compartilhar estado.", "JWT é muito mais lerdo e engessado que sessões.", "JWT obriga o uso de cookies fixos atrelados."], correta: 1 },
    { id: 53, tipo: 'objetiva', pergunta: "Por que o JWT não deve conter dados sensíveis no payload?", opcoes: ["Excede o limite do header HTTP.", "JWT não é criptografado, apenas assinado em base64. Qualquer pessoa consegue ler o conteúdo (ex: jwt.io).", "O Spring Security recusa tokens assim.", "O token expiraria imediatamente."], correta: 1 },
    { id: 54, tipo: 'objetiva', pergunta: "Qual biblioteca Java é usada para manipular JWT no projeto 3?", opcoes: ["Auth0 Secure.", "Nimbus JOSE JWT.", "A biblioteca JJWT (io.jsonwebtoken), com os artefatos jjwt-api, jjwt-impl e jjwt-jackson.", "Spring Auth Token Standard."], correta: 2 },
    { id: 55, tipo: 'objetiva', pergunta: "Qual é o tempo de expiração do JWT no projeto 3 e como é configurado?", opcoes: ["1 hora engessada no código.", "86400000 milissegundos (24 horas) via application.yml.", "7 dias setado no backend.", "Ele nunca expira sozinho."], correta: 1 },
    { id: 56, tipo: 'objetiva', pergunta: "O que é React e qual é sua principal ideia arquitetural?", opcoes: ["Framework focado em CSS responsivo.", "Biblioteca JavaScript para interfaces. Ideia principal: dividir a UI em componentes reutilizáveis com estado próprio (declarativo).", "Linguagem pesada para processos de backend.", "Banco de dados em cache no browser."], correta: 1 },
    { id: 57, tipo: 'objetiva', pergunta: "O que é uma SPA e como o projeto 3 a implementa?", opcoes: ["Sistema de Múltiplas Páginas com PHP.", "Single Page Application que atualiza conteúdo dinamicamente via JS. Roda no Vite (porta 5173), separado do Spring Boot (8080).", "Servidor proxy embutido.", "Componente para otimizar imagens."], correta: 1 },
    { id: 58, tipo: 'objetiva', pergunta: "O que é o hook useState?", opcoes: ["Função para requisições HTTP seguras.", "Gerencia estado local em componentes funcionais. Ex: const [valor, setValor] = useState(0).", "Script para bloquear formulários HTML.", "Recurso que acessa o DOM diretamente ignorando o Virtual DOM."], correta: 1 },
    { id: 59, tipo: 'objetiva', pergunta: "Qual ferramenta de build é usada no projeto 3 para o frontend React?", opcoes: ["Webpack com plugins estritos.", "Create React App (CRA).", "Vite, que serve a aplicação React de forma extremamente rápida na porta 5173.", "Babel puro sem bundlers."], correta: 2 },
    { id: 60, tipo: 'objetiva', pergunta: "O que são rotas protegidas no frontend React?", opcoes: ["Rotas bloqueadas pelo firewall.", "Rotas que redirecionam usuário não autenticado para login (protegem checkout, painel).", "Caminhos ofuscados no backend.", "Protocolo HTTPS estrito."], correta: 1 },
    { id: 61, tipo: 'dissertativa', pergunta: "Quais são as tecnologias usadas no Projeto 1 (Gerenciador de Tarefas)?", respostaExata: "Backend: Node.js com Express. Banco: PostgreSQL. Frontend: HTML, CSS, Bootstrap e JavaScript puro." },
    { id: 62, tipo: 'objetiva', pergunta: "Quais são os filtros disponíveis na interface do Gerenciador de Tarefas do Projeto 1?", opcoes: ["Filtros por Data e Idade.", "Filtros por Urgente e Normal.", "Três filtros via tabs: Todas, Pendentes e Concluídas. Fazem requisições à API com o status.", "Um filtro apenas para tarefas inativas."], correta: 2 },
    { id: 63, tipo: 'objetiva', pergunta: "Como o Projeto 1 implementa a persistência de dados?", opcoes: ["Salva em arquivos JSON.", "Matrizes globais em memória.", "Dados armazenados no PostgreSQL. Cada operação no front faz requisição à API REST via pool de conexões.", "Apenas LocalStorage."], correta: 2 },
    { id: 64, tipo: 'objetiva', pergunta: "O que é a função escapeHtml() usada no frontend e por que é importante?", opcoes: ["Formata blocos com cores.", "Comprime imagens renderizadas.", "Converte caracteres especiais HTML em entidades seguras. Previne ataques XSS de injeção de scripts no DOM.", "Limpa o cache ativo do navegador."], correta: 2 },
    { id: 65, tipo: 'dissertativa', pergunta: "Cite quatro melhorias sugeridas pelo livro para o Projeto 1.", respostaExata: "Data de vencimento; marcar como importantes; busca por palavra; categorias/tags; arrastar com SortableJS; toasts Bootstrap." },
    { id: 66, tipo: 'dissertativa', pergunta: "Quais são as tecnologias do Projeto 2 e a principal mudança em relação ao Projeto 1?", respostaExata: "Backend: Java com Spring Boot. Banco: PostgreSQL. Front: HTML, Bootstrap e JS puro. A mudança principal é a migração do backend de Node.js para Java/Spring Boot." },
    { id: 67, tipo: 'dissertativa', pergunta: "Quais são as cinco tabelas principais do banco de dados do blog no Projeto 2?", respostaExata: "usuarios, posts, comentarios, tags e post_tags (a tabela de junção N:N)." },
    { id: 68, tipo: 'objetiva', pergunta: "O que é um slug e como o Projeto 2 o gera automaticamente?", opcoes: ["Código hexadecimal exclusivo.", "Versão amigável para URL do título. O PostService usa Normalizer para remover acentos, converter para minúsculas e trocar espaços por hífens.", "Imagem em miniatura gerada.", "Identificador no servidor."], correta: 1 },
    { id: 69, tipo: 'objetiva', pergunta: "Como o Projeto 2 implementa paginação nos posts?", opcoes: ["Cortes em arrays JS gigantes.", "Usando comandos nativos de LIMIT puro.", "Com a interface Pageable do Spring Data aliada à anotação @PageableDefault nos controllers.", "Loops infinitos no frontend."], correta: 2 },
    { id: 70, tipo: 'dissertativa', pergunta: "Quais são as funcionalidades do sistema de blog do Projeto 2?", respostaExata: "Cadastro/login, perfil, criação/edição de posts, listagem pública, comentários, tags, paginação e busca." },
    { id: 71, tipo: 'dissertativa', pergunta: "Quais são as tecnologias do Projeto 3?", respostaExata: "Backend: Java/Spring Boot e JWT. Frontend: React com Vite (Axios). Banco: PostgreSQL." },
    { id: 72, tipo: 'dissertativa', pergunta: "Quais são as funcionalidades principais do e-commerce do Projeto 3?", respostaExata: "Catálogo paginado com busca/filtros, carrinho persistido, checkout, autenticação JWT, rotas protegidas, painel admin e histórico." },
    { id: 73, tipo: 'objetiva', pergunta: "Quais são os status possíveis de um pedido no Projeto 3?", opcoes: ["NOVO, REJEITADO, CONCLUÍDO.", "PENDENTE, PAGO, ENVIADO, ENTREGUE e CANCELADO.", "INICIO, DESPACHO, FINAL.", "ETAPA_1 a ETAPA_5."], correta: 1 },
    { id: 74, tipo: 'dissertativa', pergunta: "Qual é a diferença arquitetural entre o Projeto 2 e o Projeto 3 no frontend?", respostaExata: "No projeto 2 o Spring Boot serve arquivos HTML estáticos. No projeto 3 o React é uma SPA independente na porta 5173 comunicando com o backend REST/JWT." },
    { id: 75, tipo: 'objetiva', pergunta: "O que é o painel administrativo do Projeto 3 e quem pode acessá-lo?", opcoes: ["Painel público do sistema.", "Área exclusiva para gerenciar produtos e pedidos, que é acessível somente a usuários com papel ADMIN.", "Painel direto das tabelas SQL.", "Área para qualquer usuário autenticado."], correta: 1 },
    { id: 76, tipo: 'dissertativa', pergunta: "O que é Inversão de Controle (IoC) e Injeção de Dependência no Spring Boot?", respostaExata: "IoC: O framework controla o ciclo de vida dos objetos (Beans). Injeção de Dependência: O Spring fornece as instâncias automaticamente onde necessário (ex: construtor ou @Autowired)." },
    { id: 77, tipo: 'objetiva', pergunta: "O que é escalabilidade horizontal e como o JWT a facilita?", opcoes: ["Adição de instâncias de servidor para dividir a carga. JWT facilita por ser stateless: a autenticação está no token, dispensando sessão em memória.", "Aumento da capacidade de CPU num servidor central.", "Distribuição de nós no banco de dados.", "Partições verticais nos dados."], correta: 0 },
    { id: 78, tipo: 'objetiva', pergunta: "O que é @RestControllerAdvice e qual é seu papel no projeto 2?", opcoes: ["Define e controla a rota genérica que o sistema expõe.", "Anotação utilitária para definir tratamento global e centralizado de exceções, retornando respostas HTTP padronizadas (ex: 400 Bad Request) sem espalhar try/catch.", "Serviço interno para logs rigorosos.", "Rotina assíncrona para envio de e-mails em massa."], correta: 1 },
    { id: 79, tipo: 'objetiva', pergunta: "O que é Flyway ou Liquibase e por que o livro os menciona para produção?", opcoes: ["Ferramentas complexas de componentização puras.", "Potentes estruturas modulares focadas em cache.", "Ambientes de execução de múltiplos threads em nuvem.", "Ferramentas de versionamento de banco (migrations). O livro as cita pois o ddl-auto: update do Hibernate é perigoso em produção e pode causar perda de dados."], correta: 3 },
    { id: 80, tipo: 'dissertativa', pergunta: "Qual é a lição pedagógica do livro ao apresentar três projetos com complexidade crescente?", respostaExata: "Mostrar como os mesmos conceitos (CRUD, banco, segurança, frontend/backend) se aplicam evoluindo de Node.js + HTML simples, passando por MVC com Java, até atingir o padrão SPA React + Spring Boot + JWT." }
];

// Função auxiliar para embaralhar os arrays (Fisher-Yates)
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

    // Embaralha a prova final para misturar os tipos de questão
    return shuffleArray(selecionadas);
}
// Arquitetura de Salas
let rooms = {};
let roomCounter = 1;
let socketMapping = {};

// --- LÓGICA DO SERVIDOR ---
io.on('connection', (socket) => {
    console.log('Novo usuário conectado:', socket.id);

    // Evento quando um jogador entra no lobby
    socket.on('join_game', (data) => {
        const playerId = data.playerId; // Recebido do frontend (sessionStorage)
        let roomId = null;

        // Verifica se o jogador já estava em uma sala
        for (let id in rooms) {
            if (rooms[id].players[playerId]) {
                roomId = id;
                break;
            }
        }

        // Se encontrou a sala e estava jogando, reconecta!
        if (roomId) {
            const room = rooms[roomId];
            const player = room.players[playerId];
            player.online = true;
            socket.join(roomId);
            socketMapping[socket.id] = { roomId, playerId };
            
            // Envia o estado atual para o jogador que voltou
            socket.emit('reconnected', {
                gameState: room.gameState,
                players: Object.values(room.players),
                currentQuestion: room.currentQuestions[room.currentQuestionIndex],
                questionIndex: room.currentQuestionIndex,
                totalQuestions: room.currentQuestions.length,
                timeLeft: room.timeLeft,
                hasAnswered: player.answered
            });
            
            io.to(roomId).emit('update_players', Object.values(room.players));
            return;
        }

        // Se não estava em sala, procura uma no Lobby
        for (let id in rooms) {
            if (rooms[id].gameState === 'LOBBY') {
                roomId = id;
                break;
            }
        }
        
        // Se não achou lobby, cria nova
        if (!roomId) {
            roomId = 'room_' + roomCounter++;
            rooms[roomId] = {
                id: roomId,
                players: {},
                gameState: 'LOBBY',
                currentQuestions: [],
                currentQuestionIndex: 0,
                timer: null,
                timeLeft: 0
            };
        }

        socket.join(roomId);
        socketMapping[socket.id] = { roomId, playerId };

        const room = rooms[roomId];
        room.players[playerId] = { 
            id: playerId, 
            name: data.name, 
            avatar: data.avatar, 
            score: 0, 
            answered: false,
            isReady: false,
            online: true
        };
        
        io.to(roomId).emit('update_players', Object.values(room.players));
    });

    socket.on('toggle_ready', () => {
        const mapping = socketMapping[socket.id];
        if (!mapping) return;
        const room = rooms[mapping.roomId];
        const player = room.players[mapping.playerId];

        player.isReady = !player.isReady;
        io.to(room.id).emit('update_players', Object.values(room.players));

        const playersList = Object.values(room.players).filter(p => p.online);
        const allReady = playersList.length > 0 && playersList.every(p => p.isReady);

        if (allReady && room.gameState === 'LOBBY') {
            room.gameState = 'PLAYING';
            room.currentQuestions = generateSimulado();
            room.currentQuestionIndex = 0;
            
            for(let id in room.players) {
                room.players[id].score = 0;
                room.players[id].isReady = false; 
            }
            
            io.to(room.id).emit('game_started');
            sendQuestion(room.id);
        }
    });

    socket.on('submit_answer', (answerText) => {
        const mapping = socketMapping[socket.id];
        if (!mapping) return;
        const room = rooms[mapping.roomId];
        const player = room.players[mapping.playerId];
        
        if (!player || player.answered || room.gameState !== 'WAITING_ANSWERS') return;
        
        player.answered = true;
        const q = room.currentQuestions[room.currentQuestionIndex];

        if (q.tipo === 'objetiva') {
            const textoCorreto = q.opcoes[q.correta];
            if (answerText === textoCorreto) player.score += 100;
        } else {
            if (answerText.trim().length > 5) player.score += 50; 
        }
        
        // Verifica se todos os jogadores ONLINE responderam
        const activePlayers = Object.values(room.players).filter(p => p.online);
        const allAnswered = activePlayers.every(p => p.answered);
        
        if (allAnswered) {
            finishQuestion(room.id);
        }
    });

    socket.on('disconnect', () => {
        const mapping = socketMapping[socket.id];
        if (!mapping) return;
        const room = rooms[mapping.roomId];
        const player = room.players[mapping.playerId];
        
        if (player) player.online = false;
        delete socketMapping[socket.id];

        const activePlayers = Object.values(room.players).filter(p => p.online);

        if (activePlayers.length === 0) {
            // Se todos desconectaram, destrói a sala e o timer
            clearTimeout(room.timer);
            delete rooms[room.id];
        } else {
            io.to(room.id).emit('update_players', Object.values(room.players));
            // Se a partida está rolando e quem sobrou já respondeu, finaliza a questão
            if (room.gameState === 'WAITING_ANSWERS' && activePlayers.every(p => p.answered)) {
                finishQuestion(room.id);
            }
        }
    });
});

function sendQuestion(roomId) {
    const room = rooms[roomId];
    if(!room || room.gameState !== 'PLAYING') return;

    room.gameState = 'WAITING_ANSWERS';
    for(let id in room.players) room.players[id].answered = false;
    
    const q = room.currentQuestions[room.currentQuestionIndex];
    let opcoesEmbaralhadas = null;
    
    if (q.tipo === 'objetiva') {
        const opcoesObjetos = q.opcoes.map((texto, index) => ({ texto, isCorreta: index === q.correta }));
        opcoesEmbaralhadas = shuffleArray(opcoesObjetos);
    }

    // 30 segundos objetiva, 90 segundos dissertativa
    const duration = q.tipo === 'objetiva' ? 30 : 90;
    room.timeLeft = duration;

    io.to(roomId).emit('new_question', {
        index: room.currentQuestionIndex + 1,
        total: room.currentQuestions.length,
        tipo: q.tipo,
        pergunta: q.pergunta,
        opcoes: q.tipo === 'objetiva' ? opcoesEmbaralhadas.map(o => o.texto) : null,
        duration: duration
    });

    // Loop do temporizador a cada segundo para o reconnect funcionar bem
    if(room.timer) clearInterval(room.timer);
    room.timer = setInterval(() => {
        room.timeLeft--;
        if (room.timeLeft <= 0) {
            finishQuestion(roomId);
        }
    }, 1000);
}

function finishQuestion(roomId) {
    const room = rooms[roomId];
    if(!room || room.gameState !== 'WAITING_ANSWERS') return;

    clearInterval(room.timer);
    room.gameState = 'SHOWING_RESULT';

    const q = room.currentQuestions[room.currentQuestionIndex];
    const gabarito = q.tipo === 'objetiva' ? q.opcoes[q.correta] : q.respostaExata;
    
    io.to(roomId).emit('answer_result', { tipo: q.tipo, correta: gabarito });
    
    setTimeout(() => nextQuestion(roomId), 4000); 
}

function nextQuestion(roomId) {
    const room = rooms[roomId];
    if(!room || room.gameState !== 'SHOWING_RESULT') return;

    room.currentQuestionIndex++;
    if (room.currentQuestionIndex >= room.currentQuestions.length) {
        room.gameState = 'LOBBY'; // Volta pro lobby para permitir nova partida
        for(let id in room.players) room.players[id].isReady = false; 
        
        io.to(roomId).emit('game_over', Object.values(room.players).sort((a, b) => b.score - a.score));
    } else {
        room.gameState = 'PLAYING';
        sendQuestion(roomId);
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));