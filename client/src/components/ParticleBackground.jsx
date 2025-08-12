import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 3 + 1;
        this.opacity = Math.random() * 0.6 + 0.3;
        
        // Rental management themed colors (emerald, teal, cyan)
        const colors = [
          `rgba(16, 185, 129, ${this.opacity})`,  // emerald-500
          `rgba(20, 184, 166, ${this.opacity})`,  // teal-500
          `rgba(6, 182, 212, ${this.opacity})`,   // cyan-500
          `rgba(34, 197, 94, ${this.opacity})`,   // green-500
          `rgba(14, 165, 233, ${this.opacity})`   // sky-500
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Add pulsing effect
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseOffset = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        
        // Update pulsing effect
        this.pulseOffset += this.pulseSpeed;
      }

      draw() {
        // Calculate pulsing radius
        const pulseRadius = this.radius + Math.sin(this.pulseOffset) * 0.5;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Add subtle glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Initialize particles
    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(120, Math.floor((canvas.width * canvas.height) / 12000));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    // Draw connections between nearby particles
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = (120 - distance) / 120 * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Use emerald/teal gradient for connections
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    // Draw floating rental icons
    const drawRentalIcons = () => {
      const time = Date.now() * 0.001;
      const iconCount = 8;
      
      for (let i = 0; i < iconCount; i++) {
        const x = (canvas.width / iconCount) * i + Math.sin(time + i) * 30;
        const y = canvas.height * 0.1 + Math.cos(time * 0.7 + i) * 20;
        const opacity = 0.1 + Math.sin(time + i) * 0.05;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        
        const icons = ['🏠', '🚗', '📱', '🔧', '🎵', '🏋️', '📷', '🎪'];
        ctx.fillText(icons[i], x, y);
        ctx.restore();
      }
    };
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      drawConnections();
      
      // Draw floating rental icons
      drawRentalIcons();

      animationRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    // Mouse interaction
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      particles.forEach(particle => {
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const force = (120 - distance) / 120;
          particle.vx += (dx / distance) * force * 0.015;
          particle.vy += (dy / distance) * force * 0.015;
        }
      });
    };

    // Click interaction - create burst effect
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Create burst of particles at click location
      for (let i = 0; i < 5; i++) {
        const burstParticle = new particles[0].constructor();
        burstParticle.x = clickX + (Math.random() - 0.5) * 20;
        burstParticle.y = clickY + (Math.random() - 0.5) * 20;
        burstParticle.vx = (Math.random() - 0.5) * 2;
        burstParticle.vy = (Math.random() - 0.5) * 2;
        burstParticle.radius = Math.random() * 4 + 2;
        burstParticle.opacity = 0.8;
        particles.push(burstParticle);
        
        // Remove burst particles after a short time
        setTimeout(() => {
          const index = particles.indexOf(burstParticle);
          if (index > -1) particles.splice(index, 1);
        }, 2000);
      }
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  );
};

export default ParticleBackground;