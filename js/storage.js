const DB_KEYS = {
  USERS: "ps_users",
  PROMPTS: "ps_prompts",
  SESSION: "ps_session",
  ADMIN_SESSION: "ps_admin_session",
  INIT: "ps_initialized"
};

const DATA_SEED_VERSION = "2";

const CATEGORIES = [
  "ChatGPT",
  "DeepSeek",
  "Claude",
  "Gemini",
  "Grok",
  "Qwen",
  "Mistral",
  "Perplexity",
  "Meta AI",
  "Copilot",
  "OpenRouter",
  "Jan AI",
  "Ollama",
  "LM Studio",
  "Stable Diffusion",
  "Midjourney",
  "Leonardo AI",
  "Ideogram",
  "Flux",
  "Llama",
  "AI Lainnya"
];

async function seedDatabase() {
  const alreadyInit = localStorage.getItem(DB_KEYS.INIT);
  if (alreadyInit === DATA_SEED_VERSION) return;

  try {
    const usersRes = await fetch("data/users.json");
    const usersData = await usersRes.json();
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(usersData));
  } catch (err) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify([]));
  }

  try {
    const promptsRes = await fetch("data/prompts.json");
    const promptsData = await promptsRes.json();
    localStorage.setItem(DB_KEYS.PROMPTS, JSON.stringify(promptsData));
  } catch (err) {
    localStorage.setItem(DB_KEYS.PROMPTS, JSON.stringify([]));
  }

  localStorage.setItem(DB_KEYS.INIT, DATA_SEED_VERSION);
}

function getUsers() {
  const raw = localStorage.getItem(DB_KEYS.USERS);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
}

function getPrompts() {
  const raw = localStorage.getItem(DB_KEYS.PROMPTS);
  return raw ? JSON.parse(raw) : [];
}

function savePrompts(prompts) {
  localStorage.setItem(DB_KEYS.PROMPTS, JSON.stringify(prompts));
}

function getSession() {
  const raw = localStorage.getItem(DB_KEYS.SESSION);
  return raw ? JSON.parse(raw) : null;
}

function setSession(userId) {
  localStorage.setItem(DB_KEYS.SESSION, JSON.stringify({ userId, loginAt: new Date().toISOString() }));
}

function clearSession() {
  localStorage.removeItem(DB_KEYS.SESSION);
}

function getAdminSession() {
  const raw = localStorage.getItem(DB_KEYS.ADMIN_SESSION);
  return raw ? JSON.parse(raw) : null;
}

function setAdminSession(username) {
  localStorage.setItem(DB_KEYS.ADMIN_SESSION, JSON.stringify({ username, loginAt: new Date().toISOString() }));
}

function clearAdminSession() {
  localStorage.removeItem(DB_KEYS.ADMIN_SESSION);
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  const users = getUsers();
  return users.find((u) => u.id === session.userId) || null;
}

function generateId(prefix) {
  return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
