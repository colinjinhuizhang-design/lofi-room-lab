const STORAGE_KEY = "remix-sounds-lab-state-v6";
const SESSION_DURATION = 30 * 60;
const TRACK_ASSETS = {
  focus: {
    name: "mirostar-lofi-beats-531504.mp3",
    size: 3561012,
    type: "audio/mpeg",
    url: "./assets/tracks/mirostar-lofi-beats-531504.mp3",
  },
  cozy: {
    name: "fassounds-good-night-lofi-cozy-chill-music-160166.mp3",
    size: 4707892,
    type: "audio/mpeg",
    url: "./assets/tracks/fassounds-good-night-lofi-cozy-chill-music-160166.mp3",
  },
  smooth: {
    name: "pulsebox-lofi-smooth-522876.mp3",
    size: 3194880,
    type: "audio/mpeg",
    url: "./assets/tracks/pulsebox-lofi-smooth-522876.mp3",
  },
  mountain: {
    name: "the_mountain-lofi-lofi-music-496553.mp3",
    size: 3271784,
    type: "audio/mpeg",
    url: "./assets/tracks/the_mountain-lofi-lofi-music-496553.mp3",
  },
  pretty: {
    name: "prettyjohn1-lofi-lofi-music-523178.mp3",
    size: 2582987,
    type: "audio/mpeg",
    url: "./assets/tracks/prettyjohn1-lofi-lofi-music-523178.mp3",
  },
};
const THEMES = ["plum", "indigo", "amber"];
const MOOD_ORDER = ["focus", "cozy", "smooth", "mountain", "pretty"];
const MOOD_CLOCKS = {
  focus: [23, 46],
  cozy: [0, 18],
  smooth: [21, 24],
  mountain: [5, 42],
  pretty: [19, 8],
};

const MOODS = {
  focus: {
    label: "Mirostar Beats",
    lengthLabel: "Lo-Fi / 30 min",
    description: "Royalty-free study beat with warm dust.",
    duration: SESSION_DURATION,
    theme: "plum",
    mode: "lofi",
    preset: "late-night",
    beatStyle: "chill",
    beatTempo: 76,
    beatSwing: 28,
    layerDust: 74,
    layerDrums: 68,
    layerRain: 48,
    layerCafe: 44,
    mixMaster: 86,
  },
  cozy: {
    label: "Good Night Cozy",
    lengthLabel: "Lo-Fi / 30 min",
    description: "Soft night loop with cafe air and calm room tone.",
    duration: SESSION_DURATION,
    theme: "indigo",
    mode: "lofi",
    preset: "tokyo-walk",
    beatStyle: "chill",
    beatTempo: 72,
    beatSwing: 30,
    layerDust: 66,
    layerDrums: 58,
    layerRain: 56,
    layerCafe: 78,
    mixMaster: 88,
  },
  smooth: {
    label: "Pulsebox Smooth",
    lengthLabel: "Lo-Fi / 30 min",
    description: "Smooth pulse, low swing, clear headspace.",
    duration: SESSION_DURATION,
    theme: "amber",
    mode: "lofi",
    preset: "boom-room",
    beatStyle: "chill",
    beatTempo: 80,
    beatSwing: 22,
    layerDust: 62,
    layerDrums: 70,
    layerRain: 38,
    layerCafe: 52,
    mixMaster: 88,
  },
  mountain: {
    label: "Mountain Lo-Fi",
    lengthLabel: "Lo-Fi / 30 min",
    description: "Open-air texture, rain window, slower breathing.",
    duration: SESSION_DURATION,
    theme: "plum",
    mode: "lofi",
    preset: "tokyo-walk",
    beatStyle: "chill",
    beatTempo: 74,
    beatSwing: 34,
    layerDust: 64,
    layerDrums: 56,
    layerRain: 78,
    layerCafe: 36,
    mixMaster: 86,
  },
  pretty: {
    label: "PrettyJohn Lo-Fi",
    lengthLabel: "Lo-Fi / 30 min",
    description: "Light melodic loop with a relaxed desk glow.",
    duration: SESSION_DURATION,
    theme: "indigo",
    mode: "lofi",
    preset: "late-night",
    beatStyle: "chill",
    beatTempo: 78,
    beatSwing: 24,
    layerDust: 68,
    layerDrums: 62,
    layerRain: 44,
    layerCafe: 62,
    mixMaster: 88,
  },
};

const DEFAULT_STATE = {
  theme: "plum",
  mood: "focus",
  sessionDuration: SESSION_DURATION,
  mode: "lofi",
  preset: "late-night",
  beatStyle: "chill",
  beatTempo: 76,
  beatSwing: 28,
  previewLength: 18,
  previewPosition: 0,
  mixUpload: 90,
  mixMaster: 88,
  layerDust: 74,
  layerDrums: 78,
  layerRain: 68,
  layerCafe: 62,
};

const LAYER_KEYS = {
  dust: "layerDust",
  drums: "layerDrums",
  rain: "layerRain",
  cafe: "layerCafe",
};

const CHIP_META = {
  source: { label: "Base", className: "source" },
  dust: { label: "Dust", className: "dust" },
  drums: { label: "Drums", className: "drums" },
  rain: { label: "Rain", className: "rain" },
  cafe: { label: "Cafe", className: "cafe" },
};

const PREVIEW_MESSAGE = "Render a whole-session preview to hear the layered mix.";
const MOBILE_ROOM_FPS = 30;
const DESKTOP_ROOM_FPS = 60;
const ROOM_SCENE_STALE_MS = 1800;

const engine = new window.AudioStudioEngine();

const elements = {
  activeSoundChips: document.getElementById("activeSoundChips"),
  appShell: document.getElementById("appShell"),
  cafeCard: document.getElementById("cafeCard"),
  downloadLink: document.getElementById("downloadLink"),
  drumsCard: document.getElementById("drumsCard"),
  dustCard: document.getElementById("dustCard"),
  fileDuration: document.getElementById("fileDuration"),
  fileName: document.getElementById("fileName"),
  fileSize: document.getElementById("fileSize"),
  fullscreenButton: document.getElementById("fullscreenButton"),
  layerCafe: document.getElementById("layerCafe"),
  layerCafeValue: document.getElementById("layerCafeValue"),
  layerDrums: document.getElementById("layerDrums"),
  layerDrumsValue: document.getElementById("layerDrumsValue"),
  layerDust: document.getElementById("layerDust"),
  layerDustValue: document.getElementById("layerDustValue"),
  layerRain: document.getElementById("layerRain"),
  layerRainValue: document.getElementById("layerRainValue"),
  loadDemoButton: document.getElementById("loadDemoButton"),
  mixMaster: document.getElementById("mixMaster"),
  mixMasterValue: document.getElementById("mixMasterValue"),
  mixUpload: document.getElementById("mixUpload"),
  mixUploadValue: document.getElementById("mixUploadValue"),
  modeButtons: [...document.querySelectorAll("[data-mode]")],
  moodButton: document.getElementById("moodButton"),
  moodReadout: document.getElementById("moodReadout"),
  originalPreview: document.getElementById("originalPreview"),
  playPauseButton: document.getElementById("playPauseButton"),
  playerArt: document.getElementById("playerArt"),
  presetButtons: [...document.querySelectorAll("[data-session]")],
  previewPosition: document.getElementById("previewPosition"),
  previewPositionValue: document.getElementById("previewPositionValue"),
  previewMeta: document.getElementById("previewMeta"),
  processedPreview: document.getElementById("processedPreview"),
  rainCard: document.getElementById("rainCard"),
  renderFullButton: document.getElementById("renderFullButton"),
  renderPreviewButton: document.getElementById("renderPreviewButton"),
  renderSummary: document.getElementById("renderSummary"),
  roomActionButtons: [...document.querySelectorAll("[data-room-action]")],
  roomCanvas: document.getElementById("roomCanvas"),
  roomClock: document.getElementById("roomClock"),
  roomLayerButtons: [...document.querySelectorAll("[data-room-layer]")],
  roomPlayButton: document.getElementById("roomPlayButton"),
  roomStatus: document.getElementById("roomStatus"),
  screenTitle: document.getElementById("screenTitle"),
  screenWaveform: document.getElementById("screenWaveform"),
  seekSlider: document.getElementById("seekSlider"),
  shuffleButton: document.getElementById("shuffleButton"),
  sourceActionButton: document.getElementById("sourceActionButton"),
  sourceBadge: document.querySelector(".source-card .card-badge"),
  sourceCard: document.getElementById("sourceCard"),
  statusMessage: document.getElementById("statusMessage"),
  tempoReadout: document.getElementById("tempoReadout"),
  themeButton: document.getElementById("themeButton"),
  timelineReadout: document.getElementById("timelineReadout"),
  timelineWaveform: document.getElementById("timelineWaveform"),
  toggleCafe: document.getElementById("toggleCafe"),
  toggleDrums: document.getElementById("toggleDrums"),
  toggleDust: document.getElementById("toggleDust"),
  toggleRain: document.getElementById("toggleRain"),
  transportState: document.getElementById("transportState"),
};

const runtime = {
  busy: false,
  currentWaveformPeaks: [],
  exportUrl: "",
  layerMemory: {},
  previewDebounceId: 0,
  previewQueued: false,
  previewQueuedMessage: "",
  previewRequestId: 0,
  previewUrl: "",
  wholePreviewReady: false,
  rafId: 0,
  lastPlayerFrameTimestamp: 0,
  sourceBuffer: null,
  sourceFile: null,
  sourceUrl: "",
  virtualSource: null,
  livePreview: {
    audio: null,
    context: null,
    mediaSource: null,
    nodes: [],
    sources: [],
    layerBus: null,
    controls: null,
    signature: "",
    session: null,
    bufferCache: new Map(),
    rebuildTimerId: 0,
    rebuildToken: 0,
  },
  playback: {
    autoplayBlocked: false,
    desiredPlaying: false,
    pendingResume: false,
    sourceSwitchId: 0,
  },
  roomScene: {
    context: null,
    generation: 0,
    lastDrawTimestamp: 0,
    lastErrorLogTimestamp: 0,
    rafId: 0,
    lastTimestamp: 0,
    listenersBound: false,
    pointer: { x: -1, y: -1 },
    watchdogId: 0,
  },
  state: loadPersistedState(),
};

init();

function init() {
  hydrateControls();
  seedLayerMemory();
  bindToolbar();
  bindSourceCard();
  bindRoomControls();
  startRoomScene();
  bindLayerControls();
  bindActions();
  bindPlayer();
  updateThemeUi();
  applyModeUi();
  updatePresetUi();
  updateReadouts();
  updateLayerCards();
  updateRoomUi();
  updateActiveChips();
  updateSummary();
  updateTransportMeta();
  syncPlayerState();
  drawWaveforms();

  loadDemo({ auto: true }).catch((error) => {
    console.error(error);
    updateStatus("The starter 1-hour demo could not be prepared.", "error");
  });

  window.addEventListener("beforeunload", () => {
    cleanupUrl("sourceUrl");
    cleanupUrl("previewUrl");
    cleanupUrl("exportUrl");
    stopRoomScene();
    window.clearTimeout(runtime.livePreview.rebuildTimerId);
    runtime.livePreview.bufferCache.clear();
    if (runtime.livePreview.context && runtime.livePreview.context.state !== "closed") {
      runtime.livePreview.context.close().catch(() => {});
    }
    engine.dispose();
  });
}

function loadPersistedState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_STATE };
    }

    const parsed = JSON.parse(stored);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (error) {
    console.warn("Failed to load saved state", error);
    return { ...DEFAULT_STATE };
  }
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runtime.state));
  } catch (error) {
    console.warn("Failed to save state", error);
  }
}

function hydrateControls() {
  elements.mixUpload.value = String(runtime.state.mixUpload);
  elements.mixMaster.value = String(runtime.state.mixMaster);
  elements.layerDust.value = String(runtime.state.layerDust);
  elements.layerDrums.value = String(runtime.state.layerDrums);
  elements.layerRain.value = String(runtime.state.layerRain);
  elements.layerCafe.value = String(runtime.state.layerCafe);
  elements.previewPosition.value = String(runtime.state.previewPosition);
}

function seedLayerMemory() {
  for (const [layerId, stateKey] of Object.entries(LAYER_KEYS)) {
    runtime.layerMemory[layerId] = Number(runtime.state[stateKey]) || 60;
  }
}

function bindToolbar() {
  elements.fullscreenButton.addEventListener("click", async () => {
    await toggleFullscreen();
  });

  elements.shuffleButton.addEventListener("click", () => {
    randomizeMix();
  });

  elements.themeButton.addEventListener("click", () => {
    cycleTheme();
  });

  elements.moodButton.addEventListener("click", () => {
    cycleMood();
  });

  for (const button of elements.modeButtons) {
    button.addEventListener("click", () => {
      applyMode(button.dataset.mode);
    });
  }
}

function bindSourceCard() {
  elements.sourceActionButton.addEventListener("click", () => {
    cycleMood();
  });

  elements.loadDemoButton.addEventListener("click", async () => {
    cycleMood();
  });

  for (const button of elements.presetButtons) {
    button.addEventListener("click", () => {
      applyMood(button.dataset.session, { preserveTheme: false, schedule: true, resetPosition: true });
    });
  }
}

