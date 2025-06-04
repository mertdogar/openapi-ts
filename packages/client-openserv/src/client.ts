import type { AxiosError } from 'axios';

import type { Client, Config, HttpMethod, Nango, NangoProps } from './types';
import { buildUrl, createConfig, mergeConfigs, mergeHeaders } from './utils';

export const createClient = (config: Config = {}): Client => {
  let _config = mergeConfigs(createConfig(), config);

  const nangoConfig: NangoProps = {
    secretKey: _config.secretKey || '',
  };
  if (_config.host) {
    nangoConfig.host = _config.host;
  }
  if (_config.connectionId) {
    nangoConfig.connectionId = _config.connectionId;
  }
  if (_config.providerConfigKey) {
    nangoConfig.providerConfigKey = _config.providerConfigKey;
  }

  const instance: Nango | undefined = config.nango;

  const getConfig = (): Config => ({ ..._config });

  const setConfig = (config: Config): Config => {
    _config = mergeConfigs(_config, config);
    if (_config.secretKey && instance) {
      instance.secretKey = _config.secretKey;
    }
    if (_config.host && instance) {
      instance.serverUrl = _config.host;
    }
    if (_config.providerConfigKey && instance) {
      instance.providerConfigKey = _config.providerConfigKey;
    }
    if (_config.connectionId && instance) {
      instance.connectionId = _config.connectionId;
    }
    return getConfig();
  };

  const request: Client['request'] = async (options) => {
    const opts = {
      ..._config,
      ...options,
      headers: mergeHeaders(_config.headers, options.headers),
      nango: options.nango ?? _config.nango ?? instance,
    };

    if (!opts.nango) {
      throw new Error('Nango instance is required');
    }

    if (opts.body && opts.bodySerializer) {
      opts.body = opts.bodySerializer(opts.body);
    }

    const url = buildUrl(opts);

    try {
      // assign Axios here for consistency with fetch
      const _nango = opts.nango!;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { auth, ...optsWithoutAuth } = opts;
      const response = await _nango.proxy({
        ...optsWithoutAuth,
        baseUrlOverride: opts.baseUrlOverride as string | undefined,
        data: opts.body,
        endpoint: url,
        headers: opts.headers as Record<string, string> | undefined,
        method: opts.method as HttpMethod,
        params: opts.query as
          | string
          | Record<string, string | number>
          | undefined,
      });

      let { data } = response;

      if (opts.responseType === 'json') {
        if (opts.responseValidator) {
          await opts.responseValidator(data);
        }

        if (opts.responseTransformer) {
          data = await opts.responseTransformer(data);
        }
      }

      return {
        ...response,
        data: data ?? {},
      } as any;
    } catch (error) {
      const e = error as AxiosError;
      if (opts.throwOnError) {
        throw e;
      }
      // @ts-expect-error
      e.error = e.response?.data ?? {};
      return e as any;
    }
  };

  return {
    buildUrl,
    delete: (options) => request({ ...options, method: 'DELETE' }),
    get: (options) => request({ ...options, method: 'GET' }),
    getConfig,
    head: (options) => request({ ...options, method: 'HEAD' }),
    instance,
    options: (options) => request({ ...options, method: 'OPTIONS' }),
    patch: (options) => request({ ...options, method: 'PATCH' }),
    post: (options) => request({ ...options, method: 'POST' }),
    put: (options) => request({ ...options, method: 'PUT' }),
    request,
    setConfig,
  } as Client;
};
