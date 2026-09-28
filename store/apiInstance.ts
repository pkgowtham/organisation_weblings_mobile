import { getItemAsync } from "@/utils/secureStorage";

function htmlErrorToStringRegex(htmlContent: any) {
  if (typeof htmlContent !== "string") return "";
  return htmlContent.replace(/<[^>]*>/g, "").trim();
}

function extractErrorMessage(data: any): string {
  if (!data) return "Unknown error";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map(extractErrorMessage).join(", ");
    }
    if (data.error && typeof data.error === "string") {
      return data.error;
    }
    if (data.error && typeof data.error === "object") {
      return extractErrorMessage(data.error);
    }
    if (data.message && typeof data.message === "string") {
      return data.message;
    }
    if (data.message && typeof data.message === "object") {
      return extractErrorMessage(data.message);
    }
    for (const key in data) {
      if (typeof data[key] === "string") {
        return data[key];
      }
      if (typeof data[key] === "object") {
        const nested = extractErrorMessage(data[key]);
        if (nested && nested !== "Unknown error") return nested;
      }
    }
    try {
      return JSON.stringify(data);
    } catch {
      return "Unknown error";
    }
  }
  return String(data);
}

export const createFetchInstance = (baseURL: string) => {
  const fetchInstance = async (config: {
    url: string;
    method?: string;
    params?: any;
    query?: any;
    body?: any;
    isMultipart?: boolean;
  }) => {
    const { url, method = "GET", params, query, body, isMultipart } = config;

    const cleanQuery = query
      ? Object.fromEntries(
          Object.entries(query).filter(
            ([_, v]) =>
              v !== undefined && v !== null && v !== "" && v !== "undefined",
          ),
        )
      : null;

    const queryString =
      cleanQuery && Object.keys(cleanQuery).length > 0
        ? (url.includes("?") ? "&" : "?") +
          new URLSearchParams(cleanQuery as any).toString()
        : "";

    const paramsString = params ? "/" + params.toString() : "";

    const cleanBaseUrl = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
    const formattedUrl = url.startsWith("/") ? url : `/${url}`;
    const fullUrl = cleanBaseUrl + formattedUrl + paramsString + queryString;

    try {
      const token = await getItemAsync("authToken");

      const headers: HeadersInit = {
        Authorization: token ? `Bearer ${token}` : "",
      };

      const isFormData =
        Boolean(isMultipart) ||
        (body &&
          (body instanceof FormData ||
            typeof (body as any)?.append === "function"));

      let requestBody: any;
      if (isFormData) {
        requestBody = body;
      } else {
        headers["Content-Type"] = "application/json";
        requestBody = body ? JSON.stringify(body) : undefined;
      }

      const options: RequestInit = {
        method,
        headers,
        body: requestBody,
      };

      const response = await fetch(fullUrl, options);

      const text = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = htmlErrorToStringRegex(text);
      }

      if (!response.ok) {
        throw {
          status: response.status,
          message: extractErrorMessage(responseData),
        };
      }

      return responseData;
    } catch (error: any) {
      console.log("API call failed (internal):", error);
      if (error && typeof error === "object" && error.status !== undefined) {
        if (error.message && typeof error.message !== "string") {
          error.message = extractErrorMessage(error.message);
        }
        throw error;
      }
      throw new Error(
        error?.message ? String(error.message) : "Network request failed",
      );
    }
  };

  return fetchInstance;
};

export const apiFetch = createFetchInstance("https://api.weblings.dev/V1/");
