# Proposta Técnica / Documentação: Somos CIA - Club

Abaixo está o detalhamento técnico e de escopo do projeto (SaaS) **Somos CIA - Club**, com as respostas e definições solicitadas. As áreas com observações ("A definir") referem-se a acordos comerciais, licenças externas e garantias que precisam ser preenchidas pela equipe de negócios ou pelo próprio cliente conforme a negociação.

---

## 1. Escopo Técnico
### 1.1 Lista completa das funcionalidades incluídas no MVP
O Produto Mínimo Viável (MVP) contempla a operação básica do clube de benefícios e programa de pontos, estruturada para três tipos de usuários (Moradores, Parceiros e Administradores).

**Para Moradores:**
- Autenticação de usuários integrando verificação de CPF.
- Carteira Digital (Wallet): Consulta de saldo de pontos recebidos ou debitados.
- Vitrine de Ofertas: Listagem de descontos e vantagens de Parceiros.
- Cupons: Gerador de resgate de uso único mensal vinculando CPF e Parceiro.
- Sorteios (Prize Campaigns): Funcionalidade de trocar pontos por cupons para participação em sorteios/campanhas.

**Para Parceiros (Lojistas/Comércio Local):**
- Pré-cadastro com aprovação administrativa (CNPJ/E-mail).
- Painel para cadastro e gestão de Ofertas.
- Controle de limite mensal de uso das ofertas para moradores.
- Visualização de cupons resgatados no seu estabelecimento.

**Para Administradores:**
- Painel de controle interno (Backoffice) para aprovar cadastros de Parceiros.
- Criação e acompanhamento de Campanhas/Sorteios de prêmios.
- Conciliação da base de dados e emissão de permissões.

**Sistema Base (Backend/Integrações):**
- Controle automático da rotina de pontuação via Webhooks. Exemplo: bonificação de 500 pontos por taxa paga em dia e `reset` automático de saldo caso o morador atrase 15+ dias no condomínio.
- Conexão e sincronização (invalidação) do acesso do morador atrelada à situação dele no sistema da administração (ex: Point).

---

### 1.2 Estrutura técnica prevista (linguagem, framework, banco de dados)
- **Framework Front/Back:** Next.js (App Router, v14+)
- **Linguagem Principal:** TypeScript (para segurança estática) e JavaScript.
- **Estilização/UI:** CSS Moderno e ícones via `lucide-react`.
- **Banco de Dados:** Prisma ORM. O deploy final poderá usar um banco de dados relacional (ex: PostgreSQL ou MySQL), mas atualmente a base de desenvolvimento se apoia em SQLite (`dev.db`).
- **Autenticação:** JWT (JSON Web Tokens) assinados com a lib `jose` e senhas criptografadas nativamente com `bcryptjs`. 

---

## 2. Propriedade Intelectual e Entrega
### 2.1 Entrega de código-fonte e documentação
- **Sim, inclusos:** Todo o código fonte gerado durante esse escopo é detalhado e documentado em repositório (ex: GitHub/GitLab). As chaves de infraestrutura são repassadas ao final. A documentação técnica detalha fluxos e esquemas de dados.

### 2.2 Propriedade do banco de dados e infraestrutura
- A arquitetura, banco de dados (esquemas baseados no Prisma) e o hospedagem final do software Pertencem **ao cliente**, sendo a contratada apenas a executora da inteligência de software. Dados sensíveis e metadados estão sob as regulamentações da LGPD pelo gestor da plataforma (Administrador SaaS).

---

## 3. Integrações e Segurança
### 3.1 Integração com POINT (Validação API)
- **A integração via API está inclusa?** Sim. O MVP foi programado antecipando a comunicação com a API (atualmente na pasta `lib/condominio-api.ts`). A integração vai autenticar CPF, checar status (`ativo/inativo`), unidade atrelada e validar adimplência para manipulação da carteira do usuário.
- **O que a equipe de negócio precisa fornecer:** Para o deploy em Produção, é preciso a URL final de conexão (`CONDOMINIO_API_URL`) e o respectivo Token de segurança (`CONDOMINIO_API_KEY`).

