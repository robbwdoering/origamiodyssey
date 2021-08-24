// import { ServiceAddons } from '@feathersjs/feathers';
// import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
// import { LocalStrategy } from '@feathersjs/authentication-local';
// import { expressOauth } from '@feathersjs/authentication-oauth';

// import { Application } from './declarations';

// declare module './declarations' {
//   interface ServiceTypes {
//     'authentication': AuthenticationService & ServiceAddons<any>;
//   }
// }

// export default function(app: Application): void {
//   const authentication = new AuthenticationService(app);

//   authentication.register('jwt', new JWTStrategy());
//   authentication.register('local', new LocalStrategy());

//   app.use('/authentication', authentication);
//   app.configure(expressOauth());
// }

import { ServiceAddons, Params } from '@feathersjs/feathers';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import { expressOauth, OAuthStrategy, OAuthProfile } from '@feathersjs/authentication-oauth';

import { Application } from './declarations';

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService & ServiceAddons<any>;
  }
}

class Auth0Strategy extends OAuthStrategy {
  async getEntityData(profile: OAuthProfile, existing: any, params: Params) {
    const baseData = await super.getEntityData(profile, existing, params);

    return {
      ...baseData,
      email: profile.email
    };
  }
}

export default function(app: Application) {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());
  authentication.register('auth0', new Auth0Strategy());

  app.use('/authentication', authentication);
  app.configure(expressOauth());
}
