// =================================================================
// BANCO DE DADOS - MODO ESTUDO (100% OBJETIVAS E COM ESPAÇAMENTO)
// =================================================================

const questoesDB = [
    // --- AMBIENTE ---
    { id: 1, tipo: 'objetiva', pergunta: "Qual ferramenta é recomendada para instalar e gerenciar múltiplas versões do Node.js?", opcoes: ["O npm (Node Package Manager).", "O nvm (Node Version Manager). No Linux/Mac instala-se via curl e permite trocar de versão facilmente com nvm use --lts.", "O npx, utilizado para executar dependências temporárias sem instalação.", "O Yarn, que substitui o Node.js em ambientes de produção."], correta: 1 },
    { id: 2, tipo: 'objetiva', pergunta: "Qual versão do JDK é utilizada nos projetos com Spring Boot do livro, e qual distribuição é recomendada?", opcoes: ["JDK 11 na distribuição Oracle Standard Edition.", "JDK 17 (LTS) na distribuição OpenJDK pura.", "JDK 21 (LTS) na distribuição Eclipse Temurin, disponível em adoptium.net.", "JDK 8 na distribuição Amazon Corretto."], correta: 2 },
    { id: 3, tipo: 'objetiva', pergunta: "Qual é a ferramenta de build padrão para projetos Java usada no livro, e o que ela faz?", opcoes: ["Gradle. Ele compila o código em C++ nativo e otimiza a memória.", "Ant. Ele serve apenas para empacotar o projeto em um arquivo .jar.", "Maven. Ele gerencia dependências, compila o código, executa testes e empacota a aplicação.", "NPM. Ele baixa as bibliotecas do Spring Boot via repositórios do Node."], correta: 2 },
    { id: 4, tipo: 'objetiva', pergunta: "Qual banco de dados é utilizado em todos os três projetos do livro?", opcoes: ["MySQL Server 8.0.", "MongoDB.", "PostgreSQL (versão 16 ou superior), um banco de dados relacional de código aberto.", "SQLite, por ser leve e rodar na RAM."], correta: 2 },
    { id: 5, tipo: 'objetiva', pergunta: "Quais ferramentas de cliente HTTP o livro recomenda para testar APIs REST?", opcoes: ["Apenas o Postman por ser padrão de mercado.", "Swagger UI e GraphQL Playground.", "Postman, Insomnia ou Thunder Client. O livro recomenda o Insomnia por ser leve e intuitivo.", "Curl via terminal de comando exclusivamente."], correta: 2 },

    // --- HTML E CSS ---
    { id: 6, tipo: 'objetiva', pergunta: "O que são tags semânticas do HTML5? Cite três exemplos.", opcoes: ["Tags que descrevem o significado do conteúdo, tornando o código mais legível e acessível. Exemplos: header, nav, main, article, section, footer.", "Tags exclusivas para estilização visual de texto. Exemplos: b, i, u.", "Tags que executam funções de banco de dados diretamente no DOM. Exemplos: sql, query, fetch.", "Tags que substituem o uso de CSS. Exemplos: color, font, align."], correta: 0 },
    { id: 7, tipo: 'objetiva', pergunta: "Qual é a diferença entre HTML e CSS?", opcoes: ["HTML compila o código fonte, enquanto CSS executa o comportamento.", "HTML define a estrutura (o que é cada elemento), enquanto CSS define a apresentação (cor, tamanho, posição, animação).", "HTML é backend, enquanto CSS é renderizado no frontend.", "Não há diferença estrutural."], correta: 1 },
    { id: 8, tipo: 'objetiva', pergunta: "O que é o Bootstrap e qual versão é usada nos projetos?", opcoes: ["Biblioteca de ícones / Bootstrap 4.", "Motor de templates / versão 3.", "Um framework CSS com classes prontas. O livro usa Bootstrap 5, que abandonou o jQuery e é baseado em flexbox e CSS Grid.", "Banco de dados NoSQL / versão 6."], correta: 2 },
    { id: 9, tipo: 'objetiva', pergunta: "Como funciona o sistema de grid responsivo do Bootstrap?", opcoes: ["Usa atributos de tabela clássicos como colspan e rowspan.", "Usa classes como col-md-4 dentro de um row. Três divs com col-md-4 formam três colunas em telas médias e se empilham em telas pequenas.", "Usa exclusivamente a tag grid do HTML5 combinada com position: absolute.", "Usa media queries escritas manualmente no arquivo style.css."], correta: 1 },
    { id: 10, tipo: 'objetiva', pergunta: "Quais são os três tipos de seletores CSS exemplificados no livro?", opcoes: ["Por id, por valor e por estado.", "Por tag (p {}), por classe (.destaque {}) e por id (#principal {}). O livro também mostra Flexbox com display: flex.", "Por herança, por pseudo-classe e por animação.", "Por variável, por const e por let."], correta: 1 },

    // --- JAVASCRIPT ---
    { id: 11, tipo: 'objetiva', pergunta: "Qual é a diferença entre const e let em JavaScript?", opcoes: ["const é acessada globalmente, let é restrita.", "const declara uma constante (não pode ser reatribuída). let declara uma variável mutável. Ambas têm escopo de bloco.", "const só aceita números, let aceita qualquer string.", "let é içada (hoisted) e const não sofre hoisting."], correta: 1 },
    { id: 12, tipo: 'objetiva', pergunta: "Cite três métodos de arrays em JavaScript mostrados no livro e explique cada um.", opcoes: ["push() adiciona; pop() remove; shift() move.", "map() transforma cada elemento retornando novo array; filter() filtra elementos por condição; reduce() acumula valores em um único resultado.", "sort() ordena; reverse() inverte; splice() corta.", "concat() junta; slice() fatia; join() une em string."], correta: 1 },
    { id: 13, tipo: 'objetiva', pergunta: "O que é uma arrow function? Dê um exemplo.", opcoes: ["Uma função nativa para desenhar vetores no canvas.", "Um método de array que percorre itens na direção inversa.", "Sintaxe moderna para funções, mais concisa. Ex: const multiplicar = (a,b) => a * b;", "Função exclusiva do React para alterar estados."], correta: 2 },
    { id: 14, tipo: 'objetiva', pergunta: "O que são async/await em JavaScript e para que servem?", opcoes: ["Compiladores em binário no Node.js.", "Palavras-chave para operações assíncronas de forma legível. async marca a função e await pausa até uma Promise ser resolvida.", "Métodos de laço de repetição (loops).", "Funções do Express para deletar arquivos."], correta: 1 },
    { id: 15, tipo: 'objetiva', pergunta: "O que é o método fetch() e como é usado no projeto 1?", opcoes: ["API do browser para requisições HTTP. No projeto 1: const response = await fetch com a URL, seguido de response.json() para obter os dados.", "Um comando exclusivo do PostgreSQL.", "Método do Express para ler arquivos HTML.", "Função padrão do Node para buscar hardware."], correta: 0 },

    // --- NODE.JS E EXPRESS ---
    { id: 16, tipo: 'objetiva', pergunta: "O que é Node.js e qual é sua principal vantagem?", opcoes: ["Framework CSS avançado.", "Banco de dados relacional de alta velocidade.", "Runtime JavaScript baseado no motor V8 do Chrome. Principal vantagem: ecossistema npm para criar APIs e servidores.", "Servidor Apache embutido para páginas estáticas."], correta: 2 },
    { id: 17, tipo: 'objetiva', pergunta: "No projeto 1, qual é a estrutura de pastas do backend?", opcoes: ["models/, views/ e controllers/.", "src/server.js (entrada), src/routes/ (rotas), src/db/ (conexão). Arquivos estáticos do frontend ficam em public/.", "app/, config/ e public/ distribuídos em contêineres Docker.", "bin/, lib/ e src/ com os arquivos HTML misturados."], correta: 1 },
    { id: 18, tipo: 'objetiva', pergunta: "O que são middlewares no Express? Quais são usados no projeto 1?", opcoes: ["Bibliotecas de segurança de banco de dados.", "Funções que processam requisições antes dos handlers. Projeto 1 usa: cors(), express.json(), express.urlencoded() e express.static().", "Plugins do frontend para conectar no backend.", "Ferramentas de ORM similares ao Prisma."], correta: 1 },
    { id: 19, tipo: 'objetiva', pergunta: "O que é pool de conexões no PostgreSQL com Node.js e por que é importante?", opcoes: ["Um serviço de cache distribuído.", "Reutiliza conexões abertas ao banco, evitando o custo de abrir uma nova a cada requisição. Melhora performance e escalabilidade.", "Estratégia de backup redundante.", "Um protocolo de criptografia nativo."], correta: 1 },
    { id: 20, tipo: 'objetiva', pergunta: "O que são queries parametrizadas e por que são usadas?", opcoes: ["Queries lentas processadas em lote.", "Consultas SQL com valores separados como parâmetros. Protegem contra ataques SQL Injection.", "Subconsultas aninhadas.", "Procedures que rodam exclusivamente na RAM."], correta: 1 },

    // --- APIS REST ---
    { id: 21, tipo: 'objetiva', pergunta: "Quais são os 5 endpoints da API REST de tarefas no projeto 1?", opcoes: ["GET /all, POST /add, PUT /update, DELETE /remove, OPTIONS /check.", "GET /api/tarefas (listar), GET /api/tarefas/:id (buscar), POST /api/tarefas (criar), PATCH /api/tarefas/:id (atualizar), DELETE /api/tarefas/:id (excluir).", "FETCH /tasks, SEND /tasks, READ /tasks/:id, UPDATE /tasks, DROP /tasks.", "GET /api/list, POST /api/new, PUT /api/edit, DELETE /api/del, PATCH /api/status."], correta: 1 },
    { id: 22, tipo: 'objetiva', pergunta: "Como o projeto 1 lida com variáveis sensíveis como credenciais do banco?", opcoes: ["Salva em texto puro no server.js.", "Usa variáveis de ambiente com o pacote dotenv. As credenciais ficam em .env e são acessadas via process.env.NOME_VARIAVEL.", "Guarda todas no localStorage do navegador.", "Criptografa nativamente dentro de um arquivo JSON estático."], correta: 1 },
    { id: 23, tipo: 'objetiva', pergunta: "O que é REST e quais são os cinco verbos HTTP de uma API REST?", opcoes: ["Uma linguagem de programação. Verbos: GET, POST, DELETE, READ, WRITE.", "REST (Representational State Transfer) é um estilo arquitetural. Verbos: GET (buscar), POST (criar), PUT (atualizar completo), PATCH (parcial), DELETE (excluir).", "Um protocolo de camada de rede. Verbos: TCP, UDP, HTTP, FTP, SMTP.", "Um framework Javascript. Verbos: CREATE, READ, UPDATE, DELETE, MERGE."], correta: 1 },
    { id: 24, tipo: 'objetiva', pergunta: "Qual é a diferença entre PUT e PATCH?", opcoes: ["O PUT deleta de forma suave, PATCH remove permanentemente.", "PUT atualiza o recurso completo (todos os campos). PATCH atualiza apenas os campos informados (atualização parcial).", "PUT é para criação, PATCH é para exclusão lógica.", "PUT é assíncrono, PATCH bloqueia sincronicamente."], correta: 1 },
    { id: 25, tipo: 'objetiva', pergunta: "O que é o endpoint de saúde (health check) criado no projeto 1?", opcoes: ["GET /api/saude retorna status ok com timestamp. Serve para verificar se o servidor está funcionando, útil para monitoramento.", "POST /api/check para forçar reautenticação.", "GET /api/error para listar logs de bugs.", "DELETE /api/health para desligar o servidor remotamente."], correta: 0 },

    // --- POSTGRESQL ---
    { id: 26, tipo: 'objetiva', pergunta: "Quais são as quatro operações básicas de SQL demonstradas no livro?", opcoes: ["FETCH, PUSH, PULL e MERGE", "GRANT, REVOKE, COMMIT e ROLLBACK", "CREATE TABLE (criar tabela), INSERT INTO (inserir), SELECT (consultar), UPDATE (atualizar) e DELETE (excluir).", "JOIN, UNION, INTERSECT e EXCEPT"], correta: 2 },
    { id: 27, tipo: 'objetiva', pergunta: "O que significa SERIAL PRIMARY KEY em PostgreSQL?", opcoes: ["Chave condicional baseada na data.", "Chave composta de texto.", "SERIAL cria uma sequência auto-incrementada. PRIMARY KEY define essa coluna como chave primária da tabela.", "Índice de performance de deleções em cascata."], correta: 2 },
    { id: 28, tipo: 'objetiva', pergunta: "O que são índices e por que o projeto 3 os cria nas tabelas de produtos?", opcoes: ["Aceleram consultas evitando varredura completa. No projeto 3 são criados em categoria_id e ativo, campos usados frequentemente em filtros.", "Eles criptografam as senhas para segurança.", "São backups automáticos do banco a cada hora.", "Geram relatórios gerenciais em PDF."], correta: 0 },
    { id: 29, tipo: 'objetiva', pergunta: "Por que o projeto 3 guarda nome e preço na tabela itens_pedido ao invés de apenas o id do produto?", opcoes: ["Para ocupar mais espaço em disco.", "Para evitar cláusulas JOIN em consultas simples.", "Para preservar um snapshot no momento da compra. Se o preço ou nome mudar depois, o histórico de pedidos permanece correto.", "Porque a integração em React exige dados estáticos."], correta: 2 },
    { id: 30, tipo: 'objetiva', pergunta: "O que é a restrição UNIQUE (usuario_id, produto_id) na tabela carrinho_itens?", opcoes: ["Garante que cada usuário tenha no máximo um registro por produto no carrinho. Adicionar o mesmo produto vira UPDATE, não duplicata.", "Impede que dois usuários comprem a mesma peça.", "Apaga produtos duplicados por erro no checkout.", "Bloqueia compras sucessivas com o mesmo cartão."], correta: 0 },

    // --- SPRING BOOT ---
    { id: 31, tipo: 'objetiva', pergunta: "Quais são as seis camadas da arquitetura Spring Boot usadas no projeto 2?", opcoes: ["View, Route, Component, Hook, DB, Auth.", "Entity (modelo), Repository (acesso ao banco), Service (lógica de negócio), Controller (endpoints HTTP), DTO (dados em trânsito) e Config (configurações).", "Frontend, Backend, Cache, Queue, Database, Gateway.", "Model, View, Template, Reducer, Store, Action."], correta: 1 },
    { id: 32, tipo: 'objetiva', pergunta: "O que é o Spring Initializr?", opcoes: ["Uma IDE oficial da Oracle.", "Gerador web em start.spring.io que cria o ZIP do projeto Spring Boot com as dependências selecionadas.", "Ferramenta robusta de logs.", "Plugin dentro do Maven wrapper."], correta: 1 },
    { id: 33, tipo: 'objetiva', pergunta: "Qual é a diferença entre application.properties e application.yml?", opcoes: ["Properties é incompatível com Java 21.", "Ambos configuram a aplicação, mas YAML usa indentação hierárquica, tornando-o mais legível. O livro migra para .yml por legibilidade.", "Properties compila mais rápido no Docker.", "Não há diferença prática ou de sintaxe."], correta: 1 },
    { id: 34, tipo: 'objetiva', pergunta: "O que faz ddl-auto: update no Hibernate e por que não deve ser usado em produção?", opcoes: ["Atualiza pacotes da build quebrando a compilação.", "Cria e atualiza tabelas automaticamente. Em produção é perigoso pois renomear um campo pode causar perda de dados. Use Flyway ou Liquibase.", "Limpa o banco a cada restart do sistema.", "Otimiza queries consumindo muita CPU."], correta: 1 },
    { id: 35, tipo: 'objetiva', pergunta: "O que é o Maven Wrapper (mvnw) e qual é sua vantagem?", opcoes: ["Dependência para interfaces de usuário.", "Script incluído no projeto que baixa a versão correta do Maven automaticamente sem exigir instalação global.", "Plugin de segurança de pacotes.", "Framework de testes unitários."], correta: 1 },

    // --- JPA E HIBERNATE ---
    { id: 36, tipo: 'objetiva', pergunta: "O que significa a anotação @Entity em uma classe Java?", opcoes: ["Transforma o objeto em string JSON.", "Marca a classe como DTO.", "Marca a classe como uma entidade JPA, ou seja, ela é mapeada para uma tabela no banco de dados.", "Define uma regra de negócio protegida."], correta: 2 },
    { id: 37, tipo: 'objetiva', pergunta: "O que fazem @PrePersist e @PreUpdate em uma entidade JPA?", opcoes: ["Validam os dados antes do controller.", "Limpam automaticamente o cache.", "Executa antes de inserir o registro (@PrePersist) e antes de atualizar (@PreUpdate). Usados para preencher criadoEm e atualizadoEm automaticamente.", "Fazem os logs exatos de acessos via SELECT."], correta: 2 },
    { id: 38, tipo: 'objetiva', pergunta: "Qual é a diferença entre FetchType.LAZY e FetchType.EAGER?", opcoes: ["LAZY deve ser usado para inserção de dados.", "LAZY carrega dados relacionados só quando acessados (mais performático). EAGER carrega junto com a entidade principal (pode causar N+1 queries).", "LAZY é consistentemente mais lento.", "LAZY consome mais memória operacional residente."], correta: 1 },
    { id: 39, tipo: 'objetiva', pergunta: "Como o Spring Data JPA gera consultas a partir do nome do método?", opcoes: ["Inteligência artificial do Hibernate.", "Lê o nome do método e gera a query automaticamente. Ex: findByEmail gera SELECT FROM usuario WHERE email = ?. Funciona com findBy, existsBy, etc.", "Exige um arquivo complementar XML.", "Acréscimo de anotações @Sql nativas."], correta: 1 },
    { id: 40, tipo: 'objetiva', pergunta: "O que é JPQL e quando o livro recomenda usá-lo?", opcoes: ["Java Performance Query Library.", "Biblioteca externa de requisições.", "JPA Query Language, parecida com SQL mas usa entidades e atributos Java. Usada via @Query quando o nome do método derivado ficaria complexo demais.", "Ferramenta de limpeza de JSONs."], correta: 2 },

    // --- RELACIONAMENTOS E LOMBOK ---
    { id: 41, tipo: 'objetiva', pergunta: "Como funciona o @ManyToMany entre Post e Tag no projeto 2?", opcoes: ["Usa foreign keys normais sem tabela intermediária.", "Usa arrays nativos do PostgreSQL ignorando o JPA.", "Usa @JoinTable com a tabela intermediária post_tags com colunas post_id e tag_id. Cascade PERSIST e MERGE salvam tags novas automaticamente.", "Usa triggers complexas no banco de dados."], correta: 2 },
    { id: 42, tipo: 'objetiva', pergunta: "O que é o Lombok? Cite quatro anotações dele usadas no livro.", opcoes: ["Reduz boilerplate Java. Anotações: @Getter e @Setter (getters/setters), @NoArgsConstructor (construtor vazio), @AllArgsConstructor (todos os args), @Builder (padrão builder).", "Framework de logs. Anotações: @Log, @Info, @Warn, @Error.", "Módulo de segurança. Anotações: @Secured, @RolesAllowed, @PermitAll, @DenyAll.", "Ferramenta de testes. Anotações: @Test, @Before, @After, @Mock."], correta: 0 },
    
    // --- DTOS E VALIDAÇÃO ---
    { id: 43, tipo: 'objetiva', pergunta: "Por que o livro usa DTOs separados das entidades JPA?", opcoes: ["Para otimizar a velocidade de disco.", "Para não expor detalhes internos como hash de senha, permitir validações específicas por endpoint e evoluir a API independentemente do banco.", "Para economizar linhas de código no projeto.", "Exigência mandatória do Java 21 LTS."], correta: 1 },
    { id: 44, tipo: 'objetiva', pergunta: "Quais anotações de Bean Validation são usadas no UsuarioRegistroDTO?", opcoes: ["@NotNull, @Min, @Max.", "@NotEmpty, @Pattern, @Past.", "@NotBlank (campo não pode ser vazio), @Size (limite de tamanho) e @Email (formato de e-mail válido). Ativadas com @Valid no controller.", "@Required, @Length, @ValidEmail."], correta: 2 },
    { id: 45, tipo: 'objetiva', pergunta: "Como o projeto 2 trata erros de validação de forma centralizada?", opcoes: ["Blocos try/catch espalhados nos controllers.", "Redirecionando para página de erro HTML.", "Usa GlobalExceptionHandler com @RestControllerAdvice. Captura MethodArgumentNotValidException e retorna mapa com erros de cada campo com status 400.", "Ocultando silenciosamente em logs."], correta: 2 },

    // --- SPRING SECURITY ---
    { id: 46, tipo: 'objetiva', pergunta: "O que é Spring Security e qual é sua função nos projetos 2 e 3?", opcoes: ["Antivírus adaptável para atuar na JVM.", "Módulo padrão do Spring para autenticação e autorização. Projeto 2 usa sessões HTTP; projeto 3 usa JWT stateless.", "Interface de criptografia em discos.", "Poderoso Firewall embutido no Tomcat."], correta: 1 },
    { id: 47, tipo: 'objetiva', pergunta: "Por que nunca armazenar senhas em texto puro? Qual algoritmo o livro usa?", opcoes: ["O livro usa MD5 rudimentar legado.", "Usa SHA-1 nativo simplório.", "Senhas expostas vazam se o banco for comprometido. O livro usa BCrypt via PasswordEncoder, gerando hashes resistentes a força bruta.", "Usa AES-256 Nativo com chave local."], correta: 2 },
    { id: 48, tipo: 'objetiva', pergunta: "O que é o UserDetailsService e como é implementado no projeto 2?", opcoes: ["Serviço para renderizar templates HTML.", "Interface que o Spring Security usa para carregar usuários por username. A implementação busca por email no banco e retorna User com roles.", "Módulo agendado rodando em contínuo envio.", "Tabela secundária oculta para logs."], correta: 1 },
    { id: 49, tipo: 'objetiva', pergunta: "Como o projeto 2 configura rotas públicas e protegidas?", opcoes: ["Via arquivos XML antigos.", "Utilizando a anotação @Public.", "Via SecurityFilterChain com authorizeHttpRequests. Rotas de autenticação e leitura de posts são permitAll. Criar, editar e excluir requerem authenticated.", "Middlewares diretos no gateway."], correta: 2 },
    { id: 50, tipo: 'objetiva', pergunta: "O que é CORS e como o projeto 2 o configura?", opcoes: ["Cross-Origin Resource Sharing. Controla quais origens acessam a API. O projeto 2 configura via CorsConfigurationSource, permitindo localhost:8080 e localhost:3000.", "Protocolo restrito para criptografia avançada.", "Sistema de gerenciamento de pool embutido.", "Ferramenta front-end de links locais React."], correta: 0 },

    // --- JWT ---
    { id: 51, tipo: 'objetiva', pergunta: "O que é JWT e como funciona no projeto 3?", opcoes: ["Sessão baseada em cookies físicos tradicionais.", "JSON Web Token assinado digitalmente. O usuário faz login, o backend gera JWT; o frontend armazena e envia no header Authorization: Bearer.", "Motor dinâmico para renderizar HTML.", "Ferramenta React de rotas isoladas."], correta: 1 },
    { id: 52, tipo: 'objetiva', pergunta: "Qual é a diferença entre autenticação por sessão e JWT stateless?", opcoes: ["Na sessão o backend apenas valida frontend.", "Com sessões o backend guarda estado em memória. Com JWT stateless toda informação está no token, permitindo escalar horizontalmente sem compartilhar estado.", "O JWT é classicamente mais demorado e falho.", "JWT obriga cookies atrelados estáticos."], correta: 1 },
    { id: 53, tipo: 'objetiva', pergunta: "Por que o JWT não deve conter dados sensíveis no payload?", opcoes: ["Para não inchar o payload e gerar overhead.", "JWT não é criptografado, apenas assinado. Qualquer pessoa que intercepte o token consegue ler o conteúdo (ex: em jwt.io).", "Spring Security veta strings sensíveis.", "Expira de forma obrigatória em minutos."], correta: 1 },
    { id: 54, tipo: 'objetiva', pergunta: "Qual biblioteca Java é usada para manipular JWT no projeto 3?", opcoes: ["Auth0 Secure incorporada.", "Nimbus JOSE JWT avançada.", "A biblioteca JJWT (io.jsonwebtoken), com três artefatos: jjwt-api, jjwt-impl e jjwt-jackson.", "Spring Auth Token Standard nativo."], correta: 2 },
    { id: 55, tipo: 'objetiva', pergunta: "Qual é o tempo de expiração do JWT no projeto 3 e como é configurado?", opcoes: ["1 hora engessada via hardcode.", "86400000 milissegundos (24 horas), configurado no application.yml. A chave secreta vem de variável de ambiente.", "7 dias fixados no backend.", "Possui atípica propriedade que nunca expira."], correta: 1 },

    // --- REACT ---
    { id: 56, tipo: 'objetiva', pergunta: "O que é React e qual é sua principal ideia arquitetural?", opcoes: ["Framework focado estritamente em CSS.", "Biblioteca JavaScript para interfaces de usuário. Ideia principal: dividir a UI em componentes reutilizáveis com estado próprio.", "Linguagem pesada para processos backend.", "Banco de dados mantido em cache."], correta: 1 },
    { id: 57, tipo: 'objetiva', pergunta: "O que é uma SPA e como o projeto 3 a implementa?", opcoes: ["Site tradicional ancorado em múltiplas Páginas.", "Single Page Application que atualiza conteúdo dinamicamente via JS. Roda no Vite (porta 5173), separado do Spring Boot (porta 8080).", "Servidor proxy embutido de imagens.", "Componente persistido offline."], correta: 1 },
    { id: 58, tipo: 'objetiva', pergunta: "O que é o hook useState e como é exemplificado no livro?", opcoes: ["Função de requisições pesadas HTTP.", "Gerencia estado local em componentes funcionais. Exemplo: const [valor, setValor] = useState(0) retorna o estado atual e função atualizadora.", "Script de validação de formulários.", "Recurso que intercepta o DOM ignorando React."], correta: 1 },
    { id: 59, tipo: 'objetiva', pergunta: "Qual ferramenta de build é usada no projeto 3 para o frontend React?", opcoes: ["Webpack clássico.", "Create React App (CRA) monolítico.", "Vite, que serve a aplicação React de forma extremamente rápida na porta 5173 por padrão em desenvolvimento.", "Babel acoplado isoladamente."], correta: 2 },
    { id: 60, tipo: 'objetiva', pergunta: "O que são rotas protegidas no frontend React?", opcoes: ["Bloqueadas tratadas pelo firewall nativo.", "Rotas que redirecionam o usuário não autenticado para o login. No projeto 3 protegem checkout, histórico de pedidos e painel administrativo.", "Caminhos fixos de URLs ofuscados.", "Caminhos baseados no protocolo HTTPS."], correta: 1 },

    // --- PROJETOS FINAIS E GERAIS ---
    { id: 61, tipo: 'objetiva', pergunta: "Quais são as tecnologias usadas no Projeto 1 (Gerenciador de Tarefas)?", opcoes: ["Django, SQLite, Vue.", "Backend: Node.js com Express. Banco: PostgreSQL. Frontend: HTML, CSS, Bootstrap e JavaScript puro.", "PHP, MySQL, jQuery.", "Ruby on Rails, MariaDB, Angular."], correta: 1 },
    { id: 62, tipo: 'objetiva', pergunta: "Quais são os filtros disponíveis na interface do Gerenciador de Tarefas do Projeto 1?", opcoes: ["Filtros por Data, Nome e Idade.", "Filtro por status de Urgente, Importante e Normal.", "Três filtros via tabs: Todas, Pendentes e Concluídas. Fazem requisições à API com o parâmetro de status correspondente.", "Um único filtro de ativas e inativas."], correta: 2 },
    { id: 63, tipo: 'objetiva', pergunta: "Como o Projeto 1 implementa a persistência de dados?", opcoes: ["Arquiva dados em arquivos JSON locais.", "Usa matrizes em memória estática.", "Dados armazenados no PostgreSQL. Cada operação no frontend faz requisição à API REST via pool de conexões.", "Toda a persistência utiliza o LocalStorage."], correta: 2 },
    { id: 64, tipo: 'objetiva', pergunta: "O que é a função escapeHtml() usada no frontend e por que é importante?", opcoes: ["Formata blocos com cores padrão.", "Comprime as imagens pesadas HTML.", "Converte caracteres especiais HTML em entidades seguras. Previne ataques XSS de injeção de scripts no DOM.", "Limpa rigorosamente o cache ativo."], correta: 2 },
    { id: 65, tipo: 'objetiva', pergunta: "Cite quatro melhorias sugeridas pelo livro para o Projeto 1.", opcoes: ["Migrar para MongoDB e GraphQL.", "Data de vencimento para tarefas; marcar como importantes; busca por palavra-chave; categorias e tags; arrastar e soltar com SortableJS; usar toasts Bootstrap.", "Criar um app nativo em React Native.", "Implementar WebSockets para chat."], correta: 1 },
    { id: 66, tipo: 'objetiva', pergunta: "Quais são as tecnologias do Projeto 2 e a principal mudança em relação ao Projeto 1?", opcoes: ["Python/Flask e NoSQL.", "Backend: Java com Spring Boot. Banco: PostgreSQL. Front: HTML, Bootstrap e JS puro. A mudança principal é a migração do backend de Node.js para Java/Spring Boot.", "C#/ASP.NET e Tailwind.", "GoLang e Redis."], correta: 1 },
    { id: 67, tipo: 'objetiva', pergunta: "Quais são as cinco tabelas principais do banco de dados do blog no Projeto 2?", opcoes: ["users, roles, permissions, sessions, logs.", "usuarios, posts, comentarios, tags e post_tags (a tabela de junção N:N para o relacionamento posts-tags).", "artigos, categorias, imagens, autores, views.", "admin, publicacoes, curtidas, mensagens, config."], correta: 1 },
    { id: 68, tipo: 'objetiva', pergunta: "O que é um slug e como o Projeto 2 o gera automaticamente?", opcoes: ["Código numérico gerado no servidor.", "Versão amigável para URL do título. O PostService usa Normalizer para remover acentos, converter para minúsculas e trocar espaços por hífens.", "Imagem em miniatura gerada (avatar).", "Token de rascunho de post."], correta: 1 },
    { id: 69, tipo: 'objetiva', pergunta: "Como o Projeto 2 implementa paginação nos posts?", opcoes: ["Scripts que cortam arrays no frontend.", "Comandos nativos de LIMIT puros via JDBC.", "Com a interface Pageable do Spring Data aliada à anotação @PageableDefault nos controllers, retornando um objeto Page.", "Loops infinitos assíncronos."], correta: 2 },
    { id: 70, tipo: 'objetiva', pergunta: "Quais são as funcionalidades do sistema de blog do Projeto 2?", opcoes: ["Apenas leitura anônima de posts.", "Cadastro/login com Spring Security, perfil com bio/avatar, criação/edição de posts pelo autor, listagem pública, comentários, tags, paginação e busca por título.", "Fórum de discussão e votação de tópicos.", "Venda de artigos premium."], correta: 1 },
    { id: 71, tipo: 'objetiva', pergunta: "Quais são as tecnologias do Projeto 3?", opcoes: ["PHP, MySQL, Vue.", "Backend: Java com Spring Boot e JWT. Frontend: React com Vite (usando Axios). Banco: PostgreSQL.", "Node.js, MongoDB, Angular.", "Python, SQLite, Svelte."], correta: 1 },
    { id: 72, tipo: 'objetiva', pergunta: "Quais são as funcionalidades principais do e-commerce do Projeto 3?", opcoes: ["Vitrine online sem funções de venda.", "Catálogo paginado com busca e filtro de categoria, carrinho persistido, fluxo de checkout, autenticação JWT, rotas protegidas, painel admin e histórico de pedidos.", "Marketplace B2B complexo.", "Leilões em tempo real."], correta: 1 },
    { id: 73, tipo: 'objetiva', pergunta: "Quais são os status possíveis de um pedido no Projeto 3?", opcoes: ["NOVO, AVALIADO, CONCLUÍDO.", "PENDENTE, PAGO, ENVIADO, ENTREGUE e CANCELADO. Eles são definidos como enum Status dentro da entidade Pedido.", "CARRINHO, EM_ROTA, FECHADO.", "ETAPA_1 a ETAPA_5."], correta: 1 },
    { id: 74, tipo: 'objetiva', pergunta: "Qual é a diferença arquitetural entre o Projeto 2 e o Projeto 3 no frontend?", opcoes: ["Proj 2 usa CSS puro, Proj 3 usa Tailwind.", "Proj 2 focado em mobile, Proj 3 desktop.", "No projeto 2 o Spring Boot atua como monolito servindo HTML estático. No projeto 3, o React é uma SPA desacoplada na porta 5173 consumindo API via REST/JWT.", "Não há frontend no projeto 2."], correta: 2 },
    { id: 75, tipo: 'objetiva', pergunta: "O que é o painel administrativo do Projeto 3 e quem pode acessá-lo?", opcoes: ["Painel de visualização de logs abertos.", "Painel do PostgreSQL acessado por devs.", "Área para gerenciar produtos, categorias e pedidos. Acessível apenas a usuários com papel ADMIN, protegido no frontend (rotas React) e no backend (Spring Security).", "Acesso liberado a qualquer pessoa logada."], correta: 2 },
    { id: 76, tipo: 'objetiva', pergunta: "O que é Inversão de Controle (IoC) e Injeção de Dependência no Spring Boot?", opcoes: ["Mecanismo de desligamento de falhas.", "IoC: O framework toma o controle e gerencia o ciclo de vida dos objetos (Beans). Injeção de Dependência: O Spring fornece automaticamente essas dependências via @Autowired ou construtor.", "Rotinas de banco de dados SQL.", "Padrões de renderização HTML."], correta: 1 },
    { id: 77, tipo: 'objetiva', pergunta: "O que é escalabilidade horizontal e como o JWT a facilita?", opcoes: ["Aumentar memória RAM de um servidor.", "Particionar tabelas do banco em discos.", "Adicionar mais instâncias (cópias) do servidor para dividir a carga. O JWT facilita por ser stateless: como a autenticação está no token, qualquer servidor atende sem depender de sessões locais.", "Geração de métricas de crescimento."], correta: 2 },
    { id: 78, tipo: 'objetiva', pergunta: "O que é @RestControllerAdvice e qual é seu papel no projeto 2?", opcoes: ["Programa o desligamento de rotas em erro.", "Escreve erros brutos em log de disco.", "Anotação que define tratamento global de exceções. O GlobalExceptionHandler a usa para capturar erros e retornar respostas HTTP padronizadas (JSON) sem poluir os controllers com try/catch.", "Avisa admins por e-mail."], correta: 2 },
    { id: 79, tipo: 'objetiva', pergunta: "O que é Flyway ou Liquibase e por que o livro os menciona para produção?", opcoes: ["Servidores gratuitos de nuvem.", "Bibliotecas visuais front-end.", "Ferramentas de migration que versionam e automatizam alterações de schema de banco. Em produção são superiores ao 'ddl-auto: update' do Hibernate, pois evitam perda acidental de dados.", "Padrões de projeto multithread."], correta: 2 },
    { id: 80, tipo: 'objetiva', pergunta: "Qual é a lição pedagógica do livro ao apresentar três projetos com complexidade crescente?", opcoes: ["Provar que Java é mais rápido que Node.", "Ensinar a usar sistemas operacionais Linux.", "Mostrar de forma prática como os mesmos conceitos (CRUD, banco, segurança, frontend/backend) se aplicam evoluindo de Node.js simples até atingir o padrão corporativo moderno de SPA React + Spring Boot + JWT.", "Focar em técnicas de Web Design avançado."], correta: 2 }
];

