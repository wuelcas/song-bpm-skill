import {
  AlexaReply,
  IVoxaEvent,
  IVoxaIntentEvent,
  IVoxaReply,
  PlayAudio,
  VoxaApp
} from "voxa";
import * as config from "../../config/index";
import MusicTempoModel from "../model";

const clickTrackURLTemplate = config.metronome.clickTrackURLTemplate;

export function register(voxaApp: VoxaApp) {
  voxaApp.onIntent("PauseIntent", { to: "PauseMetronome" });

  voxaApp.onIntent("LaunchIntent", { to: "initSongSearch" });
  voxaApp.onIntent("SearchRequestIntent", { to: "initSongSearch" });
  voxaApp.onIntent("StartOverIntent", { to: "initSongSearch" });

  voxaApp.onState("initSongSearch", {
    alexaAPLTemplate: "APLTemplates.Instructions",
    flow: "yield",
    reply: "Launch.StartResponse",
    to: "sayBPMForSong"
  });

  voxaApp.onIntent("HelpIntent", {
    alexaAPLTemplate: "APLTemplates.Instructions",
    flow: "yield",
    reply: "Help.InstructionsMessage",
    to: "sayBPMForSong"
  });

  voxaApp.onIntent("SongRequestIntent", { to: "sayBPMForSong" });

  voxaApp.onIntent("CancelIntent", { to: "ExitSkill" });
  voxaApp.onIntent("StopIntent", { to: "ExitSkill" });
  voxaApp.onState("ExitSkill", {
    alexaStopAudio: true,
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
          alexaAPLTemplate: "APLTemplates.Instructions",
          flow: "yield",
          reply: "SongInfo.NotFoundResponse",
          to: "tryAgainWithAnotherSong?"
        };
      }

      model.songWasGuessed = false; // Reset flag for repeat intent

      return {
        alexaAPLTemplate: "APLTemplates.SongInfo",
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
          alexaAPLTemplate: "APLTemplates.SongInfo",
          flow: "yield",
          reply: "SongInfo.TempoResponse",
          to: "wasThatTheSongTheUserWanted?"
        };
      }

      return {
        reply: "SongInfo.NotFoundResponse",
        to: "askToSearchOtherSong"
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

      return { to: "askToSearchOtherSong" };
    }
  });

  voxaApp.onState("askToSearchOtherSong", {
    flow: "yield",
    reply: "SongInfo.SearchOtherSong",
    to: "tryAgainWithAnotherSong?"
  });

  voxaApp.onState("tryAgainWithAnotherSong?", { to: "ExitSkill" }, "NoIntent");
  voxaApp.onState(
    "tryAgainWithAnotherSong?",
    {
      alexaAPLTemplate: "APLTemplates.Instructions",
      flow: "yield",
      reply: "SongInfo.SayAnotherSong",
      to: "sayBPMForSong"
    },
    "YesIntent"
  );

  voxaApp.onState("repeatTheBPMOfTheSong", (voxaEvent: IVoxaIntentEvent) => {
    const model = voxaEvent.model as MusicTempoModel;
    if (model.Artist && model.BPM) {
      if (model.songWasGuessed) {
        return {
          alexaAPLTemplate: "APLTemplates.SongInfo",
          flow: "yield",
          reply: "SongInfo.RepeatLastSongTempo",
          to: "tryAgainWithAnotherSong?"
        };
      }

      return {
        alexaAPLTemplate: "APLTemplates.SongInfo",
        flow: "yield",
        reply: "SongInfo.TempoResponse",
        to: "wasThatTheSongTheUserWanted?"
      };
    }

    return {
      alexaAPLTemplate: "APLTemplates.Instructions",
      flow: "yield",
      reply: "SongInfo.YouHaveNotSearchAnySong",
      to: "sayBPMForSong"
    };
  });

  voxaApp.onState("shouldPlayMetronome?", (voxaEvent: IVoxaIntentEvent) => {
    if (voxaEvent.intent.name === "YesIntent") {
      return { to: "PlayMetronome" };
    }

    if (voxaEvent.intent.name === "NoIntent") {
      return {
        reply: "Common.Ok",
        to: "askToSearchOtherSong"
      };
    }

    return {
      flow: "yield",
      reply: "InvalidIntent.InMetronome",
      to: "shouldPlayMetronome?"
    };
  });

  voxaApp["onPlaybackController.PlayCommandIssued"]((voxaEvent: IVoxaEvent) => {
    const token = JSON.parse(voxaEvent.rawEvent.context.AudioPlayer.token);
    const shuffle = token.shuffle;
    const loop = token.loop;
    const index = token.index;
    const metadata = token.metadata;
    const offsetInMilliseconds =
      voxaEvent.rawEvent.context.AudioPlayer.offsetInMilliseconds;
    const url = token.url;

    const newToken = createToken(index, shuffle, loop, url, metadata);

    const playAudio = {
      audioItem: {
          metadata,
          stream: {
              offsetInMilliseconds,
              token: newToken,
              url,
          },
      },
      playBehavior: "REPLACE_ALL",
      type: "AudioPlayer.Play",
    };

    const reply = {
      response: {
        directives: [playAudio],
      },
      sessionAttributes: {},
      version: "1.0"
    };

    return reply;
  });

  voxaApp.onState("PlayMetronome", (voxaEvent: IVoxaEvent) => {
    const model = voxaEvent.model as MusicTempoModel;
    const url = clickTrackURLTemplate.replace("{bpm}", model.BPM);
    const index = 0;
    const shuffle = 0;
    const loop = 0;
    const metadata = {
      art: {
        sources: [
          {
            url: model.albumCover
          }
        ]
      },
      subtitle: `${model.Song} - ${model.Artist}`,
      title: `${model.BPM} BPM`
    };
    const token = createToken(index, shuffle, loop, url, metadata);
    const playAudio = new PlayAudio({
      behavior: "REPLACE_ALL",
      metadata,
      offsetInMilliseconds: 0,
      token,
      url
    });

    return {
      directives: [playAudio],
      flow: "terminate",
      reply: "Metronome.PlayAudio"
    };
  });

  voxaApp.onState("PauseMetronome", {
    alexaStopAudio: true,
    reply: "Metronome.Pause",
    to: "die"
  });

  voxaApp.onIntent("ResumeIntent", (voxaEvent: IVoxaEvent) => {
    if (voxaEvent.rawEvent.context) {
      const token = JSON.parse(voxaEvent.rawEvent.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = token.loop;
      const index = token.index;
      const metadata = token.metadata;
      const offsetInMilliseconds =
        voxaEvent.rawEvent.context.AudioPlayer.offsetInMilliseconds;
      const url = token.url;

      const newToken = createToken(index, shuffle, loop, url, metadata);

      const playAudio = new PlayAudio({
        behavior: "REPLACE_ALL",
        metadata,
        offsetInMilliseconds,
        token: newToken,
        url
      });

      return { reply: "Metronome.Resume", to: "die", directives: [playAudio] };
    }

    return { to: "ExitSkill" };
  });

  voxaApp.onState("FallbackIntent", {
    alexaAPLTemplate: "APLTemplates.Instructions",
    flow: "yield",
    reply: "InvalidIntent.DidNotUnderstand",
    to: "sayBPMForSong"
  });

  voxaApp.onUnhandledState((): any => ({ to: "FallbackIntent" }));

  function createToken(
    index: number,
    shuffle: number,
    loop: number,
    url: string,
    metadata: object
  ) {
    return JSON.stringify({ index, shuffle, loop, url, metadata });
  }
}
