import * as SpotifyWebApi from "spotify-web-api-node";
import { IVoxaEvent, IVoxaIntentEvent, PlayAudio, StopAudio, VoxaApp } from "voxa";
import * as config from "../../config/index";

const clickTrackURLTemplate = config.metronome.clickTrackURLTemplate;

const spotifyApi = new SpotifyWebApi({
  clientId: config.spotify.clientId,
  clientSecret: config.spotify.clientSecret
});

export function register(voxaApp: VoxaApp) {
  voxaApp.onState("entry", {
    PauseIntent: "stop",
    StopIntent: "stop"
  });

  voxaApp.onIntent("LaunchIntent", {
    flow: "yield",
    reply: "Launch.StartResponse",
    to: "sayBPMForSong"
  });
  voxaApp.onIntent("StartOverIntent", {
    flow: "yield",
    reply: "Launch.StartResponse",
    to: "sayBPMForSong"
  });
  voxaApp.onIntent("HelpIntent", {
    flow: "yield",
    reply: "Help.InstructionsMessage",
    to: "sayBPMForSong"
  });
  voxaApp.onIntent("SongRequestIntent", { to: "sayBPMForSong" });
  voxaApp.onIntent("CancelIntent", {
    flow: "terminate",
    reply: "Exit.GoodbyeMessage"
  });
  voxaApp.onIntent("RepeatIntent", { to: "repeatTheBPMOfTheSong" });
  voxaApp.onIntent("YesIntent", {
    flow: "yield",
    reply: "Help.InstructionsMessage",
    to: "sayBPMForSong"
  });
  voxaApp.onIntent("NoIntent", {
    flow: "yield",
    reply: "Help.InstructionsMessage",
    to: "sayBPMForSong"
  });

  voxaApp.onState("sayBPMForSong", async (voxaEvent: IVoxaIntentEvent) => {
    switch (voxaEvent.intent.name) {
      case "RepeatIntent":
        return { to: "repeatTheBPMOfTheSong" };
      case "HelpIntent":
        return { flow: "yield", reply: "Help.InstructionsMessage", to: "sayBPMForSong" };
      case "StartOverIntent":
        return { flow: "yield", reply: "Launch.StartResponse", to: "sayBPMForSong" };
      case "LaunchIntent":
        return { flow: "yield", reply: "Launch.StartResponse", to: "sayBPMForSong" };
      case "CancelIntent":
        return { flow: "terminate", reply: "Exit.GoodbyeMessage" };
      case "StopIntent":
        return { flow: "terminate", reply: "Exit.GoodbyeMessage" };
      default:
        break;
    }
    const song = voxaEvent.intent.params.Song;
    let query = `track:${song}`;

    if (voxaEvent.intent.params.Artist) {
      query = `${query} artist:${voxaEvent.intent.params.Artist}`;
    }
    if (voxaEvent.intent.params.Album) {
      query = `${query} album:${voxaEvent.intent.params.Album}`;
    }

    const result = await voxaEvent.model.getQueryResult(query);

    if (result.notFound) {
      return {
        flow: "yield",
        reply: "SongInfo.NotFoundResponse",
        to: "sayBPMForSong"
      };
    }

    let reply = "SongInfo.TempoResponse";
    let to = "sayBPMForSong";

    if (result.tempo >= config.metronome.minimumBPM && result.tempo <= config.metronome.maximumBPM) {
      reply = "SongInfo.TempoResponseAndMetronomeInvitation";
      to = "shouldPlayMetronome";
    }

    return {
      flow: "yield",
      reply,
      to
    };
  });

  voxaApp.onState("repeatTheBPMOfTheSong", (voxaEvent: IVoxaIntentEvent) => {
    if (voxaEvent.model.Artist && voxaEvent.model.BPM) {
      return {
        flow: "yield",
        reply: "SongInfo.RepeatBPMOfTheSong",
        to: "sayBPMForSong"
      };
    }

    return {
      flow: "yield",
      reply: "SongInfo.YouHaveNotSearchAnySong",
      to: "sayBPMForSong"
    };
  });

  voxaApp.onState("shouldPlayMetronome", (voxaEvent: IVoxaIntentEvent) => {
    if (voxaEvent.intent.name === "YesIntent") {
      const url = clickTrackURLTemplate.replace("{bpm}", voxaEvent.model.BPM);

      const playDirective = new PlayAudio(url, "{}", 0, "REPLACE_ALL");

      return {
        directives: [playDirective],
        flow: "terminate",
        reply: "Metronome.PlayAudio",
      };
    }

    if (voxaEvent.intent.name === "NoIntent") {
      return {
        flow: "yield",
        reply: "Help.InviteToAskForAnotherSong",
        to: "sayBPMForSong"
      };
    }

    if (voxaEvent.intent.name === "RepeatIntent") {
      return { to: "repeatTheBPMOfTheSong" };
    }

    if (voxaEvent.intent.name === "HelpIntent") {
      return {
        flow: "yield",
        reply: "Help.InstructionsMessage",
        to: "sayBPMForSong"
      };
    }

    return {
      flow: "yield",
      reply: "InvalidIntent.InMetronome",
      to: "shouldPlayMetronome"
    };
  });

  voxaApp.onState("stop", {
    directives: [StopAudio],
    reply: "Metronome.Pause",
    to: "die",
  });

  voxaApp.onIntent("ResumeIntent", (voxaEvent: IVoxaEvent) => {
    /* if (voxaEvent.executionContext) {
      const token = JSON.parse(voxaEvent.con);
      const shuffle = token.shuffle;
      const loop = token.loop;
      const index = token.index;
      const offsetInMilliseconds = voxaEvent.context.AudioPlayer.offsetInMilliseconds;
      const url = token.url;

      const directives = buildPlayDirective(
        url,
        index,
        shuffle,
        loop,
        offsetInMilliseconds
      );

      const playDirective = new PlayAudio(url, "{}", 0, "REPLACE_ALL");

      return { reply: "Metronome.Resume", to: "die", directives };
    } */

    return { flow: "terminate", reply: "Exit.GoodbyeMessage" };
  });

  /* voxaApp.onState("FallbackIntent", {
    reply: "Fallback.CallConcierge",
    to: "learnMoreAboutCategories"
  }); */

  // voxaApp.onUnhandledState((): any => ({ to: "FallbackIntent" }));
}
