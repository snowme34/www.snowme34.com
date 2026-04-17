// Snowflake Particle System with Cursor Interaction
(function() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');

    let particles = [];
    let mouse = { x: null, y: null };
    let animationId;

    // Configuration from HTML or defaults
    const config = window.particleConfig || {
        particleCount: 100,
        maxSize: 4,
        minSize: 1,
        maxSpeed: 1.5,
        minSpeed: 0.3,
        cursorRadius: 150,
        lightIntensity: 0.8,
        color: 'rgba(255, 255, 255, 0.8)',
        baseSpeed: 1.0
    };

    // Adjust particle count for mobile (but keep speed the same)
    if (window.innerWidth < 768) {
        config.particleCount = 50;
    }

    // Resize canvas to fill window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Snowflake particle class
    class Snowflake {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height;
            this.opacity = Math.random() * 0.6 + 0.4;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -10;
            this.size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
            // Use consistent speed regardless of screen size
            this.speed = (Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed) * config.baseSpeed;
            this.drift = (Math.random() - 0.5) * 0.5 * config.baseSpeed;
            this.opacity = Math.random() * 0.6 + 0.4;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        }

        update() {
            this.y += this.speed;
            this.x += this.drift;
            this.rotation += this.rotationSpeed;

            // Reset if out of bounds
            if (this.y > canvas.height) {
                this.reset();
            }

            if (this.x > canvas.width + 10) {
                this.x = -10;
            } else if (this.x < -10) {
                this.x = canvas.width + 10;
            }
        }

        draw() {
            // Calculate distance from cursor
            let distanceFromCursor = Infinity;
            let brightness = this.opacity;

            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                distanceFromCursor = Math.sqrt(dx * dx + dy * dy);

                // Light up particles near cursor
                if (distanceFromCursor < config.cursorRadius) {
                    const intensity = 1 - (distanceFromCursor / config.cursorRadius);
                    brightness = this.opacity + (config.lightIntensity * intensity);
                    brightness = Math.min(brightness, 1);
                }
            }

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = brightness;

            // Draw snowflake shape (6-pointed star)
            this.drawSnowflake();

            ctx.restore();
        }

        drawSnowflake() {
            const arms = 6;
            const innerRadius = this.size * 0.3;
            const outerRadius = this.size;

            ctx.beginPath();

            for (let i = 0; i < arms * 2; i++) {
                const angle = (Math.PI / arms) * i;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.closePath();
            ctx.fillStyle = config.color;
            ctx.fill();
        }
    }

    // Initialize particles
    function init() {
        resizeCanvas();
        particles = [];

        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Snowflake());
        }

        animate();
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        animationId = requestAnimationFrame(animate);
    }

    // Track mouse position
    function handleMouseMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }

    function handleMouseLeave() {
        mouse.x = null;
        mouse.y = null;
    }

    // Track touch position for mobile
    function handleTouchMove(e) {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    }

    function handleTouchEnd() {
        mouse.x = null;
        mouse.y = null;
    }

    // Event listeners
    window.addEventListener('resize', () => {
        resizeCanvas();
        // Adjust particle count on resize
        const newCount = window.innerWidth < 768 ? 50 : 100;
        if (newCount !== config.particleCount) {
            config.particleCount = newCount;
            init();
        }
    });

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });

    // Start the animation
    init();
})();