function bindRoomControls() {
  for (const button of elements.roomLayerButtons) {
    button.addEventListener("click", () => {
      toggleLayer(button.dataset.roomLayer);
    });
    bindRoomHotspotHover(button);
  }

  for (const button of elements.roomActionButtons) {
    button.addEventListener("click", () => {
      const action = button.dataset.roomAction;
      if (action === "mood" || action === "source") {
        cycleMood();
      }
    });
    bindRoomHotspotHover(button);
  }

  elements.roomPlayButton.addEventListener("click", async () => {
    await togglePlayer();
  });

  elements.roomCanvas.addEventListener("pointermove", (event) => {
    const point = roomPointerFromEvent(event);
    runtime.roomScene.pointer = point;
    elements.roomCanvas.style.cursor = getRoomTargetAt(point.x, point.y) ? "pointer" : "default";
  });

  elements.roomCanvas.addEventListener("pointerleave", () => {
    runtime.roomScene.pointer = { x: -1, y: -1 };
    elements.roomCanvas.style.cursor = "default";
  });

  elements.roomCanvas.addEventListener("click", async (event) => {
    const point = roomPointerFromEvent(event);
    const target = getRoomTargetAt(point.x, point.y);
    if (!target) {
      return;
    }

    if (target.type === "layer") {
      toggleLayer(target.id);
      return;
    }

    if (target.type === "action" && target.id === "source") {
      cycleMood();
      return;
    }

    if (target.type === "action" && target.id === "mood") {
      cycleMood();
      return;
    }

    if (target.type === "mood") {
      applyMood(target.id, { preserveTheme: false, schedule: true, resetPosition: true });
      return;
    }

    if (target.type === "play") {
      await togglePlayer();
    }
  });
}

function bindRoomHotspotHover(button) {
  button.addEventListener("pointerenter", () => {
    const id = button.dataset.roomLayer || button.dataset.roomAction;
    const target = ROOM_TARGETS.find((item) => item.id === id);
    if (target) {
      runtime.roomScene.pointer = {
        x: target.x + target.width / 2,
        y: target.y + target.height / 2,
      };
    }
  });

  button.addEventListener("pointerleave", () => {
    runtime.roomScene.pointer = { x: -1, y: -1 };
  });
}

function bindLayerControls() {
  const bindings = [
    ["mixUpload", "mixUploadValue", (value) => `${value}%`, false],
    ["mixMaster", "mixMasterValue", (value) => `${value}%`, true],
    ["previewPosition", "previewPositionValue", (value) => `${value}%`, true],
    ["layerDust", "layerDustValue", (value) => `${value}%`, false],
    ["layerDrums", "layerDrumsValue", (value) => `${value}%`, false],
    ["layerRain", "layerRainValue", (value) => `${value}%`, false],
    ["layerCafe", "layerCafeValue", (value) => `${value}%`, false],
  ];

  for (const [inputId, outputId, formatter, playerOnly] of bindings) {
    const input = elements[inputId];
    const output = elements[outputId];

    input.addEventListener("input", () => {
      runtime.state[inputId] = Number(input.value);
      output.textContent = formatter(Number(input.value));

      const layerId = layerIdFromStateKey(inputId);
      if (layerId && Number(input.value) > 3) {
        runtime.layerMemory[layerId] = Number(input.value);
      }

      updateLayerCards();
      updateActiveChips();
      updateSummary();
      syncPlayerState();
      persistState();

      if (inputId === "previewPosition" && runtime.virtualSource) {
        refreshVirtualSourceMonitor();
      }

      if (inputId === "previewPosition") {
        seekToPreviewPosition();
      }

      if (!playerOnly) {
        schedulePreview("Mix changed. Fading the feature in smoothly...");
      }
    });
  }

  elements.toggleDust.addEventListener("click", () => toggleLayer("dust"));
  elements.toggleDrums.addEventListener("click", () => toggleLayer("drums"));
  elements.toggleRain.addEventListener("click", () => toggleLayer("rain"));
  elements.toggleCafe.addEventListener("click", () => toggleLayer("cafe"));

  elements.activeSoundChips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chip-remove]");
    if (!button) {
      return;
    }

    const layerId = button.dataset.chipRemove;
    if (layerId === "source") {
      runtime.state.mixUpload = 0;
      elements.mixUpload.value = "0";
      elements.mixUploadValue.textContent = "0%";
    } else {
      toggleLayer(layerId);
      return;
    }

    updateLayerCards();
    updateActiveChips();
    updateSummary();
    syncPlayerState();
    persistState();
    schedulePreview("Base bed muted. Fading the session smoothly...");
  });
}

function bindActions() {
  elements.renderPreviewButton.addEventListener("click", async () => {
    await renderPreview({ autoplay: true });
  });

  elements.renderFullButton.addEventListener("click", async () => {
    await exportTrack();
  });
}

function bindPlayer() {
  const onStateChange = () => {
    syncPlayerState();
    drawWaveforms();
    ensureRoomSceneRunning({ redraw: true });
  };

  [elements.originalPreview, elements.processedPreview].forEach((audio) => {
    audio.addEventListener("loadedmetadata", () => {
      if (audio === getWholePreviewAudioElement() && runtime.wholePreviewReady) {
        seekAudioElement(audio, getPreviewWindowStart());
      }
      onStateChange();
    });
    audio.addEventListener("play", () => {
      runtime.playback.desiredPlaying = true;
      runtime.playback.autoplayBlocked = false;
      syncPlayerState();
      tickWaveforms();
      ensureRoomSceneRunning({ redraw: true });
    });
    audio.addEventListener("pause", onStateChange);
    audio.addEventListener("ended", () => {
      runtime.playback.desiredPlaying = false;
      onStateChange();
    });
    audio.addEventListener("timeupdate", onStateChange);
  });

  elements.playPauseButton.addEventListener("click", async () => {
    await togglePlayer();
  });

  elements.seekSlider.addEventListener("input", () => {
    const activeAudio = getActiveAudio();
    const playbackDuration = getActivePlaybackDuration(activeAudio);
    if (!activeAudio || !Number.isFinite(playbackDuration) || playbackDuration <= 0) {
      return;
    }

    seekAudioElement(activeAudio, (Number(elements.seekSlider.value) / 1000) * playbackDuration);
    syncPlayerState();
    drawWaveforms();
  });
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (!document.fullscreenEnabled || typeof elements.appShell.requestFullscreen !== "function") {
      updateStatus("Fullscreen is not available in this mobile browser.", "error");
      return;
    }

    await elements.appShell.requestFullscreen();
  } catch (error) {
    console.warn("Fullscreen toggle failed", error);
    updateStatus("Fullscreen could not be opened in this browser.", "error");
  }
}

function cycleTheme() {
  const currentIndex = THEMES.indexOf(runtime.state.theme);
  runtime.state.theme = THEMES[(currentIndex + 1) % THEMES.length];
  updateThemeUi();
  persistState();
}

function cycleMood() {
  const currentIndex = MOOD_ORDER.indexOf(runtime.state.mood);
  const nextMood = MOOD_ORDER[(currentIndex + 1) % MOOD_ORDER.length];
  applyMood(nextMood, { preserveTheme: false, schedule: true, resetPosition: true });
}

function randomizeMix() {
  const moodId = MOOD_ORDER[Math.floor(Math.random() * MOOD_ORDER.length)];
  applyMood(moodId, { preserveTheme: false, schedule: false });

  runtime.state.mixUpload = clamp(runtime.state.mixUpload + randomStep(12), 72, 100);
  runtime.state.mixMaster = clamp(runtime.state.mixMaster + randomStep(8), 80, 100);
  runtime.state.layerDust = clamp(runtime.state.layerDust + randomStep(14), 36, 100);
  runtime.state.layerDrums = clamp(runtime.state.layerDrums + randomStep(18), 42, 100);
  runtime.state.layerRain = clamp(runtime.state.layerRain + randomStep(18), 30, 100);
  runtime.state.layerCafe = clamp(runtime.state.layerCafe + randomStep(18), 30, 100);
  runtime.state.previewPosition = clamp(runtime.state.previewPosition + randomStep(24), 0, 100);
  runtime.state.theme = THEMES[Math.floor(Math.random() * THEMES.length)];

  hydrateControls();
  seedLayerMemory();
  updateThemeUi();
  applyModeUi();
  updatePresetUi();
  updateReadouts();
  updateLayerCards();
  updateActiveChips();
  updatePresetSourceMeta();
  updateSummary();
  seekToPreviewPosition();
  syncPlayerState();
  persistState();
  ensureRoomSceneRunning({ redraw: true });
  schedulePreview("Mix shuffled. Fading into the new take...");
}

function applyMode(mode) {
  const fallbackMood =
    mode === "lofi"
      ? runtime.state.layerRain > 36
        ? "mountain"
        : "focus"
      : runtime.state.layerCafe > 36
        ? "cozy"
        : "smooth";

  applyMood(fallbackMood, { preserveTheme: true, schedule: true, preserveLayers: true, resetPosition: true });
}

function applyMood(moodId, options = {}) {
  const mood = MOODS[moodId];
  if (!mood) {
    return;
  }

  const {
    preserveLayers = false,
    preserveTheme = false,
    resetPosition = false,
    schedule = false,
  } = options;

  const nextState = {
    ...runtime.state,
    mood: moodId,
    mode: mood.mode,
    preset: mood.preset,
    previewPosition: resetPosition ? 0 : runtime.state.previewPosition,
    sessionDuration: mood.duration,
    beatStyle: mood.beatStyle,
    beatTempo: mood.beatTempo,
    beatSwing: mood.beatSwing,
    mixMaster: preserveLayers ? runtime.state.mixMaster : mood.mixMaster,
    theme: preserveTheme ? runtime.state.theme : mood.theme,
  };

  if (!preserveLayers) {
    nextState.layerDust = mood.layerDust;
    nextState.layerDrums = mood.layerDrums;
    nextState.layerRain = mood.layerRain;
    nextState.layerCafe = mood.layerCafe;
  }

  runtime.state = nextState;
  hydrateControls();
  seedLayerMemory();
  updateThemeUi();
  applyModeUi();
  updatePresetUi();
  updateReadouts();
  updateLayerCards();
  updateActiveChips();
  updatePresetSourceMeta();
  updateSummary();
  seekToPreviewPosition();
  syncPlayerState();
  persistState();
  ensureRoomSceneRunning({ redraw: true });

  if (schedule) {
    schedulePreview(`${mood.label} is fading in smoothly...`);
  }
}

function updateThemeUi() {
  elements.appShell.classList.remove("theme-plum", "theme-indigo", "theme-amber");
  elements.appShell.classList.add(`theme-${runtime.state.theme}`);
}

function applyModeUi() {
  for (const button of elements.modeButtons) {
    const active = button.dataset.mode === runtime.state.mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  }
}

function updatePresetUi() {
  const mood = currentMood();

  for (const button of elements.presetButtons) {
    button.classList.toggle("is-active", button.dataset.session === runtime.state.mood);
    button.setAttribute("aria-pressed", String(button.dataset.session === runtime.state.mood));
  }

  if (elements.sourceBadge) {
    elements.sourceBadge.textContent = mood.duration >= 3600 ? "1H" : "30M";
  }

  elements.sourceActionButton.textContent = "Switch";
}

function updateReadouts() {
  elements.mixUploadValue.textContent = `${runtime.state.mixUpload}%`;
  elements.mixMasterValue.textContent = `${runtime.state.mixMaster}%`;
  elements.previewPositionValue.textContent = `${runtime.state.previewPosition}%`;
  elements.layerDustValue.textContent = `${runtime.state.layerDust}%`;
  elements.layerDrumsValue.textContent = `${runtime.state.layerDrums}%`;
  elements.layerRainValue.textContent = `${runtime.state.layerRain}%`;
  elements.layerCafeValue.textContent = `${runtime.state.layerCafe}%`;
  elements.tempoReadout.textContent = `${runtime.state.beatTempo} BPM`;
  elements.moodReadout.textContent = currentMood().label;
}

function updatePresetSourceMeta() {
  if (!runtime.virtualSource) {
    return;
  }

  const mood = currentMood();
  const asset = TRACK_ASSETS[runtime.state.mood] ?? TRACK_ASSETS.focus;
  const audio = elements.originalPreview;
  const targetUrl = new URL(asset.url, window.location.href).href;
  const sourceChanged = audio.src !== targetUrl;
  const shouldContinuePlaying =
    sourceChanged &&
    (runtime.playback.desiredPlaying || isAudioPlaying(audio));

  runtime.virtualSource.duration = mood.duration;
  runtime.virtualSource.url = asset.url;
  runtime.sourceUrl = asset.url;
  runtime.sourceFile = {
    name: mood.label,
    size: asset.size,
    type: asset.type,
  };
  audio.loop = true;

  if (sourceChanged) {
    const switchId = ++runtime.playback.sourceSwitchId;
    runtime.playback.pendingResume = shouldContinuePlaying;
    runtime.playback.desiredPlaying = shouldContinuePlaying;
    audio.preload = shouldContinuePlaying ? "auto" : "metadata";
    audio.src = asset.url;
    audio.load();

    if (shouldContinuePlaying) {
      void continuePlaybackAfterSourceSwitch(audio, switchId, mood.label);
    }
  }

  renderSourceMeta(mood.label, mood.duration, asset.size, mood.lengthLabel);
}

