'use client';

import { RefObject, useEffect, useRef } from 'react';
import { ParticleScene } from '@/lib/particle-scene';

type ParticleBackgroundProps = {
  containerRef: RefObject<HTMLElement | null>;
  className?: string;
};

export default function ParticleBackground({ containerRef, className }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    const canvas = canvasRef.current;

    if (!root || !canvas) {
      return;
    }

    const particleScene = new ParticleScene({
      container: root,
      canvas,
      theme: 'light',
      particlesScale: 0.52,
      density: 200,
      ringWidth: 0.15,
      ringWidth2: 0.05,
      ringDisplacement: 0.15,
      interactive: true
    });

    let animationFrameId = 0;
    let isVisible = true;

    const onPointerMove = (event: PointerEvent) => {
      particleScene.setPointer(event.clientX, event.clientY, true);
    };

    const onPointerLeave = () => {
      particleScene.setPointer(0, 0, false);
    };

    const resizeObserver = new ResizeObserver(() => particleScene.resize());
    resizeObserver.observe(root);

    const visibilityObserver = new IntersectionObserver(
      entries => {
        isVisible = entries[0]?.isIntersecting ?? true;
        if (isVisible) {
          particleScene.resume();
        } else {
          particleScene.stop();
        }
      },
      { root: null, threshold: 0 }
    );
    visibilityObserver.observe(root);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    root.addEventListener('pointerleave', onPointerLeave, { passive: true });

    const animate = () => {
      animationFrameId = window.requestAnimationFrame(animate);
      if (isVisible) {
        particleScene.render();
      }
    };

    animate();

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
      particleScene.kill();
    };
  }, [containerRef]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
