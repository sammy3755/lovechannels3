(function () {
    const sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) {
        return;
    }

    const sliderRing = sliderContainer.querySelector('.slider-ring');
    const sliderImages = sliderRing.querySelectorAll('.slider-img');
    let xPos = 0;
    let autoRotateTimeline = null;
    let isInteracting = false;
    let isPausedByHover = false;
    let lastDragDirection = 1;

    const imageUrls = [
        'https://sammy3755.github.io/testimonies/testimony/FB_IMG_1773530063762.jpg',
        'https://sammy3755.github.io/testimonies/testimony/FB_IMG_1773530729101.jpg',
        'https://sammy3755.github.io/testimonies/testimony/FB_IMG_1773531086972.jpg',
        'https://sammy3755.github.io/testimonies/testimony/FB_IMG_1773531102483.jpg',
        'https://sammy3755.github.io/testimonies/testimony/FB_IMG_1773531106305.jpg',
        'https://sammy3755.github.io/testimonies/testimony/FB_IMG_1773531108565.jpg',
        'https://sammy3755.github.io/testimonies/testimony/FB_IMG_1773531111300.jpg',
        'https://sammy3755.github.io/testimonies/testimony/FB_IMG_1773531149498.jpg',
        'https://sammy3755.github.io/testimonies/testimony/FB_IMG_1773531151589.jpg',
        'https://sammy3755.github.io/testimonies/testimony/FB_IMG_1773531158121.jpg'
    ];

    function getImageUrl(i) {
        return imageUrls[i] || imageUrls[0];
    }

    function getBgPos(i) {
        return (100 - gsap.utils.wrap(0, 360, gsap.getProperty(sliderRing, 'rotationY') - 180 - i * 36) / 360 * 500) + 'px 0px';
    }

    function restartAutoRotate(direction = lastDragDirection) {
        if (autoRotateTimeline) {
            autoRotateTimeline.kill();
        }

        const rotationValue = direction > 0 ? '+=3600' : '-=3600';
        autoRotateTimeline = gsap.to(sliderRing, {
            rotationY: rotationValue,
            duration: 300,
            ease: 'none',
            repeat: -1,
            onUpdate: () => {
                gsap.set(sliderImages, { backgroundPosition: (i) => getBgPos(i) });
            }
        });
    }

    function pauseAutoRotate() {
        if (autoRotateTimeline) {
            autoRotateTimeline.pause();
        }
    }

    function dragStart(e) {
        isInteracting = true;
        pauseAutoRotate();
        if (e.touches) {
            e.clientX = e.touches[0].clientX;
        }
        xPos = Math.round(e.clientX);
        gsap.set(sliderRing, { cursor: 'grabbing' });
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
    }

    function drag(e) {
        if (e.touches) {
            e.clientX = e.touches[0].clientX;
        }
        const delta = Math.round(e.clientX) - xPos;
        if (delta !== 0) {
            lastDragDirection = delta < 0 ? 1 : -1;
        }
        const rotationDelta = delta * 0.25;
        const currentRotation = gsap.getProperty(sliderRing, 'rotationY');
        gsap.set(sliderRing, {
            rotationY: currentRotation - rotationDelta
        });
        gsap.set(sliderImages, { backgroundPosition: (i) => getBgPos(i) });
        xPos = Math.round(e.clientX);
    }

    function dragEnd() {
        isInteracting = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        gsap.set(sliderRing, { cursor: 'grab' });
        if (!isPausedByHover) {
            restartAutoRotate();
        }
    }

    function initSlider() {
        gsap.timeline()
            .set(sliderRing, { rotationY: 180, cursor: 'grab' })
            .set(sliderImages, {
                rotateY: (i) => i * -36,
                transformOrigin: '50% 50% 500px',
                z: -500,
                backgroundImage: (i) => 'url(' + getImageUrl(i) + ')',
                backgroundPosition: (i) => getBgPos(i),
                backfaceVisibility: 'hidden'
            })
            .from(sliderImages, {
                duration: 1.5,
                y: 200,
                opacity: 0,
                stagger: 0.1,
                ease: 'expo'
            })
            .add(() => {
                restartAutoRotate();
                sliderImages.forEach(img => {
                    img.addEventListener('mouseenter', (e) => {
                        const current = e.currentTarget;
                        gsap.to(sliderImages, { opacity: (i, t) => (t === current ? 1 : 0.5), ease: 'power3' });
                    });
                    img.addEventListener('mouseleave', () => {
                        gsap.to(sliderImages, { opacity: 1, ease: 'power2.inOut' });
                    });
                });
            }, '-=0.5');
    }

    sliderContainer.addEventListener('mouseenter', () => {
        isPausedByHover = true;
        pauseAutoRotate();
    });

    sliderContainer.addEventListener('mouseleave', () => {
        isPausedByHover = false;
        if (!isInteracting) {
            restartAutoRotate();
        }
    });

    document.addEventListener('mousedown', dragStart);
    document.addEventListener('touchstart', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);

    initSlider();
})();