async function continuePlaybackAfterSourceSwitch(audio, switchId, moodLabel) {
  try {
    await audio.play();

    if (
      switchId !== runtime.playback.sourceSwitchId ||
      !runtime.playback.desiredPlaying
    ) {
      return false;
    }

    runtime.playback.pendingResume = false;
    runtime.playback.autoplayBlocked = false;
    updateStatus(`${moodLabel} is playing.`, "success");
    syncPlayerState();
    tickWaveforms();
    ensureRoomSceneRunning({ redraw: true });
    return true;
  } catch (error) {
    if (
      switchId !== runtime.playback.sourceSwitchId ||
      !runtime.playback.desiredPlaying
    ) {
      return false;
    }

    console.warn("Playback could not continue after the source switch", error);
    runtime.playback.pendingResume = false;
    runtime.playback.desiredPlaying = false;
    showPlaybackGestureFallback(`${moodLabel} is ready. Tap Start to continue.`);
    syncPlayerState();
    return false;
  }
}

function updateLayerCards() {
  const layerCards = [
    ["dust", elements.dustCard, elements.toggleDust, runtime.state.layerDust],
    ["drums", elements.drumsCard, elements.toggleDrums, runtime.state.layerDrums],
    ["rain", elements.rainCard, elements.toggleRain, runtime.state.layerRain],
    ["cafe", elements.cafeCard, elements.toggleCafe, runtime.state.layerCafe],
  ];

  for (const [layerId, card, button, value] of layerCards) {
    const active = value > 3;
    card.classList.toggle("is-active", active);
    card.classList.toggle("is-muted", !active);
    button.textContent = active ? "Active" : "Enable";
    button.setAttribute("aria-pressed", String(active));
  }

  const hasSource = hasSourceTrack();
  elements.sourceCard.classList.toggle("has-source", hasSource);
  elements.sourceActionButton.textContent = "Switch";
  updateRoomUi();
}

function updateRoomUi() {
  const mood = currentMood();
  const activeLayers = [];

  if (hasSourceTrack() && runtime.state.mixUpload > 3) {
    activeLayers.push("base");
  }

  for (const button of elements.roomLayerButtons) {
    const layerId = button.dataset.roomLayer;
    const stateKey = LAYER_KEYS[layerId];
    const active = stateKey ? Number(runtime.state[stateKey]) > 3 : false;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
    const stateLabel = button.querySelector("[data-room-control-state]");
    if (stateLabel) {
      stateLabel.textContent = active ? "On" : "Off";
    }

    if (active && CHIP_META[layerId] && !activeLayers.includes(CHIP_META[layerId].label.toLowerCase())) {
      activeLayers.push(CHIP_META[layerId].label.toLowerCase());
    }
  }

  for (const button of elements.roomActionButtons) {
    const sourceActive = button.dataset.roomAction === "source" && runtime.state.mixUpload > 3;
    button.classList.toggle("is-source-active", sourceActive);
    if (button.dataset.roomAction === "source") {
      button.setAttribute("aria-pressed", String(sourceActive));
    }
    const stateLabel = button.querySelector("[data-room-control-state]");
    if (stateLabel) {
      stateLabel.textContent = button.dataset.roomAction === "source" ? "Next" : "Change";
    }
  }

  const activeAudio = getActiveAudio();
  const playing = isAudioPlaying(activeAudio);
  const needsGesture = runtime.playback.autoplayBlocked && !playing;
  elements.roomPlayButton.classList.toggle("is-playing", playing);
  elements.roomPlayButton.classList.toggle("needs-gesture", needsGesture);
  elements.roomPlayButton.textContent = playing ? "pause" : needsGesture ? "play" : "start";
  elements.roomPlayButton.setAttribute("aria-label", playing ? "Pause room" : "Start room");
  elements.roomPlayButton.title = playing ? "Pause room" : needsGesture ? "Tap to play" : "Play room";
  elements.roomPlayButton.disabled = !activeAudio;

  elements.roomClock.textContent = formatRoomClock();
  elements.roomStatus.textContent =
    `${mood.label} / ${runtime.state.beatTempo} BPM / ${activeLayers.join(", ") || "dry room"}`;
}

function updateActiveChips() {
  const chips = [];

  if (hasSourceTrack() && runtime.state.mixUpload > 3) {
    chips.push(renderChipMarkup("source"));
  }

  for (const [layerId, stateKey] of Object.entries(LAYER_KEYS)) {
    if (runtime.state[stateKey] > 3) {
      chips.push(renderChipMarkup(layerId));
    }
  }

  elements.activeSoundChips.innerHTML =
    chips.join("") ||
    '<span class="sound-chip">No active layers yet</span>';
}

function renderChipMarkup(layerId) {
  const meta = CHIP_META[layerId];
  return `
    <span class="sound-chip ${meta.className}">
      ${meta.label}
      <button type="button" data-chip-remove="${layerId}" aria-label="Mute ${meta.label}">x</button>
    </span>
  `;
}

function updateSummary() {
  const mood = currentMood();
  const sourceName = mood.label;
  const activeSource =
    getActiveAudio() === elements.originalPreview &&
    !runtime.previewUrl &&
    !runtime.wholePreviewReady &&
    !runtime.exportUrl;
  const previewStart = getPreviewWindowStart();

  elements.screenTitle.textContent = hasSourceTrack() ? sourceName : "Your remix";
  updatePlayerArt();
  elements.renderSummary.textContent =
    `${mood.lengthLabel} / ${runtime.state.beatTempo} BPM / position near ${formatTime(previewStart)}.`;

  if (!hasSourceTrack()) {
    elements.previewMeta.textContent = PREVIEW_MESSAGE;
    return;
  }

  if (runtime.exportUrl) {
    elements.previewMeta.textContent = "Full export is loaded in the player. You can audition it or download the MP3.";
    return;
  }

  if (runtime.wholePreviewReady) {
    elements.previewMeta.textContent = activeSource
      ? "Source is loaded. Press play to compare before switching back to the whole processed preview."
      : `${mood.label} covers ${formatTime(getSourceDuration())}. Feature changes fade into the live session.`;
    return;
  }

  if (runtime.previewUrl) {
    elements.previewMeta.textContent = activeSource
      ? "Source is loaded. Press play to compare before switching back to the processed preview."
      : `Preview clip spans ${formatTime(previewStart)} to ${formatTime(previewStart + runtime.state.previewLength)}.`;
    return;
  }

  if (isVirtualSource()) {
    elements.previewMeta.textContent = `${mood.label} loaded. Move Position to choose where playback starts.`;
    return;
  }

  elements.previewMeta.textContent = "Source loaded. Render a preview to hear the processed version.";
}

function updateTransportMeta() {
  if (!hasSourceTrack()) {
    elements.fileName.textContent = "Choose a preset session";
    elements.fileDuration.textContent = "--:--";
    elements.fileSize.textContent = "--";
    elements.transportState.textContent = "waiting for preset";
    return;
  }

  elements.transportState.textContent = `${currentMood().mode} preset ready`;
}

async function loadFile(file) {
  if (!engine.isSupportedFile(file)) {
    updateStatus("Please upload an MP3 or WAV file.", "error");
    return;
  }

  setBusy(true, "load", "Decoding your source track locally...");

  try {
    const audioBuffer = await engine.decodeFile(file);
    cleanupRenderedOutputs();
    runtime.sourceBuffer = audioBuffer;
    runtime.virtualSource = null;
    runtime.sourceFile = file;
    runtime.currentWaveformPeaks = engine.createWaveformPeaks(audioBuffer, 120);
    cleanupUrl("sourceUrl");
    runtime.sourceUrl = URL.createObjectURL(file);
    elements.originalPreview.loop = false;
    elements.originalPreview.src = runtime.sourceUrl;
    elements.originalPreview.load();
    renderSourceMeta(file.name, audioBuffer.duration, file.size);
    updateStatus(`Loaded ${file.name}.`, "success");
    updateLayerCards();
    updateActiveChips();
    updateSummary();
    drawWaveforms();
    syncPlayerState();
    persistState();
  } catch (error) {
    console.error(error);
    updateStatus("This file could not be decoded. Try another MP3 or WAV.", "error");
  } finally {
    setBusy(false);
  }

  if (hasSourceTrack()) {
    schedulePreview("Preset loaded. Preparing your first preview...");
  }
}

async function loadDemo(options = {}) {
  const { auto = false } = options;
  const mood = currentMood();
  setBusy(true, "load", `Loading ${mood.label}...`);

  try {
    const starterAsset = await loadMoodAudioAsset();
    const monitorBuffer = engine.createDemoSourceBuffer(0, 30);
    cleanupRenderedOutputs();
    runtime.sourceBuffer = null;
    cleanupUrl("sourceUrl");
    runtime.sourceUrl = starterAsset.url;
    runtime.virtualSource = { duration: mood.duration, url: runtime.sourceUrl };
    runtime.sourceFile = {
      name: mood.label,
      size: starterAsset.size,
      type: starterAsset.type,
    };
    runtime.currentWaveformPeaks = engine.createWaveformPeaks(monitorBuffer, 120);
    elements.originalPreview.loop = true;
    elements.originalPreview.preload = auto ? "auto" : "metadata";
    elements.originalPreview.src = runtime.sourceUrl;
    elements.originalPreview.load();
    await refreshVirtualSourceMonitor();
    renderSourceMeta(mood.label, mood.duration, starterAsset.size, mood.lengthLabel);
    updatePresetUi();
    updateStatus(auto ? `${mood.label} ready.` : `${mood.label} loaded.`, "success");
    updateLayerCards();
    updateActiveChips();
    updateSummary();
    drawWaveforms();
    syncPlayerState();
  } catch (error) {
    console.error(error);
    updateStatus("The demo track could not be generated.", "error");
  } finally {
    setBusy(false);
  }

  if (hasSourceTrack()) {
    await renderPreview({ autoplay: auto, autoplayAttempt: auto });
  }
}

function renderSourceMeta(name, duration, size, sizeLabel = "") {
  elements.fileName.textContent = name;
  elements.fileDuration.textContent = formatTime(duration);
  elements.fileSize.textContent = sizeLabel || (typeof size === "number" && size > 0 ? formatBytes(size) : "--");
  updateTransportMeta();
}

async function loadMoodAudioAsset() {
  const mood = currentMood();
  const asset = TRACK_ASSETS[runtime.state.mood] ?? TRACK_ASSETS.focus;
  return {
    ...asset,
    displayName: mood.label,
  };
}

async function refreshVirtualSourceMonitor() {
  if (!isVirtualSource()) {
    return;
  }

  const monitorDuration = Math.max(24, Math.min(60, runtime.state.previewLength * 2));
  const monitorBuffer = engine.createDemoSourceBuffer(getPreviewWindowStart(), monitorDuration);
  if (elements.originalPreview.src !== new URL(runtime.virtualSource.url, window.location.href).href) {
    elements.originalPreview.src = runtime.virtualSource.url;
    elements.originalPreview.load();
  }
  if (Number.isFinite(elements.originalPreview.duration)) {
    elements.originalPreview.currentTime = Math.min(
      Math.max(0, getPreviewWindowStart()),
      Math.max(0, elements.originalPreview.duration - 1),
    );
  }
  runtime.currentWaveformPeaks = engine.createWaveformPeaks(monitorBuffer, 120);
  drawWaveforms();
}

function setBusy(isBusy, kind, message = "") {
  runtime.busy = isBusy;
  elements.renderPreviewButton.disabled = isBusy;
  elements.renderFullButton.disabled = isBusy;
  elements.sourceActionButton.disabled = isBusy;
  elements.loadDemoButton.disabled = isBusy;
  elements.playPauseButton.disabled = isBusy && !getActiveAudio();
  elements.roomPlayButton.disabled = isBusy && !getActiveAudio();
  elements.transportState.textContent = isBusy
    ? kind === "export"
      ? "rendering export"
      : kind === "preview"
        ? "rendering preview"
        : "loading source"
    : hasSourceTrack()
      ? "ready"
      : "waiting for preset";

  if (message) {
    updateStatus(message, isBusy ? "loading" : "success");
  }

  if (!isBusy && runtime.previewQueued) {
    const queuedMessage = runtime.previewQueuedMessage;
    runtime.previewQueued = false;
    runtime.previewQueuedMessage = "";
    window.setTimeout(() => schedulePreview(queuedMessage), 0);
  }
}

function updateStatus(message, tone = "neutral") {
  elements.statusMessage.textContent = message;
  elements.statusMessage.classList.remove("is-success", "is-error", "is-loading");
  if (tone === "success") {
    elements.statusMessage.classList.add("is-success");
  }
  if (tone === "error") {
    elements.statusMessage.classList.add("is-error");
  }
  if (tone === "loading") {
    elements.statusMessage.classList.add("is-loading");
  }
}

