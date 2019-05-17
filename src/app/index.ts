import {
  AlexaPlatform,
  ITransition,
  IVoxaEvent,
  IVoxaIntentEvent,
  IVoxaReply,
  plugins,
  VoxaApp
} from "voxa";
import * as voxaGA from "voxa-ga";

// import * as defaultFulfillIntents from "../../content/en-US/canfulfill-intent.json";
import * as config from "../config/index";
import Model from "./model";
import { register as states } from "./states";
import * as variables from "./variables";
import views from "./views";

export const voxaApp = new VoxaApp({ Model, views, variables, /* defaultFulfillIntents */ });
export const alexa = new AlexaPlatform(voxaApp);
export const alexaLambda = alexa.lambda();
export const handler = alexa.lambda();

states(voxaApp);

plugins.replaceIntent(voxaApp);

/* voxaApp.onIntentRequest(async (voxaEvent: IVoxaIntentEvent) => {
  voxaEvent.log.info("intent", {
    intent: voxaEvent.intent.rawIntent,
    userId: voxaEvent.user.userId
  });
}); */

/* voxaApp.onAfterStateChanged(
  (voxaEvent: IVoxaEvent, reply: IVoxaReply, transition: ITransition) => {
    voxaEvent.log.info("Transition", { transition });
  }
); */

voxaApp.onError((voxaEvent: IVoxaEvent, error: Error, reply: IVoxaReply) => {
  /* voxaEvent.log.error(error.message, {
    error,
    event: voxaEvent.rawEvent,
    reply
  }); */
  return { to: "FallbackIntent" };
});

// voxaGA(voxaApp, config.googleAnalytics);
