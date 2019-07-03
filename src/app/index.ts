import {
  AlexaPlatform,
  IVoxaEvent,
  IVoxaReply,
  plugins,
  VoxaApp
} from "voxa";
import * as voxaGA from "voxa-ga";

import * as config from "../config/index";
import Model from "./model";
import { register as states } from "./states";
import * as variables from "./variables";
import views from "./views";

export const voxaApp = new VoxaApp({ Model, views, variables });
export const alexa = new AlexaPlatform(voxaApp);
export const alexaLambda = alexa.lambda();
export const handler = alexa.lambda();

states(voxaApp);

plugins.replaceIntent(voxaApp);

voxaApp.onError((voxaEvent: IVoxaEvent, error: Error, reply: IVoxaReply) => {
  /* voxaEvent.log.error(error.message, {
    error,
    event: voxaEvent.rawEvent,
    reply
  }); */
  return { to: "FallbackIntent" };
});

// voxaGA(voxaApp, config.googleAnalytics);
