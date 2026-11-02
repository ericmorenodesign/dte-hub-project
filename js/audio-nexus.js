import { NODES } from './nodes-data.js';

export class AudioNexus {
  constructor(onNodeChanged) {
    this.onNodeChanged = onNodeChanged;
    this.activeIdx = 0; // Default I: SIMULACRA
    this.activeNode = NODES[this.activeIdx];

    this.audioCtx = null;
    this.analyser = null;
    this.dataArray = null;
    this.audioElement = new Audio();
    this.audioElement.preload = "auto";
    this.mediaSource = null;
    this.hasStartedFirstTrack = false;
    this.currentLoadToken = 0;
    this.lastCueLyric = "";

    this.whisperTitleEl = document.getElementById('whisperTitle');
    this.whisperLyricEl = document.getElementById('whisperLyric');
    this.threadWrapEl = document.getElementById('threadWrap');
    this.threadFillEl = document.getElementById('threadFill');
    this.whisperTimer = null;
    this.lyricTimer = null;

    this.initListeners();
    setTimeout(() => {
      this.showTitleWhisper("DRAG CRYSTAL TO SCRY THE VOID  ·  CLICK TO ENTER REALM I", 5200);
    }, 500);
  }

  fmtTime(sec) {
    if (!sec || !isFinite(sec)) return "00:00";
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  showTitleWhisper(text, duration = 4500) {
    this.whisperTitleEl.textContent = text;
    this.whisperTitleEl.classList.add('active');
    if (this.whisperTimer) clearTimeout(this.whisperTimer);
    this.whisperTimer = setTimeout(() => this.whisperTitleEl.classList.remove('active'), duration);
  }

  showLyricWhisper(text, duration = 6500) {
    document.documentElement.style.setProperty('--node-glow', this.activeNode.hex);
    this.whisperLyricEl.textContent = text;
    this.whisperLyricEl.classList.add('active');
    if (this.lyricTimer) clearTimeout(this.lyricTimer);
    this.lyricTimer = setTimeout(() => this.whisperLyricEl.classList.remove('active'), duration);
  }

  ensureAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
  }

  updateRomanNavUI() {
    document.querySelectorAll('.roman-node').forEach((btn, i) => {
      const isAct = i === this.activeIdx;
      btn.classList.toggle('active', isAct);
      btn.classList.toggle('playing', isAct && !this.audioElement.paused);
      if (isAct) btn.style.setProperty('--node-glow', this.activeNode.hex);
    });
  }

  async playNodeTrack(node) {
    this.ensureAudio();
    this.hasStartedFirstTrack = true;
    const token = ++this.currentLoadToken;

    this.audioElement.pause();

    if (!this.mediaSource && window.location.protocol !== 'file:') {
      try {
        this.mediaSource = this.audioCtx.createMediaElementSource(this.audioElement);
        this.mediaSource.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
      } catch (e) {}
    }

    for (const candidatePath of node.paths) {
      if (token !== this.currentLoadToken) return;
      try {
        this.audioElement.src = candidatePath;
        await this.audioElement.play();
        this.threadWrapEl.classList.add('visible');
        document.documentElement.style.setProperty('--node-glow', node.hex);
        this.showTitleWhisper(`${node.roman}  ·  ${node.title}  ·  00:00`, 5500);
        this.updateRomanNavUI();
        return;
      } catch (err) {}
    }

    if (token === this.currentLoadToken) {
      this.showTitleWhisper(`UNABLE TO LOAD ${node.title}`, 5000);
    }
  }

  selectNode(idx, forcePlay = false) {
    const node = NODES[idx];
    if (!node) return;

    if (idx === this.activeIdx && this.hasStartedFirstTrack && !forcePlay) {
      if (this.audioElement.paused) {
        this.audioElement.play();
        this.showTitleWhisper(`${node.roman}  ·  ${node.title}  ·  ${this.fmtTime(this.audioElement.currentTime)}`);
      } else {
        this.audioElement.pause();
        this.showTitleWhisper(`${node.roman}  ·  PAUSED`);
      }
      this.updateRomanNavUI();
      return;
    }

    this.activeIdx = idx;
    this.activeNode = node;
    this.lastCueLyric = "";

    if (this.onNodeChanged) this.onNodeChanged(node, idx);
    this.playNodeTrack(node);
    this.updateRomanNavUI();
  }

  getSpectrum(elapsedTime) {
    let bass = 0, mid = 0, high = 0;
    if (this.analyser && this.dataArray && !this.audioElement.paused) {
      this.analyser.getByteFrequencyData(this.dataArray);
      for (let i = 0; i < 10; i++) bass += this.dataArray[i];
      bass /= (10 * 255);
      for (let i = 10; i < 45; i++) mid += this.dataArray[i];
      mid /= (35 * 255);
      for (let i = 45; i < 100; i++) high += this.dataArray[i];
      high /= (55 * 255);

      if (bass < 0.01 && window.location.protocol === 'file:') {
        bass = 0.22 + Math.sin(elapsedTime * 6.5) * 0.12 + Math.pow(Math.sin(elapsedTime * 2.1), 4.0) * 0.25;
        mid = 0.18 + Math.sin(elapsedTime * 8.2) * 0.10;
        high = 0.14 + Math.cos(elapsedTime * 11.4) * 0.10;
      }
    }
    return { bass, mid, high };
  }

  initListeners() {
    this.audioElement.addEventListener('timeupdate', () => {
      const cur = this.audioElement.currentTime;
      const dur = this.audioElement.duration || 1;
      this.threadFillEl.style.width = `${(cur / dur) * 100}%`;

      if (this.whisperTitleEl.classList.contains('active') && !this.audioElement.paused) {
        this.whisperTitleEl.textContent = `${this.activeNode.roman}  ·  ${this.activeNode.title}  ·  ${this.fmtTime(cur)}`;
      }

      if (this.activeNode && this.activeNode.cues) {
        let currentCue = null;
        for (let i = 0; i < this.activeNode.cues.length; i++) {
          if (cur >= this.activeNode.cues[i].t) currentCue = this.activeNode.cues[i];
        }
        if (currentCue && currentCue.lyric !== this.lastCueLyric) {
          this.lastCueLyric = currentCue.lyric;
          this.showLyricWhisper(currentCue.lyric, 6500);
        }
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.selectNode((this.activeIdx + 1) % NODES.length, true);
    });

    this.threadWrapEl.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.threadWrapEl.addEventListener('pointerup', (e) => e.stopPropagation());
    this.threadWrapEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.audioElement.duration) return;
      const rect = this.threadWrapEl.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.audioElement.currentTime = pct * this.audioElement.duration;
      this.showTitleWhisper(`${this.activeNode.roman}  ·  ${this.activeNode.title}  ·  ${this.fmtTime(this.audioElement.currentTime)}`, 4500);
    });

    document.querySelectorAll('.roman-node').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => e.stopPropagation());
      btn.addEventListener('pointerup', (e) => e.stopPropagation());
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectNode(parseInt(btn.dataset.idx, 10));
      });
    });

    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('audio/')) {
        this.ensureAudio();
        this.hasStartedFirstTrack = true;
        this.audioElement.src = URL.createObjectURL(file);
        this.audioElement.play();
        this.threadWrapEl.classList.add('visible');
        this.showTitleWhisper(file.name.replace(/\.[^/.]+$/, ""));
        this.updateRomanNavUI();
      }
    });
  }
}
