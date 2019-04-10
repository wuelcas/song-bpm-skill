// tslint:disable:object-literal-sort-keys

const views = {
  en: {
    translation: {
      Exit: {
        GoodbyeMessage: {
          say: "Ok, Goodbye"
        }
      },
      Help: {
        InstructionsMessage: {
          card: {
            text:
              "Say the name of the song and I'll tell you the BPM. You can also specify the name of the artist and the album.",
            title: "Song BPM",
            type: "Standard",
          },
          reprompt: "What's the name of the song you like to know the BPM from?",
          say:
            "It's simple. Say the name of the song and I'll tell you the BPM. You can also specify the name of the artist and the album. " +
            "What's the name of the song you like to know the BPM from?",
        },
        InviteToAskForAnotherSong: {
          say: "Ok. Try again with another song."
        }
      },
      Launch: {
        StartResponse: {
          card: {
            text: "What's the name of the song you like to know the BPM from?",
            title: "Song BPM",
            type: "Standard"
          },
          reprompt: ["What's the name of the song you like to know the BPM from?"],
          say: ["What's the name of the song you like to know the BPM from?"]
        }
      },
      Metronome: {
        Pause: {
          say:
            "Ok. You can come back to listen to the metronome any time. Just say: Alexa, resume. Or, Alexa, continue."
        },
        PlayAudio: {
          say: "Here you go."
        },
        Resume: {
          say: "Excellent!. Let's continue."
        }
      },
      InvalidIntent: {
        InMetronome: {
          reprompt: "Would you like to start a metronomeat at {BPM} BPM?",
          say:
            "I didn't understand what you said. Would you like to start a metronome at {BPM} BPM?",
        }
      },
      SongInfo: {
        MetronomeInvitation: {
          card: {
            text:
              '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}"',
            title: "Song BPM",
            type: "Standard",
          },
          say: "Would you like to start a metronome at that tempo?",
        },
        NotFoundResponse: {
          card: {
            text: "I'm sorry, I couldn't find the song you were looking for. You can specify the artist and the album for better accuracy. You can say it like: '{Song}', by '{Artist}', from the album '{Album}'. Do you want to try with another song?",
            title: "Song BPM",
            type: "Standard",
          },
          reprompt: "Do you want to try with another song?",
          say: "I'm sorry, I couldn't find the song you were looking for. You can specify the artist and the album for better accuracy. You can say it like: '{Song}', by '{Artist}', from the album '{Album}'. Do you want to try with another song?"
        },
        RepeatBPMOfTheSong: {
          card: {
            text:
              '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}"',
            title: "Song BPM",
            type: "Standard",
          },
          reprompt:
            '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}". Try with another song',
          say:
            '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}". Try with another song',
        },
        SayAnotherSong: {
          say: "Say the name of the song and I'll search it. What song do you want?"
        },
        SorryIDidNotGuessTryAgain: {
          say:
            "I'm sorry, I couldn't find the song you were looking for. You can specify the artist and the album for better accuracy. You can say it like: '{Song}', by '{Artist}', from the album '{Album}'. Do you want to try with another song?"
        },
        TempoResponse: {
          card: {
            text:
              '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}"',
            title: "Song BPM",
            type: "Standard"
          },
          say:
            '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}". Was that the song you want it?'
        },
        YouHaveNotSearchAnySong: {
          card: {
            text:
            "You haven't search for any song. Try saying the name of the song with it's artist's name. You can specify the name of the album too.",
            title: "Song BPM",
            type: "Standard",
          },
          reprompt:
            "You haven't search for any song. Try saying the name of the song with it's artist's name. You can specify the name of the album too.",
          say:
            "You haven't search for any song. Try saying the name of the song with it's artist's name. You can specify the name of the album too.",
        }
      },
    }
  }
};

export default views;