function schedulePreview(message) {
  window.clearTimeout(runtime.previewDebounceId);
  if (!hasSourceTrack()) {
    return;
  }

  if (runtime.busy) {
    runtime.previewQueued = true;
    runtime.previewQueuedMessage = message || runtime.previewQueuedMessage;
    return;
  }

  if (message) {
    updateStatus(message, runtime.wholePreviewReady ? "success" : "loading");
  }

  if (runtime.wholePreviewReady) {
    const session = buildSession();
    runtime.livePreview.session = session;
    if (needsLivePreviewRebuild(session)) {
      smoothRebuildLivePreviewGraph(session);
    } else {
      updateLivePreviewMix(session, { smooth: true });
    }
    updateSummary();
    syncPlayerState();
    return;
  }

  runtime.previewDebounceId = window.setTimeout(() => {
    renderPreview({ autoplay: false });
  }, 320);
}

async function renderPreview(options = {}) {
  if (!hasSourceTrack() || runtime.busy) {
    if (!hasSourceTrack()) {
      updateStatus("Choose a preset first.", "error");
    }
    return;
  }

  const { autoplay = false, autoplayAttempt = false } = options;

  if (runtime.wholePreviewReady && getWholePreviewAudioElement().src) {
    runtime.livePreview.session = buildSession();
    if (autoplay) {
      await playAudio(getWholePreviewAudioElement(), { autoplayAttempt });
    } else {
      syncPlayerState();
    }
    return;
  }

  const requestId = ++runtime.previewRequestId;
  const session = buildSession();
  setBusy(true, "preview", "Preparing whole-session preview...");

  try {
    const sourceUrl = getWholePreviewSourceUrl();
    if (!sourceUrl) {
      throw new Error("No playable source URL is available.");
    }

    if (requestId !== runtime.previewRequestId) {
      return;
    }

    cleanupUrl("previewUrl");
    cleanupUrl("exportUrl");
    cleanupLivePreviewGraph();
    runtime.wholePreviewReady = true;
    runtime.livePreview.session = session;
    elements.processedPreview.removeAttribute("src");
    elements.processedPreview.load();
    if (elements.originalPreview.src !== new URL(sourceUrl, window.location.href).href) {
      elements.originalPreview.preload = "auto";
      elements.originalPreview.src = sourceUrl;
      elements.originalPreview.load();
    }
    const metadataReady = await waitForAudioMetadata(elements.originalPreview);
    seekToPreviewPosition();
    elements.downloadLink.href = "#";
    elements.downloadLink.download = "";
    elements.downloadLink.classList.add("is-disabled");
    elements.downloadLink.setAttribute("aria-disabled", "true");
    elements.downloadLink.textContent = "Download MP3";
    updateSummary();
    if (metadataReady) {
      updateStatus("Whole-session preview is ready.", "success");
      elements.transportState.textContent = "whole preview ready";
    } else {
      updateStatus(`${currentMood().label} is ready. Press Start to stream the room.`, "success");
      elements.transportState.textContent = "ready";
    }

    if (autoplay) {
      await playAudio(getWholePreviewAudioElement(), { autoplayAttempt });
    } else {
      syncPlayerState();
    }
  } catch (error) {
    console.error(error);
    updateStatus("Whole preview failed. Try reloading the source.", "error");
  } finally {
    if (requestId === runtime.previewRequestId) {
      setBusy(false);
      if (
        runtime.wholePreviewReady &&
        elements.originalPreview.src &&
        (!Number.isFinite(elements.originalPreview.duration) || elements.originalPreview.duration <= 0)
      ) {
        elements.transportState.textContent = "ready";
      }
    }
  }
}

async function exportTrack() {
  if (!hasSourceTrack() || runtime.busy) {
    if (!hasSourceTrack()) {
      updateStatus("Choose a preset first.", "error");
    }
    return;
  }

  const session = buildSession();
  setBusy(true, "export", "Rendering full track...");

  try {
    const startedAt = performance.now();
    const rendered = isVirtualSource()
      ? await engine.renderFull(
          engine.createDemoSourceBuffer(session.previewWindow.start, Math.max(60, runtime.state.previewLength)),
          {
            ...session,
            previewWindow: {
              duration: Math.max(60, runtime.state.previewLength),
              start: 0,
            },
          },
        )
      : await engine.renderFull(runtime.sourceBuffer, session);
    const asset = engine.encodeDownload(rendered);

    cleanupUrl("exportUrl");
    runtime.exportUrl = URL.createObjectURL(asset.blob);
    elements.processedPreview.src = runtime.exportUrl;
    elements.processedPreview.load();
    elements.downloadLink.href = runtime.exportUrl;
    elements.downloadLink.download = buildDownloadName(
      runtime.sourceFile?.name ?? "remix",
      runtime.state.mode,
      asset.extension,
    );
    elements.downloadLink.classList.remove("is-disabled");
    elements.downloadLink.setAttribute("aria-disabled", "false");
    elements.downloadLink.textContent = `Download ${asset.label}`;

    const elapsed = ((performance.now() - startedAt) / 1000).toFixed(1);
    elements.renderSummary.textContent =
      `${currentMood().label} exported in ${elapsed}s at ${runtime.state.beatTempo} BPM with ${runtime.state.mode} mode${isVirtualSource() ? " from the current 60s scene window" : ""}.`;
    updateSummary();
    updateStatus("Full export is ready.", "success");
    elements.transportState.textContent = "export ready";
  } catch (error) {
    console.error(error);
    updateStatus("Full export failed. Try another source or a simpler mix.", "error");
  } finally {
    setBusy(false);
  }
}

function buildSession() {
  const dust = runtime.state.layerDust;
  const drums = runtime.state.layerDrums;
  const rain = runtime.state.layerRain;
  const cafe = runtime.state.layerCafe;
  const ambienceMix = clamp(Math.round(Math.max(rain, cafe) * 0.95 + dust * 0.18), 0, 100);

  return {
    ambience: {
      rain: clamp(rain, 0, 100),
      cafe: clamp(cafe, 0, 100),
      noise: clamp(Math.round(dust * 0.95), 0, 100),
    },
    beat: {
      intensity: clamp(Math.round(Math.max(14, drums)), 0, 100),
      style: runtime.state.beatStyle,
      swing: runtime.state.beatSwing,
      tempo: runtime.state.beatTempo,
    },
    fx: {
      dust: clamp(Math.round(dust * 0.96), 0, 100),
      eq: runtime.state.mode === "remix" ? 58 : 44,
      reverb: clamp(Math.round(18 + dust * 0.24 + rain * 0.18 + cafe * 0.1), 0, 100),
      saturation: clamp(Math.round(20 + dust * 0.16 + drums * 0.1), 0, 100),
      vinyl: clamp(Math.round(dust * 0.92), 0, 100),
      wobble: clamp(Math.round((runtime.state.mode === "lofi" ? 18 : 8) + dust * 0.18), 0, 100),
    },
    mixer: {
      ambience: ambienceMix,
      chords: clamp(Math.round(dust * (runtime.state.mode === "remix" ? 0.42 : 0.58)), 0, 100),
      drums: clamp(drums, 0, 100),
      master: clamp(runtime.state.mixMaster, 0, 100),
      piano: clamp(Math.round(dust * (runtime.state.mode === "remix" ? 0.34 : 0.66)), 0, 100),
    },
    mode: runtime.state.mode,
    preset: runtime.state.preset,
    previewWindow: {
      duration: runtime.state.previewLength,
      start: getPreviewWindowStart(),
    },
    uploadMix: clamp(runtime.state.mixUpload, 0, 100),
  };
}

function getWholePreviewSourceUrl() {
  if (isVirtualSource()) {
    return runtime.virtualSource.url;
  }

  return runtime.sourceUrl;
}

function getWholePreviewAudioElement() {
  return elements.originalPreview;
}

function getPreviewWindowStart() {
  if (!hasSourceTrack()) {
    return 0;
  }

  const duration = getSourceDuration();
  return duration * (runtime.state.previewPosition / 100);
}

function cleanupRenderedOutputs() {
  cleanupUrl("previewUrl");
  cleanupUrl("exportUrl");
  cleanupLivePreviewGraph();
  runtime.wholePreviewReady = false;
  elements.processedPreview.removeAttribute("src");
  elements.processedPreview.load();
  elements.downloadLink.href = "#";
  elements.downloadLink.download = "";
  elements.downloadLink.classList.add("is-disabled");
  elements.downloadLink.setAttribute("aria-disabled", "true");
  elements.downloadLink.textContent = "Download MP3";
  elements.previewMeta.textContent = PREVIEW_MESSAGE;
}

function cleanupUrl(key) {
  if (runtime[key]) {
    if (String(runtime[key]).startsWith("blob:")) {
      URL.revokeObjectURL(runtime[key]);
    }
    runtime[key] = "";
  }
}

async function prepareLivePreviewGraph(session) {
  const context = getLiveAudioContext();
  const audio = getWholePreviewAudioElement();

  if (context.state === "suspended") {
    await context.resume();
  }

  cleanupLivePreviewGraph();

  if (!runtime.livePreview.mediaSource || runtime.livePreview.audio !== audio) {
    runtime.livePreview.mediaSource = context.createMediaElementSource(audio);
    runtime.livePreview.audio = audio;
  }

  runtime.livePreview.session = session;

  const sourceGain = context.createGain();
  sourceGain.gain.value = scalePercent(session.uploadMix, 0, 1.16);

  const highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = session.mode === "lofi" ? 45 : 58;
  highpass.Q.value = 0.55;

  const lowpass = context.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value =
    session.mode === "lofi"
      ? scalePercent(session.fx.eq, 1800, 5600)
      : scalePercent(session.fx.eq, 5200, 12800);
  lowpass.Q.value = session.mode === "lofi" ? 0.72 : 0.42;

  const saturation = context.createWaveShaper();
  saturation.curve = createLiveSaturationCurve(scalePercent(session.fx.saturation, 0.8, 3.6));
  saturation.oversample = "4x";

  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = session.mode === "lofi" ? -24 : -18;
  compressor.knee.value = 16;
  compressor.ratio.value = session.mode === "lofi" ? 2.2 : 3.2;
  compressor.attack.value = 0.012;
  compressor.release.value = 0.18;

  const delay = context.createDelay(1.2);
  delay.delayTime.value = session.mode === "lofi" ? 0.32 : 0.18;

  const feedback = context.createGain();
  feedback.gain.value = scalePercent(session.fx.reverb, 0.02, 0.16);

  const wetGain = context.createGain();
  wetGain.gain.value = scalePercent(session.fx.reverb, 0.015, 0.11);

  const layerBus = context.createGain();
  layerBus.gain.value = 0;

  const master = context.createGain();
  master.gain.value = 1.08;

  const outputLimiter = context.createDynamicsCompressor();
  outputLimiter.threshold.value = -9;
  outputLimiter.knee.value = 8;
  outputLimiter.ratio.value = 7;
  outputLimiter.attack.value = 0.004;
  outputLimiter.release.value = 0.12;

  runtime.livePreview.mediaSource
    .connect(sourceGain)
    .connect(highpass)
    .connect(lowpass)
    .connect(saturation)
    .connect(compressor)
    .connect(master)
    .connect(outputLimiter)
    .connect(context.destination);

  sourceGain.connect(delay);
  delay.connect(feedback).connect(delay);
  delay.connect(wetGain).connect(master);
  layerBus.connect(master);

  runtime.livePreview.layerBus = layerBus;
  runtime.livePreview.nodes.push(
    sourceGain,
    highpass,
    lowpass,
    saturation,
    compressor,
    delay,
    feedback,
    wetGain,
    layerBus,
    master,
    outputLimiter,
  );

  runtime.livePreview.controls = {
    feedback,
    layerGains: {
      cafe: addLiveTextureLayer(context, "cafe", layerBus),
      drums: addLiveDrumLayer(context, session, layerBus),
      dust: addLiveTextureLayer(context, "dust", layerBus),
      rain: addLiveTextureLayer(context, "rain", layerBus),
    },
    lowpass,
    sourceGain,
    wetGain,
  };
  runtime.livePreview.signature = liveSessionSignature(session);
  updateLivePreviewMix(session, { smooth: false });

  syncLivePreviewPlayback();
}

function cleanupLivePreviewGraph() {
  const live = runtime.livePreview;

  for (const source of live.sources) {
    try {
      source.stop(0);
    } catch {
      // Source nodes may already be stopped; disconnecting below is enough.
    }

    try {
      source.disconnect();
    } catch {
      // Ignore stale Web Audio nodes during graph rebuilds.
    }
  }

  for (const node of live.nodes) {
    try {
      node.disconnect();
    } catch {
      // Ignore stale Web Audio nodes during graph rebuilds.
    }
  }

  if (live.mediaSource) {
    try {
      live.mediaSource.disconnect();
    } catch {
      // Media element sources are reused across preview graph rebuilds.
    }
  }

  live.sources = [];
  live.nodes = [];
  live.layerBus = null;
  live.controls = null;
  live.signature = "";
  live.session = null;
}

function getLiveAudioContext() {
  if (!runtime.livePreview.context || runtime.livePreview.context.state === "closed") {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    runtime.livePreview.context = new AudioContextClass();
    runtime.livePreview.bufferCache.clear();
  }

  return runtime.livePreview.context;
}

function syncLivePreviewPlayback() {
  const { context, layerBus } = runtime.livePreview;
  if (!context || !layerBus) {
    return;
  }

  const shouldPlay =
    runtime.wholePreviewReady &&
    runtime.livePreview.audio &&
    !runtime.livePreview.audio.paused &&
    !runtime.livePreview.audio.ended &&
    Boolean(runtime.livePreview.audio.src);
  const target = shouldPlay ? 1 : 0;

  layerBus.gain.cancelScheduledValues(context.currentTime);
  layerBus.gain.setTargetAtTime(target, context.currentTime, 0.025);
}

