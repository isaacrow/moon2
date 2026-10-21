const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = "D:\\MAN";
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const AUDIT_LOG_FILE = path.join(DATA_DIR, "audit_log.json");

function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString("hex");
  }
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
}

function loadUsers() {
  if (fs.existsSync(USERS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    } catch (e) {
      console.error("Error reading users.json:", e);
    }
  }
  return initDefaultUsers();
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function initDefaultUsers() {
  const adminCred = hashPassword("admin123");
  const catCred = hashPassword("cat123");
  const revCred = hashPassword("rev123");

  const defaultUsers = {
    admin: {
      username: "admin",
      fullName: "مدير المنظومة المعيارية",
      role: "admin",
      roleTitle: "مدير المنظومة",
      hash: adminCred.hash,
      salt: adminCred.salt,
      createdAt: new Date().toISOString(),
      permissions: ["catalog:read", "catalog:write", "catalog:approve", "catalog:export", "users:manage", "dashboard:view"]
    },
    cataloger: {
      username: "cataloger",
      fullName: "مفهرس معتمد MARC 21",
      role: "cataloger",
      roleTitle: "مفهرس مخطوطات",
      hash: catCred.hash,
      salt: catCred.salt,
      createdAt: new Date().toISOString(),
      permissions: ["catalog:read", "catalog:write", "catalog:export", "dashboard:view"]
    },
    reviewer: {
      username: "reviewer",
      fullName: "مدقق جودة وفهرس RDA",
      role: "reviewer",
      roleTitle: "مدقق الجودة",
      hash: revCred.hash,
      salt: revCred.salt,
      createdAt: new Date().toISOString(),
      permissions: ["catalog:read", "catalog:write", "catalog:approve", "dashboard:view"]
    }
  };

  saveUsers(defaultUsers);
  return defaultUsers;
}

function loadSessions() {
  if (fs.existsSync(SESSIONS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8"));
    } catch (e) {}
  }
  return {};
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf8");
}

function loadAuditLog() {
  if (fs.existsSync(AUDIT_LOG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(AUDIT_LOG_FILE, "utf8"));
    } catch (e) {}
  }
  return [];
}

function saveAuditLog(log) {
  // Keep last 1000 events
  const trimmed = log.slice(-1000);
  fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(trimmed, null, 2), "utf8");
}

function logActivity(username, action, recordId = null, details = "") {
  try {
    const logs = loadAuditLog();
    logs.push({
      id: crypto.randomBytes(6).toString("hex"),
      username,
      action,
      recordId,
      details,
      timestamp: new Date().toISOString()
    });
    saveAuditLog(logs);
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

function authenticateUser(username, password) {
  if (!username || !password) return null;
  const users = loadUsers();
  const user = users[username.trim().toLowerCase()];
  if (!user) return null;

  const valid = verifyPassword(password, user.hash, user.salt);
  if (!valid) return null;

  return {
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    roleTitle: user.roleTitle,
    permissions: user.permissions
  };
}

function createSession(user) {
  const token = crypto.randomBytes(32).toString("hex");
  const sessions = loadSessions();
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

  sessions[token] = {
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    roleTitle: user.roleTitle,
    permissions: user.permissions,
    expiresAt,
    createdAt: new Date().toISOString()
  };

  saveSessions(sessions);
  logActivity(user.username, "تسجيل دخول إلى النظام", null, `الجلسة: ${token.slice(0, 8)}...`);
  return token;
}

function getUserByToken(token) {
  if (!token) return null;
  const sessions = loadSessions();
  const session = sessions[token];
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    delete sessions[token];
    saveSessions(sessions);
    return null;
  }

  return {
    username: session.username,
    fullName: session.fullName,
    role: session.role,
    roleTitle: session.roleTitle,
    permissions: session.permissions
  };
}

function removeSession(token) {
  if (!token) return;
  const sessions = loadSessions();
  if (sessions[token]) {
    const u = sessions[token].username;
    delete sessions[token];
    saveSessions(sessions);
    logActivity(u, "تسجيل خروج من النظام");
  }
}

function listUsers() {
  const users = loadUsers();
  return Object.values(users).map(u => ({
    username: u.username,
    fullName: u.fullName,
    role: u.role,
    roleTitle: u.roleTitle,
    createdAt: u.createdAt,
    permissions: u.permissions
  }));
}

function createUser({ username, password, fullName, role }) {
  if (!username || !password || !fullName) {
    throw new Error("جميع الحقول مطلوبة");
  }
  const cleanUsername = username.trim().toLowerCase();
  const users = loadUsers();
  if (users[cleanUsername]) {
    throw new Error("اسم المستخدم موجود مسبقاً");
  }

  const { hash, salt } = hashPassword(password);
  const cleanRole = role === "admin" ? "admin" : (role === "reviewer" ? "reviewer" : "cataloger");
  const roleTitles = {
    admin: "مدير المنظومة",
    cataloger: "مفهرس مخطوطات",
    reviewer: "مدقق الجودة"
  };

  const permsMap = {
    admin: ["catalog:read", "catalog:write", "catalog:approve", "catalog:export", "users:manage", "dashboard:view"],
    cataloger: ["catalog:read", "catalog:write", "catalog:export", "dashboard:view"],
    reviewer: ["catalog:read", "catalog:write", "catalog:approve", "dashboard:view"]
  };

  users[cleanUsername] = {
    username: cleanUsername,
    fullName: fullName.trim(),
    role: cleanRole,
    roleTitle: roleTitles[cleanRole],
    hash,
    salt,
    createdAt: new Date().toISOString(),
    permissions: permsMap[cleanRole]
  };

  saveUsers(users);
  logActivity("admin", `إنشاء حساب مستخدم جديد: ${cleanUsername}`, null, `الدور: ${roleTitles[cleanRole]}`);
  return {
    username: cleanUsername,
    fullName: fullName.trim(),
    role: cleanRole,
    roleTitle: roleTitles[cleanRole],
    permissions: permsMap[cleanRole]
  };
}

function deleteUser(username) {
  const clean = (username || "").trim().toLowerCase();
  if (clean === "admin") {
    throw new Error("لا يمكن حذف حساب المدير الافتراضي");
  }
  const users = loadUsers();
  if (!users[clean]) {
    throw new Error("المستخدم غير موجود");
  }
  delete users[clean];
  saveUsers(users);

  // Invalidate any active sessions of this user
  const sessions = loadSessions();
  for (const [token, s] of Object.entries(sessions)) {
    if (s.username === clean) {
      delete sessions[token];
    }
  }
  saveSessions(sessions);
  logActivity("admin", `حذف حساب المستخدم: ${clean}`);
  return true;
}

// Initial ensure users file exists
loadUsers();

module.exports = {
  authenticateUser,
  createSession,
  getUserByToken,
  removeSession,
  listUsers,
  createUser,
  deleteUser,
  logActivity,
  loadAuditLog
};
