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
export type RequestOptions = RequestInit & {
  responseAs?: ResponseType;
};

export interface FetchError<TBody = any> extends Error {
  response: Response;
  body: TBody;
}

export const defaultOptions: RequestOptions = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  },
  responseAs: "json"
};

export function normalizeUrl(url: string) {
  return url.slice(0, 7) + "/" + url.slice(7).replaceAll("//", "/");
}

export function isObject(v: any) {
  return v && typeof v === "object" && !Array.isArray(v);
}

export function merge<T = any>(...objects: any[]): T {
  let result = {};

  for (const object of objects) {
    if (object === undefined || object === null) continue;
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

export class Tower {
  public baseURL: string;
  public options: RequestOptions;

  public get = (url: string, options?: RequestOptions) =>
    this.request("GET", url, null, options);

  public delete = (url: string, options?: RequestOptions) =>
    this.request("GET", url, null, options);

  public post = (
    urlOrData: string | RequestData,
    dataOrOptions?: RequestData | RequestOptions,
    options?: RequestOptions
  ) => this.request("POST", urlOrData, dataOrOptions, options);
  public put = this.request.bind(this, "PUT");
  public patch = this.request.bind(this, "PATCH");

  constructor(baseUrl: string, options: RequestOptions = defaultOptions) {
    this.baseURL = baseUrl;
    this.options = options;
  }

  async request(
    method: HTTPMethod,
    urlOrData: string | RequestData,
    dataOrOptions?: RequestData | RequestOptions,
    options?: RequestOptions
  ) {
    options =
      typeof urlOrData !== "string" && dataOrOptions ? dataOrOptions : options;

    let mergedOptions: RequestOptions = merge(
      defaultOptions,
      this.options,
      options,
      { method }
    );

    console.log(mergedOptions);

    const url =
      typeof urlOrData === "string"
        ? normalizeUrl(this.baseURL + "/" + urlOrData)
        : this.baseURL;

    const data = typeof urlOrData !== "string" ? urlOrData : dataOrOptions;
    const responseAs: ResponseType = mergedOptions.responseAs as ResponseType;

    if (data) {
      mergedOptions.body =
        data instanceof FormData ? data : JSON.stringify(data);
    }

    // FETCH!!!
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

  public up(url: string, upOptions?: RequestOptions) {
    return new Tower(
      normalizeUrl(`${this.baseURL}/${url}`),
      merge(this.options, upOptions)
    );
  }

  public edit(options: RequestOptions, url: string = this.baseURL) {
    this.options = merge(this.options, options);
    this.baseURL = url;
    return this;
  }
}