function updateLivePreviewMix(session, options = {}) {
  const { context, controls } = runtime.livePreview;
  if (!context || !controls) {
    return;
  }

  const { smooth = true } = options;
  const timeConstant = smooth ? 0.38 : 0.01;
  const dustLevel = scalePercent(session.ambience.noise, 0, 0.18);
  const rainLevel = scalePercent(session.ambience.rain, 0, 0.3);
  const cafeLevel = scalePercent(session.ambience.cafe, 0, 0.22);
  const drumLevel = scalePercent(session.mixer.drums, 0, session.mode === "remix" ? 0.62 : 0.42);

  rampAudioParam(controls.sourceGain.gain, scalePercent(session.uploadMix, 0, 1.16), context, timeConstant);
  rampAudioParam(
    controls.lowpass.frequency,
    session.mode === "lofi"
      ? scalePercent(session.fx.eq, 1800, 5600)
      : scalePercent(session.fx.eq, 5200, 12800),
    context,
    timeConstant,
  );
  rampAudioParam(controls.feedback.gain, scalePercent(session.fx.reverb, 0.02, 0.16), context, timeConstant);
  rampAudioParam(controls.wetGain.gain, scalePercent(session.fx.reverb, 0.015, 0.11), context, timeConstant);
  rampAudioParam(controls.layerGains.dust.gain, dustLevel, context, timeConstant);
  rampAudioParam(controls.layerGains.rain.gain, rainLevel, context, timeConstant);
  rampAudioParam(controls.layerGains.cafe.gain, cafeLevel, context, timeConstant);
  rampAudioParam(controls.layerGains.drums.gain, drumLevel, context, timeConstant);
}

function needsLivePreviewRebuild(session) {
  return Boolean(
    runtime.livePreview.controls &&
    runtime.livePreview.signature &&
    runtime.livePreview.signature !== liveSessionSignature(session),
  );
}

function smoothRebuildLivePreviewGraph(session) {
  const { context, layerBus } = runtime.livePreview;
  const audio = getWholePreviewAudioElement();
  const shouldContinuePlaying =
    runtime.playback.desiredPlaying ||
    isAudioPlaying(audio) ||
    runtime.playback.pendingResume;
  const rebuildToken = ++runtime.livePreview.rebuildToken;

  if (context && layerBus) {
    layerBus.gain.cancelScheduledValues(context.currentTime);
    layerBus.gain.setTargetAtTime(0, context.currentTime, 0.08);
  }

  window.clearTimeout(runtime.livePreview.rebuildTimerId);
  runtime.livePreview.rebuildTimerId = window.setTimeout(() => {
    if (rebuildToken !== runtime.livePreview.rebuildToken) {
      return;
    }

    prepareLivePreviewGraph(session)
      .then(() => {
        if (rebuildToken !== runtime.livePreview.rebuildToken) {
          return undefined;
        }

        updateLivePreviewMix(session, { smooth: true });
        ensureRoomSceneRunning({ redraw: true });
        if (
          shouldContinuePlaying &&
          runtime.playback.desiredPlaying &&
          audio.paused
        ) {
          return audio.play();
        }
        return undefined;
      })
      .catch((error) => {
        console.warn("Live preset rebuild failed", error);
      });
  }, 260);
}

function liveSessionSignature(session) {
  return [
    session.mode,
    session.preset,
    session.beat.style,
    session.beat.tempo,
    session.beat.swing,
  ].join(":");
}

function rampAudioParam(param, value, context, timeConstant) {
  param.cancelScheduledValues(context.currentTime);
  param.setTargetAtTime(value, context.currentTime, timeConstant);
}

function addLiveTextureLayer(context, kind, destination) {
  const source = context.createBufferSource();
  const mobileProfile = usesMobileRenderingProfile();
  const seconds = mobileProfile
    ? kind === "dust"
      ? 3
      : 4
    : kind === "dust"
      ? 7
      : 11;
  const bufferKey = `noise:${context.sampleRate}:${kind}:${seconds}`;
  source.buffer = getCachedLiveBuffer(
    bufferKey,
    () => createLiveNoiseBuffer(context, kind, seconds),
  );
  source.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = kind === "dust" ? "bandpass" : "lowpass";
  filter.frequency.value =
    kind === "rain" ? 2600 : kind === "cafe" ? 780 : 1850;
  filter.Q.value = kind === "dust" ? 1.8 : 0.58;

  const gain = context.createGain();
  gain.gain.value = 0;

  source.connect(filter).connect(gain).connect(destination);
  source.start();

  runtime.livePreview.sources.push(source);
  runtime.livePreview.nodes.push(filter, gain);
  return gain;
}

function addLiveDrumLayer(context, session, destination) {
  const source = context.createBufferSource();
  const compactLoop = usesMobileRenderingProfile();
  const bufferKey =
    `drums:${context.sampleRate}:${liveSessionSignature(session)}:${compactLoop ? "compact" : "full"}`;
  source.buffer = getCachedLiveBuffer(
    bufferKey,
    () => createLiveDrumLoopBuffer(context, session, compactLoop),
  );
  source.loop = true;

  const gain = context.createGain();
  gain.gain.value = 0;

  source.connect(gain).connect(destination);
  source.start();

  runtime.livePreview.sources.push(source);
  runtime.livePreview.nodes.push(gain);
  return gain;
}

function getCachedLiveBuffer(key, createBuffer) {
  if (!runtime.livePreview.bufferCache.has(key)) {
    runtime.livePreview.bufferCache.set(key, createBuffer());
  }

  return runtime.livePreview.bufferCache.get(key);
}

function createLiveNoiseBuffer(context, kind, seconds) {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let smooth = 0;
  let wobble = 0;

  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;
    smooth = smooth * (kind === "rain" ? 0.72 : 0.94) + white * (kind === "rain" ? 0.28 : 0.06);
    wobble += 0.0009 + Math.random() * 0.00035;
    const movement = Math.sin(wobble * Math.PI * 2) * 0.18;
    data[index] = clamp(smooth + movement, -1, 1);
  }

  return buffer;
}

function createLiveDrumLoopBuffer(context, session, compactLoop = false) {
  const bpm = clamp(session.beat.tempo, 60, 150);
  const beatDuration = 60 / bpm;
  const bars = session.beat.style === "house" || compactLoop ? 2 : 4;
  const duration = beatDuration * 4 * bars;
  const length = Math.max(1, Math.floor(duration * context.sampleRate));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  const step = beatDuration / 2;
  const swing = scalePercent(session.beat.swing, 0, step * 0.34);
  const intensity = scalePercent(session.beat.intensity, 0.34, 1);

  for (let time = 0, stepIndex = 0; time < duration; stepIndex += 1, time += step) {
    const swungTime = time + (stepIndex % 2 ? swing : 0);
    const beat = stepIndex % 8;
    const isHouse = session.beat.style === "house";

    if (isHouse || beat === 0 || beat === 4) {
      paintKick(data, context.sampleRate, swungTime, intensity);
    }

    if ((!isHouse && (beat === 2 || beat === 6)) || (isHouse && beat === 4)) {
      paintSnare(data, context.sampleRate, swungTime, intensity * 0.78);
    }

    if (stepIndex % 2 === 1 || session.beat.style === "boom-bap") {
      paintHat(data, context.sampleRate, swungTime, intensity * 0.42);
    }
  }

  return buffer;
}

function paintKick(data, sampleRate, time, amount) {
  const start = Math.floor(time * sampleRate);
  const length = Math.floor(0.18 * sampleRate);

  for (let index = 0; index < length && start + index < data.length; index += 1) {
    const progress = index / length;
    const pitch = 88 - progress * 54;
    const envelope = Math.exp(-progress * 8);
    data[start + index] += Math.sin(progress * Math.PI * 2 * pitch) * envelope * amount;
  }
}

function paintSnare(data, sampleRate, time, amount) {
  const start = Math.floor(time * sampleRate);
  const length = Math.floor(0.13 * sampleRate);

  for (let index = 0; index < length && start + index < data.length; index += 1) {
    const progress = index / length;
    const envelope = Math.exp(-progress * 11);
    data[start + index] += (Math.random() * 2 - 1) * envelope * amount;
  }
}

function paintHat(data, sampleRate, time, amount) {
  const start = Math.floor(time * sampleRate);
  const length = Math.floor(0.045 * sampleRate);

  for (let index = 0; index < length && start + index < data.length; index += 1) {
    const progress = index / length;
    const envelope = Math.exp(-progress * 20);
    const brightness = Math.sin(index * 2.7) > 0 ? 1 : -1;
    data[start + index] += brightness * envelope * amount;
  }
}

function createLiveSaturationCurve(amount) {
  const samples = 1024;
  const curve = new Float32Array(samples);
  const drive = Math.max(0.001, amount);

  for (let index = 0; index < samples; index += 1) {
    const x = (index * 2) / samples - 1;
    curve[index] = ((1 + drive) * x) / (1 + drive * Math.abs(x));
  }

  return curve;
}

function scalePercent(percent, min, max) {
  return min + (max - min) * (clamp(percent, 0, 100) / 100);
}

function waitForAudioMetadata(audio, timeout = 15000) {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ready) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timer);
      audio.removeEventListener("loadedmetadata", onMetadata);
      audio.removeEventListener("durationchange", onMetadata);
      audio.removeEventListener("canplay", onMetadata);
      resolve(Boolean(ready && Number.isFinite(audio.duration) && audio.duration > 0));
    };
    const onMetadata = () => finish(true);
    const timer = window.setTimeout(() => finish(false), timeout);

    audio.addEventListener("loadedmetadata", onMetadata);
    audio.addEventListener("durationchange", onMetadata);
    audio.addEventListener("canplay", onMetadata);
  });
}

function seekToPreviewPosition() {
  if (!hasSourceTrack()) {
    return;
  }

  const targetTime = getPreviewWindowStart();
  for (const audio of [elements.originalPreview, elements.processedPreview]) {
    if (audio.src && Number.isFinite(audio.duration) && audio.duration > 0) {
      seekAudioElement(audio, targetTime);
    }
  }

  syncPlayerState();
  drawWaveforms();
}

function seekAudioElement(audio, targetTime) {
  const boundedTime = Math.min(Math.max(0, targetTime), Math.max(0, audio.duration - 0.1));

  try {
    if (typeof audio.fastSeek === "function") {
      audio.fastSeek(boundedTime);
    }
  } catch {
    // Some browsers expose fastSeek but reject it for blob or file-backed media.
  }

  try {
    audio.currentTime = boundedTime;
  } catch {
    // Keep playback usable even when a browser cannot seek this media source yet.
  }
}

function toggleLayer(layerId) {
  const stateKey = LAYER_KEYS[layerId];
  if (!stateKey) {
    return;
  }

  const currentValue = Number(runtime.state[stateKey]);
  if (currentValue > 3) {
    runtime.layerMemory[layerId] = currentValue;
    runtime.state[stateKey] = 0;
  } else {
    runtime.state[stateKey] = runtime.layerMemory[layerId] || MOODS[runtime.state.mood][stateKey] || 60;
  }

  elements[stateKey].value = String(runtime.state[stateKey]);
  updateReadouts();
  updateLayerCards();
  updateActiveChips();
  updateSummary();
  persistState();
  ensureRoomSceneRunning({ redraw: true });
  schedulePreview("Layer toggled. Fading the feature smoothly...");
}

function getActiveAudio() {
  if (elements.processedPreview.src) {
    return elements.processedPreview;
  }

  if (elements.originalPreview.src) {
    return elements.originalPreview;
  }

  return null;
}

function isAudioPlaying(audio) {
  return Boolean(audio && !audio.paused && !audio.ended && audio.currentSrc);
}

function hasSourceTrack() {
  return Boolean(runtime.sourceBuffer || runtime.virtualSource);
}

function isVirtualSource() {
  return Boolean(runtime.virtualSource);
}

function getSourceDuration() {
  return runtime.virtualSource?.duration ?? runtime.sourceBuffer?.duration ?? 0;
}

function getActivePlaybackDuration(audio) {
  if (!audio) {
    return 0;
  }

  if (runtime.wholePreviewReady && audio === getWholePreviewAudioElement()) {
    return getSourceDuration();
  }

  return audio.duration;
}

async function togglePlayer() {
  const activeAudio = getActiveAudio();
  if (!activeAudio) {
    updateStatus("Load a source track or preview first.", "error");
    return;
  }

  if (activeAudio.paused) {
    await playAudio(activeAudio);
  } else {
    runtime.playback.desiredPlaying = false;
    runtime.playback.pendingResume = false;
    runtime.playback.sourceSwitchId += 1;
    activeAudio.pause();
  }
}

