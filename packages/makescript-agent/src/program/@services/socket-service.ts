import URL from 'url';

import SocketIO from 'socket.io-client';

import {logger} from '../@utils';
import {Config} from '../config';

export class SocketService {
  socket!: SocketIO.Socket;

  constructor(private config: Config) {
    this.initialize();
  }

  initialize(): void {
    let makescriptSecretURL = this.config.makescriptSecretURL;

    let url = URL.parse(makescriptSecretURL);

    let socket = SocketIO.io(`${url.protocol}//${url.host}`, {
      path: url.pathname ?? '/',
    });

    socket.on('connect', () =>
      logger.info(`Connected to ${makescriptSecretURL}`),
    );
    socket.on('disconnect', (reason: string) =>
      logger.error(`Disconnected from ${makescriptSecretURL}: ${reason}`),
    );
    socket.on('connect_error', (error: Error) =>
      logger.error(
        `Failed to connect to ${makescriptSecretURL}: ${error.message}`,
      ),
    );

    this.socket = socket;
  }
}