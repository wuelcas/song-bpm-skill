import { IVoxaEvent } from "voxa";
import * as data from "./APLTemplates/data.json";
import * as document from "./APLTemplates/document.json";

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
  data.data.textContent.song.text = voxaEvent.model.Song;
  data.data.textContent.artist.text = voxaEvent.model.Artist;
  data.data.textContent.tempo.text = voxaEvent.model.BPM;
  data.data.textContent.album.text = voxaEvent.model.Album;
  data.data.albumCover = voxaEvent.model.albumCover;

  return {
    datasources: data,
    document,
    token: "MusicTempoToken",
    type: "Alexa.Presentation.APL.RenderDocument"
  };
}