async function playAudio(audio, options = {}) {
  const { autoplayAttempt = false } = options;
  runtime.playback.desiredPlaying = true;
  runtime.playback.pendingResume = false;
  ensureRoomSceneRunning({ redraw: true });

  try {
    const otherAudio = audio === elements.originalPreview ? elements.processedPreview : elements.originalPreview;
    otherAudio.pause();

    const shouldUseLiveLayers = audio === getWholePreviewAudioElement() && runtime.wholePreviewReady;
    const session = shouldUseLiveLayers ? runtime.livePreview.session || buildSession() : null;
    await audio.play();
    syncPlayerState();
    tickWaveforms();

    if (shouldUseLiveLayers) {
      try {
        if (runtime.livePreview.controls && runtime.livePreview.signature === liveSessionSignature(session)) {
          if (runtime.livePreview.context?.state === "suspended") {
            await runtime.livePreview.context.resume();
          }
          updateLivePreviewMix(session, { smooth: true });
        } else {
          await prepareLivePreviewGraph(session);
        }
      } catch (error) {
        console.warn("Live ambience could not start; base playback is continuing", error);
      }
    }

    runtime.playback.autoplayBlocked = false;
    updateStatus("Room is playing.", "success");
    syncPlayerState();
    ensureRoomSceneRunning({ redraw: true });
    return true;
  } catch (error) {
    console.warn("Playback failed", error);
    runtime.playback.desiredPlaying = false;
    runtime.playback.pendingResume = false;
    showPlaybackGestureFallback(
      autoplayAttempt
        ? "Autoplay is blocked in this browser. Tap Start once to begin."
        : "Playback could not start. Tap Start to try again.",
    );
    syncPlayerState();
    return false;
  }
}

function showPlaybackGestureFallback(message) {
  runtime.playback.autoplayBlocked = true;
  updateStatus(message, "neutral");
  ensureRoomSceneRunning({ redraw: true });
}

function syncPlayerState() {
  syncLivePreviewPlayback();
  const activeAudio = getActiveAudio();
  const disabled = !activeAudio;
  elements.playPauseButton.disabled = disabled;
  elements.playPauseButton.textContent = activeAudio && !activeAudio.paused ? "Pause" : "Play";
  updateRoomUi();

  const playbackDuration = getActivePlaybackDuration(activeAudio);
  if (!activeAudio || !Number.isFinite(playbackDuration) || playbackDuration <= 0) {
    elements.seekSlider.value = "0";
    elements.timelineReadout.textContent = "00:00 / 00:00";
    return;
  }

  if (activeAudio.currentTime > playbackDuration) {
    activeAudio.pause();
    seekAudioElement(activeAudio, playbackDuration);
  }

  activeAudio.volume = clamp(runtime.state.mixMaster, 0, 100) / 100;
  const ratio = clamp(activeAudio.currentTime / playbackDuration, 0, 1);
  elements.seekSlider.value = String(Math.round(ratio * 1000));
  elements.timelineReadout.textContent = `${formatTime(Math.min(activeAudio.currentTime, playbackDuration))} / ${formatTime(playbackDuration)}`;
}

function tickWaveforms() {
  cancelAnimationFrame(runtime.rafId);
  runtime.rafId = 0;
  runtime.lastPlayerFrameTimestamp = 0;

  const animate = (timestamp) => {
    runtime.rafId = 0;
    const activeAudio = getActiveAudio();

    if (isAudioPlaying(activeAudio)) {
      runtime.rafId = requestAnimationFrame(animate);
    }

    const frameInterval = usesMobileRenderingProfile() ? 140 : 70;
    if (
      runtime.lastPlayerFrameTimestamp &&
      timestamp - runtime.lastPlayerFrameTimestamp < frameInterval
    ) {
      return;
    }

    runtime.lastPlayerFrameTimestamp = timestamp;
    try {
      drawWaveforms();
      syncPlayerState();
    } catch (error) {
      console.warn("Player meter frame failed", error);
    }
  };

  runtime.rafId = requestAnimationFrame(animate);
}

function drawWaveforms() {
  drawWaveformCanvas(elements.screenWaveform, runtime.currentWaveformPeaks, true);
  drawWaveformCanvas(elements.timelineWaveform, runtime.currentWaveformPeaks, false);
}

function drawWaveformCanvas(canvas, peaks, hero) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);

  const values = peaks.length ? peaks : placeholderPeaks(hero ? 72 : 92);
  const barWidth = width / values.length;
  const gradient = context.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "rgba(255, 135, 197, 0.95)");
  gradient.addColorStop(1, "rgba(79, 152, 255, 0.9)");
  context.fillStyle = gradient;
  context.shadowBlur = hero ? 22 : 10;
  context.shadowColor = "rgba(255, 117, 188, 0.35)";

  for (let index = 0; index < values.length; index += 1) {
    const peak = values[index];
    const scaled = peak * height * (hero ? 0.74 : 0.44);
    const x = index * barWidth;
    const y = (height - scaled) / 2;
    roundRect(context, x + 0.8, y, Math.max(1.8, barWidth - 1.2), Math.max(3, scaled), 999);
    context.fill();
  }

  const activeAudio = getActiveAudio();
  const playbackDuration = getActivePlaybackDuration(activeAudio);
  if (activeAudio && Number.isFinite(playbackDuration) && playbackDuration > 0) {
    const ratio = clamp(activeAudio.currentTime / playbackDuration, 0, 1);
    context.shadowBlur = 0;
    context.fillStyle = "rgba(255, 255, 255, 0.16)";
    context.fillRect(width * ratio, 0, Math.max(4, hero ? 6 : 4), height);
  }
}

function placeholderPeaks(length) {
  return Array.from({ length }, (_, index) => 0.12 + Math.abs(Math.sin(index / 4.5)) * 0.28);
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function currentMood() {
  return MOODS[runtime.state.mood] ?? MOODS.focus;
}

function updatePlayerArt() {
  let art = "./assets/source-mic.png";

  if (runtime.state.mode === "remix") {
    art = "./assets/boom-bap.png";
  } else if (runtime.state.layerRain >= runtime.state.layerCafe && runtime.state.layerRain > 20) {
    art = "./assets/rain-room.png";
  } else if (runtime.state.layerCafe > 20) {
    art = "./assets/cafe-air.png";
  } else if (runtime.state.layerDust > 12) {
    art = "./assets/vinyl-dust.png";
  }

  elements.playerArt.style.backgroundImage =
    `radial-gradient(circle at top, rgba(255, 106, 169, 0.22), transparent 30%), ` +
    `linear-gradient(135deg, rgba(255, 106, 169, 0.5), rgba(47, 130, 255, 0.24)), ` +
    `url("${art}")`;
}

function layerIdFromStateKey(key) {
  return Object.entries(LAYER_KEYS).find(([, stateKey]) => stateKey === key)?.[0] ?? "";
}

function randomStep(range) {
  return Math.round((Math.random() * 2 - 1) * range);
}

function formatRoomClock() {
  const [baseHour, baseMinute] = MOOD_CLOCKS[runtime.state.mood] ?? MOOD_CLOCKS.focus;
  const elapsedMinutes = Math.floor(getPreviewWindowStart() / 60);
  const totalMinutes = (baseHour * 60 + baseMinute + elapsedMinutes) % (24 * 60);
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function usesMobileRenderingProfile() {
  const coarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const compactViewport = window.innerWidth <= 720;
  const hardwareConcurrency = Number(navigator.hardwareConcurrency) || 0;
  const constrainedCpu = hardwareConcurrency > 0 && hardwareConcurrency <= 4;
  return coarsePointer || compactViewport || constrainedCpu;
}

function getRoomFrameInterval() {
  const reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fps = reduceMotion
    ? 15
    : usesMobileRenderingProfile()
      ? MOBILE_ROOM_FPS
      : DESKTOP_ROOM_FPS;
  return 1000 / fps;
}

function startRoomScene() {
  const canvas = elements.roomCanvas;
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    console.warn("The room canvas could not be initialized.");
    return;
  }

  runtime.roomScene.context = context;
  context.imageSmoothingEnabled = false;

  if (!runtime.roomScene.listenersBound) {
    runtime.roomScene.listenersBound = true;

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(runtime.roomScene.rafId);
        runtime.roomScene.rafId = 0;
        return;
      }

      restartRoomScene();
      void resumePlaybackAfterPageReturn();
    });

    window.addEventListener("pageshow", () => {
      restartRoomScene();
      void resumePlaybackAfterPageReturn();
    });

    window.addEventListener("resize", () => {
      ensureRoomSceneRunning({ redraw: true });
    });

    window.addEventListener("orientationchange", () => {
      restartRoomScene();
    });

    canvas.addEventListener("contextlost", (event) => {
      event.preventDefault();
      cancelAnimationFrame(runtime.roomScene.rafId);
      runtime.roomScene.rafId = 0;
      runtime.roomScene.context = null;
    });

    canvas.addEventListener("contextrestored", () => {
      const restoredContext = canvas.getContext("2d");
      if (!restoredContext) {
        return;
      }

      restoredContext.imageSmoothingEnabled = false;
      runtime.roomScene.context = restoredContext;
      restartRoomScene();
    });

    runtime.roomScene.watchdogId = window.setInterval(() => {
      if (document.hidden || !runtime.roomScene.context) {
        return;
      }

      const now = performance.now();
      const frameIsStale =
        !runtime.roomScene.rafId ||
        !runtime.roomScene.lastTimestamp ||
        now - runtime.roomScene.lastTimestamp > ROOM_SCENE_STALE_MS;
      if (frameIsStale) {
        restartRoomScene();
      }
    }, 1200);
  }

  restartRoomScene();
}

function stopRoomScene() {
  runtime.roomScene.generation += 1;
  cancelAnimationFrame(runtime.roomScene.rafId);
  runtime.roomScene.rafId = 0;
  window.clearInterval(runtime.roomScene.watchdogId);
  runtime.roomScene.watchdogId = 0;
}

function restartRoomScene() {
  if (!runtime.roomScene.context || document.hidden) {
    return;
  }

  runtime.roomScene.generation += 1;
  cancelAnimationFrame(runtime.roomScene.rafId);
  runtime.roomScene.rafId = 0;
  runtime.roomScene.lastDrawTimestamp = 0;
  drawRoomSceneSafely(performance.now());
  queueRoomSceneFrame();
}

function ensureRoomSceneRunning(options = {}) {
  const { redraw = false, restart = false } = options;

  if (!runtime.roomScene.context) {
    startRoomScene();
    return;
  }

  if (restart) {
    restartRoomScene();
    return;
  }

  if (redraw && !document.hidden) {
    drawRoomSceneSafely(performance.now());
  }

  if (!runtime.roomScene.rafId && !document.hidden) {
    queueRoomSceneFrame();
  }
}

function queueRoomSceneFrame() {
  if (
    runtime.roomScene.rafId ||
    !runtime.roomScene.context ||
    document.hidden
  ) {
    return;
  }

  const generation = runtime.roomScene.generation;
  runtime.roomScene.rafId = requestAnimationFrame((timestamp) => {
    if (generation !== runtime.roomScene.generation) {
      return;
    }

    runtime.roomScene.rafId = 0;
    queueRoomSceneFrame();

    if (
      runtime.roomScene.lastDrawTimestamp &&
      timestamp - runtime.roomScene.lastDrawTimestamp < getRoomFrameInterval()
    ) {
      return;
    }

    drawRoomSceneSafely(timestamp);
  });
}

function drawRoomSceneSafely(timestamp) {
  const context = runtime.roomScene.context;
  if (!context) {
    return;
  }

  runtime.roomScene.lastTimestamp = timestamp;
  runtime.roomScene.lastDrawTimestamp = timestamp;

  try {
    drawRoomScene(context, timestamp / 1000);
  } catch (error) {
    if (timestamp - runtime.roomScene.lastErrorLogTimestamp > 2000) {
      runtime.roomScene.lastErrorLogTimestamp = timestamp;
      console.warn("Room animation frame failed and will be retried", error);
    }
  }
}

async function resumePlaybackAfterPageReturn() {
  if (!runtime.playback.desiredPlaying) {
    return;
  }

  const audio = getActiveAudio();
  if (!audio) {
    return;
  }

  try {
    if (runtime.livePreview.context?.state === "suspended") {
      await runtime.livePreview.context.resume();
    }
    if (audio.paused) {
      await audio.play();
    }
    runtime.playback.autoplayBlocked = false;
    syncPlayerState();
    tickWaveforms();
  } catch (error) {
    console.warn("Playback did not resume after the page returned", error);
    runtime.playback.desiredPlaying = false;
    showPlaybackGestureFallback("Tap Start to resume this room.");
    syncPlayerState();
  }
}

function drawRoomScene(context, time) {
  const width = context.canvas.width;
  const height = context.canvas.height;
  const mood = currentMood();
  const playing = Boolean(getActiveAudio() && !getActiveAudio().paused);
  const hoverTarget = getRoomTargetAt(runtime.roomScene.pointer.x, runtime.roomScene.pointer.y);

  context.clearRect(0, 0, width, height);
  fillRect(context, 0, 0, width, height, "#07101f");
  drawRoomBackdrop(context, mood, time);
  drawRoomWindow(context, time, isRoomLayerActive("rain"), hoverTarget?.id === "rain");
  drawRoomLamp(context, time, hoverTarget?.id === "mood");
  drawRoomDesk(context);
  drawRoomPerson(context, time, playing);
  drawRoomTurntable(context, time, isRoomLayerActive("dust"), hoverTarget?.id === "dust");
  drawRoomRadio(context, time, isRoomLayerActive("drums"), hoverTarget?.id === "drums");
  drawRoomCup(context, time, isRoomLayerActive("cafe"), hoverTarget?.id === "cafe");
  drawRoomSofaKeyboard(context, time, runtime.state.mixUpload > 3, hoverTarget?.id === "source");
  drawRoomInteractionTags(context, hoverTarget);
  drawRoomFocusRing(context, hoverTarget);
  drawRoomTooltip(context, hoverTarget);
  drawRoomHud(context, mood, playing, hoverTarget);
}

