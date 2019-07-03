import * as mime from "alexa-mime";
import * as _ from "lodash";
import * as path from "path";
import * as simple from "simple-mock";
import * as SpotifyWebApi from "spotify-web-api-node";
import * as skill from "../src/app";
import views from "../src/app/views";

const searchToldYouSoTrackResponse = {
  body: {
    tracks: {
      items: [
        {
          album: {
            images: [
              {
                url: "",
              },
              {
                url: "",
              }
            ],
            name: "Told You So"
          },
          artists: [
            {
              name: "HRVY"
            }
          ],
          id: "F8CXsfJIi2kH81Wv",
          name: "Told You So",
        },
        {
          album: {
            images: [
              {
                url: "",
              },
              {
                url: "",
              }
            ],
            name: "After Laughter"
          },
          artists: [
            {
              name: "Paramore"
            }
          ],
          id: "uGIrfb6xaak3c9cf",
          name: "Told You So",
        },
        {
          album: {
            images: [
              {
                url: "",
              },
              {
                url: "",
              }
            ],
            name: "Veni Vidi Vicious"
          },
          artists: [
            {
              name: "The Hives"
            }
          ],
          id: "qQX0b96b9DC5vC0Z",
          name: "Hate To Say I Told You So",
        },
      ]
    }
  }
};

const tempoToldYouSoResponse = (id) => {
  let tempo;

  switch (id) {
    case "F8CXsfJIi2kH81Wv":
      tempo = 99;
      break;
    case "uGIrfb6xaak3c9cf":
      tempo = 123;
      break;
    case "qQX0b96b9DC5vC0Z":
      tempo = 135;
      break;
    default:
      tempo = 123;
      break;
  }

  return { body: { tempo } };
}

const describeWrapper = {
  clear: () => {
    simple.restore();
  },
  mockInvalidTempoSong: () => {
    simple.mock(SpotifyWebApi.prototype, "clientCredentialsGrant").resolveWith({
      body: {
        access_token: "HHqyaoTPZULsxoxD",
        expires_in: 3000000000,
      }
    });
    simple.mock(SpotifyWebApi.prototype, "setAccessToken").resolveWith({});
    simple.mock(SpotifyWebApi.prototype, "searchTracks").resolveWith({
      body: {
        tracks: {
          items: [
            {
              album: {
                images: [
                  {
                    url: "",
                  },
                  {
                    url: "",
                  }
                ],
                name: "Ultimate Album",
              },
              artists: [
                {
                  name: "Some crazy band"
                }
              ],
              id: "F8CXsfJIi2kH81Wv",
              name: "A Very Fast Song",
            },
          ],
        }
      }
    });
    simple.mock(SpotifyWebApi.prototype, "getAudioFeaturesForTrack").resolveWith({
      body: {
        tempo: 200
      }
    });
  },
  mockNotFoundSong: () => {
    simple.mock(SpotifyWebApi.prototype, "clientCredentialsGrant").resolveWith({
      body: {
        access_token: "HHqyaoTPZULsxoxD",
        expires_in: 3000000000,
      }
    });
    simple.mock(SpotifyWebApi.prototype, "setAccessToken").resolveWith({});
    simple.mock(SpotifyWebApi.prototype, "searchTracks").resolveWith({
      body: {
        tracks: {
          items: [],
        }
      }
    });
  },
  mockSpotifyApiForToldYouSo: () => {
    simple.mock(SpotifyWebApi.prototype, "clientCredentialsGrant").resolveWith({
      body: {
        access_token: "HHqyaoTPZULsxoxD",
        expires_in: 3000000000,
      }
    });
    simple.mock(SpotifyWebApi.prototype, "setAccessToken").resolveWith({});
    simple.mock(SpotifyWebApi.prototype, "searchTracks").resolveWith(searchToldYouSoTrackResponse);
    simple.mock(SpotifyWebApi.prototype, "getAudioFeaturesForTrack").callFn(tempoToldYouSoResponse);
  }
};

mime(
  skill,
  views.en.translation,
  path.join(__dirname, "use-cases"),
  path.join(__dirname, "..", "reports", "simulate"),
  describeWrapper
);
