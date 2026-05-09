export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem("recruweb_token");
  
  const headers = {
    ...options.headers,
  };
  
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "An error occurred";
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch (e) {
      // Ignore JSON parse error
    }
    throw new Error(message);
  }

  // No content
  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch (e) {
    return null;
  }
}
