'use strict';

const views = (function views() {
  return {
    Launch: {
      StartResponse: {
        ask: 'What\'s the name of the song you like to know the BPM from?',
        reprompt: 'What\'s the name of the song you like to know the BPM from?',
        card: {
          type: 'Standard',
          title: 'Song BPM',
          text: 'What\'s the name of the song you like to know the BPM from?',
        },
      },
    },
    SongInfo: {
      TempoResponse: {
        ask: '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}". Would you like to start a metronome at that tempo?',
        card: {
          type: 'Standard',
          title: 'Song BPM',
          text: '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}"',
        },
      },
      NotFoundResponse: {
        ask: 'I couldn\'t find that song. Try again',
        reprompt: 'I couldn\'t find that song. Try again',
        card: {
          type: 'Standard',
          title: 'Song BPM',
          text: 'I couldn\'t find that song. Try again',
        },
      },
      RepeatBPMOfTheSong: {
        ask: '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}". Try with another song',
        reprompt: '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}". Try with another song',
        card: {
          type: 'Standard',
          title: 'Song BPM',
          text: '{BPM} BPM is the tempo for "{Song}", by "{Artist}", from the album "{Album}"',
        },
      },
      YouHaveNotSearchAnySong: {
        ask: 'You haven\'t search for any song. Try saying the name of the song with it\'s artist\'s name. You can specify the name of the album too.',
        reprompt: 'You haven\'t search for any song. Try saying the name of the song with it\'s artist\'s name. You can specify the name of the album too.',
        card: {
          type: 'Standard',
          title: 'Song BPM',
          text: 'You haven\'t search for any song. Try saying the name of the song with it\'s artist\'s name. You can specify the name of the album too.',
        },
      },
    },
    Help: {
      InstructionsMessage: {
        ask: 'It\'s simple. Say the name of the song and I\'ll tell you the BPM. You can also specify the name of the artist and the album. ' +
        'What\'s the name of the song you like to know the BPM from?',
        reprompt: 'What\'s the name of the song you like to know the BPM from?',
        card: {
          type: 'Standard',
          title: 'Song BPM',
          text: 'Say the name of the song and I\'ll tell you the BPM. You can also specify the name of the artist and the album.',
        },
      },
      InviteToAskForAnotherSong: {
        tell: 'Ok. Try again with another song.',
      },
    },
    Exit: {
      GoodbyeMessage: {
        say: 'Ok, Goodbye',
      },
    },
    Metronome: {
      PlayAudio: {
        tell: 'Here you go.',
      },
      Pause: {
        tell: 'Ok. You can come back to listen to the metronome any time. Just say: Alexa, resume. Or, Alexa, continue.',
      },
      Resume: {
        tell: 'Excellent!. Let\'s continue.',
      },
    },
  };
}());
module.exports = views;
