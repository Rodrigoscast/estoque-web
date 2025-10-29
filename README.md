# 🎮 Ludoteca

Bem-vindo à **Ludoteca** — uma coleção moderna e nostálgica de **jogos clássicos da web**, recriados com muito estilo, animações suaves e uma pitada de nostalgia retrô.  
Aqui você encontra desde o **Jogo da Forca**, **Letrix (inspirado em Wordle)**, **Jogo da Velha**, até **Tetris**, **Campo Minado** e muito mais.

Visite o [site oficial da Ludoteca](https://my-ludoteca.netlify.app/)
---

## 🕹️ Visão Geral

A **Ludoteca** é um projeto em **Next.js + TypeScript**, projetado para reunir diversos mini-jogos clássicos em uma única interface web interativa.  
Cada jogo possui sua própria rota, animações dedicadas e visual padronizado com **TailwindCSS + shadcn/ui**.

O objetivo é criar uma experiência leve, acessível e divertida — seja para relembrar velhos tempos ou competir com amigos em futuras versões multiplayer.

---

## ✨ Jogos disponíveis

| 🎯 Nome | 🧠 Tipo | 📄 Descrição |
|---------|---------|--------------|
| **Jogo da Forca** | Palavras | Adivinhe a palavra antes que o boneco apareça inteiro! |
| **Letrix** | Palavras | Descubra a palavra secreta de 6 letras em até 8 tentativas! |
| **Jogo da Velha** | Estratégia | Clássico duelo de X e O. Será que você vence o bot? |
| **Sudoku** | Lógica | Complete a grade numérica sem repetir números. |
| **Campo Minado** | Lógica | Evite as minas e revele todo o campo. |
| **Tetris** | Reflexo | Empilhe blocos coloridos e forme linhas completas! |

> 💡 Novos jogos estão sendo adicionados constantemente.  
> Se um card aparecer como **"Em breve"**, é porque o jogo está em desenvolvimento.

---

## 🧩 Tecnologias utilizadas

| Stack | Descrição |
|-------|------------|
| **Next.js 16** | Framework React moderno com App Router |
| **TypeScript** | Tipagem estática e código mais seguro |
| **TailwindCSS** | Estilização rápida e responsiva |
| **shadcn/ui** | Biblioteca de componentes acessíveis e elegantes |
| **Framer Motion** | Animações suaves e interativas |
| **Lucide Icons** | Ícones leves e bonitos |
| **Netlify** | Hospedagem |

---

##⚙️ Instalação e uso

    # Clone o repositório
    git clone https://github.com/Rodrigoscast/ludoteca.git

    # Entre na pasta
    cd ludoteca

    # Instale as dependências
    npm install

    # Rode o servidor de desenvolvimento
    npm run dev

    # Abra no navegador
    http://localhost:3000

---

##🧠 Estrutura do projeto

    📂 ludoteca
     ┣ 📂 app
     ┃ ┣ 📂 jogos
     ┃ ┃ ┣ 📂 forca
     ┃ ┃ ┃ ┗ 📄 page.tsx
     ┃ ┃ ┣ 📂 letrix
     ┃ ┃ ┃ ┗ 📄 page.tsx
     ┃ ┃ ┣ 📂 velha
     ┃ ┃ ┃ ┗ 📄 page.tsx
     ┃ ┃ ┗ ...
     ┃ ┗ 📄 page.tsx          ← Tela inicial com os cards dos jogos
     ┣ 📂 components
     ┃ ┣ 📂 ui                ← Componentes shadcn
     ┃ ┗ 📄 layout.tsx
     ┣ 📂 public
     ┃ ┗📂 icons             ← Ícones usados nos jogos
     ┣ 📄 package.json
     ┣ 📄 tailwind.config.ts
     ┗ 📄 README.md

---

##🎨 Estilo visual

-   Tema dark por padrão, com gradientes sutis e blur suave.
-   Animações de hover, entrada e glitch com Framer Motion.
-   Cores vivas para cada jogo, mantendo a identidade arcade.
-   Botões e cards reativos, com efeitos de gradiente animado.

---

##🧑‍💻 Autor

Desenvolvido com 💙 por Rodrigo Castro
Engenheiro de Software e criador da Ludoteca.
> Projeto sem fins lucrativos, feito para fins de estudo e nostalgia.

---

##⚠️ Direitos & créditos

Alguns jogos da Ludoteca são recriações inspiradas em clássicos, como
Wordle, Campo Minado, Tetris e Forca.
Esses jogos têm regras de domínio público, mas nomes e marcas originais
pertencem a seus respectivos criadores.

  O jogo Letrix é inspirado em Termo e Wordle, sem fins lucrativos.

---

##🚀 Roadmap futuro

-   🧑‍🤝‍🧑 Modo multiplayer online
-   💾 Salvamento de progresso local
-   🔊 Música e efeitos sonoros Lo-Fi
