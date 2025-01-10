export const backendCaller = async (route, method = "GET", headers, body) => {
  try {
    const url = `${import.meta.env.VITE_BACKEND_URL}${route}`;

    const options = { headers, credentials: "include", method };

    if (method !== "GET" && body) {
      if (body instanceof FormData) {
        options.body = body;
      } else {
        options.body = JSON.stringify(body);
      }
    }

    // console.log(typeof headers, headers);
    // console.log(typeof body, body);

    const response = await fetch(url, options);

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
  }
};
