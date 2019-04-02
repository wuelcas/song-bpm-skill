const views = {
  en: {
    translation: {
      Launch: {
        StartResponse: {
          say: ["What's the name of the song you like to know the BPM from?"],
          reprompt: ["What's the name of the song you like to know the BPM from?"],
          card: {
            type: "Standard",
            title: "Song BPM",
            text: "What's the name of the song you like to know the BPM from?"
          }
        }
      },
      SongInfo: {
        TempoResponse: {
          say:
            '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}". Try with another song',
          card: {
            type: "Standard",
            title: "Song BPM",
            text:
              '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}"'
          }
        },
        TempoResponseAndMetronomeInvitation: {
          say:
            '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}". Would you like to start a metronome at that tempo?',
          card: {
            type: "Standard",
            title: "Song BPM",
            text:
              '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}"'
          }
        },
        NotFoundResponse: {
          say: "I couldn't find that song. Try again",
          reprompt: "I couldn't find that song. Try again",
          card: {
            type: "Standard",
            title: "Song BPM",
            text: "I couldn't find that song. Try again"
          }
        },
        RepeatBPMOfTheSong: {
          say:
            '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}". Try with another song',
          reprompt:
            '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}". Try with another song',
          card: {
            type: "Standard",
            title: "Song BPM",
            text:
              '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}"'
          }
        },
        YouHaveNotSearchAnySong: {
          say:
            "You haven't search for any song. Try saying the name of the song with it's artist's name. You can specify the name of the album too.",
          reprompt:
            "You haven't search for any song. Try saying the name of the song with it's artist's name. You can specify the name of the album too.",
          card: {
            type: "Standard",
            title: "Song BPM",
            text:
              "You haven't search for any song. Try saying the name of the song with it's artist's name. You can specify the name of the album too."
          }
        }
      },
      Help: {
        InstructionsMessage: {
          say:
            "It's simple. Say the name of the song and I'll tell you the BPM. You can also specify the name of the artist and the album. " +
            "What's the name of the song you like to know the BPM from?",
          reprompt: "What's the name of the song you like to know the BPM from?",
          card: {
            type: "Standard",
            title: "Song BPM",
            text:
              "Say the name of the song and I'll tell you the BPM. You can also specify the name of the artist and the album."
          }
        },
        InviteToAskForAnotherSong: {
          say: "Ok. Try again with another song."
        }
      },
      Exit: {
        GoodbyeMessage: {
          say: "Ok, Goodbye"
        }
      },
      Metronome: {
        PlayAudio: {
          say: "Here you go."
        },
        Pause: {
          say:
            "Ok. You can come back to listen to the metronome any time. Just say: Alexa, resume. Or, Alexa, continue."
        },
        Resume: {
          say: "Excellent!. Let's continue."
        }
      },
      InvalidIntent: {
        InMetronome: {
          say:
            "I didn't understand what you said. Would you like start a metronome at {BPM} BPM?",
          reprompt: "Would you like start a metronomeat at {BPM} BPM?"
        }
      }
    }
  }
};

export default views;
