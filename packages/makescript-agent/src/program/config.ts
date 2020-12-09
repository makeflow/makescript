import YAML from 'yaml';

/**
 * Config type use for the app internal
 */
export interface Config {
  makescriptSecretURL: string;
  scriptsRepoURL: string;
  namespace: string;
  port: number;
  host: string;
  token: string;
  workspace: string;
  proxy:
    | {
        url: string;
        username: string;
        password: string;
      }
    | undefined;
}

/**
 * The config type use for config file
 */
export interface ConfigFile {
  'makescript-secret-url': string;
  'scripts-repo-url': string;
  namespace: string;
  /**
   * The port to listen on
   */
  port: number;
  /**
   * The host to listen on
   */
  host: string;
  /**
   * @uuid
   *
   * The token to authenticate
   */
  token: string;
  proxy:
    | {
        url: string;
        username: string;
        password: string;
      }
    | undefined;
}

export function generateYamlConfig(config: ConfigFile): string {
  // TODO: add comments
  return YAML.stringify(config);
}

export function transformConfig(config: ConfigFile, workspace: string): Config {
  return {
    makescriptSecretURL: config['makescript-secret-url'],
    scriptsRepoURL: config['scripts-repo-url'],
    namespace: config.namespace,
    port: config.port,
    host: config.host,
    token: config.token,
    proxy: config.proxy,
    workspace,
  };
}
