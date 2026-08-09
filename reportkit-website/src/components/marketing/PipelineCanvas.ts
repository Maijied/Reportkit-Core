/**
 * Hand-rolled canvas pipeline: LIVE + ARCHIVE streams → merge/dedupe → JSON.
 * Honors prefers-reduced-motion (caller should hide canvas).
 */
export function mountPipelineCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let raf = 0;
  let t0 = performance.now();

  type Particle = {
    x: number;
    y: number;
    vx: number;
    lane: 'live' | 'archive';
    phase: number;
    alive: boolean;
  };

  const particles: Particle[] = [];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(220, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(lane: 'live' | 'archive') {
    const yBase = lane === 'live' ? height * 0.28 : height * 0.58;
    particles.push({
      x: 24,
      y: yBase + (Math.random() - 0.5) * 28,
      vx: 1.6 + Math.random() * 1.4,
      lane,
      phase: Math.random() * Math.PI * 2,
      alive: true,
    });
  }

  function drawStage(x: number, label: string, color: string) {
    ctx!.strokeStyle = color;
    ctx!.lineWidth = 1.5;
    ctx!.beginPath();
    ctx!.moveTo(x, height * 0.12);
    ctx!.lineTo(x, height * 0.88);
    ctx!.stroke();
    ctx!.fillStyle = color;
    ctx!.font = '600 11px Manrope, sans-serif';
    ctx!.fillText(label, x + 6, height * 0.12);
  }

  function frame(now: number) {
    const elapsed = (now - t0) / 1000;
    ctx!.clearRect(0, 0, width, height);

    // background grid
    ctx!.strokeStyle = 'rgba(11,122,75,0.08)';
    ctx!.lineWidth = 1;
    for (let x = 0; x < width; x += 28) {
      ctx!.beginPath();
      ctx!.moveTo(x, 0);
      ctx!.lineTo(x, height);
      ctx!.stroke();
    }

    const mergeX = width * 0.42;
    const jsonX = width * 0.68;
    const outX = width * 0.88;

    drawStage(mergeX, 'MERGE · DEDUPE', '#0b7a4b');
    drawStage(jsonX, 'JSON', '#9fd9bc');
    drawStage(outX, 'DataTables', '#f0ad4e');

    // lane labels
    ctx!.fillStyle = '#1a9a62';
    ctx!.font = '700 12px JetBrains Mono, monospace';
    ctx!.fillText('LIVE', 16, height * 0.22);
    ctx!.fillStyle = '#f0ad4e';
    ctx!.fillText('ARCHIVE', 16, height * 0.52);

    if (particles.length < 48 && Math.random() < 0.35) {
      spawn(Math.random() > 0.45 ? 'live' : 'archive');
    }

    for (const p of particles) {
      p.x += p.vx;
      p.y += Math.sin(elapsed * 3 + p.phase) * 0.25;

      // converge into merge gate
      if (p.x > mergeX - 40) {
        const targetY = height * 0.43;
        p.y += (targetY - p.y) * 0.08;
      }

      // drop some archive particles at merge (dedupe visual)
      if (p.lane === 'archive' && p.x > mergeX && p.x < mergeX + 18 && Math.random() < 0.08) {
        p.alive = false;
        continue;
      }

      if (p.x > width + 10) p.alive = false;

      ctx!.beginPath();
      ctx!.fillStyle = p.lane === 'live' ? '#1a9a62' : '#f0ad4e';
      ctx!.globalAlpha = p.x > jsonX ? 0.95 : 0.85;
      ctx!.arc(p.x, p.y, p.x > jsonX ? 2.2 : 3.2, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.globalAlpha = 1;
    }

    // prune
    for (let i = particles.length - 1; i >= 0; i--) {
      if (!particles[i].alive) particles.splice(i, 1);
    }

    raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
}
