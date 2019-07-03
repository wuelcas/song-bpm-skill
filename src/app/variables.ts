import { IVoxaEvent } from "voxa";
import * as config from "../config";
import Instructions from "./APLTemplates/Instructions";
import SongInfo from "./APLTemplates/SongInfo";

export function Artist(voxaEvent: IVoxaEvent) {
  return voxaEvent.model.Artist;
}
export function Song(voxaEvent: IVoxaEvent) {
  return voxaEvent.model.Song;
}
export function Album(voxaEvent: IVoxaEvent) {
  return voxaEvent.model.Album;
}
export function BPM(voxaEvent: IVoxaEvent) {
  return voxaEvent.model.BPM;
}

export function SongInfoTemplate(voxaEvent: IVoxaEvent) {
  SongInfo.data.data.backgroundImage = config.APL.backgroundImage;
  SongInfo.data.data.logoUrl = config.APL.logoUrl;

  SongInfo.data.data.textContent.song.text = voxaEvent.model.Song;
  SongInfo.data.data.textContent.artist.text = voxaEvent.model.Artist;
  SongInfo.data.data.textContent.tempo.text = voxaEvent.model.BPM;
  SongInfo.data.data.textContent.album.text = voxaEvent.model.Album;
  SongInfo.data.data.albumCover = voxaEvent.model.albumCover;

  return {
    datasources: SongInfo.data,
    document: SongInfo.document,
    token: "MusicTempoToken",
    type: "Alexa.Presentation.APL.RenderDocument"
  };
}

export function InstructionsTemplate() {
  Instructions.data.data.backgroundImage = config.APL.backgroundImage;
  Instructions.data.data.logoUrl = config.APL.logoUrl;

  return {
    datasources: Instructions.data,
    document: Instructions.document,
    token: "MusicTempoToken",
    type: "Alexa.Presentation.APL.RenderDocument"
  };
}
