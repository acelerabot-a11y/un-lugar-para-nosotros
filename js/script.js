/* ==========================================================================
   UN LUGAR PARA NOSOTROS · lógica de la experiencia
   --------------------------------------------------------------------------
   1. Preferencias (movimiento reducido)
   2. El cielo animado (canvas: estrellas, partículas, estrellas fugaces)
   3. Flores
   4. Navegación entre los cinco momentos
   5. Playlist con YouTube (una sola canción suena a la vez)
   6. La carta
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const rand = (a, b) => a + Math.random() * (b - a);

  /* 1. Preferencias ------------------------------------------------------- */
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionQuery.matches;

  /* 2. El cielo ----------------------------------------------------------- */
  const sky = createSky($('#sky'));

  motionQuery.addEventListener?.('change', (e) => {
    reducedMotion = e.matches;
    sky.setReduced(reducedMotion);
  });

  function createSky(canvas) {
    const ctx = canvas.getContext('2d');
    const STAR_COLORS = ['255,255,255', '255,240,214', '220,212,255'];
    let w = 0, h = 0, dpr = 1;
    let stars = [], motes = [];
    let shooting = null, nextShoot = 0;
    let warpStart = -1;
    let intensity = 0.55, intensityTarget = 0.55;
    let rafId = 0, lastT = 0;
    let reduced = reducedMotion;

    // Pequeños "sprites" de luz, para no dibujar degradados en cada cuadro
    const glowGold = makeGlow('255,222,160');
    const glowLilac = makeGlow('210,195,255');

    function makeGlow(rgb) {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, `rgba(${rgb},1)`);
      grd.addColorStop(0.25, `rgba(${rgb},0.55)`);
      grd.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = grd;
      g.fillRect(0, 0, 64, 64);
      return c;
    }

    function newMote(initial) {
      return {
        x: rand(0, w),
        y: initial ? rand(0, h) : h + rand(10, 60),
        r: rand(1, 2.8),
        vy: rand(5, 13),          // px por segundo, hacia arriba
        sway: rand(8, 22),
        sp: rand(0.15, 0.45),
        ph: rand(0, Math.PI * 2),
        a: rand(0.25, 0.75),
        warm: Math.random() < 0.72,
        slot: Math.random()       // decide si aparece según la intensidad
      };
    }

    function seed() {
      const count = Math.min(560, Math.round((w * h) / 2300));
      stars = Array.from({ length: count }, () => {
        const big = Math.random() < 0.07;
        return {
          x: rand(0, w),
          y: rand(0, h),
          r: big ? rand(1.1, 1.8) : rand(0.3, 1),
          a: rand(0.35, 0.95),
          tw: rand(0.4, 1.5),
          ph: rand(0, Math.PI * 2),
          c: STAR_COLORS[Math.random() < 0.7 ? 0 : Math.random() < 0.5 ? 1 : 2],
          big
        };
      });
      motes = Array.from({ length: 46 }, () => newMote(true));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduced) draw(performance.now(), 0);
    }

    function draw(t, dt) {
      ctx.clearRect(0, 0, w, h);
      const sec = t / 1000;
      const cx = w / 2, cy = h * 0.45;

      // "Viaje" suave al presionar Descubrir: las estrellas se abren desde el centro
      let warp = 0;
      if (warpStart >= 0) {
        const p = (t - warpStart) / 2000;
        if (p >= 1) warpStart = -1;
        else warp = Math.sin(p * Math.PI) ** 2;
      }

      // Estrellas que titilan y se desplazan muy despacio
      for (const s of stars) {
        const tw = reduced ? 1 : 0.62 + 0.38 * Math.sin(sec * s.tw + s.ph);
        const alpha = s.a * tw;
        let x = reduced ? s.x : (s.x - sec * 1.4 * s.r + w * 10) % w;
        let y = s.y;

        if (warp > 0) {
          const dx = x - cx, dy = y - cy;
          const k = 1 + warp * 0.55;
          const k0 = 1 + warp * 0.4;
          ctx.strokeStyle = `rgba(${s.c},${alpha})`;
          ctx.lineWidth = s.r;
          ctx.beginPath();
          ctx.moveTo(cx + dx * k0, cy + dy * k0);
          ctx.lineTo(cx + dx * k, cy + dy * k);
          ctx.stroke();
          continue;
        }

        ctx.fillStyle = `rgba(${s.c},${alpha})`;
        if (s.r < 0.8) {
          ctx.fillRect(x, y, s.r * 1.4, s.r * 1.4);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, s.r, 0, Math.PI * 2);
          ctx.fill();
          if (s.big) {
            ctx.globalAlpha = alpha * 0.5;
            ctx.drawImage(glowLilac, x - s.r * 5, y - s.r * 5, s.r * 10, s.r * 10);
            ctx.globalAlpha = 1;
          }
        }
      }

      // Partículas luminosas que suben lentamente
      intensity += (intensityTarget - intensity) * Math.min(1, dt * 0.8);
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        if (!reduced) {
          m.y -= m.vy * dt;
          if (m.y < -30) motes[i] = newMote(false);
        }
        const visible = Math.max(0, Math.min(1, (intensity - m.slot) * 6 + 1));
        if (visible <= 0) continue;
        const x = m.x + (reduced ? 0 : Math.sin(sec * m.sp + m.ph) * m.sway);
        const flicker = reduced ? 1 : 0.7 + 0.3 * Math.sin(sec * 2 * m.sp + m.ph);
        const size = m.r * 7;
        ctx.globalAlpha = m.a * flicker * visible;
        ctx.drawImage(m.warm ? glowGold : glowLilac, x - size / 2, m.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      // Estrella fugaz discreta, de vez en cuando
      if (!reduced) {
        if (!shooting && t > nextShoot) {
          if (nextShoot) {
            shooting = {
              x: rand(w * 0.3, w * 1.05),
              y: rand(-20, h * 0.35),
              vx: -rand(520, 720),
              vy: rand(180, 260),
              life: 0,
              max: rand(0.9, 1.3)
            };
          }
          nextShoot = t + rand(9000, 17000);
        }
        if (shooting) {
          const s = shooting;
          s.life += dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          const p = s.life / s.max;
          const a = Math.sin(Math.min(1, p) * Math.PI) * 0.8;
          const tail = 0.16;
          const grd = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * tail, s.y - s.vy * tail);
          grd.addColorStop(0, `rgba(255,246,225,${a})`);
          grd.addColorStop(1, 'rgba(255,246,225,0)');
          ctx.strokeStyle = grd;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * tail, s.y - s.vy * tail);
          ctx.stroke();
          if (p >= 1) shooting = null;
        }
      }
    }

    function loop(t) {
      const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0;
      lastT = t;
      draw(t, dt);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(rafId);
      lastT = 0;
      if (reduced) draw(performance.now(), 0);
      else rafId = requestAnimationFrame(loop);
    }

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    start();

    return {
      warp() { if (!reduced) warpStart = performance.now(); },
      setIntensity(v) {
        intensityTarget = v;
        if (reduced) { intensity = v; draw(performance.now(), 0); }
      },
      setReduced(v) { reduced = v; start(); }
    };
  }

  /* 3. Flores ------------------------------------------------------------- */
  // Rama delicada dibujada con SVG: tallo, hojas y tres flores pequeñas.
  const FLOWER_SVG = `
    <svg viewBox="0 0 120 210" aria-hidden="true">
      <path class="stem" d="M60 210 C58 168 70 138 62 102 C56 74 64 48 72 26" />
      <path class="stem" d="M61 96 C55 88 48 80 44 68" />
      <path class="stem" d="M64 128 C74 120 84 112 92 98" />
      <path class="leaf" style="--k:0" d="M61 158 C42 150 33 133 35 120 C50 126 58 140 61 158 Z" />
      <path class="leaf" style="--k:1" d="M65 140 C82 134 92 120 92 110 C78 114 68 126 65 140 Z" />
      <path class="leaf" style="--k:2" d="M63 84 C50 80 43 70 43 62 C54 66 61 74 63 84 Z" />
      ${bloom(72, 24, 1, 0, '')}
      ${bloom(43, 66, 0.75, 1, 'bloom--warm')}
      ${bloom(93, 96, 0.62, 2, '')}
    </svg>`;

  function bloom(x, y, s, k, extra) {
    const petals = [0, 72, 144, 216, 288]
      .map((a) => `<ellipse class="petal" cx="0" cy="-7.5" rx="4.6" ry="8" transform="rotate(${a})" />`)
      .join('');
    return `<g transform="translate(${x} ${y}) scale(${s})"><g class="bloom ${extra}" style="--k:${k}">${petals}<circle class="heart" r="2.4" /></g></g>`;
  }

  const flowers = $$('.flower');
  flowers.forEach((f) => { f.innerHTML = FLOWER_SVG; });

  function updateFlowers(scene) {
    flowers.forEach((f) => {
      const show = f.dataset.scenes.split(' ').includes(String(scene));
      f.classList.toggle('is-shown', show);
    });
  }

  /* 4. Navegación --------------------------------------------------------- */
  const scenes = $$('.scene');
  const dots = $$('.progress button');
  const backBtn = $('.back');
  const SCENE_SONGS = 2;
  const MOOD = [0.45, 0.5, 0.35, 0.45, 1]; // intensidad de partículas por momento
  let current = 0;
  let maxVisited = 0;
  let busy = false;

  function goTo(index) {
    if (busy || index === current || index < 0 || index >= scenes.length) return;
    busy = true;

    const from = scenes[current];
    const to = scenes[index];

    from.classList.add('is-leaving');
    from.classList.remove('is-active');
    from.setAttribute('inert', '');

    to.scrollTop = 0;
    to.removeAttribute('inert');
    to.classList.remove('is-leaving');
    // pequeño desfase para que la escena saliente empiece a desvanecerse primero
    setTimeout(() => {
      to.classList.add('is-active');
      $('[tabindex="-1"]', to)?.focus({ preventScroll: true });
    }, reducedMotion ? 0 : 380);

    current = index;
    maxVisited = Math.max(maxVisited, index);
    document.body.dataset.scene = String(index);
    sky.setIntensity(MOOD[index]);
    updateFlowers(index);
    updateChrome();
    updateNowPlaying();
    if (index === 3) onLetterSceneEnter();

    setTimeout(() => {
      from.classList.remove('is-leaving');
      busy = false;
    }, reducedMotion ? 300 : 1000);
  }

  function updateChrome() {
    backBtn.hidden = current === 0;
    dots.forEach((d, i) => {
      d.disabled = i > maxVisited;
      d.classList.toggle('is-visited', i <= maxVisited);
      if (i === current) d.setAttribute('aria-current', 'step');
      else d.removeAttribute('aria-current');
    });
  }

  // Botones
  $('[data-action="discover"]').addEventListener('click', () => {
    sky.warp();
    setTimeout(() => goTo(1), reducedMotion ? 0 : 700);
  });
  $$('[data-action="next"]').forEach((b) => b.addEventListener('click', () => goTo(current + 1)));
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => goTo(Number(b.dataset.go))));
  backBtn.addEventListener('click', () => goTo(current - 1));

  // Teclado: flecha izquierda o Escape para volver
  document.addEventListener('keydown', (e) => {
    if (e.target.closest?.('input, textarea')) return;
    if (e.key === 'ArrowLeft' || e.key === 'Escape') goTo(current - 1);
  });

  /* 5. Playlist ----------------------------------------------------------- */
  const SONGS = Array.isArray(window.SONGS) ? window.SONGS : [];
  const playlistEl = $('#playlist');
  const nowEl = $('.now-playing');
  const nowTitle = $('strong', nowEl);
  const nowToggle = $('.now-playing__toggle', nowEl);

  const ICON_PLAY = '<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>';
  const ICON_PAUSE = '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zM13 5h3v14h-3z"/></svg>';

  const tracks = []; // { song, el, player, state }
  let nowPlaying = null; // pista que sonó por última vez

  // La canción especial va primero; el resto conserva el orden de songs.js
  const ordered = [...SONGS.filter((s) => s.featured), ...SONGS.filter((s) => !s.featured)];

  ordered.forEach((song, i) => {
    const el = document.createElement('article');
    el.className = 'track reveal' + (song.featured ? ' track--featured' : '');
    el.style.setProperty('--d', String(600 + i * 180));
    const number = String(SONGS.indexOf(song) + 1).padStart(2, '0');
    const thumb = `https://i.ytimg.com/vi/${encodeURIComponent(song.youtubeId)}/hqdefault.jpg`;

    el.innerHTML = `
      <div class="track__media">
        <div class="track__player"></div>
        <button class="track__cover" type="button" aria-label="Escuchar ${song.title} aquí">
          <img src="${thumb}" alt="" loading="lazy" decoding="async" />
          <span class="track__play-icon">${ICON_PLAY}</span>
        </button>
      </div>
      <div class="track__info">
        ${song.featured ? '<p class="track__tag">Una canción especial</p>' : ''}
        <div class="track__meta">
          <span class="track__num">${number}</span>
          <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
        </div>
        <h3 class="track__title">${song.title}</h3>
        <p class="track__artist">${song.artist}</p>
        <div class="track__actions">
          <button class="track__btn" type="button">${ICON_PLAY}${ICON_PAUSE}<span>Escuchar</span></button>
          <a class="track__yt" href="${song.url}" target="_blank" rel="noopener">Abrir en YouTube ↗</a>
        </div>
        <p class="track__error" hidden>Este video prefiere abrirse directamente en YouTube. Puedes escucharlo con el enlace de arriba.</p>
      </div>`;

    // Si la miniatura oficial no carga, queda la portada hecha con CSS
    $('img', el).addEventListener('error', (e) => e.currentTarget.remove());

    const track = { song, el, player: null, state: -1 };
    tracks.push(track);
    $('.track__cover', el).addEventListener('click', () => toggleTrack(track));
    $('.track__btn', el).addEventListener('click', () => toggleTrack(track));
    playlistEl.appendChild(el);
  });

  // Carga la API de YouTube solo cuando alguien da play por primera vez
  let ytReady = null;
  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (ytReady) return ytReady;
    ytReady = new Promise((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev();
        resolve(window.YT);
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.async = true;
      s.onerror = () => reject(new Error('No se pudo cargar YouTube'));
      document.head.appendChild(s);
      setTimeout(() => reject(new Error('YouTube tardó demasiado')), 15000);
    }).catch((err) => {
      ytReady = null; // permite reintentar
      throw err;
    });
    return ytReady;
  }

  function toggleTrack(track) {
    if (track.player && typeof track.player.getPlayerState === 'function') {
      const st = track.player.getPlayerState();
      if (st === 1 || st === 3) track.player.pauseVideo();
      else track.player.playVideo();
      return;
    }
    if (track.el.classList.contains('is-loading')) return;
    createPlayer(track);
  }

  function createPlayer(track) {
    const { el, song } = track;
    el.classList.add('is-loading');
    pauseOthers(track);

    loadYouTubeAPI()
      .then((YT) => {
        const vars = { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 };
        if (location.protocol.startsWith('http')) vars.origin = location.origin;
        track.player = new YT.Player($('.track__player', el), {
          videoId: song.youtubeId,
          width: '100%',
          height: '100%',
          playerVars: vars,
          events: {
            onReady: (e) => {
              el.classList.remove('is-loading');
              el.classList.add('has-player');
              // El usuario ya pidió escucharla: se intenta reproducir.
              // (En algunos celulares hay que tocar el video una vez más.)
              e.target.playVideo();
            },
            onStateChange: (e) => onState(track, e.data),
            onError: () => showEmbedError(track)
          }
        });
      })
      .catch(() => {
        el.classList.remove('is-loading');
        showEmbedError(track);
      });
  }

  function showEmbedError(track) {
    track.el.classList.remove('is-loading', 'is-playing');
    $('.track__error', track.el).hidden = false;
  }

  function onState(track, state) {
    track.state = state;
    const playing = state === 1 || state === 3; // reproduciendo o cargando
    track.el.classList.toggle('is-playing', playing);
    $('.track__btn span', track.el).textContent = playing ? 'Pausar' : 'Escuchar';

    if (state === 1) {
      pauseOthers(track);
      nowPlaying = track;
    }
    updateNowPlaying();
  }

  // Solo una canción a la vez
  function pauseOthers(except) {
    tracks.forEach((t) => {
      if (t !== except && t.player && typeof t.player.pauseVideo === 'function') {
        const st = t.player.getPlayerState?.();
        if (st === 1 || st === 3) t.player.pauseVideo();
      }
    });
  }

  // Mini reproductor: si sales de la playlist con música, puedes pausarla desde aquí
  function updateNowPlaying() {
    const t = nowPlaying;
    const active = t && (t.state === 1 || t.state === 3 || t.state === 2);
    if (!active || current === SCENE_SONGS) {
      nowEl.hidden = true;
      return;
    }
    nowEl.hidden = false;
    nowTitle.textContent = t.song.title.charAt(0) + t.song.title.slice(1).toLowerCase();
    const paused = t.state === 2;
    nowEl.classList.toggle('is-paused', paused);
    nowToggle.setAttribute('aria-label', paused ? 'Reanudar' : 'Pausar');
  }

  nowToggle.addEventListener('click', () => { if (nowPlaying) toggleTrack(nowPlaying); });

  /* 6. La carta ----------------------------------------------------------- */
  const envelopeWrap = $('.envelope-wrap');
  const envelope = $('.envelope');
  const letter = $('.letter');
  const letterNext = $('.letter-next');
  let letterOpened = false;

  function onLetterSceneEnter() {
    // Si ya se abrió antes, la carta se queda abierta al volver
    if (letterOpened) return;
  }

  function openLetter() {
    if (letterOpened) return;
    letterOpened = true;
    envelope.classList.add('is-open');
    envelope.setAttribute('aria-expanded', 'true');

    const t1 = reducedMotion ? 50 : 1700;
    setTimeout(() => envelopeWrap.classList.add('is-gone'), t1);
    setTimeout(() => {
      envelopeWrap.hidden = true;
      letter.hidden = false;
      letter.classList.add('is-unfolding');
      letter.setAttribute('tabindex', '-1');
      letter.focus({ preventScroll: true });
      const lines = $$('p', letter).length;
      setTimeout(() => { letterNext.hidden = false; }, reducedMotion ? 0 : 900 + lines * 550);
    }, t1 + (reducedMotion ? 50 : 650));
  }

  envelope.addEventListener('click', openLetter);

  /* Estado inicial -------------------------------------------------------- */
  document.body.dataset.scene = '0';
  sky.setIntensity(MOOD[0]);
  updateChrome();
  updateFlowers(0);
  // La portada aparece con su animación de entrada
  // (se fuerza un reflow para que la transición corra aunque la pestaña
  //  haya cargado en segundo plano)
  void scenes[0].offsetWidth;
  setTimeout(() => scenes[0].classList.add('is-active'), 30);
})();
