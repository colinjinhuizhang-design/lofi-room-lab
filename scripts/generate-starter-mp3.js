const fs = require("fs");
const path = require("path");

const lameBundlePath = path.resolve(__dirname, "../node_modules/lamejs/lame.all.js");
const lameBundle = fs.readFileSync(lameBundlePath, "utf8");
const lamejs = new Function(`${lameBundle}; return lamejs;`)();

const outputPath = path.resolve(__dirname, "../assets/starter-session-1h.mp3");
const sampleRate = 22050;
const segmentSeconds = 4 * 60;
const segmentsInHour = 15;
const uniqueSegments = 4;
const bitrateKbps = 56;
const frameSize = 1152;
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
const ghostSteps = new Set([3, 11, 15]);

function encodeSegment(variation) {
  const encoder = new lamejs.Mp3Encoder(2, sampleRate, bitrateKbps);
  const totalSamples = sampleRate * segmentSeconds;
  const chunks = [];
  const leftFrame = new Int16Array(frameSize);
  const rightFrame = new Int16Array(frameSize);
  const padPhase = new Array(6).fill(0);
  let bassPhase = 0;
  let melodyPhase = 0;
  let dust = 0;
  let seed = (0x8badf00d + variation * 0x9e3779b9) >>> 0;

  const random01 = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const randomSigned = () => random01() * 2 - 1;

  for (let offset = 0; offset < totalSamples; offset += frameSize) {
    for (let i = 0; i < frameSize; i += 1) {
      const absolute = offset + i;
      if (absolute >= totalSamples) {
        leftFrame[i] = 0;
        rightFrame[i] = 0;
        continue;
      }

      const localTime = absolute / sampleRate;
      const phraseTime = localTime + variation * 23.5;
      const beat = phraseTime / beatDuration;
      const bar = Math.floor(beat / 4);
      const chord = chords[(Math.floor(bar / chordBars) + variation) % chords.length];
      const chordProgress = ((bar % chordBars) * 4 + (beat % 4)) / (chordBars * 4);
      const fadeIn = Math.min(1, localTime / 2.5);
      const fadeOut = Math.min(1, (segmentSeconds - localTime) / 2.5);
      const sectionLift = (0.82 + Math.sin(Math.PI * 2 * phraseTime / 128) * 0.07) * fadeIn * fadeOut;
      const padEnvelope = Math.min(1, chordProgress * 5, (1 - chordProgress) * 10 + 0.16);
      const wow = 0.998 + Math.sin(Math.PI * 2 * 0.045 * phraseTime + variation) * 0.005;
      let padLeft = 0;
      let padRight = 0;

      for (let noteIndex = 0; noteIndex < chord.notes.length; noteIndex += 1) {
        const frequency = midiToFrequency(chord.notes[noteIndex]) * wow;
        padPhase[noteIndex] += (Math.PI * 2 * frequency) / sampleRate;
        const sine = Math.sin(padPhase[noteIndex]);
        const octave = Math.sin(padPhase[noteIndex] * 2) * 0.2;
        const bell = Math.tanh((sine + octave) * 1.15);
        const level = (noteIndex < 2 ? 0.06 : 0.034) * padEnvelope * sectionLift;
        const pan = noteIndex % 2 === 0 ? 0.76 : 1.08;
        padLeft += bell * level * pan;
        padRight += bell * level * (1.84 - pan);
      }

      const stepIndex = Math.floor(phraseTime / stepDuration);
      const barStep = stepIndex % 16;
      const stepPhase = phraseTime - stepIndex * stepDuration;
      const halfStepIndex = Math.floor(phraseTime / (stepDuration * 2));
      const halfStepPhase = phraseTime - halfStepIndex * stepDuration * 2;

      const bassOffset = bassPattern[(barStep + (variation % 2 ? 2 : 0)) % bassPattern.length];
      let bass = 0;
      if (bassOffset !== null) {
        bassPhase += (Math.PI * 2 * midiToFrequency(chord.root + bassOffset - 12)) / sampleRate;
        bass = Math.sin(bassPhase) * Math.exp(-stepPhase * 4.8) * 0.18 * sectionLift;
      }

      const melodySlot = melodyPattern[(halfStepIndex + variation * 3) % melodyPattern.length];
      let melody = 0;
      if (melodySlot !== null && bar % 16 >= 5 && bar % 16 <= 13) {
        const note = chord.color[(melodySlot + Math.floor(bar / 8)) % chord.color.length] + 12;
        melodyPhase += (Math.PI * 2 * midiToFrequency(note)) / sampleRate;
        melody = Math.sin(melodyPhase) * Math.exp(-halfStepPhase * 5.2) * 0.062 * sectionLift;
      }

      const drums = renderDrums({
        barStep,
        phraseTime,
        randomSigned,
        sectionLift,
        stepPhase,
        variation,
      });
      const texture = renderTexture({ dust, phraseTime, random01, randomSigned });
      dust = texture.dust;

      const left = softClip(padLeft + bass * 0.92 + melody * 0.74 + drums.left + texture.left);
      const right = softClip(padRight + bass * 0.86 + melody + drums.right + texture.right);
      leftFrame[i] = toInt16(left);
      rightFrame[i] = toInt16(right);
    }

    const encoded = encoder.encodeBuffer(leftFrame, rightFrame);
    if (encoded.length > 0) {
      chunks.push(Buffer.from(encoded));
    }
  }

  const flush = encoder.flush();
  if (flush.length > 0) {
    chunks.push(Buffer.from(flush));
  }

  return Buffer.concat(chunks);
}

