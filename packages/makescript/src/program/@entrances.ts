import entrance from 'entrance-decorator';

import {
  AgentService,
  DBService,
  MakeflowService,
  RunningService,
  ScriptService,
  TokenService,
  UserService,
} from './@services';
import {Config} from './config';

export class Entrances {
  readonly ready = Promise.all([this.dbService.ready]);

  constructor(readonly config: Config) {}

  @entrance
  get dbService(): DBService {
    return new DBService(this.config);
  }

  @entrance
  get makeflowService(): MakeflowService {
    return new MakeflowService(
      this.scriptService,
      this.runningService,
      this.tokenService,
      this.dbService,
      this.config,
    );
  }

  @entrance
  get agentService(): AgentService {
    return new AgentService(this.config);
  }

  @entrance
  get scriptService(): ScriptService {
    return new ScriptService(this.agentService, this.dbService, this.config);
  }

  @entrance
  get runningService(): RunningService {
    return new RunningService(this.agentService, this.dbService, this.config);
  }

  @entrance
  get userService(): UserService {
    return new UserService(this.dbService);
  }

  @entrance
  get tokenService(): TokenService {
    return new TokenService(this.dbService);
  }
}