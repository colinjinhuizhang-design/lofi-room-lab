const AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/wave"];

const CHORD_GRAPH = [
  { degree: 0, type: "min9", next: [1, 2, 3] },
  { degree: 5, type: "maj7", next: [2, 3, 0] },
  { degree: 3, type: "maj7", next: [3, 0, 1] },
  { degree: 4, type: "min7", next: [0, 2, 1] },
  { degree: 2, type: "min7", next: [1, 3, 0] },
];

const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

const CHORD_INTERVALS = {
  min7: [0, 3, 7, 10],
  min9: [0, 3, 7, 10, 14],
  maj7: [0, 4, 7, 11],
  add9: [0, 4, 7, 14],
};

const PRESET_ROOTS = {
  "late-night": 48,
  "tokyo-walk": 50,
  "boom-room": 43,
  "neon-house": 45,
};

class AudioStudioEngine {
  constructor() {
    this.decodeContext = null;
  }

  isSupportedFile(file) {
    if (!file) {
      return false;
    }

    return AUDIO_TYPES.includes(file.type) || /\.(mp3|wav)$/i.test(file.name);
  }

  async decodeFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    return decodeAudioData(this.getDecodeContext(), arrayBuffer);
  }

  createDemoAsset() {
    const buffer = createDemoTrackBuffer(0, 16);
    const blob = encodeWav(buffer);

    return {
      blob,
      buffer,
      file: {
        name: "demo-source.wav",
        size: blob.size,
        type: "audio/wav",
      },
    };
  }

  createDemoSourceBuffer(startSeconds = 0, durationSeconds = 16) {
    return createDemoTrackBuffer(startSeconds, durationSeconds);
  }

  async renderPreview(sourceBuffer, session) {
    const clip = sliceAudioBuffer(
      sourceBuffer,
      session.previewWindow.start,
      session.previewWindow.duration,
    );
    return this.renderProcessedBuffer(clip, session);
  }

  async renderFull(sourceBuffer, session) {
    return this.renderProcessedBuffer(sourceBuffer, session);
  }

  encodePreview(buffer) {
    return encodeWav(buffer);
  }

  encodeDownload(buffer) {
    if (window.lamejs) {
      return {
        blob: encodeMp3(buffer),
        extension: "mp3",
        label: "MP3",
      };
    }

    return {
      blob: encodeWav(buffer),
      extension: "wav",
      label: "WAV",
    };
  }

  createWaveformPeaks(audioBuffer, bars = 96) {
    const channel = audioBuffer.getChannelData(0);
    const blockSize = Math.max(1, Math.floor(channel.length / bars));
    const peaks = [];

    for (let bar = 0; bar < bars; bar += 1) {
      const start = bar * blockSize;
      const end = Math.min(channel.length, start + blockSize);
      let peak = 0;

      for (let index = start; index < end; index += 1) {
        peak = Math.max(peak, Math.abs(channel[index]));
      }

      peaks.push(peak);
    }

    return peaks;
  }

  dispose() {
    this.decodeContext?.close();
    this.decodeContext = null;
  }

  getDecodeContext() {
    if (!this.decodeContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.decodeContext = new AudioContextClass();
    }

    return this.decodeContext;
  }

  async renderProcessedBuffer(sourceBuffer, session) {
    const rendered =
      session.mode === "lofi"
        ? await renderLofiVersion(sourceBuffer, session)
        : await renderRemixVersion(sourceBuffer, session);

    return normalizeAudioBuffer(rendered, 0.92);
  }
}

async function renderLofiVersion(sourceBuffer, session) {
  const sampleRate = sourceBuffer.sampleRate;
  const channels = Math.min(2, sourceBuffer.numberOfChannels || 1);
  const tail = 2.2;
  const renderDuration = sourceBuffer.duration + tail;
  const context = new OfflineAudioContext(
    channels,
    Math.ceil(renderDuration * sampleRate),
    sampleRate,
  );

  const masterBus = context.createGain();
  const reverbSend = context.createGain();
  const reverb = context.createConvolver();
  reverb.buffer = createImpulseResponse(
    context,
    1.4 + session.fx.reverb * 0.016,
    2.2,
  );
  const reverbGain = context.createGain();
  reverbGain.gain.value = mixValue(session.fx.reverb, 0.04, 0.28);

  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 12;
  compressor.ratio.value = 3.4;
  compressor.attack.value = 0.01;
  compressor.release.value = 0.24;

  const outputGain = context.createGain();
  outputGain.gain.value = mixValue(session.mixer.master, 0.82, 1.2);

  reverbSend.connect(reverb);
  reverb.connect(reverbGain);
  reverbGain.connect(masterBus);
  masterBus.connect(compressor);
  compressor.connect(outputGain);
  outputGain.connect(context.destination);

  scheduleUploadedLofiTrack(context, sourceBuffer, session, masterBus, reverbSend);
  scheduleBandLayer(context, sourceBuffer.duration, session, masterBus, reverbSend, false);
  scheduleAmbience(context, sourceBuffer.duration + tail, session, masterBus, false);

  const rendered = await context.startRendering();
  return trimAudioBuffer(rendered, sourceBuffer.duration + tail * 0.65);
}

