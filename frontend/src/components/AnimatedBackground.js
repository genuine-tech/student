import React, { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

/**
 * AnimatedBackground Component
 * Renders an elegant animated background with:
 * - Floating particles with connecting lines
 * - Gradient wave layers
 * - Floating geometric shapes
 * - Parallax star field
 */
const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const starsCanvas = starsRef.current;
    if (!canvas || !starsCanvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const starsCtx = starsCanvas.getContext('2d', { alpha: true });

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      starsCanvas.width = window.innerWidth;
      starsCanvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Geometric shape system
    class GeometricShape {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.rotation = Math.random() * Math.PI * 2;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 30 + 20;
        this.opacity = Math.random() * 0.15 + 0.05;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        this.type = Math.floor(Math.random() * 4); // 0: circle, 1: triangle, 2: square, 3: polygon
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        // Wrap around edges
        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.strokeStyle = `rgba(139, 92, 246, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();

        switch (this.type) {
          case 0: // Circle
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            break;
          case 1: // Triangle
            ctx.moveTo(0, -this.size / 2);
            ctx.lineTo(this.size / 2, this.size / 2);
            ctx.lineTo(-this.size / 2, this.size / 2);
            ctx.closePath();
            break;
          case 2: // Square
            ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
            break;
          case 3: // Hexagon
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i;
              const x = (this.size / 2) * Math.cos(angle);
              const y = (this.size / 2) * Math.sin(angle);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
          default:
            // Default to circle if invalid type
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            break;
        }

        ctx.stroke();
        ctx.restore();
      }
    }

    // Star system for parallax effect
    class Star {
      constructor(layer) {
        this.layer = layer; // 0, 1, 2 for different parallax speeds
        this.reset();
      }

      reset() {
        this.x = Math.random() * starsCanvas.width;
        this.y = Math.random() * starsCanvas.height;
        this.size = Math.random() * 1.5 + 0.3;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinkleOffset = Math.random() * Math.PI * 2;
      }

      update(scrollY) {
        // Parallax effect based on layer
        const parallaxSpeed = (this.layer + 1) * 0.3;
        this.parallaxY = this.y + scrollY * parallaxSpeed;

        // Wrap vertically
        if (this.parallaxY > starsCanvas.height + 10) {
          this.y = -10;
        }
        if (this.parallaxY < -10) {
          this.y = starsCanvas.height + 10;
        }
      }

      draw(time) {
        const twinkle = Math.sin(time * this.twinkleSpeed + this.twinkleOffset);
        const currentOpacity = this.opacity * (0.7 + twinkle * 0.3);

        starsCtx.beginPath();
        starsCtx.arc(this.x, this.parallaxY || this.y, this.size, 0, Math.PI * 2);
        starsCtx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        starsCtx.fill();
      }
    }

    // Initialize particles, shapes, and stars
    const particles = Array.from({ length: 80 }, () => new Particle());
    const shapes = Array.from({ length: 12 }, () => new GeometricShape());
    const stars = [
      ...Array.from({ length: 100 }, () => new Star(0)),
      ...Array.from({ length: 60 }, () => new Star(1)),
      ...Array.from({ length: 40 }, () => new Star(2)),
    ];

    let scrollY = 0;
    let time = 0;

    // Scroll handler for parallax
    const handleScroll = () => {
      scrollY = window.scrollY * 0.5;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Draw connecting lines between nearby particles
    const drawConnections = () => {
      const maxDistance = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.2;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      time++;

      // Clear canvases
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);

      // Draw stars with parallax
      stars.forEach(star => {
        star.update(scrollY);
        star.draw(time);
      });

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      drawConnections();

      // Update and draw geometric shapes
      shapes.forEach(shape => {
        shape.update();
        shape.draw();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div className="animated-background">
      {/* Star field layer (bottom) */}
      <canvas ref={starsRef} className="stars-canvas" />
      
      {/* Gradient wave layers */}
      <div className="wave-container">
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        <div className="wave wave-3"></div>
      </div>

      {/* Particles and shapes layer (top) */}
      <canvas ref={canvasRef} className="particles-canvas" />
    </div>
  );
};

export default AnimatedBackground;
