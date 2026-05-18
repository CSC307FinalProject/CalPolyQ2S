export function getStoredUser() {
  const storedUser =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  return storedUser ? JSON.parse(storedUser) : null;
}

export function logout() {
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
}