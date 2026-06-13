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
    { id: 13, tipo: 'objetiva', pergunta: "O que é uma arrow function? Dê um exemplo.", opcoes: ["Uma função nativa para desenhar vetores no canvas do HTML5.", "Um método de array que percorre itens na direção inversa (de trás para frente).", "Sintaxe moderna para funções, mais concisa. Ex: const multiplicar = (a,b) => a * b; em vez de function multiplicar(a, b) { return a * b; }.", "Uma função atrelada exclusivamente ao framework React para alterar o estado virtual."], correta: 2 },
    { id: 14, tipo: 'objetiva', pergunta: "O que são async/await em JavaScript e para que servem?", opcoes: ["Ferramentas para compilar código síncrono em binário no Node.js.", "Palavras-chave para operações assíncronas de forma legível. async marca a função e await pausa até uma Promise ser resolvida.", "Métodos de laço de repetição que substituem o uso do for e while tradicionais.", "Funções do Express para deletar arquivos físicos do disco."], correta: 1 },
    { id: 15, tipo: 'objetiva', pergunta: "O que é o método fetch() e como é usado no projeto 1?", opcoes: ["API do browser para requisições HTTP. No projeto 1: const response = await fetch com a URL, seguido de response.json() para obter os dados.", "Um comando de terminal exclusivo do PostgreSQL para buscar registros apagados.", "Método do Express para ler arquivos HTML estáticos na pasta public.", "Função padrão do Node.js para buscar informações de hardware do servidor."], correta: 0 },
    { id: 16, tipo: 'objetiva', pergunta: "O que é Node.js e qual é sua principal vantagem?", opcoes: ["Um framework de estilização CSS avançado focado em aplicações móveis.", "Um sistema gerenciador de banco de dados relacional de alta velocidade.", "Um runtime JavaScript baseado no motor V8 do Chrome. Principal vantagem: ecossistema npm com mais de 2 milhões de pacotes para criar APIs, CLIs e servidores.", "Um servidor Apache embutido para hospedar páginas estáticas com segurança nativa."], correta: 2 },
    { id: 17, tipo: 'objetiva', pergunta: "No projeto 1, qual é a estrutura de pastas do backend?", opcoes: ["models/, views/ e controllers/, seguindo o padrão estrito MVC para páginas.", "src/server.js (entrada), src/routes/ (rotas), src/db/ (conexão). Arquivos estáticos do frontend ficam em public/.", "app/, config/ e public/ distribuídos em contêineres Docker independentes.", "bin/, lib/ e src/ com os arquivos HTML misturados aos códigos de banco de dados."], correta: 1 },
    { id: 18, type: 'dissertativa', pergunta: "O que são middlewares no Express? Quais são usados no projeto 1?", respostaExata: "Funções que processam requisições antes dos handlers. Projeto 1 usa: cors(), express.json(), express.urlencoded() e express.static()." },
    { id: 19, tipo: 'objetiva', pergunta: "O que é pool de conexões no PostgreSQL com Node.js e por que é importante?", opcoes: ["Um serviço de cache distribuído em memória semelhante ao Redis para aliviar o banco principal.", "Reutiliza conexões abertas ao banco, evitando o custo de abrir uma nova a cada requisição. Melhora performance e escalabilidade.", "Estratégia de backup redundante que copia dados para servidores geolocalizados diferentes.", "Um protocolo de criptografia ponta a ponta nativo exigido pelo Node.js."], correta: 1 },
    { id: 20, tipo: 'objetiva', pergunta: "O que são queries parametrizadas e por que são usadas?", opcoes: ["Queries mais lentas processadas em lote durante a madrugada.", "Consultas SQL com valores separados como parâmetros. Protegem contra ataques SQL Injection.", "Subconsultas aninhadas utilizadas apenas para leitura de tabelas relacionadas.", "Procedures nativas que rodam exclusivamente na memória RAM do servidor."], correta: 1 },
    { id: 21, tipo: 'dissertativa', pergunta: "Quais são os 5 endpoints da API REST de tarefas no projeto 1?", respostaExata: "GET /api/tarefas (listar), GET /api/tarefas/:id (buscar), POST /api/tarefas (criar), PATCH /api/tarefas/:id (atualizar), DELETE /api/tarefas/:id (excluir)." },
    { id: 22, tipo: 'objetiva', pergunta: "Como o projeto 1 lida com variáveis sensíveis como credenciais do banco?", opcoes: ["Salva as credenciais em texto puro no topo do arquivo server.js para facilitar a manutenção.", "Usa variáveis de ambiente com o pacote dotenv. As credenciais ficam em .env (não commitado) e são acessadas via process.env.NOME_VARIAVEL.", "Guarda todas as credenciais no localStorage do navegador do administrador do sistema.", "Criptografa as senhas nativamente dentro de um arquivo JSON estático no diretório public."], correta: 1 },
    { id: 23, tipo: 'objetiva', pergunta: "O que é REST e quais são os cinco verbos HTTP de uma API REST?", opcoes: ["Uma linguagem de programação de baixo nível. Verbos: GET, POST, DELETE, READ, WRITE.", "REST (Representational State Transfer) é um estilo arquitetural. Verbos: GET (buscar), POST (criar), PUT (atualizar completo), PATCH (parcial), DELETE (excluir).", "Um protocolo de camada de rede seguro e fechado. Verbos: TCP, UDP, HTTP, FTP, SMTP.", "Um framework Javascript. Verbos: CREATE, READ, UPDATE, DELETE, MERGE."], correta: 1 },
    { id: 24, tipo: 'objetiva', pergunta: "Qual é a diferença entre PUT e PATCH?", opcoes: ["O PUT é usado para deletar de forma suave (soft delete), enquanto PATCH remove permanentemente do banco.", "PUT atualiza o recurso completo (todos os campos). PATCH atualiza apenas os campos informados (atualização parcial).", "PUT é para criação de novos dados, PATCH é para exclusão lógica de registros.", "PUT é processado de forma assíncrona pelo servidor, enquanto PATCH bloqueia a requisição sincronicamente."], correta: 1 },
    { id: 25, tipo: 'objetiva', pergunta: "O que é o endpoint de saúde (health check) criado no projeto 1?", opcoes: ["GET /api/saude retorna status ok com timestamp. Serve para verificar se o servidor está funcionando, útil para monitoramento.", "POST /api/check que serve para forçar a reautenticação de todos os usuários logados no momento.", "GET /api/error que serve unicamente para listar os logs de bugs diretamente na interface do usuário.", "DELETE /api/health utilizado em casos de emergência para desligar o servidor remotamente."], correta: 0 },
    { id: 26, tipo: 'objetiva', pergunta: "Quais são as quatro operações básicas de SQL demonstradas no livro?", opcoes: ["FETCH, PUSH, PULL e MERGE", "GRANT, REVOKE, COMMIT e ROLLBACK", "CREATE TABLE (criar tabela), INSERT INTO (inserir), SELECT (consultar), UPDATE (atualizar) e DELETE (excluir).", "JOIN, UNION, INTERSECT e EXCEPT"], correta: 2 },
    { id: 27, tipo: 'objetiva', pergunta: "O que significa SERIAL PRIMARY KEY em PostgreSQL?", opcoes: ["Define uma chave estrangeira condicional baseada na data de inserção do registro.", "Cria uma chave composta de texto que obrigatoriamente deve conter letras e números seriais.", "SERIAL cria uma sequência auto-incrementada. PRIMARY KEY define essa coluna como chave primária da tabela.", "Gera um índice de performance exclusivo que impede que a tabela sofra deleções em cascata."], correta: 2 },
    { id: 28, tipo: 'objetiva', pergunta: "O que são índices e por que o projeto 3 os cria nas tabelas de produtos?", opcoes: ["Aceleram consultas evitando varredura completa. No projeto 3 são criados em categoria_id e ativo, campos usados frequentemente em filtros.", "Eles criptografam as senhas dos administradores e usuários para maior segurança.", "São scripts que fazem backup automático de segurança do banco a cada hora.", "Formatam e geram relatórios gerenciais automáticos em PDF do estoque na madrugada."], correta: 0 },
    { id: 29, tipo: 'objetiva', pergunta: "Por que o projeto 3 guarda nome e preço na tabela itens_pedido ao invés de apenas o id do produto?", opcoes: ["Exclusivamente para ocupar mais espaço em disco e justificar a alocação de servidores maiores.", "Para evitar a utilização de cláusulas JOIN em consultas simples, que são nativamente lentas no PostgreSQL.", "Para preservar um snapshot no momento da compra. Se o preço ou nome mudar depois, o histórico de pedidos permanece correto.", "Porque a integração via frontend em React exige que os dados sejam estáticos e imutáveis."], correta: 2 },
    { id: 30, tipo: 'objetiva', pergunta: "O que é a restrição UNIQUE (usuario_id, produto_id) na tabela carrinho_itens?", opcoes: ["Garante que cada usuário tenha no máximo um registro por produto no carrinho. Adicionar o mesmo produto duas vezes vira UPDATE, não duplicata.", "Impede que dois usuários diferentes consigam comprar a mesma peça do estoque.", "Apaga automaticamente produtos que tenham sido duplicados por erro durante o processo de checkout final.", "Bloqueia temporariamente compras sucessivas repetidas utilizando diferentes métodos de pagamento."], correta: 0 },
    { id: 31, tipo: 'dissertativa', pergunta: "Quais são as seis camadas da arquitetura Spring Boot usadas no projeto 2?", respostaExata: "Entity (modelo), Repository (acesso ao banco), Service (lógica de negócio), Controller (endpoints HTTP), DTO (dados em trânsito) e Config (configurações)." },
    { id: 32, tipo: 'objetiva', pergunta: "O que é o Spring Initializr?", opcoes: ["Uma IDE oficial da Oracle voltada apenas para o ecossistema e projetos do Spring nativo.", "Gerador web em start.spring.io que cria o ZIP do projeto Spring Boot com as dependências selecionadas.", "Ferramenta robusta focada estritamente no monitoramento contínuo e extração de logs do banco.", "Plugin padrão incorporado obrigatoriamente dentro das configurações clássicas do Maven wrapper."], correta: 1 },
    { id: 33, tipo: 'objetiva', pergunta: "Qual é a diferença entre application.properties e application.yml?", opcoes: ["Properties é um formato obsoleto que foi descontinuado, enquanto YML é o único compatível com as versões recentes do Java 21.", "Ambos configuram a aplicação, mas YAML usa indentação hierárquica, tornando-o mais legível. O livro migra para .yml por legibilidade.", "O arquivo Properties compila mais rápido quando subido em contêineres Docker hospedados diretamente na nuvem.", "Não há absolutamente nenhuma diferença prática ou de sintaxe, os formatos são intermutáveis e idênticos."], correta: 1 },
    { id: 34, tipo: 'objetiva', pergunta: "O que faz ddl-auto: update no Hibernate e por que não deve ser usado em produção?", opcoes: ["Ele atualiza todos os pacotes da build no deploy, o que frequentemente quebra a compilação final.", "Cria e atualiza tabelas automaticamente. Em produção é perigoso pois uma renomeação de campo pode causar perda de dados. Use validate com Flyway ou Liquibase.", "Ele limpa o banco inteiro a cada restart do sistema, apagando de modo irreversível todos os dados permanentes essenciais.", "Ele otimiza queries rodando em tempo real mas acaba consumindo praticamente 100% da CPU nativa do servidor."], correta: 1 },
    { id: 35, tipo: 'objetiva', pergunta: "O que é o Maven Wrapper (mvnw) e qual é sua vantagem?", opcoes: ["Uma dependência moderna focada para prover integração simples com interfaces reativas de usuário.", "Script incluído no projeto que baixa a versão correta do Maven automaticamente sem exigir instalação global.", "Um plugin restrito encarregado de implementar protocolos rígidos de segurança de pacotes nos módulos da aplicação.", "Um framework externo importado para simplificar a criação de testes unitários automatizados cobrindo os services."], correta: 1 },
    { id: 36, tipo: 'objetiva', pergunta: "O que significa a anotação @Entity em uma classe Java?", opcoes: ["Serve para transformar diretamente o objeto instanciado em uma string serializada no formato JSON.", "Marca expressamente que a classe foi convertida para atuar apenas como DTO genérico leve.", "Marca a classe como uma entidade JPA, ou seja, ela é mapeada para uma tabela no banco de dados.", "Define internamente na classe uma regra de negócio protegida e bloqueada para o Controller."], correta: 2 },
    { id: 37, tipo: 'objetiva', pergunta: "O que fazem @PrePersist e @PreUpdate em uma entidade JPA?", opcoes: ["Validam rigorosamente os dados na ponta inicial antes mesmo da requisição HTTP chegar ao respectivo controller.", "Limpam automaticamente o cache residente em memória da requisição ao final do ciclo de processamento.", "Executa antes de inserir o registro (@PrePersist) e antes de atualizar (@PreUpdate). Usados para preencher criadoEm e atualizadoEm automaticamente.", "Fazem os logs exatos de acessos vinculados à segurança sempre que tabelas são lidas via comando SELECT simples."], correta: 2 },
    { id: 38, tipo: 'objetiva', pergunta: "Qual é a diferença entre FetchType.LAZY e FetchType.EAGER?", opcoes: ["LAZY deve ser usado exclusivamente para inserção de dados, enquanto EAGER atende consultas de leitura pesada.", "LAZY carrega dados relacionados só quando acessados (mais performático). EAGER carrega junto com a entidade principal (pode causar N+1 queries).", "LAZY é, por padrão arquitetural, consistentemente mais lento em consultas que demandam JOIN simples relacional.", "LAZY consome muita memória operacional residente no lado do servidor Spring, ao contrário do ágil processo EAGER."], correta: 1 },
    { id: 39, tipo: 'objetiva', pergunta: "Como o Spring Data JPA gera consultas a partir do nome do método?", opcoes: ["Fazendo uso intensivo de algoritmos de inteligência artificial adaptativa presentes no motor avançado do Hibernate.", "Lê o nome do método e gera a query automaticamente. Ex: findByEmail gera SELECT FROM usuario WHERE email = ?. Funciona com findBy, existsBy, countBy, etc.", "Exige obrigatoriamente do dev um arquivo complementar XML contendo todas as queries manuais de relacionamento em um map.", "Unicamente por meio do acréscimo rígido de anotações clássicas de @Sql injetadas na raiz do repositório Java da classe."], correta: 1 },
    { id: 40, tipo: 'objetiva', pergunta: "O que é JPQL e quando o livro recomenda usá-lo?", opcoes: ["É a sigla de Java Performance Query Library, uma robusta biblioteca embutida reservada para o cache ágil global da rede.", "Trata-se de uma eficiente e moderna biblioteca externa importada que gerencia nativamente requisições assíncronas do frontend.", "JPA Query Language, parecida com SQL mas usa entidades e atributos Java. Usada via @Query quando o nome de método derivado ficaria complexo demais.", "Uma ferramenta simples utilizada nos serviços de formatação pesada e processo de limpeza exaustiva nos pesados payloads via JSONs."], correta: 2 },
    { id: 41, tipo: 'dissertativa', pergunta: "Como funciona o @ManyToMany entre Post e Tag no projeto 2?", respostaExata: "Usa @JoinTable com a tabela intermediária post_tags com colunas post_id e tag_id. Cascade PERSIST e MERGE salvam tags novas automaticamente." },
    { id: 42, tipo: 'dissertativa', pergunta: "O que é o Lombok? Cite quatro anotações dele usadas no livro.", respostaExata: "Reduz boilerplate Java. Anotações: @Getter e @Setter (getters/setters), @NoArgsConstructor (construtor vazio), @AllArgsConstructor (todos os args), @Builder (padrão builder)." },
    { id: 43, tipo: 'objetiva', pergunta: "Por que o livro usa DTOs separados das entidades JPA?", opcoes: ["Exclusivamente para otimizar a velocidade de processamento lógico interno focado nas operações de disco no banco de dados principal nativo isolado.", "Para não expor detalhes internos como hash de senha, permitir validações específicas por endpoint e evoluir a API independentemente do banco.", "Apenas com o objetivo central simplista de economizar drasticamente dezenas de preciosas linhas contadas de código explícito base em todo o projeto.", "Porque sua aplicação foi tornada mandatória técnica rígida exigida impreterivelmente na compilação pelas mais recentes atualizações contidas do Java 21 LTS."], correta: 1 },
    { id: 44, tipo: 'dissertativa', pergunta: "Quais anotações de Bean Validation são usadas no UsuarioRegistroDTO?", respostaExata: "@NotBlank (campo não pode ser vazio), @Size (limite de tamanho) e @Email (formato de e-mail válido). Ativadas com @Valid no controller." },
    { id: 45, tipo: 'objetiva', pergunta: "Como o projeto 2 trata erros de validação de forma centralizada?", opcoes: ["Inserindo explícitamente blocos try/catch em cada método da API.", "Redirecionando para uma página de erro HTML.", "Usa GlobalExceptionHandler com @RestControllerAdvice. Captura MethodArgumentNotValidException e retorna mapa com erros de cada campo com status 400.", "Ocultando os erros no log do servidor."], correta: 2 },
    { id: 46, tipo: 'objetiva', pergunta: "O que é Spring Security e qual é sua função nos projetos 2 e 3?", opcoes: ["Antivírus de JVM.", "Módulo padrão do Spring para autenticação e autorização. Projeto 2 usa sessões HTTP; projeto 3 usa JWT stateless.", "Interface de criptografia nativa em disco.", "Firewall embutido no Tomcat."], correta: 1 },
    { id: 47, tipo: 'objetiva', pergunta: "Por que nunca armazenar senhas em texto puro? Qual algoritmo o livro usa?", opcoes: ["O livro obriga uso de MD5.", "Usa SHA-1 nativo estrito.", "Senhas expostas se o banco for comprometido. O livro usa BCrypt via PasswordEncoder, que gera hashes resistentes a força bruta.", "Usa AES-256 Nativo com chave local."], correta: 2 },
    { id: 48, tipo: 'objetiva', pergunta: "O que é o UserDetailsService e como é implementado no projeto 2?", opcoes: ["Serviço para renderizar as views do frontend.", "Interface que o Spring Security usa para carregar usuários por username. A implementação busca por email no banco e retorna User com roles.", "Serviço automático de emails.", "Tabela secundária de logs."], correta: 1 },
    { id: 49, tipo: 'objetiva', pergunta: "Como o projeto 2 configura rotas públicas e protegidas?", opcoes: ["Via arquivos XML estáticos.", "Utilizando a anotação @Public nas controllers.", "Via SecurityFilterChain com authorizeHttpRequests. Rotas de autenticação e leitura de posts são permitAll. Criar, editar e excluir requerem authenticated.", "Através de middlewares no Nginx."], correta: 2 },
    { id: 50, tipo: 'objetiva', pergunta: "O que é CORS e como o projeto 2 o configura?", opcoes: ["Cross-Origin Resource Sharing controla quais origens acessam a API. O projeto 2 configura via CorsConfigurationSource, permitindo localhost:8080 e localhost:3000.", "Criptografia avançada em fluxos trafegados.", "Sistema de gerenciamento de cache nativo do Spring.", "Ferramenta para roteamento no front-end React."], correta: 0 },
    { id: 51, tipo: 'objetiva', pergunta: "O que é JWT e como funciona no projeto 3?", opcoes: ["Sessão baseada em cookies físicos do servidor.", "JSON Web Token assinado digitalmente. O usuário faz login, o backend gera JWT; o frontend armazena e envia no header Authorization: Bearer.", "Biblioteca de templates de renderização HTML.", "Componente de roteamento de links do React."], correta: 1 },
    { id: 52, tipo: 'objetiva', pergunta: "Qual é a diferença entre autenticação por sessão e JWT stateless?", opcoes: ["A sessão opera apenas no front-end.", "Com sessões o backend guarda estado em memória. Com JWT stateless toda informação está no token, permitindo escalar sem compartilhar estado.", "JWT é mais lento e menos seguro que sessões.", "JWT obriga o uso de cookies atrelados."], correta: 1 },
    { id: 53, tipo: 'objetiva', pergunta: "Por que o JWT não deve conter dados sensíveis no payload?", opcoes: ["Gera overhead na rede.", "JWT não é criptografado, apenas assinado. Qualquer um que intercepte o token consegue ler o conteúdo (ex: no jwt.io).", "O Spring Security recusa o token.", "Ele expira muito rápido."], correta: 1 },
    { id: 54, tipo: 'objetiva', pergunta: "Qual biblioteca Java é usada para manipular JWT no projeto 3?", opcoes: ["Auth0 Secure.", "Nimbus JOSE.", "A biblioteca JJWT (io.jsonwebtoken), com artefatos jjwt-api, jjwt-impl e jjwt-jackson.", "Spring Auth Token."], correta: 2 },
    { id: 55, tipo: 'objetiva', pergunta: "Qual é o tempo de expiração do JWT no projeto 3 e como é configurado?", opcoes: ["1 hora em hardcode.", "86400000 milissegundos (24 horas), configurado em app.jwt.expiracao-ms no application.yml.", "7 dias setados no backend.", "Nunca expira."], correta: 1 },
    { id: 56, tipo: 'objetiva', pergunta: "O que é React e qual é sua principal ideia arquitetural?", opcoes: ["Framework CSS focado em responsividade.", "Biblioteca JavaScript para interfaces. Ideia principal: dividir a UI em componentes reutilizáveis com estado próprio e ser declarativo.", "Linguagem de backend compilada.", "Banco de dados local no browser."], correta: 1 },
    { id: 57, tipo: 'objetiva', pergunta: "O que é uma SPA e como o projeto 3 a implementa?", opcoes: ["Site renderizado em múltiplas páginas com PHP.", "Single Page Application que atualiza conteúdo dinamicamente. Projeto 3 usa React com Vite na porta 5173, separado do Spring Boot.", "Servidor de proxy leve embutido.", "Componente de cache offline."], correta: 1 },
    { id: 58, tipo: 'objetiva', pergunta: "O que é o hook useState e como é exemplificado no livro?", opcoes: ["Faz chamadas HTTP nativas.", "Gerencia estado local em componentes funcionais. Exemplo: const [valor, setValor] = useState(0) retorna o estado atual e uma função para atualizá-lo.", "Valida formulários HTML complexos.", "Manipula o DOM nativo ignorando o React."], correta: 1 },
    { id: 59, tipo: 'objetiva', pergunta: "Qual ferramenta de build é usada no projeto 3 para o frontend React?", opcoes: ["Webpack com configuração manual.", "Create React App (CRA).", "Vite, que serve a aplicação React de forma extremamente rápida na porta 5173.", "Babel sem bundlers adicionais."], correta: 2 },
    { id: 60, tipo: 'objetiva', pergunta: "O que são rotas protegidas no frontend React?", opcoes: ["Bloqueadas por firewall.", "Rotas que redirecionam o usuário não autenticado para o login. No projeto 3 protegem checkout, histórico de pedidos e painel administrativo.", "URLs criptografadas ocultas.", "Links absolutos com HTTPS obrigatório."], correta: 1 },
    { id: 61, tipo: 'dissertativa', pergunta: "Quais são as tecnologias usadas no Projeto 1?", respostaExata: "Backend: Node.js com Express. Banco: PostgreSQL. Frontend: HTML, CSS, Bootstrap e JavaScript puro." },
    { id: 62, tipo: 'objetiva', pergunta: "Quais são os filtros disponíveis na interface do Gerenciador de Tarefas do Projeto 1?", opcoes: ["Filtros por Data, Nome e Idade.", "Filtro por status de Urgente, Importante e Normal.", "Três filtros via tabs: Todas, Pendentes e Concluídas. Fazem requisições à API com o parâmetro de status correspondente.", "Um único filtro de ativas e inativas."], correta: 2 },
    { id: 63, tipo: 'objetiva', pergunta: "Como o Projeto 1 implementa a persistência de dados?", opcoes: ["Arquivos JSON locais.", "Variáveis globais na memória.", "Dados armazenados no PostgreSQL. Cada operação faz requisição à API REST que executa a query correspondente via pool de conexões.", "Utiliza apenas o LocalStorage do browser."], correta: 2 },
    { id: 64, tipo: 'objetiva', pergunta: "O que é a função escapeHtml() usada no frontend e por que é importante?", opcoes: ["Formata o texto visualmente.", "Comprime imagens renderizadas.", "Converte caracteres especiais HTML em entidades seguras. Previne ataques XSS ao exibir conteúdo inserido pelo usuário no DOM.", "Limpa o cache ativo do navegador."], correta: 2 },
    { id: 65, tipo: 'dissertativa', pergunta: "Cite quatro melhorias sugeridas pelo livro para o Projeto 1.", respostaExata: "Data de vencimento para tarefas; marcar como importantes; busca por palavra-chave; categorias e tags; arrastar e soltar com SortableJS; substituir alert por toasts Bootstrap." },
    { id: 66, tipo: 'dissertativa', pergunta: "Quais são as tecnologias do Projeto 2 e a principal mudança em relação ao Projeto 1?", respostaExata: "Backend: Java com Spring Boot. Banco: PostgreSQL. Front: HTML, Bootstrap e JS puro. A principal mudança é a migração do backend de Node.js/Express para Java/Spring Boot." },
    { id: 67, tipo: 'dissertativa', pergunta: "Quais são as cinco tabelas principais do banco de dados do blog no Projeto 2?", respostaExata: "usuarios, posts, comentarios, tags e post_tags (a tabela de junção N:N para o relacionamento posts-tags)." },
    { id: 68, tipo: 'objetiva', pergunta: "O que é um slug e como o Projeto 2 o gera automaticamente?", opcoes: ["Código numérico do servidor.", "Versão amigável para URL do título. O PostService usa Normalizer para remover acentos, converter para minúsculas e substituir espaços por hífens.", "Imagem em miniatura gerada.", "Token de segurança temporário."], correta: 1 },
    { id: 69, tipo: 'objetiva', pergunta: "Como o Projeto 2 implementa paginação nos posts?", opcoes: ["Através de scripts no frontend.", "Usando comandos nativos de LIMIT puros injetados rigorosamente em conexões JDBC.", "Com a interface Pageable do Spring Data aliada à anotação @PageableDefault nos controllers.", "Carregando a base inteira em arrays estáticos no backend em memória."], correta: 2 },
    { id: 70, tipo: 'dissertativa', pergunta: "Quais são as funcionalidades do sistema de blog do Projeto 2?", respostaExata: "Cadastro e login com Spring Security, perfil com bio e avatar, criação/edição de posts pelo autor, listagem pública, comentários, tags, paginação e busca por palavra-chave." },
    { id: 71, tipo: 'dissertativa', pergunta: "Quais são as tecnologias do Projeto 3?", respostaExata: "Backend: Java com Spring Boot e JWT. Frontend: React com Vite (usando Axios). Banco: PostgreSQL." },
    { id: 72, tipo: 'dissertativa', pergunta: "Quais são as funcionalidades principais do e-commerce do Projeto 3?", respostaExata: "Catálogo paginado com busca e filtro por categoria, carrinho persistido no backend, checkout, autenticação JWT, rotas protegidas, painel administrativo e histórico de pedidos." },
    { id: 73, tipo: 'objetiva', pergunta: "Quais são os status possíveis de um pedido no Projeto 3?", opcoes: ["NOVO, AVALIADO, REJEITADO.", "PENDENTE, PAGO, ENVIADO, ENTREGUE e CANCELADO. Definidos como enum Status dentro da entidade Pedido.", "INICIO, TRAMITE, DESPACHO e FINAL.", "ETAPA_1, ETAPA_2, ETAPA_3."], correta: 1 },
    { id: 74, tipo: 'dissertativa', pergunta: "Qual é a diferença arquitetural entre o Projeto 2 e o Projeto 3 no frontend?", respostaExata: "No projeto 2 o Spring Boot serve arquivos HTML estáticos. No projeto 3 o React é uma SPA independente rodando na porta 5173 comunicando com o backend REST/JWT." },
    { id: 75, tipo: 'objetiva', pergunta: "O que é o painel administrativo do Projeto 3 e quem pode acessá-lo?", opcoes: ["Painel gerencial disponível a todos.", "Área pública de relatórios e estatísticas.", "Área exclusiva para gerenciar produtos e pedidos, acessível somente a usuários com papel ADMIN.", "Painel direto de acesso às tabelas PostgreSQL."], correta: 2 },
    { id: 76, tipo: 'dissertativa', pergunta: "O que é Inversão de Controle (IoC) e Injeção de Dependência no Spring Boot?", respostaExata: "IoC: O framework toma controle do ciclo de vida dos objetos (Beans). Injeção de Dependência: O Spring fornece dependências automaticamente (ex: @Autowired)." },
    { id: 77, tipo: 'objetiva', pergunta: "O que é escalabilidade horizontal e como o JWT a facilita?", opcoes: ["Adição de instâncias de servidor para dividir carga. JWT facilita por ser stateless: a autenticação está no token, permitindo que qualquer instância atenda a requisição sem compartilhar estado na memória.", "Aumento de CPU de um servidor central. JWT compacta o tráfego.", "Distribuição de banco de dados. JWT executa sharding.", "Partições de dados. JWT mapeia modelos."], correta: 0 },
    { id: 78, tipo: 'objetiva', pergunta: "O que é @RestControllerAdvice e qual é seu papel no projeto 2?", opcoes: ["Controla a rota genérica raiz do sistema.", "Serviço de envio de emails em batch.", "Anotação que define tratamento global de exceções. Captura erros e retorna respostas HTTP padronizadas (ex: 400 Bad Request) sem try/catch repetitivo no código.", "Responsável por logs contábeis rígidos."], correta: 2 },
    { id: 79, tipo: 'objetiva', pergunta: "O que é Flyway ou Liquibase e por que o livro os menciona para produção?", opcoes: ["Frameworks visuais reativos.", "Caches temporários ultra velozes.", "Ambientes de múltiplos threads em cloud.", "Ferramentas de migration que versionam alterações de schema de banco. Em produção evitam falhas e perda de dados, superando o perigoso 'ddl-auto: update'."], correta: 3 },
    { id: 80, tipo: 'dissertativa', pergunta: "Qual é a lição pedagógica do livro ao apresentar três projetos com complexidade crescente?", respostaExata: "Mostrar de forma prática como os mesmos conceitos (CRUD, banco, segurança, front/backend) se aplicam e evoluem em diferentes stacks: de Node.js + HTML simples, passando por MVC com Java, até SPA React + Spring Boot + JWT." }
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

// Lógica principal do servidor para gerar a prova e verificar as respostas
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
        if (gameState !== 'LOBBY') return socket.emit('error', 'O jogo já começou!');
        
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
        const allReady = playersList.length > 0 && playersList.every(p => p.isReady);

        if (allReady && gameState === 'LOBBY') {
            gameState = 'PLAYING';
            currentQuestions = generateSimulado();
            currentQuestionIndex = 0;
            
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
            if (answerText === textoCorreto) player.score += 100;
        } else {
            if (answerText.trim().length > 5) player.score += 50; 
        }
        
        const allAnswered = Object.values(players).every(p => p.answered);
        if (allAnswered) {
            const gabarito = q.tipo === 'objetiva' ? q.opcoes[q.correta] : q.respostaExata;
            io.emit('answer_result', { tipo: q.tipo, correta: gabarito });
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Hootka Backend rodando na porta ${PORT}`));