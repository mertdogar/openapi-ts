let Nango: Awaited<ReturnType<typeof init>>;
let nango: Awaited<ReturnType<typeof createInstance>>;

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

export interface Timestamps {
  created_at: string;
  updated_at: string;
}
export interface Sync extends Timestamps {
  connection_id: string;
  id: string;
  last_sync_date: string;
  name: string;
}
export interface SyncConfig extends Timestamps {
  description?: string;
  name: string;
}
export interface Action extends Timestamps {
  name: string;
}
export type SyncType = 'INCREMENTAL' | 'INITIAL';
export interface Integration {
  actions: Action[];
  provider: string;
  syncs: SyncConfig[];
  unique_key: string;
}

export interface IntegrationWithCreds extends Integration {
  client_id: string;
  client_secret: string;
  created_at: Date;
  has_webhook: boolean;
  scopes: string;
  webhook_url?: string;
}

export const IGNORED_INTEGRATIONS = ['twitter'];

export async function init() {
  const Nangos = await import('@nangohq/node');

  Nango = Nangos.Nango;
  return Nangos.Nango;
}

export async function createInstance({
  host,
  secretKey,
}: {
  host?: string;
  secretKey?: string;
}) {
  const nangos = new Nango({
    host,
    secretKey: secretKey || '',
  });
  nango = nangos;
  return nangos;
}

export const getNango = () => Nango;

export const listIntegrationsWithDetails = async () => {
  const integrationsResponse = await nango.listIntegrations();
  const integrationsDetailedResponse = await Promise.all(
    integrationsResponse.configs.map((integration: { unique_key: any }) =>
      nango.getIntegration(integration.unique_key, true),
    ),
  );
  return integrationsDetailedResponse.filter(
    (integration: { config: { unique_key: string } }) =>
      !IGNORED_INTEGRATIONS.includes(integration.config.unique_key),
  );
};

export const getNangoInstance = () => nango;