function drawRoomBackdrop(context, mood, time) {
  fillRect(context, 0, 0, 960, 470, "#112f35");
  fillRect(context, 0, 382, 960, 218, "#10132a");

  for (let y = 395; y < 600; y += 28) {
    fillRect(context, 0, y, 960, 2, "rgba(255,255,255,0.045)");
  }

  for (let x = -80; x < 1060; x += 82) {
    fillRect(context, x, 384, 48, 216, "rgba(0,0,0,0.12)");
  }

  fillRect(context, 610, 64, 250, 168, "rgba(9,18,33,0.25)");
  fillRect(context, 628, 80, 218, 126, "#1b493d");
  strokeRect(context, 628, 80, 218, 126, 8, "#7b4f24");
  drawText(context, "LO-FI ROOM", 658, 128, 22, "#fff4cf", "left");
  drawText(context, mood.label.toUpperCase(), 658, 160, 14, "#baf6d7", "left");

  const glow = 0.22 + Math.sin(time * 2) * 0.05;
  fillRect(context, 422, 110, 154, 196, `rgba(255,235,128,${glow})`);
}

function drawRoomWindow(context, time, active, hovering) {
  drawPanelGlow(context, 58, 92, 276, 230, active ? "#5ebdff" : "#253e75", hovering);
  fillRect(context, 62, 96, 268, 220, "#261406");
  fillRect(context, 78, 112, 236, 188, "#071127");
  fillRect(context, 86, 120, 220, 80, "#1a3a70");
  fillRect(context, 86, 200, 220, 44, "#66b9bd");
  fillRect(context, 86, 244, 220, 56, "#f1c696");
  fillRect(context, 188, 112, 12, 188, "#3a1d0a");
  fillRect(context, 78, 202, 236, 12, "#3a1d0a");

  for (let star = 0; star < 12; star += 1) {
    const x = 102 + ((star * 47) % 184);
    const y = 130 + ((star * 23) % 58);
    fillRect(context, x, y, 4, 4, "#fff4b8");
  }

  if (active) {
    for (let drop = 0; drop < 18; drop += 1) {
      const x = 90 + ((drop * 31) % 198);
      const y = 114 + ((time * 90 + drop * 29) % 176);
      fillRect(context, x, y, 3, 20, "#bde9ff");
    }
  }

  drawRoomCat(context, time, active);
}

function drawRoomLamp(context, time, hovering) {
  drawPanelGlow(context, 408, 0, 174, 228, "#fff075", hovering);
  const pulse = 0.26 + Math.sin(time * 1.6) * 0.06;
  context.save();
  context.globalAlpha = hovering ? 0.56 : 0.36;
  drawTrapezoid(context, 430, 146, 556, 146, 606, 354, 378, 354, "#ffe982");
  context.restore();
  fillRect(context, 420, 116, 152, 190, `rgba(255,235,124,${pulse})`);
  fillRect(context, 490, 0, 8, 76, "#f2e9c7");
  fillRect(context, 466, 72, 58, 10, "#5a3b20");
  drawTrapezoid(context, 430, 86, 556, 86, 528, 148, 458, 148, "#16a05d");
  strokeTrapezoid(context, 430, 86, 556, 86, 528, 148, 458, 148, 5, "#064225");
  fillRect(context, 448, 142, 90, 12, "#0b6f3b");
  drawCircle(context, 494, 166, 18, "#fff4a8");
  fillRect(context, 486, 154, 16, 18, "#fff4a8");

  const rayAlpha = hovering ? 0.74 : 0.42;
  fillRect(context, 398, 178, 58, 7, `rgba(255,245,161,${rayAlpha})`);
  fillRect(context, 534, 178, 58, 7, `rgba(255,245,161,${rayAlpha})`);
  fillRect(context, 490, 202, 8, 72, `rgba(255,245,161,${rayAlpha})`);
}

function drawRoomCat(context, time, rainActive) {
  const breathe = Math.round(Math.sin(time * 2.2) * 1);
  const tailLift = Math.round(Math.sin(time * 1.4) * 3);
  const coat = rainActive ? "#4c445f" : "#3a3448";
  const coatDark = "#1b1726";
  const highlight = "#c4bbd9";

  fillRect(context, 222, 286, 116, 14, "#5d3518");
  fillRect(context, 230, 266 + breathe, 76, 34, coat);
  fillRect(context, 294, 246 + breathe, 46, 42, coat);
  fillRect(context, 246, 296 + breathe, 46, 8, coatDark);
  strokeRect(context, 230, 266 + breathe, 76, 34, 3, coatDark);
  strokeRect(context, 294, 246 + breathe, 46, 42, 3, coatDark);

  drawTriangle(context, 296, 250 + breathe, 308, 228 + breathe, 316, 252 + breathe, coat);
  drawTriangle(context, 318, 252 + breathe, 334, 230 + breathe, 340, 260 + breathe, coat);
  drawTriangle(context, 303, 246 + breathe, 308, 236 + breathe, 312, 251 + breathe, "#f1a7c2");
  drawTriangle(context, 324, 249 + breathe, 332, 238 + breathe, 334, 256 + breathe, "#f1a7c2");

  fillRect(context, 306, 266 + breathe, 6, 6, "#fff3a1");
  fillRect(context, 326, 266 + breathe, 6, 6, "#fff3a1");
  fillRect(context, 318, 278 + breathe, 6, 4, "#f2a6bb");
  fillRect(context, 299, 280 + breathe, 13, 2, highlight);
  fillRect(context, 326, 280 + breathe, 13, 2, highlight);
  fillRect(context, 304, 285 + breathe, 26, 3, coatDark);

  fillRect(context, 214, 258 + tailLift, 20, 10, coat);
  fillRect(context, 204, 240 + tailLift, 12, 30, coat);
  fillRect(context, 206, 234 + tailLift, 30, 9, coat);
  strokeRect(context, 204, 240 + tailLift, 12, 30, 3, coatDark);

  drawText(context, "Z", 278, 244 + Math.round(Math.sin(time * 1.2) * 2), 16, "#e9ddff", "center");
  drawText(context, "Z", 260, 226 + Math.round(Math.sin(time * 1.2 + 1) * 2), 11, "#b8d8ff", "center");
}

function drawRoomDesk(context) {
  fillRect(context, 294, 508, 318, 18, "rgba(0,0,0,0.22)");
  fillRect(context, 304, 402, 292, 28, "#a16b2f");
  fillRect(context, 304, 430, 292, 12, "#5b3417");
  strokeRect(context, 304, 402, 292, 40, 4, "#2b170c");

  fillRect(context, 320, 442, 54, 74, "#6c3f1c");
  fillRect(context, 530, 442, 42, 74, "#4a2a10");
  strokeRect(context, 320, 442, 54, 74, 3, "#29160b");
  strokeRect(context, 530, 442, 42, 74, 3, "#29160b");
  fillRect(context, 334, 462, 26, 4, "#d1a15c");
  fillRect(context, 334, 488, 26, 4, "#d1a15c");

  fillRect(context, 342, 346, 86, 58, "#151b25");
  strokeRect(context, 342, 346, 86, 58, 5, "#060a12");
  fillRect(context, 354, 358, 62, 34, "#96cfd0");
  fillRect(context, 374, 404, 24, 18, "#232833");
  fillRect(context, 350, 422, 72, 8, "#d8d4bd");
  fillRect(context, 432, 382, 30, 42, "#171b25");
  strokeRect(context, 432, 382, 30, 42, 4, "#070a11");
  fillRect(context, 438, 392, 18, 22, "#75e1ff");

  fillRect(context, 490, 392, 42, 10, "#e0c06d");
  fillRect(context, 494, 378, 32, 14, "#d96f49");
  fillRect(context, 498, 370, 24, 8, "#fff1ad");
}

function drawRoomPerson(context, time, playing) {
  const bob = playing ? Math.round(Math.sin(time * 5) * 3) : 0;
  fillRect(context, 226, 506, 112, 16, "rgba(0,0,0,0.25)");
  fillRect(context, 232, 342, 78, 94, "#151a2a");
  strokeRect(context, 232, 342, 78, 94, 4, "#070a13");
  fillRect(context, 222, 414, 96, 24, "#263348");
  fillRect(context, 264, 438, 10, 62, "#121827");
  fillRect(context, 238, 498, 62, 8, "#121827");
  fillRect(context, 232, 504, 14, 10, "#121827");
  fillRect(context, 292, 504, 14, 10, "#121827");

  fillRect(context, 250, 292 + bob, 54, 54, "#c89269");
  strokeRect(context, 250, 292 + bob, 54, 54, 4, "#3b1b12");
  fillRect(context, 246, 280 + bob, 62, 24, "#08060c");
  fillRect(context, 242, 300 + bob, 18, 40, "#08060c");
  fillRect(context, 294, 300 + bob, 18, 34, "#08060c");
  fillRect(context, 236, 310 + bob, 12, 26, "#73e4ff");
  fillRect(context, 304, 310 + bob, 12, 26, "#73e4ff");
  fillRect(context, 244, 304 + bob, 68, 6, "#73e4ff");
  fillRect(context, 264, 314 + bob, 5, 5, "#1a1210");
  fillRect(context, 286, 314 + bob, 5, 5, "#1a1210");
  fillRect(context, 274, 330 + bob, 16, 3, "#5d2c25");

  fillRect(context, 258, 342 + bob, 54, 78, "#267d8c");
  strokeRect(context, 258, 342 + bob, 54, 78, 4, "#0b323d");
  fillRect(context, 274, 342 + bob, 18, 12, "#d6a076");
  fillRect(context, 278, 358 + bob, 4, 42, "#b8eef0");
  fillRect(context, 290, 358 + bob, 4, 42, "#b8eef0");

  fillRect(context, 232, 362 + bob, 36, 18, "#c89269");
  fillRect(context, 304, 362 + bob, 44, 18, "#c89269");
  fillRect(context, 222, 374 + bob, 24, 12, "#8f5d3f");
  fillRect(context, 336, 374 + bob, 24, 12, "#8f5d3f");

  fillRect(context, 258, 418 + bob, 24, 56, "#07101f");
  fillRect(context, 288, 418 + bob, 24, 56, "#07101f");
  fillRect(context, 252, 468 + bob, 36, 12, "#1b2644");
  fillRect(context, 286, 468 + bob, 36, 12, "#1b2644");
}

function drawRoomTurntable(context, time, active, hovering) {
  drawPanelGlow(context, 318, 332, 210, 120, active ? "#ff77b8" : "#5d4c6d", hovering);
  fillRect(context, 356, 414, 164, 30, "#87571f");
  fillRect(context, 374, 444, 18, 62, "#4a2a10");
  fillRect(context, 486, 444, 18, 62, "#4a2a10");
  fillRect(context, 398, 354, 86, 60, "#171b25");
  fillRect(context, 410, 364, 54, 36, "#c7ccc3");

  const cx = 492;
  const cy = 378;
  const spin = active ? time * 6 : 0;
  drawCircle(context, cx, cy, 36, "#12131d");
  drawCircle(context, cx, cy, 13, "#ff5a9b");
  fillRect(context, cx + Math.cos(spin) * 12, cy + Math.sin(spin) * 12, 8, 4, "#f7e6ff");
  fillRect(context, 516, 352, 8, 54, "#d2c1a0");
}

function drawRoomRadio(context, time, active, hovering) {
  drawPanelGlow(context, 500, 370, 112, 100, active ? "#ffe06d" : "#5e5836", hovering);
  fillRect(context, 520, 390, 78, 60, "#c8b649");
  strokeRect(context, 520, 390, 78, 60, 5, "#49431a");
  fillRect(context, 535, 414, 28, 18, "#26261d");
  drawCircle(context, 580, 424, 11, "#fff39c");
  fillRect(context, 536, 376, 5, 22, "#dce5d5");
  fillRect(context, 576, 376, 5, 22, "#dce5d5");

  if (active) {
    const level = 8 + Math.round(Math.abs(Math.sin(time * 8)) * 15);
    fillRect(context, 535, 432 - level, 5, level, "#fff39c");
    fillRect(context, 546, 424 - level * 0.6, 5, Math.max(4, level * 0.6), "#fff39c");
    fillRect(context, 557, 430 - level * 0.8, 5, Math.max(4, level * 0.8), "#fff39c");
  }
}