### 3.2 Testes, homologação e segurança
- **Inclusos:** Sim. Todo o código abrange validações com JWT (Autenticação Stateless), senhas hasheadas e proteções via Midleware do Next.js bloqueando rotas não autorizadas por Role Based Access (`Admin`, `Partner`, `Resident`).
- *(Nota de Negócio: Favor especificar se os testes de stress/carga ou auditoria extrema de penetração serão terceirizados ou se faz parte do orçamento atual).*

### 3.3 Há limite de requisições ou custo adicional relacionado à API?
- A estrutura do Next.js é preparada para escalabilidade. O limite de requisições dependerá diretamente do **provedor de hospedagem** (ex: Vercel, AWS, DigitalOcean) e do plano com a API externa (POINT). 
- *Pela arquitetura do código construído, não há taxação interna ou restrição imposta pelo software desenvolvido.*

---

## 4. O que é preciso para subir este App (Requisitos de Produção)?
Para publicar o **Somos CIA - Club** publicamente na internet, transferindo-o do ambiente de desenvolvimento para a produção, são necessárias algumas contratações e configurações de infraestrutura.

### 4.1. Hospedagem do Sistema (Frontend/Backend)
O código principal (escrito em Next.js) precisa de um servidor.
- **Recomendação:** **Vercel** (Custo estimado: Pro Tour U$ 20/mês, mas possui plano "Hobby" gratuito que não é ideal para uso comercial) ou configurações equivalentes (como **Render**, **Railway** ou **AWS Amplify**).
- **O que precisa fazer:** Conectar a Vercel à conta do **GitHub/GitLab** (onde o código será salvo e gerido), permitindo *Deploy Automático*.

### 4.2. Hospedagem de Banco de Dados
Na fase atual, usamos o SQLite apenas como banco de dados local para desenvolvimento. Em produção, você precisa de um banco "na nuvem" (arquitetura cliente-servidor). 
- **Recomendação:** **PostgreSQL** ou **MySQL** hospedados.
- **Sugestões de Empresas/Serviços:** **Supabase**, **PlanetScale**, **Render (Databases)** ou **AWS RDS**.
- **Estimativa de Custo:** A partir de U$ 15 a U$ 30 dólares/mês.

### 4.3. Domínio (URL da plataforma)
O endereço pelo qual os moradores e parceiros acessarão o clube (ex: `app.somosciaclub.com.br`).
- **Onde contratar:** Registro.br (custa cerca de R$ 40,00/ano se for `.com.br`) ou HostGator, Locaweb, GoDaddy.
- **O que precisa fazer:** Configurar o apontamento dos servidores DNS da sua compra com os IPs do provedor de hospedagem citado na etapa *4.1*.

### 4.4. Integração com a Imobiliária/Sistema (POINT)
Os desenvolvedores precisam de acessos reais do sistema gerencial existente (POINT) para plugar o que já está desenvolvido e simulado na arquitetura:
- **`CONDOMINIO_API_URL`**: O endereço de API da plataforma POINT.
- **`CONDOMINIO_API_KEY`**: Chave de permissões para validar o CPF e status de moradores do Condomínio.
- Informações de formato de resposta para homologar a comunicação.

---

## 4. Custos e Licenças Externas (Dúvidas Comerciais)
As questões a seguir são relativas à infraestrutura em Dólar/Reais e acordos e precisam ser **definidos e alinhados pela equipe comercial/diretoria**:

### 4.1 Valores em dólar apresentados
*(A definir com o cliente)*
- **A que serviços/licenças se referem?** Geralmente se referem ao provedor de Hospedagem (ex: Vercel Pro - \$20/mês), Banco de Dados (ex: Supabase, PlanetScale - entre \$15 e \$29/mês), ou de disparo de emails/SMS necessários à operação.
- **São custos únicos ou recorrentes?** Na nuvem, infraestruturas costumam ser **recorrentes** (mensais).
- **Estão inclusos nos R$ 20.000 ou são adicionais?** *(Preencher conforme proposta assinada)* Se a fatura das nuvens for gerada no cartão do cliente, são custos adicionais de manutenção do negócio contínuo.

