import type {
  Auth,
  Client as CoreClient,
  Config as CoreConfig,
} from '@hey-api/client-core';
import type { AxiosError, AxiosResponse, CreateAxiosDefaults } from 'axios';

import type { getNangoInstance } from './nango';

export type Nango = Awaited<ReturnType<typeof getNangoInstance>>;
export type NangoProps = {
  activityLogId?: string | undefined;
  connectionId?: string;
  dryRun?: boolean;
  host?: string;
  isSync?: boolean;
  providerConfigKey?: string;
  secretKey: string;
};
export interface SerializerOptions {
  dots?: boolean;
  indexes?: boolean | null;
  metaTokens?: boolean;
  visitor?: any;
}
export interface ParamsSerializerOptions extends SerializerOptions {
  encode?: any;
  serialize?: any;
}
export interface ProxyConfiguration {
  baseUrlOverride?: string;
  connectionId?: string;
  data?: unknown;
  decompress?: boolean;
  endpoint: string;
  headers?: Record<string, string>;
  method?:
    | 'GET'
    | 'POST'
    | 'PATCH'
    | 'PUT'
    | 'DELETE'
    | 'get'
    | 'post'
    | 'patch'
    | 'put'
    | 'delete';
  params?: string | Record<string, string | number>;
  paramsSerializer?: ParamsSerializerOptions;
  providerConfigKey?: string;
  responseType?:
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json'
    | 'text'
    | 'stream';
  retries?: number;
  retryOn?: number[] | null;
}

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PATCH'
  | 'PUT'
  | 'DELETE'
  | 'get'
  | 'post'
  | 'patch'
  | 'put'
  | 'delete';

export interface Config<T extends ClientOptions = ClientOptions>
  extends Omit<ProxyConfiguration, 'auth' | 'headers' | 'method' | 'endpoint'>,
    CoreConfig {
  /**
   * An object containing any HTTP headers that you want to pre-populate your
   * `Headers` object with.
   *
   * {@link https://developer.mozilla.org/docs/Web/API/Headers/Headers#init See more}
   */
  headers?:
    | CreateAxiosDefaults['headers']
    | Record<
        string,
        | string
        | number
        | boolean
        | (string | number | boolean)[]
        | null
        | undefined
        | unknown
      >;
  host?: T['host'];

  /**
   * Axios implementation. You can use this option to provide a custom
   * Axios instance.
   *
   * @default axios
   */
  nango?: Nango;
  secretKey?: T['secretKey'];
  /**
   * Throw an error instead of returning it in the response?
   *
   * @default false
   */
  throwOnError?: T['throwOnError'];
}

export interface RequestOptions<
  ThrowOnError extends boolean = boolean,
  Url extends string = string,
> extends Config<{
    secretKey: string;
    throwOnError: ThrowOnError;
  }> {
  /**
   * Any body that you want to add to your request.
   *
   * {@link https://developer.mozilla.org/docs/Web/API/fetch#body}
   */
  body?: unknown;
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  /**
   * Security mechanism(s) to use for the request.
   */
  security?: ReadonlyArray<Auth>;
  url: Url;
}

export type RequestResult<
  TData = unknown,
  TError = unknown,
  ThrowOnError extends boolean = boolean,
> = ThrowOnError extends true
  ? Promise<
      AxiosResponse<
        TData extends Record<string, unknown> ? TData[keyof TData] : TData
      >
    >
  : Promise<
      | (AxiosResponse<
          TData extends Record<string, unknown> ? TData[keyof TData] : TData
        > & { error: undefined })
      | (AxiosError<
          TError extends Record<string, unknown> ? TError[keyof TError] : TError
        > & {
          data: undefined;
          error: TError extends Record<string, unknown>
            ? TError[keyof TError]
            : TError;
        })
    >;

export interface ClientOptions {
  activityLogId?: string | undefined;
  connectionId?: string;
  dryRun?: boolean;
  host?: string;
  isSync?: boolean;
  providerConfigKey?: string;
  secretKey?: string;
  throwOnError?: boolean;
}

type MethodFn = <
  TData = unknown,
  TError = unknown,
  ThrowOnError extends boolean = false,
>(
  options: Omit<RequestOptions<ThrowOnError>, 'method'>,
) => RequestResult<TData, TError, ThrowOnError>;

type RequestFn = <
  TData = unknown,
  TError = unknown,
  ThrowOnError extends boolean = false,
>(
  options: Omit<RequestOptions<ThrowOnError>, 'method'> &
    Pick<Required<RequestOptions<ThrowOnError>>, 'method'>,
) => RequestResult<TData, TError, ThrowOnError>;

type BuildUrlFn = <
  TData extends {
    body?: unknown;
    path?: Record<string, unknown>;
    query?: Record<string, unknown>;
    url: string;
  },
>(
  options: Pick<TData, 'url'> & Omit<Options<TData>, 'axios'>,
) => string;

export type Client = CoreClient<RequestFn, Config, MethodFn, BuildUrlFn> & {
  instance: Nango;
};

/**
 * The `createClientConfig()` function will be called on client initialization
 * and the returned object will become the client's initial configuration.
 *
 * You may want to initialize your client this way instead of calling
 * `setConfig()`. This is useful for example if you're using Next.js
 * to ensure your client always has the correct values.
 */
export type CreateClientConfig<T extends ClientOptions = ClientOptions> = (
  override?: Config<ClientOptions & T>,
) => Config<Required<ClientOptions> & T>;

export interface TDataShape {
  body?: unknown;
  headers?: unknown;
  path?: unknown;
  query?: unknown;
  url: string;
}

type OmitKeys<T, K> = Pick<T, Exclude<keyof T, K>>;

export type Options<
  TData extends TDataShape = TDataShape,
  ThrowOnError extends boolean = boolean,
> = OmitKeys<RequestOptions<ThrowOnError>, 'body' | 'path' | 'query' | 'url'> &
  Omit<TData, 'url'>;

export type OptionsLegacyParser<
  TData = unknown,
  ThrowOnError extends boolean = boolean,
> = TData extends { body?: any }
  ? TData extends { headers?: any }
    ? OmitKeys<RequestOptions<ThrowOnError>, 'body' | 'headers' | 'url'> & TData
    : OmitKeys<RequestOptions<ThrowOnError>, 'body' | 'url'> &
        TData &
        Pick<RequestOptions<ThrowOnError>, 'headers'>
  : TData extends { headers?: any }
    ? OmitKeys<RequestOptions<ThrowOnError>, 'headers' | 'url'> &
        TData &
        Pick<RequestOptions<ThrowOnError>, 'body'>
    : OmitKeys<RequestOptions<ThrowOnError>, 'url'> & TData;