async function renderRemixVersion(sourceBuffer, session) {
  const stretchedBuffer = createTempoStretchedBuffer(sourceBuffer, tempoRatio(session));
  const sampleRate = stretchedBuffer.sampleRate;
  const channels = Math.min(2, stretchedBuffer.numberOfChannels || 1);
  const tail = 0.9;
  const renderDuration = stretchedBuffer.duration + tail;
  const context = new OfflineAudioContext(
    channels,
    Math.ceil(renderDuration * sampleRate),
    sampleRate,
  );

  const masterBus = context.createGain();
  const sendDelay = context.createGain();
  const delay = context.createDelay(1.5);
  delay.delayTime.value = 60 / session.beat.tempo / 2;
  const delayFeedback = context.createGain();
  delayFeedback.gain.value = mixValue(session.fx.reverb, 0.04, 0.18);
  const delayFilter = context.createBiquadFilter();
  delayFilter.type = "lowpass";
  delayFilter.frequency.value = mixValue(session.fx.eq, 2200, 5200);
  const delayWet = context.createGain();
  delayWet.gain.value = mixValue(session.fx.reverb, 0.04, 0.22);

  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.knee.value = 12;
  compressor.ratio.value = 4.6;
  compressor.attack.value = 0.006;
  compressor.release.value = 0.22;

  const outputGain = context.createGain();
  outputGain.gain.value = mixValue(session.mixer.master, 0.84, 1.16);

  sendDelay.connect(delay);
  delay.connect(delayFilter);
  delayFilter.connect(delayWet);
  delayWet.connect(masterBus);
  delayFilter.connect(delayFeedback);
  delayFeedback.connect(delay);
  masterBus.connect(compressor);
  compressor.connect(outputGain);
  outputGain.connect(context.destination);

  scheduleUploadedRemixTrack(context, stretchedBuffer, session, masterBus, sendDelay);
  scheduleBandLayer(context, stretchedBuffer.duration, session, masterBus, sendDelay, true);
  scheduleAmbience(context, renderDuration, session, masterBus, true);
  applyPumpEnvelope(masterBus.gain, stretchedBuffer.duration, session.beat.tempo, mixValue(session.beat.intensity, 0.04, 0.18));

  const rendered = await context.startRendering();
  return trimAudioBuffer(rendered, renderDuration);
}

function scheduleUploadedLofiTrack(context, sourceBuffer, session, destination, reverbSend) {
  const textureBuffer = createTextureBuffer(context, sourceBuffer, session.fx.dust, session.fx.saturation);
  const source = context.createBufferSource();
  source.buffer = textureBuffer;

  const wowDelay = context.createDelay(0.05);
  wowDelay.delayTime.value = mixValue(session.fx.wobble, 0.0018, 0.0085);
  const wowLfo = context.createOscillator();
  wowLfo.type = "sine";
  wowLfo.frequency.value = mixValue(session.fx.wobble, 0.18, 1.2);
  const wowDepth = context.createGain();
  wowDepth.gain.value = mixValue(session.fx.wobble, 0.00018, 0.0024);

  const flutter = context.createOscillator();
  flutter.type = "triangle";
  flutter.frequency.value = mixValue(session.fx.wobble, 2.1, 7.4);
  const flutterDepth = context.createGain();
  flutterDepth.gain.value = mixValue(session.fx.wobble, 0.00005, 0.00072);

  const lowpass = context.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = mixValue(session.fx.eq, 6200, 1700);

  const body = context.createBiquadFilter();
  body.type = "peaking";
  body.frequency.value = 220;
  body.Q.value = 0.85;
  body.gain.value = mixValue(session.fx.eq, 0.5, 3.2);

  const saturator = context.createWaveShaper();
  saturator.curve = createSoftClipCurve(2048, mixValue(session.fx.saturation, 1.0, 1.85));
  saturator.oversample = "2x";

  const uploadGain = context.createGain();
  uploadGain.gain.value = mixValue(session.uploadMix, 0.16, 1.14);

  const sendGain = context.createGain();
  sendGain.gain.value = mixValue(session.fx.reverb, 0.04, 0.22);

  wowLfo.connect(wowDepth);
  wowDepth.connect(wowDelay.delayTime);
  flutter.connect(flutterDepth);
  flutterDepth.connect(wowDelay.delayTime);

  source.connect(wowDelay);
  wowDelay.connect(lowpass);
  lowpass.connect(body);
  body.connect(saturator);
  saturator.connect(uploadGain);
  uploadGain.connect(destination);
  uploadGain.connect(sendGain);
  sendGain.connect(reverbSend);

  source.start(0);
  source.stop(sourceBuffer.duration);
  wowLfo.start(0);
  wowLfo.stop(sourceBuffer.duration);
  flutter.start(0);
  flutter.stop(sourceBuffer.duration);
}

