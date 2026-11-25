
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

let accessToken = null;
let sessionExpiredHandler = () => {};
let sessionUpdatedHandler = () => {};
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const setSessionHandlers = ({ onExpired, onUpdated }) => {
  sessionExpiredHandler = onExpired || (() => {});
  sessionUpdatedHandler = onUpdated || (() => {});
};

const getResponseData = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || "Something went wrong"
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

// Refresh the access token using the HTTP-only cookie.
export const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(
        `${API_BASE_URL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await getResponseData(response);

      const token = result.data?.accessToken;
      const user = result.data?.user;

      if (!token || !user) {
        throw new Error("Invalid refresh response");
      }

      setAccessToken(token);

      return { accessToken: token, user };
    })();
  }

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

// Main API request function.
export const apiRequest = async (
  endpoint,
  options = {}
) => {
  const {
    skipAuthRefresh = false,
    ...requestOptions
  } = options;

  const makeRequest = () => {
    const headers = new Headers(requestOptions.headers || {});

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const isFormData =
      requestOptions.body instanceof FormData;

    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestOptions,
      headers,
      credentials: "include",
    });
  };

  let response = await makeRequest();

  // If access token expired, refresh and retry once.
  if (
    response.status === 401 &&
    !skipAuthRefresh &&
    endpoint !== "/auth/login" &&
    endpoint !== "/auth/refresh"
  ) {
    try {
      const session = await refreshSession();

      sessionUpdatedHandler(session);

      response = await makeRequest();
    } catch (error) {
      setAccessToken(null);
      sessionExpiredHandler();

      throw error;
    }
  }

  return getResponseData(response);
};
