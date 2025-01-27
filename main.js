const fs = require("fs");
const path = require("path");
const { ipcMain } = require("electron");

// Caminho para o arquivo JSON onde os dados serão salvos
const dataFilePath = path.join(__dirname, "user_data.json");

// Função para carregar dados
function loadUserData() {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath, "utf-8");
        return JSON.parse(data);
    } else {
        // Se o arquivo não existir, retorna um objeto vazio
        return {};
    }
}

// Função para salvar dados
function saveUserData(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}

// Registro de eventos para IPC
ipcMain.on("register-user", (event, userData) => {
    const users = loadUserData();
    if (users[userData.email]) {
        event.sender.send("registration-failed", "E-mail já registrado.");
    } else {
        users[userData.email] = {
            name: userData.name,
            password: userData.password,
            progress: 0, // Progresso inicial no jogo
        };
        saveUserData(users);
        event.sender.send("registration-success", "Usuário registrado com sucesso!");
    }
});

ipcMain.on("login-user", (event, credentials) => {
    const users = loadUserData();
    const user = users[credentials.email];

    if (user && user.password === credentials.password) {
        event.sender.send("login-success", "Login realizado com sucesso!");
    } else {
        event.sender.send("login-failed", "E-mail ou senha inválidos.");
    }
});

ipcMain.on("update-progress", (event, progressData) => {
    const users = loadUserData();

    if (users[progressData.email]) {
        users[progressData.email].progress = progressData.progress;
        saveUserData(users);
        event.sender.send("progress-updated", "Progresso salvo com sucesso!");
    } else {
        event.sender.send("progress-update-failed", "Usuário não encontrado.");
    }
});

module.exports = { loadUserData, saveUserData };