function renderDrums({ barStep, phraseTime, randomSigned, sectionLift, stepPhase, variation }) {
  const noise = randomSigned();
  let left = 0;
  let right = 0;
  const swingPush = barStep % 2 ? 0.016 + variation * 0.002 : 0;
  const phase = Math.max(0, stepPhase - swingPush);

  if (kickSteps.has(barStep) && phase < 0.25) {
    const sweep = 92 - phase * 180;
    const kick = Math.sin(Math.PI * 2 * sweep * phase) * Math.exp(-phase * 12.5) * 0.22 * sectionLift;
    left += kick;
    right += kick * 0.96;
  }

  if (snareSteps.has(barStep) && phase < 0.18) {
    const env = Math.exp(-phase * 17);
    const tone = Math.sin(Math.PI * 2 * 180 * phase) * Math.exp(-phase * 22);
    const snare = (noise * 0.14 + tone * 0.06) * env * sectionLift;
    left += snare * 0.88;
    right += snare;
  }

  if (hatSteps.has(barStep) && phase < 0.055) {
    const hat = highNoise(noise, phraseTime) * Math.exp(-phase * 42) * 0.035 * sectionLift;
    left += hat * (barStep % 4 === 0 ? 0.7 : 0.92);
    right += hat * (barStep % 4 === 0 ? 1.0 : 0.78);
  }

  if (ghostSteps.has(barStep) && phase < 0.08) {
    const ghost = noise * Math.exp(-phase * 26) * 0.024 * sectionLift;
    left += ghost * 0.75;
    right += ghost * 0.62;
  }

  return { left, right };
}

function renderTexture({ dust, phraseTime, random01, randomSigned }) {
  dust = dust * 0.96 + randomSigned() * 0.04;
  const crackleGate = random01();
  const crackle = crackleGate > 0.9992 ? randomSigned() * 0.12 : 0;
  const room = Math.sin(Math.PI * 2 * 58 * phraseTime) * 0.004;
  const tape = Math.sin(Math.PI * 2 * 0.18 * phraseTime) * 0.01;
  const air = dust * 0.026 + tape;

  return {
    dust,
    left: crackle + air + room,
    right: crackle * 0.7 - air * 0.62 - room * 0.3,
  };
}

function highNoise(noise, time) {
  return (noise - Math.sin(Math.PI * 2 * 6800 * time) * 0.26) * 0.66;
}

function midiToFrequency(midi) {
  return 440 * (2 ** ((midi - 69) / 12));
}

function softClip(sample) {
  return Math.tanh(sample * 1.18) * 0.9;
}

function toInt16(sample) {
  return Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
}

const segmentBuffers = [];
for (let variation = 0; variation < uniqueSegments; variation += 1) {
  segmentBuffers.push(encodeSegment(variation));
  console.log(`Encoded study variation ${variation + 1}/${uniqueSegments}`);
}

const hourBuffers = Array.from(
  { length: segmentsInHour },
  (_, index) => segmentBuffers[index % segmentBuffers.length],
);
fs.writeFileSync(outputPath, Buffer.concat(hourBuffers));

const stats = fs.statSync(outputPath);
console.log(`Wrote ${outputPath}`);
console.log(`Duration: ${segmentSeconds * segmentsInHour}s`);
console.log(`Sample rate: ${sampleRate}Hz stereo`);
console.log(`Bitrate: ${bitrateKbps}kbps`);
console.log(`Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