function scheduleUploadedRemixTrack(context, sourceBuffer, session, destination, delaySend) {
  const source = context.createBufferSource();
  source.buffer = sourceBuffer;

  const highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 48;

  const presence = context.createBiquadFilter();
  presence.type = "peaking";
  presence.frequency.value = 2800;
  presence.Q.value = 0.88;
  presence.gain.value = mixValue(session.fx.eq, 0.8, 3.6);

  const air = context.createBiquadFilter();
  air.type = "highshelf";
  air.frequency.value = 6500;
  air.gain.value = mixValue(session.fx.eq, 0.2, 2.8);

  const saturator = context.createWaveShaper();
  saturator.curve = createSoftClipCurve(2048, mixValue(session.fx.saturation, 1.02, 1.58));
  saturator.oversample = "2x";

  const uploadGain = context.createGain();
  uploadGain.gain.value = mixValue(session.uploadMix, 0.16, 1.16);

  const sendGain = context.createGain();
  sendGain.gain.value = mixValue(session.fx.reverb, 0.04, 0.18);

  source.connect(highpass);
  highpass.connect(presence);
  presence.connect(air);
  air.connect(saturator);
  saturator.connect(uploadGain);
  uploadGain.connect(destination);
  uploadGain.connect(sendGain);
  sendGain.connect(delaySend);

  source.start(0);
  source.stop(sourceBuffer.duration);
}

function scheduleBandLayer(context, duration, session, destination, sendBus, energetic) {
  const tempo = session.beat.tempo;
  const progression = generateChordProgression(
    Math.max(4, Math.ceil(duration / ((60 / tempo) * 4))),
    session.preset,
    energetic,
  );
  const barDuration = (60 / tempo) * 4;
  const rootMidi = PRESET_ROOTS[session.preset] ?? 48;

  for (let bar = 0; bar < progression.length; bar += 1) {
    const chord = chordToMidiNotes(progression[bar], rootMidi);
    const startTime = bar * barDuration;
    if (startTime > duration) {
      break;
    }

    schedulePadChord(context, chord, startTime, barDuration * 0.96, mixValue(session.mixer.chords, 0.04, energetic ? 0.22 : 0.32), destination, sendBus, energetic);
    schedulePianoPhrase(context, chord, startTime, barDuration, tempo, mixValue(session.mixer.piano, 0.04, energetic ? 0.26 : 0.24), destination, sendBus, energetic);
    scheduleBassline(context, chord[0] - 12, startTime, barDuration, tempo, mixValue(session.mixer.chords, 0.04, energetic ? 0.3 : 0.2), destination, energetic);
  }

  const drumBuffer = createDrumTrackBuffer(
    context,
    duration + 0.2,
    tempo,
    session.beat.intensity,
    session.beat.swing,
    session.beat.style,
    energetic,
  );

  const drumSource = context.createBufferSource();
  drumSource.buffer = drumBuffer;
  const drumFilter = context.createBiquadFilter();
  drumFilter.type = energetic ? "highshelf" : "lowpass";
  drumFilter.frequency.value = energetic ? 4200 : 5200;
  if (energetic) {
    drumFilter.gain.value = 1.8;
  }
  const drumGain = context.createGain();
  drumGain.gain.value = mixValue(session.mixer.drums, 0.04, energetic ? 0.76 : 0.62);

  drumSource.connect(drumFilter);
  drumFilter.connect(drumGain);
  drumGain.connect(destination);
  drumSource.start(0);
  drumSource.stop(duration + 0.2);
}

function schedulePadChord(context, midiNotes, time, duration, level, destination, sendBus, energetic) {
  const chordGain = context.createGain();
  chordGain.gain.setValueAtTime(0.0001, time);
  chordGain.gain.linearRampToValueAtTime(level, time + 0.45);
  chordGain.gain.linearRampToValueAtTime(level * 0.82, time + duration * 0.62);
  chordGain.gain.linearRampToValueAtTime(0.0001, time + duration);

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = energetic ? 2600 : 1800;

  const sendGain = context.createGain();
  sendGain.gain.value = energetic ? 0.08 : 0.16;

  for (let noteIndex = 0; noteIndex < midiNotes.length; noteIndex += 1) {
    const note = midiNotes[noteIndex];
    const oscillator = context.createOscillator();
    oscillator.type = noteIndex % 2 === 0 ? "triangle" : "sawtooth";
    oscillator.frequency.value = midiToFrequency(note);
    oscillator.detune.value = noteIndex % 2 === 0 ? -4 : 4;
    oscillator.connect(filter);
    oscillator.start(time);
    oscillator.stop(time + duration);
  }

  filter.connect(chordGain);
  chordGain.connect(destination);
  chordGain.connect(sendGain);
  sendGain.connect(sendBus);
}

function schedulePianoPhrase(context, midiNotes, barStart, barDuration, tempo, level, destination, sendBus, energetic) {
  const beat = 60 / tempo;
  const phraseSteps = energetic
    ? [0, 0.5, 1, 1.5, 2.5, 3, 3.5]
    : [0, 1, 1.5, 2.5, 3];

  for (let index = 0; index < phraseSteps.length; index += 1) {
    const time = barStart + phraseSteps[index] * beat;
    const note = midiNotes[(index * 2) % midiNotes.length] + (index % 3 === 0 ? 12 : 0);
    schedulePluck(context, note, time, energetic ? 0.26 : 0.34, level, destination, sendBus);
  }

  schedulePluck(context, midiNotes[1] + 12, barStart + barDuration - beat * 0.65, 0.28, level * 0.82, destination, sendBus);
}

