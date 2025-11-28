# Post Feed - Angular Application

Uma aplicação Angular moderna para gerenciamento de Posts e Comentários, desenvolvida como parte de um desafio técnico. A aplicação consome a API pública JSONPlaceholder e implementa operações CRUD completas com cache in-memory, atualizações otimistas e interface responsiva.

## 🚀 Tecnologias Utilizadas

- **Angular 17+** com Standalone Components
- **TypeScript** com tipagem estrita
- **Tailwind CSS** para estilização
- **RxJS** para programação reativa
- **Angular Signals** para gerenciamento de estado
- **JSONPlaceholder API** para backend

## 📋 Requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** versão 18.x ou superior
- **npm** versão 9.x ou superior
- **Angular CLI** versão 17.x ou superior (será instalado automaticamente)

## 🔧 Instalação

### 1. Clone o repositório (ou extraia os arquivos)

### 2. Instale as dependências

```bash
npm install
```

### 3. Execute o servidor de desenvolvimento

```bash
npm start
```

ou

```bash
ng serve
```

### 4. Acesse a aplicação

Abra seu navegador e acesse: [http://localhost:4200](http://localhost:4200)

## 📁 Estrutura do Projeto

```
src/app/
├── core/
│   ├── interceptors/
│   │   ├── base-url.interceptor.ts       # Adiciona URL base da API
│   │   └── error-handler.interceptor.ts  # Tratamento global de erros
│   ├── services/
│   │   ├── posts.service.ts              # Serviço de Posts com cache
│   │   └── comments.service.ts           # Serviço de Comentários com cache
│   └── models/
│       ├── post.interface.ts             # Interfaces de Post e DTOs
│       └── comment.interface.ts          # Interfaces de Comment e DTOs
├── shared/
│   └── components/
│       ├── modal/                        # Modal reutilizável
│       ├── confirmation-dialog/          # Diálogo de confirmação
│       ├── spinner/                      # Indicador de carregamento
│       └── error-message/                # Mensagem de erro
├── features/
│   ├── posts/
│   │   ├── posts-list/                   # Listagem de posts (rota principal)
│   │   ├── post-detail/                  # Detalhes do post
│   │   ├── post-form-modal/              # Formulário de criação/edição
│   │   └── posts-table/                  # Tabela com paginação e busca
│   └── comments/
│       ├── comments-list/                # Listagem de comentários
│       └── comment-form/                 # Formulário de comentário
├── app.component.ts
├── app.config.ts                         # Configuração da aplicação
└── app.routes.ts                         # Definição de rotas
```

## ✨ Funcionalidades

### Posts
- ✅ Listagem de posts com paginação (10, 25, 50 por página)
- ✅ Busca por título e conteúdo (com debounce)
- ✅ Ordenação por ID ou Título (crescente/decrescente)
- ✅ Criação de novos posts
- ✅ Edição de posts existentes
- ✅ Exclusão com confirmação
- ✅ Visualização de detalhes do post
- ✅ Cache in-memory para melhor performance

### Comentários
- ✅ Listagem de comentários por post
- ✅ Adição de novos comentários
- ✅ Edição de comentários existentes
- ✅ Exclusão com confirmação
- ✅ Validação de e-mail
- ✅ Cache in-memory sincronizado

### Experiência do Usuário
- ✅ Interface responsiva (mobile-first)
- ✅ Indicadores de carregamento
- ✅ Mensagens de erro amigáveis
- ✅ Estados vazios informativos
- ✅ Atualizações otimistas com rollback
- ✅ Acessibilidade (ARIA labels, navegação por teclado)

## 🏗️ Arquitetura e Decisões Técnicas

### Hybrid State Management: Signals + RxJS

A aplicação utiliza uma abordagem híbrida que aproveita o melhor de ambos os paradigmas:

**Angular Signals** são usados para:
- Estado síncrono da UI (modais abertos/fechados, loading, erros)
- Cache in-memory de posts e comentários
- Estado derivado com `computed()`
- Reatividade granular e eficiente

**RxJS Observables** são usados para:
- Operações HTTP assíncronas
- Transformação e composição de dados
- Tratamento de erros
- Operações complexas de stream

**Por quê?**
- Signals oferecem melhor performance para estado local e reatividade da UI
- RxJS continua sendo ideal para operações assíncronas e HTTP
- A combinação permite código mais limpo e manutenível
- Uso do `async pipe` nos templates para automatic subscription management

### Cache In-Memory com Map

Implementação de cache usando `Map<id, entity>` para:
- Acesso O(1) aos dados
- Redução de chamadas à API
- Sincronização automática após operações CRUD
- Experiência mais rápida para o usuário

**Estratégia:**
1. Primeiro, verifica o cache
2. Se não encontrado, busca da API
3. Atualiza o cache com dados da API
4. Estado compartilhado entre componentes via service

### Atualizações Otimistas com Rollback

Todas as operações de modificação (Create, Update, Delete) implementam:

1. **Salvar estado anterior** antes da operação
2. **Atualizar cache/UI imediatamente** (otimista)
3. **Enviar requisição para a API**
4. **Em caso de sucesso**: confirmar alteração
5. **Em caso de erro**: rollback ao estado anterior + mostrar erro

**Benefícios:**
- Interface instantaneamente responsiva
- Melhor experiência do usuário
- Feedback visual imediato
- Recuperação elegante de erros

### Standalone Components

Toda a aplicação usa Standalone Components (Angular 17+):
- Sem necessidade de NgModules
- Imports explícitos em cada componente
- Lazy loading simplificado
- Melhor tree-shaking

### HTTP Interceptors

**BaseUrlInterceptor:**
- Adiciona automaticamente a URL base da API a todas as requisições
- Centraliza configuração da API

**ErrorHandlerInterceptor:**
- Intercepta todos os erros HTTP
- Traduz códigos de erro para mensagens amigáveis em português
- Fornece informações estruturadas de erro

### Component Design Patterns

**Container/Presenter Pattern:**
- `PostsListComponent` = Container (lógica, estado, serviços)
- `PostsTableComponent` = Presenter (apenas exibição, @Input/@Output)

**Composição de Componentes:**
- Componentes pequenos e focados em uma responsabilidade
- Reutilização através de `shared/components`
- Props tipadas com TypeScript

## ♿ Acessibilidade

A aplicação implementa práticas de acessibilidade:

- **Semântica HTML**: uso de tags apropriadas (`main`, `article`, `nav`, etc.)
- **ARIA Labels**: todos os elementos interativos têm labels descritivos
- **Navegação por teclado**: 
  - `Tab` para navegar entre elementos
  - `Enter` para ativar botões
  - `Esc` para fechar modais
- **Focus Management**: foco é gerenciado em modais e formulários
- **Screen Readers**: anúncios de loading e erros com `aria-live`
- **Contraste de cores**: seguindo WCAG 2.1 AA
- **Estados visuais**: hover, focus, active bem definidos

## 🎨 Estilização

### Tailwind CSS

Escolhido por:
- Utilização de classes utilitárias
- Configuração minimal
- Bundle size otimizado (apenas classes usadas)
- Responsividade mobile-first
- Customização via `tailwind.config.js`

### Design System

**Cores:**
- Primária: Blue-600 (ações principais)
- Secundária: Indigo-600 (edição)
- Destrutiva: Red-600 (exclusão)
- Neutra: Gray (textos, backgrounds)

**Espaçamento:**
- Consistente usando escala Tailwind (4, 8, 16, 24px, etc.)
- Padding e margin proporcionais

**Tipografia:**
- Sistema de fontes nativo para melhor performance
- Hierarquia clara (h1, h2, h3)
- Line-height adequado para leitura

## 🔄 Fluxo de Dados

```
User Action → Component
              ↓
         Service (Signal/Observable)
              ↓
         HTTP Interceptor
              ↓
         JSONPlaceholder API
              ↓
         Cache Update (Map)
              ↓
         Signal Change
              ↓
         Component Re-render
```

## 🧪 Como Testar

### Testes Manuais

1. **Listagem de Posts**
   - Acesse a página inicial
   - Verifique se os posts carregam
   - Teste paginação (anterior/próxima)
   - Teste busca por título/conteúdo
   - Teste ordenação por ID e Título

2. **CRUD de Posts**
   - Clique em "Novo Post" e crie um post
   - Clique em "Editar" e modifique um post
   - Clique em "Excluir" e confirme a exclusão

3. **Detalhes do Post**
   - Clique em "Ver" em qualquer post
   - Verifique detalhes e comentários
   - Teste edição e exclusão na página de detalhes

4. **CRUD de Comentários**
   - Na página de detalhes, adicione um comentário
   - Edite um comentário existente
   - Exclua um comentário com confirmação

5. **Estados de Erro**
   - Desconecte a internet e tente carregar dados
   - Verifique mensagens de erro amigáveis
   - Teste botão "Tentar novamente"

6. **Responsividade**
   - Redimensione a janela do navegador
   - Teste em dispositivo móvel
   - Verifique que todos os elementos se adaptam

7. **Acessibilidade**
   - Navegue apenas com teclado (Tab, Enter, Esc)
   - Use um leitor de tela
   - Verifique focus indicators

## 📦 Build de Produção

Para criar um build otimizado:

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/preco-justo/`.

### Tailwind não está aplicando estilos
```bash
# Verifique se tailwind.config.js existe
# Verifique se styles.css tem as diretivas @tailwind
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm test` - Executa testes (se implementados)
- `npm run lint` - Verifica código com ESLint

## 🤝 Contribuindo

Este é um projeto de desafio técnico, mas sugestões são bem-vindas:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de avaliação técnica.

## 👨‍💻 Autor

Vitor Hugo

Desenvolvido como parte do Desafio Técnico - Post Feed

---

**Nota**: Este projeto consome a API pública JSONPlaceholder (https://jsonplaceholder.typicode.com), que é uma API fake para testes e prototipação. As operações de modificação (POST, PUT, DELETE) simulam sucesso mas não persistem dados realmente no servidor.
