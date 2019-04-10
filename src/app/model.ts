import * as _ from "lodash";
import * as SpotifyWebApi from "spotify-web-api-node";
import * as config from "../config/index";

interface IFoundSongs {
  trackId: string,
  name: string,
  artist: string,
  album: string,
};

export default class Model {
  public static deserialize(data: any, voxaEvent: any): Promise<Model> | Model {
    return new this(data);
  }

  public spotifyApi: any;
  public BPM: number;
  public Song: string;
  public Artist: string;
  public Album: string;
  public SpotifyAccessToken: string;
  public SpotifyAccessTokenExpireTime: number;
  public foundSongs: IFoundSongs[] = [];
  public nextSongIndex: number;

  constructor(data: any = {}) {
    _.assign(this, data);
    this.spotifyApi = new SpotifyWebApi({
      clientId: config.spotify.clientId,
      clientSecret: config.spotify.clientSecret
    });
  }

  public serialize(): any | Promise<any> {
    return _.omit(this, ["room"]);
  }

  public get haveMoreSongs(): boolean {
    return (this.foundSongs.length > 0 && this.foundSongs.length > this.nextSongIndex);
  }

  public async getQueryResult(query: string) {
    await this.setSpotifyCredentials();

    const searchTracksResponse = await this.spotifyApi.searchTracks(query, { limit: 3 });

    if (searchTracksResponse.error || !searchTracksResponse.body.tracks.items.length) {
      return { notFound: true };
    }

    this.foundSongs = searchTracksResponse.body.tracks.items.map(item => ({
      album: item.album.name,
      artist: item.artists[0].name,
      name: item.name,
      trackId: item.id
    }));
    this.nextSongIndex = 1;

    const trackId = this.foundSongs[0].trackId;
    const song = this.foundSongs[0].name;
    const artist = this.foundSongs[0].artist;
    const album = this.foundSongs[0].album;

    const audioFeaturesResponse = await this.spotifyApi.getAudioFeaturesForTrack(trackId);

    if (audioFeaturesResponse.error) {
      return { notFound: true };
    }

    const tempo = Math.floor(audioFeaturesResponse.body.tempo);

    this.BPM = tempo;
    this.Song = song;
    this.Artist = artist;
    this.Album = album;

    return {
      album,
      artist,
      song,
      tempo
    };
  }

  public async setNextSongInfo() {
    await this.setSpotifyCredentials();

    const trackId = this.foundSongs[this.nextSongIndex].trackId;
    const song = this.foundSongs[this.nextSongIndex].name;
    const artist = this.foundSongs[this.nextSongIndex].artist;
    const album = this.foundSongs[this.nextSongIndex].album;

    const audioFeaturesResponse = await this.spotifyApi.getAudioFeaturesForTrack(trackId);

    // TODO: see what I can do if an error happens

    const tempo = Math.floor(audioFeaturesResponse.body.tempo);

    this.BPM = tempo;
    this.Song = song;
    this.Artist = artist;
    this.Album = album;
    this.nextSongIndex = this.nextSongIndex + 1;
  }

  public getCurrentSongTempo(): number {
    return this.BPM;
  }

  private async setSpotifyCredentials() {
    if (!this.hasValidSpotifyAccessToken()) {
      const credentialResponse = await this.spotifyApi.clientCredentialsGrant();
      const { access_token, expires_in } = credentialResponse.body;
      this.SpotifyAccessToken = access_token;
      this.SpotifyAccessTokenExpireTime = new Date().getTime() + expires_in;
    }

    this.spotifyApi.setAccessToken(this.SpotifyAccessToken);
  }

  private hasValidSpotifyAccessToken(): boolean {
    return (
      !!(this.SpotifyAccessTokenExpireTime &&
      this.SpotifyAccessTokenExpireTime > new Date().getTime())
    );
  }
}