function schedulePluck(context, midiNote, time, duration, level, destination, sendBus) {
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(level, time + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 4200;

  const sendGain = context.createGain();
  sendGain.gain.value = level * 0.85;

  const main = context.createOscillator();
  main.type = "triangle";
  main.frequency.value = midiToFrequency(midiNote);

  const upper = context.createOscillator();
  upper.type = "sine";
  upper.frequency.value = midiToFrequency(midiNote + 12);

  main.connect(filter);
  upper.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  gain.connect(sendGain);
  sendGain.connect(sendBus);

  main.start(time);
  main.stop(time + duration);
  upper.start(time);
  upper.stop(time + duration * 0.9);
}

function scheduleBassline(context, midiNote, barStart, barDuration, tempo, level, destination, energetic) {
  const beat = 60 / tempo;
  const pulsePattern = energetic ? [0, 0.75, 1.5, 2.25, 3] : [0, 1, 2, 3];

  for (let index = 0; index < pulsePattern.length; index += 1) {
    const time = barStart + pulsePattern[index] * beat;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(level, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + beat * 0.58);

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = energetic ? 380 : 260;

    const oscillator = context.createOscillator();
    oscillator.type = energetic ? "sawtooth" : "triangle";
    oscillator.frequency.value = midiToFrequency(midiNote + (index % 2 === 0 ? 0 : 12));
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    oscillator.start(time);
    oscillator.stop(time + beat * 0.58);
  }
}

function scheduleAmbience(context, duration, session, destination, energetic) {
  const ambienceAmount = mixValue(session.mixer.ambience, 0, 1);
  if (ambienceAmount <= 0.01) {
    return;
  }

  const ambienceBuffer = createAmbienceBuffer(context, duration, session, energetic);
  const ambienceSource = context.createBufferSource();
  ambienceSource.buffer = ambienceBuffer;
  ambienceSource.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = energetic ? 4200 : 2600;
  const gain = context.createGain();
  gain.gain.value = ambienceAmount * 0.38;

  ambienceSource.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  ambienceSource.start(0);
  ambienceSource.stop(duration);
}

function generateChordProgression(length, preset, energetic) {
  const progression = [];
  let node = CHORD_GRAPH[preset === "neon-house" ? 1 : 0];

  for (let index = 0; index < length; index += 1) {
    progression.push(node);
    const nextPool = energetic ? [...node.next].reverse() : node.next;
    node = CHORD_GRAPH[nextPool[index % nextPool.length]];
  }

  return progression;
}

function chordToMidiNotes(chordNode, rootMidi) {
  const scaleRoot = MINOR_SCALE[chordNode.degree] ?? 0;
  const intervals = CHORD_INTERVALS[chordNode.type] ?? CHORD_INTERVALS.min7;
  return intervals.map((interval, index) => rootMidi + scaleRoot + interval + (index > 2 ? 12 : 0));
}

function createDrumTrackBuffer(context, duration, bpm, intensity, swing, style, energetic) {
  const channels = 2;
  const length = Math.ceil(duration * context.sampleRate);
  const buffer = context.createBuffer(channels, length, context.sampleRate);
  const stepDuration = (60 / bpm) / 4;
  const swingAmount = mixValue(swing, 0, stepDuration * 0.12);
  const drumIntensity = mixValue(intensity, 0.18, energetic ? 0.88 : 0.64);

  const patterns = {
    chill: {
      kick: [0, 8, 10],
      snare: [4, 12],
      hat: [0, 2, 4, 6, 8, 10, 12, 14],
      open: [15],
      ghost: [6, 13],
    },
    "boom-bap": {
      kick: [0, 7, 10, 14],
      snare: [4, 12],
      hat: [0, 2, 4, 5, 8, 10, 12, 14],
      open: [15],
      ghost: [3, 11],
    },
    house: {
      kick: [0, 4, 8, 12],
      snare: [4, 12],
      hat: [2, 6, 10, 14],
      open: [7, 15],
      ghost: [11],
    },
  };

  const pattern = patterns[style] ?? patterns.chill;

  for (let step = 0, time = 0; time < duration; step += 1, time += stepDuration) {
    const barStep = step % 16;
    const hitTime = time + (barStep % 2 === 1 ? swingAmount : 0);

    if (pattern.kick.includes(barStep)) {
      addKick(buffer, hitTime, drumIntensity * (barStep === 0 ? 1 : 0.74));
    }

    if (pattern.snare.includes(barStep)) {
      addClap(buffer, hitTime, drumIntensity * 0.48);
      addSnare(buffer, hitTime, drumIntensity * 0.38);
    }

    if (pattern.hat.includes(barStep)) {
      addHiHat(buffer, hitTime, drumIntensity * (barStep % 4 === 0 ? 0.16 : 0.11), barStep % 4 === 0 ? -0.14 : 0.14);
    }

    if (pattern.open.includes(barStep)) {
      addOpenHat(buffer, hitTime, drumIntensity * 0.18, 0.2);
    }

    if (pattern.ghost.includes(barStep)) {
      addGhostPerc(buffer, hitTime, drumIntensity * 0.08, -0.08);
    }
  }

  return buffer;
}

function createAmbienceBuffer(context, duration, session, energetic) {
  const channels = 2;
  const length = Math.ceil(duration * context.sampleRate);
  const buffer = context.createBuffer(channels, length, context.sampleRate);

  const rainAmount = mixValue(session.ambience.rain, 0, 1);
  const cafeAmount = mixValue(session.ambience.cafe, 0, 1);
  const vinylAmount = mixValue(session.ambience.noise, 0, 1);

  for (let channel = 0; channel < channels; channel += 1) {
    const data = buffer.getChannelData(channel);
    let brown = 0;
    let murmur = 0;

    for (let index = 0; index < length; index += 1) {
      const time = index / context.sampleRate;
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.035 * white) / 1.035;
      murmur = murmur * 0.97 + white * 0.03;

      const rain = brown * rainAmount * 0.44;
      const cafe =
        (Math.sin(Math.PI * 2 * 110 * time + channel * 0.2) * 0.014 +
          murmur * 0.045) *
        cafeAmount;

      let crackle = 0;
      if (Math.random() < 0.0009 + vinylAmount * 0.0016) {
        crackle = (Math.random() * 2 - 1) * (0.24 + Math.random() * 0.34);
      }

      const wowHum = Math.sin(Math.PI * 2 * (energetic ? 48 : 58) * time) * vinylAmount * 0.012;
      data[index] = rain + cafe + crackle * vinylAmount * 0.07 + wowHum;
    }
  }

  return buffer;
}

