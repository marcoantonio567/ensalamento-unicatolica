# Visualizador de Horários e Ensalamento - Católica do Tocantins 🎓

Este projeto é uma aplicação web moderna desenvolvida para visualizar e filtrar os horários de aulas e ensalamento do Centro Universitário Católica do Tocantins. Ele consome dados diretamente de uma planilha Excel hospedada no SharePoint, garantindo que as informações estejam sempre sincronizadas com a coordenação.

## 🚀 Funcionalidades

-   **Atualização em Tempo Real**: Os dados são baixados automaticamente do link oficial do SharePoint a cada acesso, garantindo que qualquer alteração na planilha online seja refletida imediatamente.
-   **Visualização Clara**: Cards organizados com informações essenciais: Disciplina, Professor, Horário, Local (Campus, Bloco, Sala) e Turma.
-   **Filtros Inteligentes**:
    -   **Curso**: Selecione seu curso para ver apenas as aulas relevantes.
    -   **Turno**: Filtre rapidamente por Manhã, Tarde ou Noite.
    -   **Dia e Período**: Refine sua busca para encontrar aulas específicas.
-   **Tratamento de Dados Avancado**:
    -   Reconhecimento automático de **Campus I e II**.
    -   Identificação de **Blocos** e **Salas**.
    -   Suporte para aulas **Quinzenais**.
    -   Correção automática de células mescladas (períodos).

## 🛠️ Tecnologias Utilizadas

-   **Frontend**: [Next.js](https://nextjs.org/) (React Framework), TypeScript, Tailwind CSS.
-   **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) para uma interface limpa e acessível.
-   **Backend (API Route)**: Node.js com `puppeteer` para automação de download e `xlsx` para processamento de planilhas.
-   **Ícones**: Lucide React.

## ⚙️ Como Funciona (Por Baixo dos Panos)

1.  **Conexão**: Ao abrir a página, o servidor inicia uma instância segura do navegador (Puppeteer).
2.  **Download**: Ele navega até o link público do SharePoint e baixa a versão mais recente da planilha `.xlsx`.
3.  **Processamento**: O sistema lê todas as 19+ abas (Cursos), limpa linhas vazias, preenche células mescladas e normaliza os dados (ex: define sábado como "Manhã" por padrão se não especificado).
4.  **Exibição**: Os dados processados são enviados para a interface, onde você pode filtrar e visualizar.

## 📦 Instalação e Execução

### Pré-requisitos
-   Node.js 18+ instalado.

### Passos
1.  Clone o repositório ou baixe os arquivos.
2.  Instale as dependências:
    ```bash
    npm install
    # ou
    yarn install
    ```
3.  Execute o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
4.  Acesse `http://localhost:3000` no seu navegador.

## 📂 Estrutura de Pastas Importante

-   `/app`: Páginas e Rotas da API.
-   `/components`: Componentes visuais (Cards, Filtros).
-   `/lib`: Lógica de processamento da planilha (`schedule.ts`).
-   `/scripts`: Scripts de verificação e teste de dados.

