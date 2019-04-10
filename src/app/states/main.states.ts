import { IVoxaEvent, IVoxaIntentEvent, PlayAudio, StopAudio, VoxaApp } from "voxa";
import * as config from "../../config/index";

const clickTrackURLTemplate = config.metronome.clickTrackURLTemplate;

// TODO: make metronome work
// TODO: refactor state code, specially when handling intents
// TODO: check direct intents
// TODO: Make tests using alexa mime

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
        to: "tryAgainWithAnotherSong?"
      };
    }

    return {
      flow: "yield",
      reply: "SongInfo.TempoResponse",
      to: "wasThatTheSongTheUserWanted?"
    };
  });

  voxaApp.onState("wasThatTheSongTheUserWanted?", async (voxaEvent: IVoxaIntentEvent) => {
    if (voxaEvent.intent.name === "NoIntent") {
      if (voxaEvent.model.haveMoreSongs) {
        await voxaEvent.model.setNextSongInfo();
        return {
          flow: "yield",
          reply: "SongInfo.TempoResponse",
          to: "wasThatTheSongTheUserWanted?"
        };
      }

      return {
        flow: "yield",
        reply: "SongInfo.NotFoundResponse",
        to: "tryAgainWithAnotherSong?"
      };
    }

    if (voxaEvent.intent.name === "YesIntent") {
      const tempo = voxaEvent.model.getCurrentSongTempo();
      if (tempo >= config.metronome.minimumBPM && tempo <= config.metronome.maximumBPM) {
        return {
          flow: "yield",
          reply: "SongInfo.MetronomeInvitation",
          to: "shouldPlayMetronome?"
        };
      }

      return {
        flow: "yield",
        reply: "SongInfo.SayAnotherSong",
        to: "sayBPMForSong"
      };
    }
  });

  voxaApp.onState("tryAgainWithAnotherSong?", { flow: "terminate", reply: "Exit.GoodbyeMessage" }, "NoIntent");
  voxaApp.onState("tryAgainWithAnotherSong?", { flow: "yield",
  reply: "SongInfo.SayAnotherSong",
  to: "sayBPMForSong" }, "NoIntent");

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

  voxaApp.onState("shouldPlayMetronome?", (voxaEvent: IVoxaIntentEvent) => {
    if (voxaEvent.intent.name === "YesIntent") {
      const url = clickTrackURLTemplate.replace("{bpm}", voxaEvent.model.BPM);

      const playDirective = new PlayAudio(url, "{}", 0, "REPLACE_ALL");

      return {
        directives: [playDirective],
        flow: "terminate",
        reply: "Metronome.PlayAudio"
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
    to: "die"
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