function createTextureBuffer(context, sourceBuffer, dust, saturation) {
  const channels = Math.min(2, sourceBuffer.numberOfChannels || 1);
  const output = context.createBuffer(channels, sourceBuffer.length, sourceBuffer.sampleRate);
  const holdSamples = Math.max(1, Math.round(mixValue(dust, 1, 9)));
  const bitDepth = Math.max(6, Math.round(mixValue(dust, 12, 7)));
  const quantize = 2 ** (bitDepth - 1);
  const drive = mixValue(saturation, 1.02, 1.32);

  for (let channel = 0; channel < channels; channel += 1) {
    const input = sourceBuffer.getChannelData(channel);
    const target = output.getChannelData(channel);
    let held = 0;
    let smear = 0;

    for (let index = 0; index < input.length; index += 1) {
      if (index % holdSamples === 0) {
        held = input[index];
      }

      const crushed = Math.round(held * quantize) / quantize;
      smear += (crushed - smear) * 0.32;
      target[index] = Math.tanh(smear * drive) * 0.96;
    }
  }

  return output;
}

function createTempoStretchedBuffer(sourceBuffer, speed) {
  const safeSpeed = clamp(speed, 0.72, 1.38);
  const sampleRate = sourceBuffer.sampleRate;
  const channels = sourceBuffer.numberOfChannels;
  const grainSize = Math.max(1024, Math.floor(sampleRate * 0.09));
  const hopOut = Math.max(256, Math.floor(grainSize * 0.35));
  const hopIn = Math.max(256, Math.floor(hopOut * safeSpeed));
  const outputLength = Math.max(
    grainSize,
    Math.ceil(sourceBuffer.length / safeSpeed + grainSize * 2),
  );
  const output = createAudioBuffer(channels, outputLength, sampleRate);
  const window = createHannWindow(grainSize);

  for (let channel = 0; channel < channels; channel += 1) {
    const input = sourceBuffer.getChannelData(channel);
    const target = output.getChannelData(channel);

    for (
      let inputIndex = 0, outputIndex = 0;
      inputIndex < input.length;
      inputIndex += hopIn, outputIndex += hopOut
    ) {
      for (let grainIndex = 0; grainIndex < grainSize; grainIndex += 1) {
        const sourceIndex = inputIndex + grainIndex;
        const destinationIndex = outputIndex + grainIndex;

        if (sourceIndex >= input.length || destinationIndex >= target.length) {
          break;
        }

        target[destinationIndex] += input[sourceIndex] * window[grainIndex];
      }
    }
  }

  const targetLength = Math.min(output.length, Math.ceil(sourceBuffer.length / safeSpeed));
  return trimAudioBuffer(normalizeAudioBuffer(output, 0.88), targetLength / sampleRate);
}

function tempoRatio(session) {
  const base = session.mode === "remix" ? 1.02 : 1;
  const styleBoost =
    session.beat.style === "house" ? 0.16 : session.beat.style === "boom-bap" ? -0.04 : 0;
  const userBoost = (session.beat.tempo - 92) / 160;
  return clamp(base + styleBoost + userBoost, 0.78, 1.34);
}

function addKick(buffer, time, level) {
  const sampleRate = buffer.sampleRate;
  const duration = 0.22;
  const startIndex = Math.floor(time * sampleRate);
  const length = Math.floor(duration * sampleRate);
  let phase = 0;

  for (let index = 0; index < length; index += 1) {
    const progress = index / length;
    const envelope = Math.exp(-7 * progress);
    const frequency = 150 - 105 * progress;
    phase += (Math.PI * 2 * frequency) / sampleRate;
    const sample = Math.sin(phase) * envelope * level;
    writeStereo(buffer, startIndex + index, sample, sample);
  }
}

