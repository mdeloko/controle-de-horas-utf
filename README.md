# Controle de Horas - Meninas Digitais UTFPR

Sistema web para registro e aprovação de horas de atividades dedicadas
ao projeto **Meninas Digitais** da UTFPR. Desenvolvido como trabalho da
disciplina **Certificadora da Competência 3**, do curso de Engenharia de
Computação na UTFPR Cornélio Procópio.

## Sumário

- [Equipe](#equipe)
- [Objetivo](#objetivo)
- [Acesso à versão em produção](#acesso-à-versão-em-produção)
- [Funcionalidades desenvolvidas](#funcionalidades-desenvolvidas)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Como executar o projeto](#como-executar-o-projeto)
- [Roteiro de teste](#roteiro-de-teste)
- [Contas de acesso padrão](#contas-de-acesso-padrão)
- [Estrutura do repositório](#estrutura-do-repositório)

## Equipe

**Grupo 5**, Engenharia de Computação, UTFPR Cornélio Procópio (2026).

- Erik Gonçalves Coutinho
- Leonardo Freitas dos Santos
- Thallys Silva dos Santos Correia
- Vitor Hugo Amadeu da Silva

## Objetivo

O projeto **Meninas Digitais** da UTFPR incentiva a participação de
meninas nas áreas de STEM por meio de oficinas, mentorias e eventos. Com
o crescimento das atividades, surgiu a necessidade de um sistema
centralizado para registrar e gerenciar as horas dedicadas pelos
integrantes.

Este sistema permite que **participantes** registrem as horas das
atividades realizadas e que o **diretor** revise, aprove e acompanhe a
distribuição dessas horas por meio de relatórios, além de exportar os
dados em formato adequado para a geração de certificados.

## Acesso à versão em produção

A aplicação está hospedada em uma VPS para testes:

**http://148.113.181.118:5000/**

Você pode usar as contas de acesso padrão (ver final do README) para
entrar diretamente sem precisar instalar nada.

## Funcionalidades desenvolvidas

- **Autenticação por e-mail/senha**, com sessão por token JWT.
- **Dois perfis de usuário**: `diretor` e `participante`, com permissões
  distintas.
- **Cadastro de tipos de atividade** (CRUD), restrito ao diretor.
- **Registro de horas** pelo participante (entra como pendente) e
  **atribuição direta** pelo diretor (já aprovada).
- **Aprovação e edição** de registros pelo diretor.
- **Listagem com filtros** por usuário, tipo, status e intervalo de datas.
- **Relatórios**: total de horas por participante, distribuição por tipo de
  atividade, ranking, **exportação em CSV** (geral ou por participante) e
  **geração de certificado em PDF** por participante.
- **Gestão de participantes**: cadastrar, editar (nome e perfil) e
  **ativar/inativar** o acesso.
- **Recuperação de acesso** (sem dependência de e-mail): o diretor reseta a
  senha e gera uma temporária; o próprio usuário a troca depois em
  **Perfil → Trocar senha**.

## Tecnologias utilizadas

### Linguagem, runtime e editor

| Ferramenta | Versão | Link |
|---|---|---|
| Node.js | 22 LTS | https://nodejs.org/ |
| TypeScript | 5.8 / 6.0 | https://www.typescriptlang.org/ |
| Visual Studio Code | 1.95+ | https://code.visualstudio.com/ |
| Git | 2.40+ | https://git-scm.com/ |

### Backend

| Biblioteca | Versão | Link |
|---|---|---|
| Express | 5.x | https://expressjs.com/ |
| Sequelize | 6.x | https://sequelize.org/ |
| SQLite | 3.x | https://www.sqlite.org/ |
| bcrypt | 6.x | https://www.npmjs.com/package/bcrypt |
| jsonwebtoken | 9.x | https://www.npmjs.com/package/jsonwebtoken |
| cors | 2.x | https://www.npmjs.com/package/cors |
| http-status-codes | 2.x | https://www.npmjs.com/package/http-status-codes |

### Frontend

| Biblioteca | Versão | Link |
|---|---|---|
| React | 18.3 | https://react.dev/ |
| Vite | 5.4 | https://vitejs.dev/ |
| Tailwind CSS | 3.4 | https://tailwindcss.com/ |
| shadcn/ui (Radix UI) | latest | https://ui.shadcn.com/ |
| React Router | 6.30 | https://reactrouter.com/ |
| TanStack Query | 5.83 | https://tanstack.com/query |
| React Hook Form | 7.61 | https://react-hook-form.com/ |
| Zod | 3.25 | https://zod.dev/ |

### Banco de dados

O sistema utiliza **SQLite**, um banco embarcado em arquivo único. Não é
necessário instalar nem configurar um servidor de banco. Toda a criação
e o povoamento inicial são feitos automaticamente pela aplicação.

**Roteiro de criação e execução do banco:**

1. Suba os containers com `docker compose up --build` (passo descrito na
   próxima seção).
2. Na **primeira execução**, o backend roda o *seed* automaticamente:
   - cria todas as tabelas a partir dos modelos do Sequelize;
   - cadastra os tipos de atividade padrão (Reunião, Permanência, Evento,
     Oficina, Mentoria);
   - cadastra as duas contas de acesso padrão (ver final do README).
3. O arquivo do banco (`meninas_digitais.sqlite`) fica persistido no
   volume Docker chamado `backend-data`. Em execuções posteriores, todos
   os dados são preservados.
4. Para **recomeçar com o banco zerado**, basta apagar o volume:

   ```bash
   docker compose down -v
   ```

### Infraestrutura

| Ferramenta | Versão | Link |
|---|---|---|
| Docker | 24+ | https://www.docker.com/ |
| Docker Compose | v2 | https://docs.docker.com/compose/ |
| nginx | 1.27 (alpine) | https://nginx.org/ |

## Como executar o projeto

A maneira recomendada é usando **Docker Compose**, que cuida de instalar
as dependências, compilar o backend e o frontend, e subir os dois
serviços em containers.

### Pré-requisitos

- **Docker Desktop** instalado (Windows ou macOS), ou Docker Engine + Docker
  Compose v2 (Linux/VPS). Verifique com:

  ```bash
  docker --version
  docker compose version
  ```

- **Git** para clonar o repositório.

### Execução local (Windows / macOS / Linux)

```bash
# 1. Clonar o repositório
git clone https://github.com/mdeloko/controle-de-horas-utf.git
cd controle-de-horas-utf

# 2. Criar o arquivo de variáveis de ambiente a partir do exemplo
cp .env.example .env

# 3. Subir os containers
docker compose up --build
```

A aplicação ficará disponível em:

**http://localhost:5000**

Na primeira execução, o backend cria o banco de dados, popula os tipos de
atividade padrão (Reunião, Permanência, Evento, Oficina, Mentoria) e
cadastra as contas de acesso padrão (ver seção abaixo). Em execuções
seguintes, os dados são preservados pelo volume `backend-data`.

Para parar:

```bash
docker compose down
```

Para parar **e apagar o banco** (recomeçar do zero):

```bash
docker compose down -v
```

### Execução em VPS

O processo é o mesmo do ambiente local. Em uma VPS Linux:

```bash
# 1. Instalar Docker e Docker Compose (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# faça logout e login novamente para aplicar a permissão

# 2. Clonar o repositório
git clone https://github.com/mdeloko/controle-de-horas-utf.git
cd controle-de-horas-utf

# 3. Configurar as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env e troque o JWT_SECRET por um valor aleatório forte
nano .env

# 4. Subir os containers em background
docker compose up -d --build
```

A aplicação ficará disponível em **http://SEU_IP:5000** (ajuste o firewall
da VPS para liberar a porta 5000, se necessário).

Para visualizar logs:

```bash
docker compose logs -f
```

Para atualizar a aplicação após um `git pull`:

```bash
docker compose up -d --build
```

### Variáveis de ambiente

O arquivo `.env` controla:

| Variável | Descrição | Padrão |
|---|---|---|
| `APP_PORT` | Porta em que a aplicação ficará exposta | `5000` |
| `JWT_SECRET` | Chave usada para assinar os tokens de sessão | `chave_secreta` |

> **Importante**: em produção, troque o `JWT_SECRET` por um valor longo e
> aleatório. Você pode gerar um com:
>
> ```bash
> openssl rand -hex 32
> ```

## Roteiro de teste

Sugestão de ordem para testar todas as funcionalidades:

1. **Acesse a aplicação** (`http://localhost:5000` ou
   `http://148.113.181.118:5000` em produção).

2. **Faça login como diretor** usando a conta padrão (ver abaixo).
   - Você verá a tela inicial com acesso completo ao sistema.

3. **Cadastre um novo participante**:
   - Vá em **Participantes** e use o formulário **Novo Participante** (lateral direita).
   - Preencha nome e e-mail. A senha inicial será gerada e exibida.

4. **Atribua horas a um participante**:
   - Vá em **Atribuir Horas**.
   - Selecione o participante, o tipo de atividade, a data e a quantidade
     de horas. Essa entrada já é criada como **aprovada**.

5. **Faça logout e entre como participante** (use a conta padrão ou a
   recém criada).
   - Cadastre um registro próprio. Ele entra como **pendente**.

6. **Volte como diretor e aprove o registro pendente**:
   - Vá em **Validação** e aprove o registro pendente na fila.

7. **Veja os relatórios e gere certificados**:
   - **Total de horas por participante** e **ranking** (visível só ao diretor).
   - **Exportação CSV**: geral ou filtrada por participante e período.
   - **Gerar Certificado (PDF)**: selecione uma participante e baixe o
     certificado com o total de horas e as atividades incluídas.

8. **Edite um tipo de atividade** ou crie um novo em **Tipos de
   Atividade**.

9. **Troque sua senha** em **Perfil → Trocar senha** (informe a senha atual
   e a nova). É assim que funciona a recuperação de acesso: a coordenação
   reseta e informa uma senha temporária, e você a redefine aqui.

## Contas de acesso padrão

Criadas automaticamente na primeira execução:

### Diretor

- **E-mail**: `diretor@meninasdigitais.utfpr.br`
- **Senha**: `Diretor@123`

### Participante

- **E-mail**: `participante@meninasdigitais.utfpr.br`
- **Senha**: `Participante@123`

> Recomendamos trocar essas senhas em ambiente de produção.

## Estrutura do repositório

```
controle-de-horas-utf/
├── backend/              # API Express + Sequelize + SQLite
│   ├── src/
│   │   ├── controllers/  # camada HTTP
│   │   ├── services/     # regra de negócio
│   │   ├── routes/       # definição das rotas REST
│   │   ├── models/       # modelos Sequelize
│   │   ├── middlewares/  # auth, log, error handler
│   │   └── database/     # conexão e seed
│   └── Dockerfile
├── frontend/             # React + Vite + Tailwind + shadcn/ui
│   ├── src/
│   ├── nginx.conf        # reverse proxy para o backend
│   └── Dockerfile
├── docker-compose.yml    # orquestração dos serviços
└── .env.example
```
