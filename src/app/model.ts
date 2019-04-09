import * as _ from "lodash";
import * as SpotifyWebApi from "spotify-web-api-node";
import * as config from "../config/index";

const spotifyApi = new SpotifyWebApi({
  clientId: config.spotify.clientId,
  clientSecret: config.spotify.clientSecret
});

export default class Model {
  public static deserialize(data: any, voxaEvent: any): Promise<Model> | Model {
    return new this(data);
  }

  public BPM: number;
  public Song: string;
  public Artist: string;
  public Album: string;
  public SpotifyAccessToken: string;
  public SpotifyAccessTokenExpireTime: number;

  constructor(data: any = {}) {
    _.assign(this, data);
  }

  public serialize(): any | Promise<any> {
    return _.omit(this, ["room"]);
  }

  public async getQueryResult(query: string) {
    if (!this.hasValidSpotifyAccessToken()) {
      const credentialResponse = await spotifyApi.clientCredentialsGrant();
      const { access_token, expires_in } = credentialResponse.body;
      this.SpotifyAccessToken = access_token;
      this.SpotifyAccessTokenExpireTime = new Date().getTime() + expires_in;
    }

    spotifyApi.setAccessToken(this.SpotifyAccessToken);

    const searchTracksResponse = await spotifyApi.searchTracks(query, { limit: 1 });

    if (searchTracksResponse.error || !searchTracksResponse.body.tracks.items.length) {
      return { notFound: true };
    }

    const trackId = searchTracksResponse.body.tracks.items[0].id;
    const song = searchTracksResponse.body.tracks.items[0].name;
    const artist = searchTracksResponse.body.tracks.items[0].artists[0].name;
    const album = searchTracksResponse.body.tracks.items[0].album.name;

    const audioFeaturesResponse = await spotifyApi.getAudioFeaturesForTrack(trackId);

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

  private hasValidSpotifyAccessToken(): boolean {
    return (
      !!(this.SpotifyAccessTokenExpireTime &&
      this.SpotifyAccessTokenExpireTime > new Date().getTime())
    );
  }
}