function addSnare(buffer, time, level) {
  const sampleRate = buffer.sampleRate;
  const duration = 0.16;
  const startIndex = Math.floor(time * sampleRate);
  const length = Math.floor(duration * sampleRate);
  let phase = 0;

  for (let index = 0; index < length; index += 1) {
    const progress = index / length;
    const noise = (Math.random() * 2 - 1) * Math.exp(-12 * progress);
    const toneFrequency = 220 - 80 * progress;
    phase += (Math.PI * 2 * toneFrequency) / sampleRate;
    const tone = Math.sin(phase) * Math.exp(-18 * progress) * 0.4;
    const sample = (noise * 0.85 + tone) * level;
    writeStereo(buffer, startIndex + index, sample, sample);
  }
}

function addClap(buffer, time, level) {
  const offsets = [0, 0.014, 0.03];
  for (const offset of offsets) {
    addSnare(buffer, time + offset, level * (offset === 0 ? 0.84 : 0.46));
  }
}

function addHiHat(buffer, time, level, pan = 0) {
  const sampleRate = buffer.sampleRate;
  const duration = 0.05;
  const startIndex = Math.floor(time * sampleRate);
  const length = Math.floor(duration * sampleRate);
  const leftGain = 1 - Math.max(0, pan);
  const rightGain = 1 + Math.min(0, pan);
  let previous = 0;

  for (let index = 0; index < length; index += 1) {
    const progress = index / length;
    const envelope = Math.exp(-35 * progress);
    const white = Math.random() * 2 - 1;
    const metallic = (white - previous * 0.75) * envelope * level;
    previous = white;
    writeStereo(
      buffer,
      startIndex + index,
      metallic * leftGain,
      metallic * rightGain,
    );
  }
}

function addOpenHat(buffer, time, level, pan = 0) {
  const sampleRate = buffer.sampleRate;
  const duration = 0.18;
  const startIndex = Math.floor(time * sampleRate);
  const length = Math.floor(duration * sampleRate);
  const leftGain = 1 - Math.max(0, pan);
  const rightGain = 1 + Math.min(0, pan);
  let previous = 0;

  for (let index = 0; index < length; index += 1) {
    const progress = index / length;
    const envelope = Math.exp(-12 * progress);
    const white = Math.random() * 2 - 1;
    const bright = white - previous * 0.72;
    previous = white;
    const sample = bright * envelope * level;
    writeStereo(buffer, startIndex + index, sample * leftGain, sample * rightGain);
  }
}

function addGhostPerc(buffer, time, level, pan = 0) {
  const sampleRate = buffer.sampleRate;
  const duration = 0.08;
  const startIndex = Math.floor(time * sampleRate);
  const length = Math.floor(duration * sampleRate);
  const leftGain = 1 - Math.max(0, pan);
  const rightGain = 1 + Math.min(0, pan);
  let phase = 0;

  for (let index = 0; index < length; index += 1) {
    const progress = index / length;
    const envelope = Math.exp(-18 * progress);
    phase += (Math.PI * 2 * (420 - progress * 180)) / sampleRate;
    const tone = Math.sin(phase) * envelope * level;
    const noise = (Math.random() * 2 - 1) * Math.exp(-24 * progress) * level * 0.35;
    const sample = tone + noise;
    writeStereo(buffer, startIndex + index, sample * leftGain, sample * rightGain);
  }
}

function writeStereo(buffer, index, left, right) {
  if (index < 0 || index >= buffer.length) {
    return;
  }

  buffer.getChannelData(0)[index] += left;
  if (buffer.numberOfChannels > 1) {
    buffer.getChannelData(1)[index] += right;
  }
}

