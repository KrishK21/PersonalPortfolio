(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ boot sequence ============ */
  const boot = document.getElementById('boot');
  const log = document.getElementById('bootlog');
  const lines = [
    ['KANDA-OS v3.8 — sensor init', 0],
    ['loading thermal core .......... <span class="ok">OK</span>', 160],
    ['engaging white-hot mode ....... <span class="ok">OK</span>', 320],
    ['drone uplink 45.63N -122.66W .. <span class="ok">OK</span>', 480],
    ['<span class="mg">HEAT SOURCE DETECTED: visitor</span>', 700]
  ];
  if (reduceMotion){
    boot.classList.add('done');
    boot.remove();
  } else {
    lines.forEach(([html,t]) => setTimeout(() => { log.innerHTML += html + '\n'; }, t));
    setTimeout(() => boot.classList.add('done'), 1150);
    setTimeout(() => boot.remove(), 1800);
  }

  /* ============ thermal heat-diffusion simulation ============ */
  const canvas = document.getElementById('thermal');
  const ctx = canvas.getContext('2d');
  const CELL = 6;
  let W, H, gw, gh, temp, tmp, off, offCtx, img;

  // FLIR palette LUT: cold indigo -> violet -> magenta -> orange -> white-hot
  const LUT = new Uint8ClampedArray(256 * 3);
  const stops = [
    [0.00, 16, 19, 28],
    [0.30, 32, 38, 52],
    [0.52, 60, 69, 92],
    [0.70, 122, 128, 138],
    [0.86, 228, 178, 104],
    [1.00, 248, 244, 236]
  ];
  for (let i = 0; i < 256; i++){
    const t = i / 255;
    let a = stops[0], b = stops[stops.length-1];
    for (let s = 0; s < stops.length-1; s++){
      if (t >= stops[s][0] && t <= stops[s+1][0]){ a = stops[s]; b = stops[s+1]; break; }
    }
    const f = (t - a[0]) / (b[0] - a[0] || 1);
    LUT[i*3]   = a[1] + (b[1]-a[1])*f;
    LUT[i*3+1] = a[2] + (b[2]-a[2])*f;
    LUT[i*3+2] = a[3] + (b[3]-a[3])*f;
  }

  function resize(){
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W; canvas.height = H;
    gw = Math.ceil(W / CELL); gh = Math.ceil(H / CELL);
    temp = new Float32Array(gw * gh);
    tmp  = new Float32Array(gw * gh);
    off = document.createElement('canvas');
    off.width = gw; off.height = gh;
    offCtx = off.getContext('2d');
    img = offCtx.createImageData(gw, gh);
    ctx.imageSmoothingEnabled = true;
  }
  resize();
  window.addEventListener('resize', resize);

  function deposit(px, py, radius, amount){
    const cx = px / CELL, cy = py / CELL, r = radius / CELL;
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(gw-1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(gh-1, Math.ceil(cy + r));
    for (let y = y0; y <= y1; y++){
      for (let x = x0; x <= x1; x++){
        const d = Math.hypot(x - cx, y - cy);
        if (d < r){
          const i = y * gw + x;
          temp[i] = Math.min(1.35, temp[i] + amount * (1 - d/r));
        }
      }
    }
  }

  if (reduceMotion){
    // static thermal composition, no animation loop
    deposit(W*0.76, H*0.3, Math.min(W,H)*0.4, 1.1);
    deposit(W*0.22, H*0.7, Math.min(W,H)*0.28, 0.7);
    for (let pass = 0; pass < 30; pass++) diffuse(0);
    render();
  } else {
    let mouse = null, idleT = Math.random()*10;
    canvas.addEventListener('pointermove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const hint = document.getElementById('hint');
      if (hint) hint.style.opacity = '0';
    });
    canvas.addEventListener('pointerleave', () => { mouse = null; det.style.opacity = '0'; });
    canvas.addEventListener('pointerdown', e => {
      const rect = canvas.getBoundingClientRect();
      deposit(e.clientX - rect.left, e.clientY - rect.top, 150, 1.2);
    });

    /* detection HUD */
    const det = document.getElementById('det');
    const detlbl = document.getElementById('detlbl');
    let dx = 0, dy = 0;

    function loop(){
      idleT += 0.0045;
      // ambient roaming heat source
      deposit(W*0.72 + Math.cos(idleT)*W*0.08, H*0.3 + Math.sin(idleT*1.4)*H*0.07,
              Math.min(W,H)*0.11, 0.05);
      if (mouse){
        deposit(mouse.x, mouse.y, 60, 0.16);
        // HUD locks tightly to cursor (small lag only)
        dx += (mouse.x - dx) * 0.35;
        dy += (mouse.y - dy) * 0.35;
        det.style.opacity = '1';
        det.style.transform = 'translate(' + Math.round(dx-60) + 'px,' + Math.round(dy-60) + 'px)';
        if (Math.random() < 0.08){
          const t = (36.2 + Math.random()*1.6).toFixed(1);
          detlbl.textContent = 'SIGNAL LOCKED · ' + t + '°C';
        }
      }
      diffuse(1);
      render();
      requestAnimationFrame(loop);
    }
    loop();

    /* feed clock */
    const clock = document.getElementById('clock');
    setInterval(() => {
      const d = new Date();
      const pad = n => String(n).padStart(2,'0');
      clock.innerHTML = 'THERMAL FEED ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' <span class="live">● LIVE</span>';
    }, 1000);
  }

  function diffuse(cool){
    const k = 0.42, cooling = cool ? 0.988 : 1;
    for (let y = 0; y < gh; y++){
      for (let x = 0; x < gw; x++){
        const i = y * gw + x;
        const l = x > 0 ? temp[i-1] : temp[i];
        const r = x < gw-1 ? temp[i+1] : temp[i];
        const u = y > 0 ? temp[i-gw] : temp[i];
        const d = y < gh-1 ? temp[i+gw] : temp[i];
        tmp[i] = (temp[i] + k * ((l + r + u + d) / 4 - temp[i])) * cooling;
      }
    }
    const swap = temp; temp = tmp; tmp = swap;
  }

  function render(){
    const data = img.data;
    for (let i = 0; i < gw * gh; i++){
      const noise = (Math.random() - 0.5) * 5;
      let v = Math.min(255, Math.max(0, (temp[i] * 235) + noise)) | 0;
      data[i*4]   = LUT[v*3];
      data[i*4+1] = LUT[v*3+1];
      data[i*4+2] = LUT[v*3+2];
      data[i*4+3] = 255;
    }
    offCtx.putImageData(img, 0, 0);
    ctx.drawImage(off, 0, 0, W, H);
    // vignette
    const vg = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.35, W/2, H/2, Math.max(W,H)*0.75);
    vg.addColorStop(0, 'rgba(16,19,28,0)');
    vg.addColorStop(1, 'rgba(16,19,28,0.55)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  /* ============ section scan reveals ============ */
  if (!reduceMotion && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting){ e.target.classList.add('scanned'); io.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.sec-head').forEach(h => io.observe(h));
  }

  /* ============ resume-rewrite live demo ============ */
  const demoIn = document.getElementById('demo-in');
  const demoOut = document.getElementById('demo-out');
  const matchBar = document.getElementById('matchbar');
  const matchPct = document.getElementById('matchpct');
  const IN_TEXT = '> input: "worked on drone stuff with python"';
  const OUT_TEXT = 'Trained PyTorch models for thermal object detection on drone imagery';
  function setMatch(n){
    matchBar.style.width = n + '%';
    // count the label up toward n
    const start = parseInt(matchPct.textContent) || 0;
    const t0 = performance.now();
    (function step(now){
      const f = Math.min(1, (now - t0) / 1000);
      matchPct.textContent = Math.round(start + (n - start) * f) + '%';
      if (f < 1) requestAnimationFrame(step);
    })(t0);
  }
  if (reduceMotion){
    demoIn.textContent = IN_TEXT;
    demoOut.textContent = OUT_TEXT;
    matchBar.style.width = '92%';
    matchPct.textContent = '92%';
  } else {
    function typeDemo(){
      demoIn.textContent = '';
      demoOut.textContent = '';
      matchBar.style.width = '0%';
      matchPct.textContent = '0%';
      let i = 0, j = 0;
      const t1 = setInterval(() => {
        demoIn.textContent = IN_TEXT.slice(0, ++i);
        if (i >= IN_TEXT.length){
          clearInterval(t1);
          setMatch(38);
          setTimeout(() => {
            const t2 = setInterval(() => {
              demoOut.textContent = OUT_TEXT.slice(0, ++j);
              if (j >= OUT_TEXT.length){
                clearInterval(t2);
                setMatch(92);
                setTimeout(typeDemo, 6000);
              }
            }, 26);
          }, 600);
        }
      }, 22);
    }
    if ('IntersectionObserver' in window){
      const dio = new IntersectionObserver(es => {
        es.forEach(e => { if (e.isIntersecting){ typeDemo(); dio.disconnect(); } });
      }, { threshold: 0.5 });
      dio.observe(document.querySelector('.demo'));
    } else typeDemo();
  }

  /* ============ signal heat meters + leaderboard ============ */
  if ('IntersectionObserver' in window){
    const sio = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('lit'); sio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    document.querySelectorAll('.signal, .board').forEach(s => sio.observe(s));
  } else {
    document.querySelectorAll('.signal, .board').forEach(s => s.classList.add('lit'));
  }
  /* ============ drone thermal sweep (Interject) ============ */
  (function(){
    const c = document.getElementById('droneviz');
    if (!c) return;
    const dctx = c.getContext('2d');
    let dw, dh;
    function dsize(){ dw = c.clientWidth; dh = c.clientHeight; c.width = dw; c.height = dh; }
    dsize(); window.addEventListener('resize', dsize);

    const people = [
      { x:.22, y:.62, r:14 }, { x:.55, y:.42, r:12 }, { x:.81, y:.68, r:15 }
    ];
    people.forEach(p => p.hit = -1e9);

    function blob(x, y, r, glow){
      const g = dctx.createRadialGradient(x, y, 0, x, y, r*2.6);
      g.addColorStop(0, 'rgba(242,238,230,' + (.75+glow*.25) + ')');
      g.addColorStop(.3, 'rgba(228,178,104,.7)');
      g.addColorStop(.65, 'rgba(151,163,189,.35)');
      g.addColorStop(1, 'rgba(16,19,28,0)');
      dctx.fillStyle = g;
      dctx.beginPath(); dctx.arc(x, y, r*2.6, 0, Math.PI*2); dctx.fill();
    }

    function drawStatic(){
      dctx.fillStyle = '#151A26'; dctx.fillRect(0,0,dw,dh);
      people.forEach(p => blob(p.x*dw, p.y*dh, p.r, 1));
      const p = people[1];
      dctx.strokeStyle = '#E4B268'; dctx.lineWidth = 1.5;
      dctx.strokeRect(p.x*dw-30, p.y*dh-30, 60, 60);
      dctx.fillStyle = '#F2EEE6'; dctx.font = '11px IBM Plex Mono';
      dctx.fillText('HUMAN 36.9°C', p.x*dw-30, p.y*dh-38);
    }

    if (reduceMotion){ drawStatic(); const l=document.getElementById('latstat'); if(l) l.innerHTML='LATENCY <b>55ms</b>'; return; }

    let running = false, t = 0;
    const latEl = document.getElementById('latstat');
    let latShown = 100;
    function dloop(){
      if (!running) return;
      t += 2.2;
      const sweep = (t % (dw + 160)) - 80;
      // animate latency readout easing toward 55ms (the -45% result)
      latShown += (55 - latShown) * 0.03;
      if (latEl) latEl.innerHTML = 'LATENCY <b>' + Math.round(latShown) + 'ms</b>';
      // terrain
      const bg = dctx.createLinearGradient(0,0,0,dh);
      bg.addColorStop(0,'#10131C'); bg.addColorStop(1,'#1C2233');
      dctx.fillStyle = bg; dctx.fillRect(0,0,dw,dh);
      // faint contour lines
      dctx.strokeStyle = 'rgba(60,69,92,.25)'; dctx.lineWidth = 1;
      for (let y = 24; y < dh; y += 26){
        dctx.beginPath();
        for (let x = 0; x <= dw; x += 18){
          const yy = y + Math.sin(x*.02 + y) * 5;
          x === 0 ? dctx.moveTo(x, yy) : dctx.lineTo(x, yy);
        }
        dctx.stroke();
      }
      // heat blobs, flickering
      const now = performance.now();
      people.forEach(p => {
        blob(p.x*dw, p.y*dh + Math.sin(now*.002 + p.x*9)*2, p.r, Math.random()*.4);
        if (Math.abs(sweep - p.x*dw) < 6) p.hit = now;
        if (now - p.hit < 2600){
          const a = 1 - (now - p.hit)/2600;
          dctx.strokeStyle = 'rgba(228,178,104,' + a + ')'; dctx.lineWidth = 1.5;
          dctx.strokeRect(p.x*dw-30, p.y*dh-30, 60, 60);
          dctx.fillStyle = 'rgba(242,238,230,' + a + ')';
          dctx.font = '11px IBM Plex Mono';
          dctx.fillText('HUMAN ' + (36.4 + p.r/50).toFixed(1) + '°C', p.x*dw-30, p.y*dh-38);
        }
      });
      // sweep beam + drone
      const beam = dctx.createLinearGradient(sweep-40, 0, sweep+4, 0);
      beam.addColorStop(0, 'rgba(151,163,189,0)');
      beam.addColorStop(1, 'rgba(151,163,189,.35)');
      dctx.fillStyle = beam; dctx.fillRect(sweep-40, 0, 44, dh);
      dctx.strokeStyle = 'rgba(228,178,104,.9)'; dctx.lineWidth = 1.5;
      dctx.beginPath(); dctx.moveTo(sweep, 0); dctx.lineTo(sweep, dh); dctx.stroke();
      dctx.fillStyle = '#F2EEE6';
      dctx.beginPath();
      dctx.moveTo(sweep, 8); dctx.lineTo(sweep-7, 20); dctx.lineTo(sweep+7, 20);
      dctx.closePath(); dctx.fill();
      requestAnimationFrame(dloop);
    }
    const vio = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting && !running){ running = true; dloop(); }
        else if (!e.isIntersecting) running = false;
      });
    }, { threshold: .2 });
    vio.observe(c);
  })();

  /* ============ ghost-listing filter (LinkedOut) ============ */
  (function(){
    const list = document.getElementById('gvlist');
    const counter = document.getElementById('gvn');
    if (!list) return;
    const fresh = [
      ['Backend Engineer — Flask', '2d'],
      ['Data Analyst — SQL', '5d'],
      ['ML Intern — PyTorch', '1d'],
      ['Cloud Engineer — Azure', '3d'],
      ['Full-Stack Dev — React', '4d'],
      ['DevOps — CI/CD', '6d']
    ];
    const stale = ['Ninja Rockstar Dev — 97d', 'Sr. Everything Eng — 120d', 'Urgent Hire!! — 88d', 'Growth Hacker — 104d'];
    let purged = 0, fi = 0, si = 0;

    function row(title, age){
      const li = document.createElement('li');
      li.innerHTML = '<span>' + title + '</span><span class="age">' + age + '</span>';
      return li;
    }
    // seed: three fresh + one stale
    for (let i = 0; i < 3; i++) list.appendChild(row(...fresh[fi++ % fresh.length]));
    let staleRow = row(stale[si % stale.length].split(' — ')[0], stale[si++ % stale.length].split(' — ')[1]);
    list.appendChild(staleRow);

    if (reduceMotion){
      staleRow.classList.add('expired');
      counter.textContent = '142';
      return;
    }
    setInterval(() => {
      if (!staleRow) return;
      staleRow.classList.add('expired');
      const dying = staleRow;
      setTimeout(() => dying.classList.add('gone'), 700);
      setTimeout(() => {
        dying.remove();
        counter.textContent = ++purged;
        list.insertBefore(row(...fresh[fi++ % fresh.length]), list.firstChild);
        if (list.children.length > 4) list.lastElementChild.remove();
        const s = stale[si++ % stale.length].split(' — ');
        staleRow = row(s[0], s[1]);
        list.appendChild(staleRow);
      }, 1600);
    }, 3400);
  })();
  /* ============ "currently building" EKG pulse ============ */
  (function(){
    const c = document.getElementById('ekg');
    if (!c) return;
    const ectx = c.getContext('2d');
    let ew, eh;
    function esize(){ ew = c.clientWidth; eh = c.clientHeight; c.width = ew; c.height = eh; }
    esize(); window.addEventListener('resize', esize);

    // one heartbeat spike shape as normalized y-offsets across a beat
    function beatY(p){
      // p in 0..1 across one beat; return vertical offset (-1..1), spike near 0.5
      if (p < 0.42 || p > 0.62) return Math.sin(p*Math.PI*6)*0.04; // gentle baseline ripple
      const q = (p - 0.42) / 0.20; // 0..1 within spike
      if (q < 0.2) return q/0.2 * 0.25;              // small P
      if (q < 0.35) return 0.25 - (q-0.2)/0.15*0.45; // dip
      if (q < 0.5) return -0.20 + (q-0.35)/0.15*1.2; // tall R up
      if (q < 0.65) return 1.0 - (q-0.5)/0.15*1.4;   // sharp down S
      if (q < 0.85) return -0.4 + (q-0.65)/0.2*0.4;  // recover
      return 0;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      // draw one static beat
      ectx.strokeStyle = '#E4B268'; ectx.lineWidth = 2; ectx.beginPath();
      for (let x=0;x<=ew;x++){ const y=eh/2 - beatY(x/ew)*eh*0.4; x?ectx.lineTo(x,y):ectx.moveTo(x,y); }
      ectx.stroke(); return;
    }

    let running=false, off=0;
    const tempEl = document.getElementById('pulse-temp');
    function loop(){
      if(!running) return;
      off += 0.006;
      ectx.clearRect(0,0,ew,eh);
      // trailing grid tick
      ectx.strokeStyle='rgba(114,123,142,.15)'; ectx.lineWidth=1;
      ectx.beginPath(); ectx.moveTo(0,eh/2); ectx.lineTo(ew,eh/2); ectx.stroke();
      // the trace
      ectx.strokeStyle='#E4B268'; ectx.lineWidth=2; ectx.lineJoin='round';
      ectx.shadowColor='rgba(228,178,104,.6)'; ectx.shadowBlur=6;
      ectx.beginPath();
      let leadY=eh/2;
      for(let x=0;x<=ew;x++){
        const p=((x/ew)*1.4 + off) % 1;
        const y=eh/2 - beatY(p)*eh*0.42;
        x?ectx.lineTo(x,y):ectx.moveTo(x,y);
        if(x===ew-1) leadY=y;
      }
      ectx.stroke();
      ectx.shadowBlur=0;
      // leading dot
      ectx.fillStyle='#F2EEE6';
      ectx.beginPath(); ectx.arc(ew-1,leadY,2.5,0,Math.PI*2); ectx.fill();
      requestAnimationFrame(loop);
    }
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>{
        es.forEach(e=>{
          if(e.isIntersecting && !running){running=true;loop();}
          else if(!e.isIntersecting) running=false;
        });
      },{threshold:.3});
      io.observe(c);
    } else { running=true; loop(); }
  })();
  /* ============ ambient thermal-drift background ============ */
  (function(){
    const c = document.getElementById('ambient');
    if (!c || reduceMotion) { if(c) c.style.display='none'; return; }
    const actx = c.getContext('2d');
    let aw, ah;
    function asize(){ aw=c.width=Math.ceil(window.innerWidth/8); ah=c.height=Math.ceil(window.innerHeight/8); c.style.width=window.innerWidth+'px'; c.style.height=window.innerHeight+'px'; }
    asize(); window.addEventListener('resize', asize);
    // slow-drifting warm blobs, rendered tiny and CSS-scaled for a soft haze
    const blobs = Array.from({length:5}, () => ({
      x:Math.random(), y:Math.random(),
      vx:(Math.random()-.5)*0.00018, vy:(Math.random()-.5)*0.00018,
      r:0.28+Math.random()*0.22
    }));
    function aloop(){
      actx.clearRect(0,0,aw,ah);
      actx.globalCompositeOperation='lighter';
      for(const b of blobs){
        b.x+=b.vx; b.y+=b.vy;
        if(b.x<-.3||b.x>1.3) b.vx*=-1;
        if(b.y<-.3||b.y>1.3) b.vy*=-1;
        const g=actx.createRadialGradient(b.x*aw,b.y*ah,0,b.x*aw,b.y*ah,b.r*aw);
        g.addColorStop(0,'rgba(228,178,104,0.10)');
        g.addColorStop(.5,'rgba(151,163,189,0.05)');
        g.addColorStop(1,'rgba(16,19,28,0)');
        actx.fillStyle=g;
        actx.beginPath(); actx.arc(b.x*aw,b.y*ah,b.r*aw,0,Math.PI*2); actx.fill();
      }
      actx.globalCompositeOperation='source-over';
      requestAnimationFrame(aloop);
    }
    aloop();
  })();

  /* ============ scroll temperature rail ============ */
  (function(){
    const heat=document.getElementById('scrollheat');
    const temp=document.getElementById('scrolltemp');
    if(!heat) return;
    function onScroll(){
      const h=document.documentElement;
      const max=h.scrollHeight-h.clientHeight;
      const p=max>0?h.scrollTop/max:0;
      heat.style.height=(p*100)+'%';
      temp.style.top=(p*100)+'%';
      // 36.6 at top climbing to 98.7 (white hot) at the bottom
      temp.textContent=(36.6+p*62.1).toFixed(1)+'°';
    }
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll);
  })();

  /* ============ staggered scroll reveals ============ */
  (function(){
    const targets=[];
    document.querySelectorAll('.job, .project, .trophy, .signal, .skill-row, .edu').forEach(el=>{
      el.classList.add('reveal'); targets.push(el);
    });
    if(reduceMotion || !('IntersectionObserver' in window)){
      targets.forEach(t=>t.classList.add('in')); return;
    }
    const io=new IntersectionObserver((es)=>{
      es.forEach(e=>{
        if(e.isIntersecting){
          // stagger siblings within the same parent
          const sibs=[...e.target.parentElement.children].filter(n=>n.classList.contains('reveal'));
          const idx=sibs.indexOf(e.target);
          e.target.style.transitionDelay=(Math.max(0,idx)*80)+'ms';
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },{threshold:.18});
    targets.forEach(t=>io.observe(t));
  })();

  /* ============ magnetic stack chips ============ */
  (function(){
    if(reduceMotion || matchMedia('(hover:none)').matches) return;
    document.querySelectorAll('.job-stack span, .sk-tags span, .t-stack span').forEach(chip=>{
      chip.style.transition='transform .18s cubic-bezier(.2,.7,.2,1),border-color .15s,color .15s,box-shadow .15s';
      chip.addEventListener('pointermove', e=>{
        const r=chip.getBoundingClientRect();
        const dx=(e.clientX-(r.left+r.width/2))/r.width;
        const dy=(e.clientY-(r.top+r.height/2))/r.height;
        chip.style.transform='translate('+(dx*6)+'px,'+(dy*6)+'px)';
      });
      chip.addEventListener('pointerleave', ()=>{ chip.style.transform=''; });
    });
  })();

  /* ============ ticker number count-up ============ */
  (function(){
    if(reduceMotion) return;
    const nums=document.querySelectorAll('.ticker-set:first-child .tk b');
    if(!('IntersectionObserver' in window)) return;
    const io=new IntersectionObserver((es)=>{
      es.forEach(e=>{
        if(!e.isIntersecting) return;
        const el=e.target;
        const raw=el.textContent.trim();
        const m=raw.match(/^(-?)(\$?)(\d+)([%Kk]?)$/);
        io.unobserve(el);
        if(!m) return;
        const [,sign,pre,digits,suf]=m;
        const target=parseInt(digits);
        const t0=performance.now(), dur=900;
        (function step(now){
          const f=Math.min(1,(now-t0)/dur);
          const eased=1-Math.pow(1-f,3);
          el.textContent=sign+pre+Math.round(target*eased)+suf;
          if(f<1) requestAnimationFrame(step);
        })(t0);
      });
    },{threshold:.6});
    nums.forEach(n=>io.observe(n));
  })();
  /* ============ quicknav active-section highlight ============ */
  (function(){
    const links=[...document.querySelectorAll('.qn-links a')].filter(a=>a.getAttribute('href').startsWith('#') && a.getAttribute('href')!=='#top');
    const map=new Map();
    links.forEach(a=>{
      const el=document.querySelector(a.getAttribute('href'));
      if(el) map.set(el,a);
    });
    if(!('IntersectionObserver' in window)||!map.size) return;
    const io=new IntersectionObserver((es)=>{
      es.forEach(e=>{
        const a=map.get(e.target);
        if(!a) return;
        if(e.isIntersecting){
          links.forEach(l=>l.classList.remove('active'));
          a.classList.add('active');
        }
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    map.forEach((a,el)=>io.observe(el));
  })();
})();
