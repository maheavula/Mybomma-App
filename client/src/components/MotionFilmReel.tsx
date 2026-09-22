import React, { useEffect, useRef } from 'react';

export const MotionFilmReel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particles (Champagne Stars & Sapphire Nebula Dust)
    const particleCount = 65;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.4,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.4 - 0.1,
      opacity: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * 0.02,
      color: Math.random() > 0.4 ? 'gold' : 'sapphire',
    }));

    let reelAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Ambient Royal Sapphire & Champagne Nebula Glow
      const sapphireGrad = ctx.createRadialGradient(
        width * 0.75,
        height * 0.4,
        20,
        width * 0.75,
        height * 0.4,
        width * 0.5
      );
      sapphireGrad.addColorStop(0, 'rgba(37, 99, 235, 0.16)');
      sapphireGrad.addColorStop(0.5, 'rgba(243, 208, 136, 0.05)');
      sapphireGrad.addColorStop(1, 'rgba(5, 7, 11, 0)');
      ctx.fillStyle = sapphireGrad;
      ctx.fillRect(0, 0, width, height);

      // Secondary Warm Champagne Halo on left
      const goldGrad = ctx.createRadialGradient(
        width * 0.25,
        height * 0.6,
        10,
        width * 0.25,
        height * 0.6,
        width * 0.45
      );
      goldGrad.addColorStop(0, 'rgba(243, 208, 136, 0.10)');
      goldGrad.addColorStop(1, 'rgba(5, 7, 11, 0)');
      ctx.fillStyle = goldGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Animated Cinema Film Reel Graphic
      ctx.save();
      const reelCenterX = width > 768 ? width * 0.82 : width * 0.5;
      const reelCenterY = height * 0.48;
      const reelRadius = width > 768 ? 140 : 95;

      reelAngle += 0.005;
      ctx.translate(reelCenterX, reelCenterY);
      ctx.rotate(reelAngle);

      // Outer Reel Rim with Champagne & Sapphire Stroke
      ctx.beginPath();
      ctx.arc(0, 0, reelRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(243, 208, 136, 0.25)';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Film Spoke Holes
      const spokeCount = 6;
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i * Math.PI * 2) / spokeCount;
        const holeX = Math.cos(angle) * (reelRadius * 0.55);
        const holeY = Math.sin(angle) * (reelRadius * 0.55);

        ctx.beginPath();
        ctx.arc(holeX, holeY, reelRadius * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(13, 17, 23, 0.95)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Center Hub
      ctx.beginPath();
      ctx.arc(0, 0, reelRadius * 0.26, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(243, 208, 136, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#F3D088';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();

      // 3. Floating Cinema Light Flares / Dust Motes
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.pulse;
        if (p.opacity > 0.85 || p.opacity < 0.15) {
          p.pulse = -p.pulse;
        }

        // Loop edges
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle =
          p.color === 'gold'
            ? `rgba(243, 208, 136, ${p.opacity})`
            : `rgba(96, 165, 250, ${p.opacity * 0.9})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color === 'gold' ? '#F3D088' : '#2563EB';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-0 scanlines opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-canvas/80" />
    </div>
  );
};