// Variáveis de controle de UI
const quizContainer = document.getElementById('quiz-container');
const btnMod1 = document.getElementById('btn-mod1');
const btnMod2 = document.getElementById('btn-mod2');

// Algoritmo de embaralhamento das alternativas (Fisher-Yates)
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Renderiza a questão objetiva para estudo, adicionando espaçamento de organização
function renderObjetiva(q, indexReal) {
    const card = document.createElement('div');
    card.className = 'question-card';
    
    // Adiciona o espaçamento e uma linha tracejada no fundo para organização visual
    card.style.marginBottom = '3.5rem';
    card.style.paddingBottom = '2.5rem';
    card.style.borderBottom = '2px dashed var(--neon-violet)';
    
    let optionsHtml = '';
    
    // Anexa as opções as suas posições corretas originais antes de embaralhar
    const opcoesComIndex = q.opcoes.map((opcao, idx) => ({ texto: opcao, correto: idx === q.correta }));
    const opcoesEmbaralhadas = shuffleArray(opcoesComIndex);

    opcoesEmbaralhadas.forEach((opcao) => {
        optionsHtml += `<button class="option-btn" data-correct="${opcao.correto}">${opcao.texto}</button>`;
    });

    card.innerHTML = `
        <div class="question-header">
            <span style="font-size: 1.1rem; color: var(--neon-cyan); font-weight: bold;">Questão ${indexReal} de 80</span>
        </div>
        <h3 class="question-title">${q.pergunta}</h3>
        <div class="options-grid">
            ${optionsHtml}
        </div>
    `;
    return card;
}

