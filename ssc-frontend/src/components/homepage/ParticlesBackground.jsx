import { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
  const canvasRef = useRef(null);
  const rafRef    = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let w = window.innerWidth;
    let h = window.innerHeight;

    const setSize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width  = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    setSize();

    const count = Math.min(70, Math.floor((w * h) / 20000));
    const particles = Array.from({ length: count }, () => ({
      x:  Math.random() * w,
      y:  Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r:  Math.random() * 2.5 + 1,
      hue: Math.random() < 0.6 ? 28 : 42,  // orange 28° / amber 42°
      sat: Math.floor(Math.random() * 20 + 80),
    }));

    const MAX_DIST = 100;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10)  p.x = w + 10;
        if (p.x > w+10) p.x = -10;
        if (p.y < -10)  p.y = h + 10;
        if (p.y > h+10) p.y = -10;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, 52%, 0.25)`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx.strokeStyle = `rgba(247,127,0,${(1 - dist / MAX_DIST) * 0.10})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    const onResize = () => setSize();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
};

export default ParticlesBackground;
