import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";

import { Server }from "socket.io";

import { router } from "./routes";

const app = express();
app.use(cors());

const serverHttp = http.createServer(app);

const io = new Server(serverHttp, {
    cors: {
        origin: "*"
    }
});

io.on("connection", socket => {
    console.log(`Usuário conectado no socket ${socket.id}`);
});

app.use(express.json());

// Usar router
app.use(router);

// Rota de autenticação
app.get("/github", (request, response) => {
    // Redireciona o usuário para a página de autenticação do github
    // PEGA O client_id DE DENTRO DE .env COM process.env
    response.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`)
})

// Rota de callback
// Rota de callback é a rota que o usuário é redirecionado quando
// o login é efetuado com sucesso
app.get("/signin/callback", (request, response) => {
    // Armazena em code o que está na query do request
    // a query o request é basicamente o html que o navegador recebe:
    // http://localhost:4000/signin/callback?code=d7d5f9d9e6d5d1a51fd2
    const {code} = request.query;

    return response.json(code);
})

export { serverHttp, io }