function drawRoomCup(context, time, active, hovering) {
  drawPanelGlow(context, 142, 325, 92, 92, active ? "#ffd18f" : "#5d4b3a", hovering);
  fillRect(context, 144, 404, 96, 16, "rgba(0,0,0,0.22)");
  fillRect(context, 150, 392, 82, 14, "#5a351c");
  fillRect(context, 160, 406, 10, 36, "#2c1a0d");
  fillRect(context, 210, 406, 10, 36, "#2c1a0d");
  fillRect(context, 172, 366, 42, 34, "#d77640");
  fillRect(context, 208, 374, 18, 16, "#d77640");
  fillRect(context, 178, 400, 30, 6, "#8a3f25");
  fillRect(context, 164, 404, 58, 6, "#f0cf9a");

  if (active) {
    for (let i = 0; i < 3; i += 1) {
      const y = 350 - ((time * 20 + i * 10) % 34);
      fillRect(context, 180 + i * 10, y, 5, 18, "rgba(255,240,210,0.8)");
    }
  }
}

function drawRoomSofaKeyboard(context, time, active, hovering) {
  drawPanelGlow(context, 598, 318, 300, 172, active ? "#6feaff" : "#31505d", hovering);
  fillRect(context, 600, 476, 300, 18, "rgba(0,0,0,0.24)");
  fillRect(context, 620, 330, 242, 88, "#0a6470");
  strokeRect(context, 620, 330, 242, 88, 5, "#03323e");
  fillRect(context, 610, 392, 262, 62, "#087383");
  strokeRect(context, 610, 392, 262, 62, 5, "#03323e");
  fillRect(context, 624, 402, 75, 42, "#0f8a99");
  fillRect(context, 708, 402, 75, 42, "#0f8a99");
  fillRect(context, 792, 402, 62, 42, "#0f8a99");
  fillRect(context, 604, 410, 34, 74, "#064956");
  fillRect(context, 842, 410, 38, 74, "#064956");
  fillRect(context, 638, 454, 18, 30, "#042a33");
  fillRect(context, 824, 454, 18, 30, "#042a33");

  fillRect(context, 664, 426, 184, 8, "#0a1019");
  fillRect(context, 688, 408, 136, 8, "#0a1019");
  fillRect(context, 704, 432, 8, 46, "#0a1019");
  fillRect(context, 802, 432, 8, 46, "#0a1019");
  fillRect(context, 676, 382, 164, 44, "#101821");
  strokeRect(context, 676, 382, 164, 44, 4, "#060a12");
  fillRect(context, 688, 394, 138, 20, "#f4edd5");

  for (let key = 0; key < 15; key += 1) {
    fillRect(context, 692 + key * 8, 394, 3, 20, "#151821");
  }

  fillRect(context, 688, 418, 24, 4, "#6feaff");
  fillRect(context, 718, 418, 24, 4, "#ff77b8");
  fillRect(context, 748, 418, 24, 4, "#ffe06d");

  if (active) {
    fillRect(context, 688 + (Math.floor(time * 8) % 14) * 8, 394, 7, 20, "#d9efff");
  }

  fillRect(context, 830, 245, 36, 128, "#d39a58");
  strokeRect(context, 830, 245, 36, 128, 4, "#5b3517");
  drawCircle(context, 848, 392, 34, "#b66b2d");
  strokeRect(context, 816, 374, 64, 42, 4, "#5b3517");
  drawCircle(context, 848, 392, 12, "#5b3517");
  fillRect(context, 847, 250, 4, 132, "#5b3517");
  fillRect(context, 837, 246, 26, 12, "#8b552c");
  fillRect(context, 836, 282, 28, 4, "#fff2b4");
}

function drawRoomInteractionTags(context, hoverTarget) {
  const tags = [
    { id: "rain", label: "RAIN", x: 92, y: 324, color: "#6feaff", active: isRoomLayerActive("rain") },
    { id: "mood", label: "LIGHT", x: 442, y: 178, color: "#fff075", active: true },
    { id: "cafe", label: "CAFE", x: 142, y: 424, color: "#ffd18f", active: isRoomLayerActive("cafe") },
    { id: "dust", label: "VINYL", x: 352, y: 326, color: "#ff77b8", active: isRoomLayerActive("dust") },
    { id: "drums", label: "DRUMS", x: 512, y: 352, color: "#ffe06d", active: isRoomLayerActive("drums") },
    { id: "source", label: "KEYS", x: 704, y: 432, color: "#6feaff", active: runtime.state.mixUpload > 3 },
  ];

  for (const tag of tags) {
    drawGameTag(context, tag.label, tag.x, tag.y, tag.color, tag.active || hoverTarget?.id === tag.id);
  }
}

function drawGameTag(context, label, x, y, color, active) {
  const width = Math.max(70, label.length * 12 + 22);
  const fill = active ? color : "rgba(5,10,22,0.8)";
  const textColor = active ? "#161927" : "#e8f1ff";
  fillRect(context, x + 4, y + 5, width, 30, "rgba(0,0,0,0.26)");
  fillRect(context, x, y, width, 30, fill);
  strokeRect(context, x, y, width, 30, 3, active ? "#fff8c8" : "rgba(255,255,255,0.18)");
  drawText(context, label, x + width / 2, y + 21, 14, textColor, "center");
}

function drawRoomFocusRing(context, target) {
  if (!target || target.type === "mood") {
    return;
  }

  context.save();
  context.globalAlpha = 0.86;
  strokeRect(context, target.x - 8, target.y - 8, target.width + 16, target.height + 16, 5, "#fff3a6");
  context.globalAlpha = 0.18;
  fillRect(context, target.x - 8, target.y - 8, target.width + 16, target.height + 16, "#fff3a6");
  context.restore();
}

function drawRoomTooltip(context, hoverTarget) {
  if (!hoverTarget || hoverTarget.type === "mood") {
    return;
  }

  const label = hoverTarget.type === "layer"
    ? `${hoverTarget.label} / click to toggle`
    : `${hoverTarget.label} / click to use`;
  const width = Math.max(260, label.length * 10 + 28);
  const x = Math.round((960 - width) / 2);
  const y = 482;

  fillRect(context, x + 5, y + 5, width, 38, "rgba(0,0,0,0.28)");
  fillRect(context, x, y, width, 38, "rgba(5,10,22,0.88)");
  strokeRect(context, x, y, width, 38, 3, "#fff4a8");
  drawText(context, label.toUpperCase(), x + width / 2, y + 25, 13, "#fff4cf", "center");
}

function drawRoomHud(context, mood, playing, hoverTarget) {
  fillRect(context, 22, 22, 292, 64, "rgba(5,10,22,0.76)");
  strokeRect(context, 22, 22, 292, 64, 3, "rgba(255,255,255,0.16)");
  fillRect(context, 22, 22, 7, 64, playing ? "#92f2bc" : "#62d9ff");
  drawText(context, mood.label, 44, 48, 20, "#fff5dc", "left");
  drawText(context, `${runtime.state.beatTempo} BPM / ${runtime.state.mode.toUpperCase()} / 30 MIN`, 44, 72, 13, "#b8def0", "left");

  fillRect(context, 336, 32, playing ? 96 : 116, 34, playing ? "#92f2bc" : "#ffd37a");
  strokeRect(context, 336, 32, playing ? 96 : 116, 34, 3, "#07101f");
  drawText(context, playing ? "LIVE" : "READY", 384, 55, 15, "#07101f", "center");

  for (const target of ROOM_TARGETS) {
    if (target.type !== "layer") {
      continue;
    }
    const active = isRoomLayerActive(target.id);
    const x = target.badgeX;
    const y = target.badgeY;
    fillRect(context, x, y, 84, 28, active ? "#fff2a8" : "rgba(5,10,22,0.7)");
    strokeRect(context, x, y, 84, 28, 2, active ? "#07101f" : "rgba(255,255,255,0.16)");
    drawText(context, active ? "ON" : "OFF", x + 42, y + 19, 11, active ? "#2c2430" : "#d8d6ff", "center");
  }

  const categoryTargets = ROOM_TARGETS.filter((target) => target.type === "mood");
  for (const target of categoryTargets) {
    const active = runtime.state.mood === target.id;
    fillRect(context, target.x + 4, target.y + 5, target.width, target.height, "rgba(0,0,0,0.24)");
    fillRect(context, target.x, target.y, target.width, target.height, active ? "#ffd36f" : "rgba(8,14,28,0.74)");
    strokeRect(context, target.x, target.y, target.width, target.height, 3, active ? "#fff2b4" : "rgba(255,255,255,0.12)");
    drawText(context, target.shortLabel, target.x + target.width / 2, target.y + 21, 14, active ? "#271d20" : "#e6e8ff", "center");
    drawText(context, "30 MIN", target.x + target.width / 2, target.y + 40, 11, active ? "#4b3422" : "#9fb2ce", "center");
  }
}

const ROOM_TARGETS = [
  { id: "rain", label: "Rain window", type: "layer", x: 48, y: 92, width: 292, height: 236, badgeX: 76, badgeY: 328 },
  { id: "dust", label: "Turntable", type: "layer", x: 318, y: 324, width: 224, height: 148, badgeX: 360, badgeY: 470 },
  { id: "drums", label: "Radio drums", type: "layer", x: 496, y: 356, width: 126, height: 116, badgeX: 516, badgeY: 470 },
  { id: "cafe", label: "Coffee cup", type: "layer", x: 136, y: 318, width: 106, height: 110, badgeX: 146, badgeY: 428 },
  { id: "source", label: "Keyboard preset", type: "action", x: 598, y: 318, width: 304, height: 176 },
  { id: "mood", label: "Lamp light", type: "action", x: 410, y: 0, width: 182, height: 224 },
  { id: "play", label: "Play button", type: "play", x: 744, y: 22, width: 190, height: 88 },
  { id: "focus", label: "Mirostar Beats", shortLabel: "MIROSTAR", type: "mood", x: 34, y: 524, width: 160, height: 52 },
  { id: "cozy", label: "Good Night Cozy", shortLabel: "COZY", type: "mood", x: 210, y: 524, width: 160, height: 52 },
  { id: "smooth", label: "Pulsebox Smooth", shortLabel: "SMOOTH", type: "mood", x: 386, y: 524, width: 160, height: 52 },
  { id: "mountain", label: "Mountain Lo-Fi", shortLabel: "MOUNTAIN", type: "mood", x: 562, y: 524, width: 160, height: 52 },
  { id: "pretty", label: "PrettyJohn Lo-Fi", shortLabel: "PRETTY", type: "mood", x: 738, y: 524, width: 160, height: 52 },
];

function isRoomLayerActive(layerId) {
  const stateKey = LAYER_KEYS[layerId];
  return Boolean(stateKey && Number(runtime.state[stateKey]) > 3);
}

function getRoomTargetAt(x, y) {
  if (x < 0 || y < 0) {
    return null;
  }

  for (let index = ROOM_TARGETS.length - 1; index >= 0; index -= 1) {
    const target = ROOM_TARGETS[index];
    if (
      x >= target.x &&
      x <= target.x + target.width &&
      y >= target.y &&
      y <= target.y + target.height
    ) {
      return target;
    }
  }

  return null;
}

function roomPointerFromEvent(event) {
  const rect = elements.roomCanvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * elements.roomCanvas.width,
    y: ((event.clientY - rect.top) / rect.height) * elements.roomCanvas.height,
  };
}

function drawPanelGlow(context, x, y, width, height, color, hovering) {
  context.save();
  context.globalAlpha = hovering ? 0.34 : 0.16;
  fillRect(context, x - 8, y - 8, width + 16, height + 16, color);
  context.restore();
}

function fillRect(context, x, y, width, height, color) {
  context.fillStyle = color;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function strokeRect(context, x, y, width, height, lineWidth, color) {
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.strokeRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawCircle(context, x, y, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(Math.round(x), Math.round(y), radius, 0, Math.PI * 2);
  context.fill();
}

function drawTriangle(context, x1, y1, x2, y2, x3, y3, color) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(Math.round(x1), Math.round(y1));
  context.lineTo(Math.round(x2), Math.round(y2));
  context.lineTo(Math.round(x3), Math.round(y3));
  context.closePath();
  context.fill();
}

function drawTrapezoid(context, x1, y1, x2, y2, x3, y3, x4, y4, color) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(Math.round(x1), Math.round(y1));
  context.lineTo(Math.round(x2), Math.round(y2));
  context.lineTo(Math.round(x3), Math.round(y3));
  context.lineTo(Math.round(x4), Math.round(y4));
  context.closePath();
  context.fill();
}

function strokeTrapezoid(context, x1, y1, x2, y2, x3, y3, x4, y4, lineWidth, color) {
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.beginPath();
  context.moveTo(Math.round(x1), Math.round(y1));
  context.lineTo(Math.round(x2), Math.round(y2));
  context.lineTo(Math.round(x3), Math.round(y3));
  context.lineTo(Math.round(x4), Math.round(y4));
  context.closePath();
  context.stroke();
}

function drawText(context, text, x, y, size, color, align) {
  context.fillStyle = color;
  context.font = `700 ${size}px Consolas, monospace`;
  context.textAlign = align;
  context.textBaseline = "alphabetic";
  context.fillText(text, Math.round(x), Math.round(y));
}

function formatTime(seconds) {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  if (hours > 0) {
    const hourMinutes = Math.floor((total % 3600) / 60);
    return `${String(hours).padStart(2, "0")}:${String(hourMinutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function formatBytes(bytes) {
  if (!bytes) {
    return "--";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function buildDownloadName(originalName, mode, extension) {
  const stem = originalName.replace(/\.[^.]+$/, "");
  return `${stem}-${mode}-${runtime.state.mood}.${extension}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