function createDemoTrackBuffer(startSeconds = 0, duration = 16) {
  const sampleRate = 44100;
  const buffer = createAudioBuffer(2, duration * sampleRate, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  const bpm = 76;
  const beatDuration = 60 / bpm;
  const stepDuration = beatDuration / 4;
  const chordBars = 4;
  const chords = [
    { root: 41, notes: [41, 48, 51, 55, 60, 65], color: [60, 63, 67, 70, 75] },
    { root: 37, notes: [37, 44, 48, 53, 56, 60], color: [56, 60, 63, 68, 72] },
    { root: 44, notes: [44, 51, 55, 58, 63, 67], color: [63, 67, 70, 75, 79] },
    { root: 39, notes: [39, 46, 50, 55, 58, 62], color: [58, 62, 65, 70, 74] },
    { root: 36, notes: [36, 43, 46, 51, 55, 60], color: [55, 58, 63, 67, 72] },
    { root: 43, notes: [43, 50, 53, 58, 62, 65], color: [62, 65, 69, 74, 77] },
  ];
  const bassPattern = [0, null, null, 7, null, 0, null, null, 12, null, 7, null, null, 0, null, 7];
  const melodyPattern = [null, null, 0, null, 2, null, null, 1, null, 3, null, null, 2, null, 4, null];
  const kickSteps = new Set([0, 6, 10, 14]);
  const snareSteps = new Set([4, 12]);
  const hatSteps = new Set([0, 2, 4, 6, 8, 10, 12, 14]);
  const padPhase = new Array(6).fill(0);
  let bassPhase = 0;
  let melodyPhase = 0;

  for (let index = 0; index < buffer.length; index += 1) {
    const time = startSeconds + index / sampleRate;
    const absolute = Math.floor(time * sampleRate);
    const beat = time / beatDuration;
    const bar = Math.floor(beat / 4);
    const chord = chords[Math.floor(bar / chordBars) % chords.length];
    const chordProgress = ((bar % chordBars) * 4 + (beat % 4)) / (chordBars * 4);
    const sectionLift = 0.82 + Math.sin(Math.PI * 2 * time / 128) * 0.07;
    const padEnvelope = Math.min(1, chordProgress * 5, (1 - chordProgress) * 10 + 0.16);
    const wobble = 0.998 + Math.sin(Math.PI * 2 * 0.045 * time) * 0.005;
    let padLeft = 0;
    let padRight = 0;

    for (let noteIndex = 0; noteIndex < chord.notes.length; noteIndex += 1) {
      const frequency = midiToFrequency(chord.notes[noteIndex]) * wobble;
      padPhase[noteIndex] += (Math.PI * 2 * frequency) / sampleRate;
      const sine = Math.sin(padPhase[noteIndex]);
      const octave = Math.sin(padPhase[noteIndex] * 2) * 0.2;
      const warm = Math.tanh((sine + octave) * 1.15);
      const level = (noteIndex < 2 ? 0.06 : 0.034) * padEnvelope * sectionLift;
      const pan = noteIndex % 2 === 0 ? 0.76 : 1.08;
      padLeft += warm * level * pan;
      padRight += warm * level * (1.84 - pan);
    }

    const stepIndex = Math.floor(time / stepDuration);
    const barStep = stepIndex % 16;
    const stepPhase = time - stepIndex * stepDuration;
    const halfStepIndex = Math.floor(time / (stepDuration * 2));
    const halfStepPhase = time - halfStepIndex * stepDuration * 2;

    const bassOffset = bassPattern[barStep];
    let bass = 0;
    if (bassOffset !== null) {
      bassPhase += (Math.PI * 2 * midiToFrequency(chord.root + bassOffset - 12)) / sampleRate;
      bass = Math.sin(bassPhase) * Math.exp(-stepPhase * 4.8) * 0.18 * sectionLift;
    }

    const melodySlot = melodyPattern[halfStepIndex % melodyPattern.length];
    let melody = 0;
    if (melodySlot !== null && bar % 16 >= 5 && bar % 16 <= 13) {
      const note = chord.color[(melodySlot + Math.floor(bar / 4)) % chord.color.length] + 12;
      melodyPhase += (Math.PI * 2 * midiToFrequency(note)) / sampleRate;
      melody = Math.sin(melodyPhase) * Math.exp(-halfStepPhase * 5.2) * 0.062 * sectionLift;
    }

    const noise = seededNoise(absolute);
    const crackle = seededNoise(absolute + 991) > 0.9992 ? seededNoise(absolute + 17) * 0.12 : 0;
    let drumLeft = 0;
    let drumRight = 0;

    if (kickSteps.has(barStep) && stepPhase < 0.24) {
      const kick = Math.sin(Math.PI * 2 * (92 - stepPhase * 180) * stepPhase) * Math.exp(-stepPhase * 12.5) * 0.22;
      drumLeft += kick;
      drumRight += kick * 0.96;
    }

    if (snareSteps.has(barStep) && stepPhase < 0.17) {
      const snareTone = Math.sin(Math.PI * 2 * 180 * stepPhase) * Math.exp(-stepPhase * 22);
      const snare = (noise * 0.14 + snareTone * 0.06) * Math.exp(-stepPhase * 17) * sectionLift;
      drumLeft += snare * 0.88;
      drumRight += snare;
    }

    if (hatSteps.has(barStep) && stepPhase < 0.052) {
      const hat = (noise - seededNoise(absolute + 23) * 0.26) * Math.exp(-stepPhase * 42) * 0.035 * sectionLift;
      drumLeft += hat * (barStep % 4 === 0 ? 0.7 : 0.92);
      drumRight += hat * (barStep % 4 === 0 ? 1 : 0.78);
    }

    const room = Math.sin(Math.PI * 2 * 58 * time) * 0.004 + noise * 0.026;
    left[index] = Math.tanh((padLeft + bass * 0.92 + melody * 0.74 + drumLeft + crackle + room) * 1.18) * 0.9;
    right[index] = Math.tanh((padRight + bass * 0.86 + melody + drumRight + crackle * 0.7 - room * 0.62) * 1.18) * 0.9;
  }

  return normalizeAudioBuffer(buffer, 0.86);
}

function seededNoise(index) {
  let value = (index + 0x6d2b79f5) | 0;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return (((value ^ (value >>> 14)) >>> 0) / 4294967295) * 2 - 1;
}

function createSoftClipCurve(size, drive = 1.2) {
  const curve = new Float32Array(size);

  for (let index = 0; index < size; index += 1) {
    const x = (index / (size - 1)) * 2 - 1;
    curve[index] = Math.tanh(x * drive);
  }

  return curve;
}

function applyPumpEnvelope(audioParam, duration, bpm, amount) {
  const beatDuration = 60 / bpm;
  const minimum = Math.max(0.54, 1 - amount);

  audioParam.cancelScheduledValues(0);
  audioParam.setValueAtTime(1, 0);

  for (let time = 0; time < duration; time += beatDuration) {
    audioParam.setValueAtTime(1, time);
    audioParam.linearRampToValueAtTime(minimum, Math.min(duration, time + 0.03));
    audioParam.linearRampToValueAtTime(1, Math.min(duration, time + beatDuration * 0.48));
  }
}

function createImpulseResponse(context, seconds, decay) {
  const length = Math.ceil(seconds * context.sampleRate);
  const buffer = context.createBuffer(2, length, context.sampleRate);

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < length; index += 1) {
      const distance = 1 - index / length;
      data[index] = (Math.random() * 2 - 1) * distance ** decay;
    }
  }

  return buffer;
}

