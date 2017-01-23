'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var classnames = require('classnames');
var shuffle = require('shuffle-array');

var CLAudioPlayer = React.createClass({
  displayName: 'CLAudioPlayer',

  propTypes: {
    songs: React.PropTypes.array.isRequired,
    autoplay: React.PropTypes.bool
  },

  getInitialState: function getInitialState() {
    return {
      active: this.props.songs[0],
      songs: this.props.songs,
      current: 0,
      progress: 0,
      random: false,
      playing: !!this.props.autoplay,
      repeat: false,
      mute: false
    };
  },

  componentDidMount: function componentDidMount() {
    var self = this;
    self.audio = document.createElement('audio');
    this.audio.addEventListener('error', self.error);
    document.body.appendChild(self.audio);
    self.audio.src = self.state.active.url;
    self.audio.autoplay = !!this.props.autoplay;

    this.audio.addEventListener('timeupdate', self.updateProgress);
    this.audio.addEventListener('ended', self.next);
  },

  updateProgress: function updateProgress() {
    var duration = this.audio.duration;
    var currentTime = this.audio.currentTime;
    var progress = currentTime * 100 / duration;

    this.setState({
      progress: progress
    });
  },

  setProgress: function setProgress(e) {
    var target = e.target.nodeName === 'SPAN' ? e.target.parentNode : e.target;
    var width = target.clientWidth;
    var rect = target.getBoundingClientRect();
    var offsetX = e.clientX - rect.left;
    var duration = this.audio.duration;
    var currentTime = duration * offsetX / width;
    var progress = currentTime * 100 / duration;

    this.audio.currentTime = currentTime;

    this.setState({
      progress: progress
    });

    this.play();
  },

  play: function play() {
    this.setState({
      playing: true
    });

    this.audio.play();
  },

  pause: function pause() {
    this.setState({
      playing: false
    });

    this.audio.pause();
  },

  toggle: function toggle() {
    this.state.playing ? this.pause() : this.play();
  },

  next: function next() {
    var total = this.state.songs.length;
    var current = this.state.repeat ? this.state.current : this.state.current < total - 1 ? this.state.current + 1 : 0;
    var active = this.state.songs[current];

    this.setState({
      current: current,
      active: active,
      progress: 0,
      repeat: false
    });

    this.audio.src = active.url;
    this.play();
  },

  error: function error() {
    this.props.handleAudioError();
  },

  previous: function previous() {
    var total = this.state.songs.length;
    var current = this.state.current > 0 ? this.state.current - 1 : total - 1;
    var active = this.state.songs[current];

    this.setState({
      current: current,
      active: active,
      progress: 0
    });

    this.audio.src = active.url;
    this.play();
  },

  randomize: function randomize() {
    var s = shuffle(this.props.songs.slice());

    this.setState({
      songs: !this.state.random ? s : this.props.songs,
      random: !this.state.random
    });
  },

  repeat: function repeat() {
    this.setState({
      repeat: !this.state.repeat
    });
  },

  toggleMute: function toggleMute() {
    var mute = this.state.mute;

    this.setState({
      mute: !mute
    });

    this.audio.volume = mute ? 1 : 0;
  },

  render: function render() {

    var coverClass = classnames({
      'player-cover': true,
      'no-height': !!!this.state.active.cover
    });

    var playPauseClass = classnames({
      'fa': true,
      'fa-play': !this.state.playing,
      'fa-pause': this.state.playing
    });

    var volumeClass = classnames({
      'fa': true,
      'fa-volume-up': !this.state.mute,
      'fa-volume-off': this.state.mute
    });

    var randomClass = classnames({
      'player-btn small random': true,
      'active': this.state.random
    });

    var repeatClass = classnames({
      'player-btn small repeat': true,
      'active': this.state.repeat
    });

    var song = this.state.active;

    return React.createElement(
      'div',
      { className: 'player-container' },
      React.createElement('div', { className: coverClass, style: { backgroundImage: 'url(' + (song.cover || '') + ')' } }),
      React.createElement(
        'div',
        { className: 'artist-info' },
        React.createElement(
          'h2',
          { className: 'artist-name' },
          song.artist.name
        ),
        React.createElement(
          'h3',
          { className: 'artist-song-name' },
          song.artist.song
        )
      ),
      React.createElement(
        'div',
        { className: 'player-progress-container', onClick: this.setProgress },
        React.createElement('span', { className: 'player-progress-value', style: { width: this.state.progress + '%' } })
      ),
      React.createElement(
        'div',
        { className: 'player-options' },
        React.createElement(
          'div',
          { className: 'player-buttons player-controls' },
          React.createElement(
            'button',
            {
              onClick: this.toggle,
              className: 'player-btn big',
              title: 'Play/Pause'
            },
            React.createElement('i', { className: playPauseClass })
          ),
          React.createElement(
            'button',
            {
              onClick: this.previous,
              className: 'player-btn medium',
              title: 'Previous Song'
            },
            React.createElement('i', { className: 'fa fa-backward' })
          ),
          React.createElement(
            'button',
            {
              onClick: this.next,
              className: 'player-btn medium',
              title: 'Next Song'
            },
            React.createElement('i', { className: 'fa fa-forward' })
          )
        ),
        React.createElement(
          'div',
          { className: 'player-buttons' },
          React.createElement(
            'button',
            {
              className: 'player-btn small volume',
              onClick: this.toggleMute,
              title: 'Mute/Unmute'
            },
            React.createElement('i', { className: volumeClass })
          ),
          React.createElement(
            'button',
            {
              className: repeatClass,
              onClick: this.repeat,
              title: 'Repeat'
            },
            React.createElement('i', { className: 'fa fa-repeat' })
          ),
          React.createElement(
            'button',
            {
              className: randomClass,
              onClick: this.randomize,
              title: 'Shuffle'
            },
            React.createElement('i', { className: 'fa fa-random' })
          )
        )
      )
    );
  }

});

module.exports = CLAudioPlayer;
