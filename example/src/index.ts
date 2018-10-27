import Server from './server';

import * as simple from './simple';
import * as example from './example';

const server = new Server();
simple.setup(server.app);
example.setup(server.app);
server.start();
