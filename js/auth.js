function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username) {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

function registerUser(data) {
  const users = getUsers();

  if (!data.name || data.name.trim().length < 2) {
    return { success: false, message: "Nama lengkap minimal 2 karakter." };
  }

  if (!isValidUsername(data.username)) {
    return { success: false, message: "Username hanya boleh huruf kecil, angka, underscore, 3-20 karakter." };
  }

  const usernameTaken = users.some((u) => u.username.toLowerCase() === data.username.toLowerCase());
  if (usernameTaken) {
    return { success: false, message: "Username sudah digunakan, silakan pilih yang lain." };
  }

  if (!isValidEmail(data.email)) {
    return { success: false, message: "Format email tidak valid." };
  }

  const emailTaken = users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (emailTaken) {
    return { success: false, message: "Email sudah terdaftar." };
  }

  if (!data.password || data.password.length < 6) {
    return { success: false, message: "Password minimal 6 karakter." };
  }

  const newUser = {
    id: generateId("u"),
    username: data.username.toLowerCase(),
    name: data.name.trim(),
    email: data.email.trim(),
    password: data.password,
    bio: data.bio ? data.bio.trim() : "",
    avatar: data.avatar || "assets/img/default-avatar.svg",
    banned: false,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  setSession(newUser.id);

  return { success: true, user: newUser };
}

function loginUser(identifier, password) {
  const users = getUsers();
  const user = users.find(
    (u) =>
      (u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase()) &&
      u.password === password
  );

  if (!user) {
    return { success: false, message: "Username/email atau password salah." };
  }

  if (user.banned) {
    return { success: false, message: "Akun ini telah dibanned oleh admin." };
  }

  setSession(user.id);
  return { success: true, user };
}

function logoutUser() {
  clearSession();
  window.location.href = "index.html";
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  if (user.banned) {
    clearSession();
    window.location.href = "login.html";
    return null;
  }
  return user;
}

function loginAdmin(username, password) {
  const config = window.ENV_CONFIG || {};
  if (username === config.ADMIN_USERNAME && password === config.ADMIN_PASSWORD) {
    setAdminSession(username);
    return { success: true };
  }
  return { success: false, message: "Username atau password admin salah." };
}

function requireAdmin() {
  const session = getAdminSession();
  if (!session) {
    window.location.href = "admin.html";
    return null;
  }
  return session;
}

function logoutAdmin() {
  clearAdminSession();
  window.location.href = "admin.html";
}