---

## 5. Prazo, Ajustes e Garantias
*(A definir com o cliente em contrato de prestação de serviços)*
- **Prazo estimado de entrega:** (Ex: 30 a 45 dias úteis a contar do acesso à API/Point em homologação).
- **Quantas rodadas de ajustes estão contempladas:** (Ex: 2 rodadas de ajustes em Homologação antes da subida para Produção).
- **Período de garantia pós-entrega:** (Ex: 90 dias de garantia contra *bugs* e vícios de software, que não sejam decorrentes de mudança nas integrações/senhas de terceiros).

---

## 6. Infraestrutura (Proposta/Contratação)
*Definições atreladas à hospedagem (Secão 4.1 e 4.2)*

- **Tipo de hospedagem:** Arquitetura *Serverless* e Edge Computing no Frontend (Ex: Vercel) para alta velocidade, atrelado a banco de dados relacional em Nuvem (Cloud DB). Não recomendamos VPS antiga pelo alto engajamento local.

- **Limites de tráfego e armazenamento:** Dependerá do plano do Datacenter contratado. Como exemplo, na conta Vercel Pro (U$ 20), o limite de banda beira 1 TB, o que é absurdamente suficiente para o escopo inicial.

- **Backup e segurança inclusos:** (A preencher: Definir se a agência/desenvolvedor cobrará a manutenção dos scripts de rotina de backup semanal ou se usará os *snapshots* automáticos de bancos de dados cloud como da AWS RDS / Supabase).

---

## 7. Suporte Técnico (Sistema)
*Atenção Direção: Definir prazos de contrato e Service Level Agreement (SLA)*
- **SLA (tempo de resposta):** (Ex: O tempo padrão de primeira resposta é de até X horas úteis para falhas críticas - *site fora do ar* - e Y horas úteis para dúvidas operacionais).
- **Horário de atendimento:** (Ex: Segunda a Sexta, das 09h às 18h).
- **Limite de chamados mensais:** (Ex: Estão contemplados X chamados de suporte ao sistema para os Diretores da Imobiliária. Acima disso, é cobrado um valor avulso base-hora).

---

## 8. Suporte a Parceiros (Lojistas) e Moradores
- **O que exatamente está incluso?** (A preencher: Nós da agência/TI daremos suporte para Lojistas com dificuldade em acessar a plataforma ou gerar ofertas, via WhatsApp/Tickets, OU este papel será da equipe de Atendimento CCO da própria POINT/Somos CIA?)
- **Trata-se de suporte técnico ou operacional?** É esperado que seja um suporte operacional de Nível 1.
- **Existe limite de atendimentos?** (A preencher no contrato SLA em caso de gestão terceirizada).

---

## 9. Marketing e Divulgação
*Escopo comercial da plataforma e lançamento*
- **O que está incluso na "divulgação inicial"?** (A preencher: Se for uma frente feita pela sua equipe, defina como ocorrerão as instruções de adesão aos síndicos).
- **Quantidade de artes, vídeos ou campanhas:** (Ex: Entrega de X artes estáticas, Y carrosséis de explicação para os moradores logarem, e Z *vídeo-tutoriais* para enviar a Parceiros ensinando a usar o App).
- **Se há gestão contínua ou apenas lançamento:** (A preencher: O contrato atual fecha apenas a elaboração dos materiais de Onboarding, ou inclui a criação mensal de novas peças de promoções da rodada?).

---

## 10. Evoluções e Melhorias (Roadmap)
- **A mensalidade inclui pequenas evoluções?** (A preencher: Diferenciar o que é correções de BUG (já na garantia) do que é EVOLUÇÃO (ex: pedir para construir uma aba nova ou chat dentro do app)).
- **Quantas horas mensais de desenvolvimento estão previstas?** (Ex: Contrato ativo de infra inclui suporte base. Melhorias arquiteturais que passem de X horas gerarão novo orçamento. Ou incluir pacote: Y horas/mês destinadas a evolução para um SaaS rotativo).


