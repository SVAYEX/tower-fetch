export type ResponseType =
  | "text"
  | "json"
  | "blob"
  | "arrayBuffer"
  | "formData"
  | "response";

export type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

export type RequestData = FormData | object | null;
export type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string | null>;
  responseAs?: ResponseType;
};

export interface FetchError<TBody = any> extends Error {
  response: Response;
  body: TBody;
}

export interface RequestInstance {
  method: HTTPMethod;
  url: string | (() => string);
  options?: RequestOptions;
  rateLimit?: number;
  rateOnlySuccess?: boolean;
  data?: RequestData | (() => RequestData);
  then?: <T = unknown>(response: T) => void;
  catch?: <T = any>(error: FetchError<T>) => void;
  rateLimitHadler?: (remainingTime: number) => void;
}

export interface FetchInstance {
  get<T = unknown>(url: string, options?: RequestOptions): Promise<T>;

  post<T = unknown>(
    urlOrData: string | RequestData,
    dataOrOptions?: RequestData | RequestOptions,
    options?: RequestOptions
  ): Promise<T>;

  put<T = unknown>(
    urlOrData: string | RequestData,
    dataOrOptions?: RequestData | RequestOptions,
    options?: RequestOptions
  ): Promise<T>;

  patch<T = unknown>(
    urlOrData: string | RequestData,
    dataOrOptions?: RequestData | RequestOptions,
    options?: RequestOptions
  ): Promise<T>;

  delete<T = unknown>(url: string, options?: RequestOptions): Promise<T>;

  up(url: string, upOptions?: RequestOptions): FetchInstance;

  edit(options: RequestOptions, url?: string): FetchInstance;

  request<T = unknown>(options: RequestInstance): () => Promise<T> | undefined;
}

export const defaults: RequestOptions = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },
  responseAs: "json"
};

export function normalizeURL(url: string) {
  return url.replace(/(https?:\/\/)|(\/)+/g, "$1$2");
}

export function isObject(v: any): v is object {
  return (
    v && typeof v === "object" && !Array.isArray(v) && !(v instanceof FormData)
  );
}

export function merge<T = any>(...objects: any[]): T {
  let result = {};

  for (const object of objects) {
    for (const key in object) {
      //@ts-ignore
      if (!result[key]) {
        //@ts-ignore
        result[key] = object[key];
        continue;
      }

      //@ts-ignore
      if (isObject(object[key]) && isObject(result[key])) {
        //@ts-ignore
        result[key] = merge(result[key], object[key]);
        continue;
      } else {
        //@ts-ignore
        result[key] = object[key];
      }
    }
  }

  //@ts-ignore
  return result;
}

export function filterHeaders(
  v: Record<string, string | null> | undefined
): Record<string, string | null> | undefined {
  const result = {};
  for (const key in v) {
    //@ts-ignore
    if (v[key] !== null) {
      //@ts-ignore
      result[key] = v[key];
    }
  }
  return result;
}

export function tower(
  baseURL: string,
  instanceOptions: RequestOptions = defaults
): FetchInstance {
  async function _fetch(
    method: HTTPMethod,
    urlOrData: string | RequestData,
    dataOrOptions?: RequestData | RequestOptions,
    options?: RequestOptions
  ) {
    options =
      typeof urlOrData !== "string" && dataOrOptions ? dataOrOptions : options;

    let mergedOptions: RequestOptions = merge(
      defaults,
      instanceOptions,
      options,
      { method }
    );

    // Remove headers with null values
    mergedOptions.headers = filterHeaders(mergedOptions.headers);

    const url =
      typeof urlOrData === "string"
        ? normalizeURL(`${baseURL}/${urlOrData}`)
        : baseURL;

    const data = typeof urlOrData !== "string" ? urlOrData : dataOrOptions;
    const responseAs: ResponseType = mergedOptions.responseAs as ResponseType;

    if (data) {
      mergedOptions.body = isObject(data) ? JSON.stringify(data) : data;
    }

    //@ts-ignore
    const response = await fetch(url, mergedOptions);

    const responseData =
      responseAs === "response"
        ? response
        : await response[responseAs]().catch(() => null);

    if (response.status >= 200 && response.status < 300) {
      return responseData;
    }

    const error = new Error(response.statusText) as FetchError;
    error.response = response;
    error.body = responseData;
    throw error;
  }

  return {
    get: (url: string, options?: RequestOptions) =>
      _fetch("GET", url, null, options),

    delete: (url: string, options?: RequestOptions, data?: RequestData) =>
      _fetch("DELETE", url, data, options),

    post: _fetch.bind(null, "POST"),

    put: _fetch.bind(null, "PUT"),

    patch: _fetch.bind(null, "PATCH"),

    up(url: string, upOptions?: RequestOptions) {
      return tower(
        normalizeURL(`${baseURL}/${url}`),
        merge(instanceOptions, upOptions)
      );
    },

    edit(options: RequestOptions, url: string = baseURL) {
      instanceOptions = merge(instanceOptions, options);
      baseURL = url;
      return this;
    },

    request(options: RequestInstance) {
      const inst = async () => {
        try {
          const response = await _fetch(
            options.method,
            typeof options.url === "function" ? options.url() : options.url,
            typeof options.data === "function" ? options.data() : options.data,
            options.options
          );
          options.then && options.then(response);
          return response;
        } catch (e: any) {
          options.catch && options.catch(e);
          throw e;
        }
      };

      if (options.rateLimit) {
        let timer: ReturnType<typeof setTimeout> | null = null;
        let startTime = new Date().getTime();
        return function () {
          let result;

          if (timer === null) {
            startTime = new Date().getTime();
            timer = setTimeout(() => (timer = null), options.rateLimit);
            result = inst().catch(() => {
              if (
                options.rateOnlySuccess !== undefined &&
                options.rateOnlySuccess
              ) {
                timer = null;
              }
            });
          } else {
            if (options.rateLimitHadler) {
              options.rateLimitHadler(
                (options.rateLimit as number) -
                  (new Date().getTime() - startTime)
              );
            }
            return;
          }

          return result;
        };
      }

      return inst;
    }
  };
}
