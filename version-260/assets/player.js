
import { H as Hls } from './hls-dru42stk.js';

function setStatus(shell, message) {
  const status = shell.querySelector('[data-player-status]');
  if (status) {
    status.textContent = message;
  }
}

function attachSource(video, source) {
  if (video.dataset.loaded === 'true') {
    return Promise.resolve();
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.dataset.loaded = 'true';
    return Promise.resolve();
  }

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    video.dataset.loaded = 'true';
    video._hlsInstance = hls;
    return Promise.resolve();
  }

  return Promise.reject(new Error('当前浏览器不支持 HLS 播放。'));
}

function initPlayer(shell) {
  const video = shell.querySelector('[data-hls-player]');
  const button = shell.querySelector('[data-play-button]');
  if (!video || !button) {
    return;
  }

  const source = video.dataset.src;
  const play = async () => {
    if (!source) {
      setStatus(shell, '当前影片缺少播放源。');
      return;
    }

    try {
      setStatus(shell, '正在加载高清播放源...');
      await attachSource(video, source);
      shell.classList.add('is-ready');
      video.controls = true;
      await video.play();
    } catch (error) {
      shell.classList.remove('is-ready');
      setStatus(shell, error && error.message ? error.message : '播放启动失败，请稍后重试。');
    }
  };

  button.addEventListener('click', play);
  video.addEventListener('play', () => shell.classList.add('is-ready'));
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-video-shell]').forEach(initPlayer);
});
