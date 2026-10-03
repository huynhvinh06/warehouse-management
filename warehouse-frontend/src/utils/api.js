export const API_URL = "http://localhost:5000";

// ---------- Phiên đăng nhập ----------
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function getCurrentUserId() {
  return getCurrentUser()?.user_id ?? null;
}

export function getToken() {
  return localStorage.getItem("token");
}

export function saveSession(user, token) {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
}

export function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

// Tự gắn token vào mọi request gửi tới backend, và đưa về trang đăng nhập
// khi token hết hạn / tài khoản bị khóa (401). Gọi một lần ở main.jsx.
export function setupAuthFetch() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;

    if (!url.startsWith(API_URL)) {
      return originalFetch(input, init);
    }

    const headers = new Headers(init.headers || {});
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await originalFetch(input, { ...init, headers });

    if (response.status === 401 && !url.endsWith("/api/login")) {
      logout();
      window.location.href = "/login";
    }

    return response;
  };
}

// ---------- Phân quyền giao diện ----------
// (Máy chủ vẫn kiểm tra lại mọi yêu cầu; phần này chỉ để ẩn chức năng không dùng được.)
export const ROLES = { ADMIN: "ADMIN", MANAGER: "MANAGER", STAFF: "STAFF" };

export const ROLE_LABELS = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý",
  STAFF: "Thủ kho",
};

const ALL_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF];

// Trang nào vai trò nào được vào
export const ROUTE_ROLES = {
  "/": ALL_ROLES,
  "/products": ALL_ROLES,
  "/categories": ALL_ROLES,
  "/suppliers": ALL_ROLES,
  "/warehouses": [ROLES.ADMIN, ROLES.MANAGER],
  "/inventory": ALL_ROLES,
  "/imports": ALL_ROLES,
  "/exports": ALL_ROLES,
  "/stocktakes": ALL_ROLES,
  "/reports": [ROLES.ADMIN, ROLES.MANAGER],
  "/users": [ROLES.ADMIN],
  "/audit-logs": [ROLES.ADMIN],
};

export function getRole() {
  return getCurrentUser()?.role_name ?? null;
}

export function canAccess(path) {
  const allowed = ROUTE_ROLES[path];
  return !!allowed && allowed.includes(getRole());
}

// Thêm / sửa / xóa sản phẩm, danh mục
export function canEditCatalog() {
  return [ROLES.ADMIN, ROLES.MANAGER].includes(getRole());
}

// Lập phiếu nhập, phiếu xuất
export function canCreateReceipt() {
  return [ROLES.ADMIN, ROLES.STAFF].includes(getRole());
}

// ---------- Định dạng ----------
export const STATUS_LABELS = {
  DRAFT: "Nháp",
  PENDING: "Chờ duyệt",
  APPROVED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN");
}

export function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}
