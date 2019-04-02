import { IVoxaEvent } from "voxa";

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
