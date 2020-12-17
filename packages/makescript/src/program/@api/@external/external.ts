import Hapi from '@hapi/hapi';
import {logger} from '@makeflow/makescript-agent';

import {Entrances} from '../../@entrances';

import {routeMakeflow} from './@makeflow';
import {routeRunning} from './@running';

export async function serveExternalAPI(
  server: Hapi.Server,
  entrances: Entrances,
): Promise<void> {
  routeMakeflow(entrances.makeflowService, server);
  routeRunning(entrances.runningService, server);

  await server.start();

  logger.info(`MakeScript api is running on port ${entrances.config.api.port}`);
}