function encodeMp3(audioBuffer) {
  const bitrate = 128;
  const channels = Math.min(2, audioBuffer.numberOfChannels);
  const encoder = new lamejs.Mp3Encoder(channels, audioBuffer.sampleRate, bitrate);
  const blockSize = 1152;
  const mp3Chunks = [];

  const left = floatTo16Bit(audioBuffer.getChannelData(0));
  const right = channels > 1 ? floatTo16Bit(audioBuffer.getChannelData(1)) : null;

  for (let index = 0; index < left.length; index += blockSize) {
    const leftChunk = left.subarray(index, index + blockSize);
    const buffer =
      channels > 1
        ? encoder.encodeBuffer(leftChunk, right.subarray(index, index + blockSize))
        : encoder.encodeBuffer(leftChunk);

    if (buffer.length > 0) {
      mp3Chunks.push(new Int8Array(buffer));
    }
  }

  const flush = encoder.flush();
  if (flush.length > 0) {
    mp3Chunks.push(new Int8Array(flush));
  }

  return new Blob(mp3Chunks, { type: "audio/mpeg" });
}

function encodeWav(audioBuffer) {
  const channels = Math.min(2, audioBuffer.numberOfChannels);
  const sampleRate = audioBuffer.sampleRate;
  const samples = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataLength = samples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataLength, true);

  const channelData = [];
  for (let channel = 0; channel < channels; channel += 1) {
    channelData.push(audioBuffer.getChannelData(channel));
  }

  let offset = 44;
  for (let index = 0; index < samples; index += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][index]));
      const value = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, value, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function floatTo16Bit(float32Array) {
  const output = new Int16Array(float32Array.length);

  for (let index = 0; index < float32Array.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, float32Array[index]));
    output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  return output;
}

function writeAscii(view, offset, text) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

function sliceAudioBuffer(sourceBuffer, startSeconds, durationSeconds) {
  const sampleRate = sourceBuffer.sampleRate;
  const startFrame = Math.max(0, Math.floor(startSeconds * sampleRate));
  const frameLength = Math.min(
    sourceBuffer.length - startFrame,
    Math.ceil(durationSeconds * sampleRate),
  );
  const channels = sourceBuffer.numberOfChannels;
  const sliced = createAudioBuffer(channels, frameLength, sampleRate);

  for (let channel = 0; channel < channels; channel += 1) {
    const channelData = sourceBuffer.getChannelData(channel);
    const slice = channelData.subarray(startFrame, startFrame + frameLength);
    sliced.getChannelData(channel).set(slice);
  }

  return sliced;
}

function trimAudioBuffer(audioBuffer, duration) {
  const sampleCount = Math.min(
    audioBuffer.length,
    Math.ceil(duration * audioBuffer.sampleRate),
  );
  const trimmed = createAudioBuffer(
    audioBuffer.numberOfChannels,
    sampleCount,
    audioBuffer.sampleRate,
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    trimmed
      .getChannelData(channel)
      .set(audioBuffer.getChannelData(channel).subarray(0, sampleCount));
  }

  return trimmed;
}

function normalizeAudioBuffer(audioBuffer, targetPeak = 0.92) {
  let peak = 0;

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const data = audioBuffer.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      peak = Math.max(peak, Math.abs(data[index]));
    }
  }

  if (!peak) {
    return audioBuffer;
  }

  const gain = Math.min(1.18, targetPeak / peak);
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const data = audioBuffer.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      data[index] *= gain;
    }
  }

  return audioBuffer;
}

function createAudioBuffer(numberOfChannels, length, sampleRate) {
  if (typeof AudioBuffer === "function") {
    return new AudioBuffer({
      length,
      numberOfChannels,
      sampleRate,
    });
  }

  const context = new OfflineAudioContext(numberOfChannels, length, sampleRate);
  return context.createBuffer(numberOfChannels, length, sampleRate);
}

function createHannWindow(length) {
  const window = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    window[index] = 0.5 * (1 - Math.cos((Math.PI * 2 * index) / (length - 1 || 1)));
  }
  return window;
}

async function decodeAudioData(context, arrayBuffer) {
  return context.decodeAudioData(arrayBuffer.slice(0));
}

function midiToFrequency(midi) {
  return 440 * (2 ** ((midi - 69) / 12));
}

function mixValue(percent, min, max) {
  return min + (clamp(percent, 0, 100) / 100) * (max - min);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

window.AudioStudioEngine = AudioStudioEngine;
