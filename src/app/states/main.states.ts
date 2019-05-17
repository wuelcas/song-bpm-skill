import { IVoxaEvent, IVoxaIntentEvent, PlayAudio, StopAudio, VoxaApp } from "voxa";
import * as config from "../../config/index";
import MusicTempoModel from "../model";

const clickTrackURLTemplate = config.metronome.clickTrackURLTemplate;

// TODO: make metronome work

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
  voxaApp.onIntent("StartOverIntent", { to: "LaunchIntent" });
  voxaApp.onIntent("HelpIntent", {
    flow: "yield",
    reply: "Help.InstructionsMessage",
    to: "sayBPMForSong"
  });
  voxaApp.onIntent("SongRequestIntent", { to: "sayBPMForSong" });
  voxaApp.onIntent("CancelIntent", { to: "ExitSkill" });
  voxaApp.onState("ExitSkill", {
    flow: "terminate",
    reply: "Exit.GoodbyeMessage"
  });
  voxaApp.onIntent("RepeatIntent", { to: "repeatTheBPMOfTheSong" });

  voxaApp.onState("sayBPMForSong", async (voxaEvent: IVoxaIntentEvent) => {
    if (voxaEvent.intent.name === "SongRequestIntent") {
      const song = voxaEvent.intent.params.Song;
      const model = voxaEvent.model as MusicTempoModel;

      let query = `track:${song}`;

      if (voxaEvent.intent.params.Artist) {
        query = `${query} artist:${voxaEvent.intent.params.Artist}`;
      }
      if (voxaEvent.intent.params.Album) {
        query = `${query} album:${voxaEvent.intent.params.Album}`;
      }

      const result = await model.getQueryResult(query);

      if (result.notFound) {
        return {
          flow: "yield",
          reply: "SongInfo.NotFoundResponse",
          to: "tryAgainWithAnotherSong?"
        };
      }

      model.songWasGuessed = false; // Reset flag for repeat intent

      return {
        flow: "yield",
        reply: "SongInfo.TempoResponse",
        to: "wasThatTheSongTheUserWanted?"
      };
    }
  });

  voxaApp.onState("wasThatTheSongTheUserWanted?", async (voxaEvent: IVoxaIntentEvent) => {
    const model = voxaEvent.model as MusicTempoModel;

    if (voxaEvent.intent.name === "NoIntent") {
      if (model.haveMoreSongs) {
        await model.setNextSongInfo();
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
      model.guessedTheSong();

      const tempo = model.getCurrentSongTempo();
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
    const model = voxaEvent.model as MusicTempoModel;
    if (model.Artist && model.BPM) {
      if (model.songWasGuessed) {
        return {
          flow: "yield",
          reply: "SongInfo.RepeatLastSongTempo",
          to: "tryAgainWithAnotherSong?"
        };
      }

      return {
        flow: "yield",
        reply: "SongInfo.TempoResponse",
        to: "wasThatTheSongTheUserWanted?"
      };
    }

    return {
      flow: "yield",
      reply: "SongInfo.YouHaveNotSearchAnySong",
      to: "sayBPMForSong"
    };
  });

  voxaApp.onState("shouldPlayMetronome?", (voxaEvent: IVoxaIntentEvent) => {
    const model = voxaEvent.model as MusicTempoModel;
    if (voxaEvent.intent.name === "YesIntent") {
      const url = clickTrackURLTemplate.replace("{bpm}", model.BPM);

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

    return {
      flow: "yield",
      reply: "InvalidIntent.InMetronome",
      to: "shouldPlayMetronome?"
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

  voxaApp.onState("FallbackIntent", {
    flow: "yield",
    reply: "InvalidIntent.DidNotUnderstand",
    to: "sayBPMForSong"
  });

  voxaApp.onUnhandledState((): any => ({ to: "FallbackIntent" }));
}