// Escuta de cliques globais (Validação de resposta certa/errada)
quizContainer.addEventListener('click', (e) => {
    // Se o usuário clicou em uma alternativa
    if (e.target.classList.contains('option-btn')) {
        const btnClicado = e.target;
        const grid = btnClicado.parentElement;
        const isCorrect = btnClicado.dataset.correct === "true";
        const botoes = grid.querySelectorAll('.option-btn');
        
        // Revela as cores em todos os botões daquela pergunta
        botoes.forEach(b => {
            b.disabled = true; // Impede clicar duas vezes na mesma questão
            if (b.dataset.correct === "true") {
                b.classList.add('correct'); // Pinta o botão correto de verde
            }
        });

        // Se clicou na alternativa errada, pinta ela de vermelho
        if (!isCorrect) {
            btnClicado.classList.add('incorrect');
        }
    }
});

// Função que carrega apenas as questões do módulo selecionado
function carregarModulo(inicio, fim, botaoAtivo) {
    quizContainer.innerHTML = ''; // Limpa a tela
    
    // Atualiza o botão ativo no topo
    btnMod1.classList.remove('active');
    btnMod2.classList.remove('active');
    botaoAtivo.classList.add('active');

    // Fatiando o banco de dados (0 a 40 para Mod 1 | 40 a 80 para Mod 2)
    const questoesDoModulo = questoesDB.slice(inicio, fim);

    // Renderiza as questões na tela mantendo a numeração original do ID
    questoesDoModulo.forEach((q) => {
        quizContainer.appendChild(renderObjetiva(q, q.id));
    });
    
    // Rola para o topo suavemente ao trocar
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Conectando os botões de navegação
btnMod1.addEventListener('click', () => {
    carregarModulo(0, 40, btnMod1);
});

btnMod2.addEventListener('click', () => {
    carregarModulo(40, 80, btnMod2);
});

// Inicia a tela automaticamente carregando o Módulo 1 (Questões 1 a 40)
carregarModulo(0, 40, btnMod1);