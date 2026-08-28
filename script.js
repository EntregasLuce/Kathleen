// ====== CONSTANTES PARA CLOUDINARY ======
const CLOUD_NAME = 'dz6lay5a6';
const TAG_NAME = 'kathleen'; // Etiqueta para la galería general de fotos y hero video
const TAG_CEREMONIA = 'ceremonia'; // Etiqueta para la imagen de la sección Ceremonia
const TAG_RECEPCION = 'recepcion'; // Etiqueta para la imagen de la sección Recepción

// Función para cargar imágenes y videos desde Cloudinary
async function loadGalleryFromCloudinary() {
    const galleryContainer = document.getElementById('gallery-container');
    if (!galleryContainer) return;

    galleryContainer.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500 animate-pulse font-medium">Cargando momentos mágicos desde Cloudinary...</div>';

    // ============================================
    // 1. Obtener listado de Imágenes para la Galería (SOLO FOTOS)
    // Usamos el endpoint público List de Cloudinary para el tag.
    // ============================================
    try {
        const imgUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG_NAME}.json`;
        const imgRes = await fetch(imgUrl);

        let images = [];
        if (imgRes.ok) {
            const imgData = await imgRes.json();
            images = imgData.resources || [];
        }

        galleryContainer.innerHTML = ''; // Limpiar contenedor temporal
        window.galleryImages = []; // Guardaremos las URLs para el lightbox swipable

        if (images.length === 0) {
            galleryContainer.innerHTML = `<div class="col-span-full text-center text-slate-500 py-10 px-4">No se encontraron fotos con el tag <strong>"${TAG_NAME}"</strong> o falta activar "Resource List" en la configuración de seguridad de Cloudinary.</div>`;
        } else {
            images.forEach((file, index) => {
                // Miniatura cuadrada optimizada para cuadrícula
                const thumbUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_600,h_600,q_auto,f_auto/${file.public_id}.${file.format}`;
                // Imagen en alta definición para lightbox
                const fullUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto/${file.public_id}.${file.format}`;

                window.galleryImages.push(fullUrl);

                const elementHTML = `
                    <div class="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl bg-slate-100 cursor-pointer transform transition-all duration-300 hover:-translate-y-1" onclick="openLightbox(${index})">
                        <div class="aspect-square w-full overflow-hidden bg-slate-200">
                            <img class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                                 src="${thumbUrl}" 
                                 alt="Momento Boda ${index + 1}" 
                                 loading="lazy" />
                        </div>
                        <div class="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div class="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-eucalyptus shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                <span class="material-symbols-outlined text-2xl">zoom_in</span>
                            </div>
                        </div>
                    </div>
                `;

                galleryContainer.innerHTML += elementHTML;
            });

            // Inicializar el cajetín de foto aleatoria si se encontraron fotos
            initRandomPhotoBox();
        }
    } catch (error) {
        console.error('Error fetching images from Cloudinary:', error);
        galleryContainer.innerHTML = '<div class="col-span-full text-center text-red-500 py-10">Hubo un problema de conexión para descargar las fotos desde Cloudinary.</div>';
    }
}

// ============================================
// 2. Obtener y sincronizar Video para el Hero Video (LOOP)
// ============================================
async function loadHeroVideoFromCloudinary() {
    const heroVideoElement = document.getElementById('hero-video-bg');
    if (heroVideoElement) {
        // Asegurar que el video pre-cargado empiece a reproducirse de inmediato
        heroVideoElement.play().catch(() => { });
    }

    try {
        const vidUrl = `https://res.cloudinary.com/${CLOUD_NAME}/video/list/${TAG_NAME}.json`;
        const vidRes = await fetch(vidUrl);

        if (vidRes.ok) {
            const vidData = await vidRes.json();
            const videos = vidData.resources || [];

            if (videos.length > 0 && heroVideoElement) {
                const heroVideo = videos[0];
                const videoSrc = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/q_auto:eco,vc_auto/${heroVideo.public_id}.mp4`;
                const posterSrc = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0,q_auto,f_auto,w_1920/${heroVideo.public_id}.jpg`;

                // Solo actualizar si el recurso en Cloudinary cambió
                if (!heroVideoElement.src.includes(heroVideo.public_id)) {
                    heroVideoElement.poster = posterSrc;
                    heroVideoElement.src = videoSrc;
                    heroVideoElement.load();
                    heroVideoElement.play().catch(e => console.error("Error al iniciar autoplay del hero video:", e));
                }
            }
        }
    } catch (e) {
        console.error("No se pudo sincronizar video de Cloudinary:", e);
    }
}

// ============================================
// 3. Cargar imágenes de Ceremonia y Recepción (Tags: ceremonia, recepcion)
// ============================================
async function loadEventImagesFromCloudinary() {
    // Imagen de Ceremonia
    try {
        const resCeremonia = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG_CEREMONIA}.json`);
        if (resCeremonia.ok) {
            const data = await resCeremonia.json();
            const items = data.resources || [];
            if (items.length > 0) {
                const file = items[0];
                const imgUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_800,h_500,q_auto,f_auto/${file.public_id}.${file.format}`;
                const ceremonyElement = document.getElementById('ceremony-img');
                if (ceremonyElement) {
                    ceremonyElement.style.backgroundImage = `url('${imgUrl}')`;
                }
            }
        }
    } catch (err) {
        console.error('Error al cargar imagen de ceremonia desde Cloudinary:', err);
    }

    // Imagen de Recepción
    try {
        const resRecepcion = await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG_RECEPCION}.json`);
        if (resRecepcion.ok) {
            const data = await resRecepcion.json();
            const items = data.resources || [];
            if (items.length > 0) {
                const file = items[0];
                const imgUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_800,h_500,q_auto,f_auto/${file.public_id}.${file.format}`;
                const receptionElement = document.getElementById('reception-img');
                if (receptionElement) {
                    receptionElement.style.backgroundImage = `url('${imgUrl}')`;
                }
            }
        }
    } catch (err) {
        console.error('Error al cargar imagen de recepción desde Cloudinary:', err);
    }
}

// Ejecutar cargar información cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    loadHeroVideoFromCloudinary();
    loadGalleryFromCloudinary();
    loadEventImagesFromCloudinary();
    initCountdown();
    setupScrollFadeIn();
});

// Lógica de Foto Aleatoria (Cajetín debajo del Hero)
function initRandomPhotoBox() {
    const photoDisplay = document.getElementById('random-photo-display');
    if (!photoDisplay || !window.galleryImages || window.galleryImages.length === 0) return;

    // Cambiar la foto inmediatamente a la primera o a una random
    let currentIndex = Math.floor(Math.random() * window.galleryImages.length);
    photoDisplay.src = window.galleryImages[currentIndex];

    // Dar un tiempo muy corto para asegurar la carga y mostrarla
    setTimeout(() => {
        photoDisplay.classList.remove('opacity-0');
    }, 100);

    // Bucle para cambiar la foto cada segundo
    setInterval(() => {
        // En lugar de ocultar completamente y esperar, podemos elegir una nueva foto y cruzar
        photoDisplay.classList.add('opacity-0');

        setTimeout(() => {
            currentIndex = Math.floor(Math.random() * window.galleryImages.length);
            photoDisplay.src = window.galleryImages[currentIndex];
            photoDisplay.classList.remove('opacity-0');
        }, 800); // Casi al final de la transición de 1s para que sea suave

    }, 2500); // Rotar foto cada 2.5 seg (dado que la animación dura aprox 1s, nos da un buen overlap)
}

// Lógica para que los elementos aparezcan con Fade-In en Scroll
function setupScrollFadeIn() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('opacity-0', 'translate-y-8');
                entry.target.classList.add('opacity-100', 'translate-y-0');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar la sección de foto aleatoria
    const photoSection = document.getElementById('random-photo-section');
    if (photoSection) {
        photoSection.classList.add('transition-all', 'duration-1000');
        observer.observe(photoSection);
    }

    // Observar las nuevas tarjetas de regalo y dress code
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => observer.observe(el));
}

// Lógica de Cuenta Regresiva
function initCountdown() {
    // Fecha objetivo: Sabado, 10 de Octubre, 2026 a las 18:00 HRS (Hora Local)
    const targetDate = new Date('October 10, 2026 18:00:00').getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

            const daysEl = document.getElementById('countdown-days');
            const hoursEl = document.getElementById('countdown-hours');
            const minutesEl = document.getElementById('countdown-minutes');

            if (daysEl) daysEl.innerText = days;
            if (hoursEl) hoursEl.innerText = hours;
            if (minutesEl) minutesEl.innerText = minutes;
        } else {
            // La fecha ha llegado
            const daysEl = document.getElementById('countdown-days');
            const hoursEl = document.getElementById('countdown-hours');
            const minutesEl = document.getElementById('countdown-minutes');

            if (daysEl) daysEl.innerText = '0';
            if (hoursEl) hoursEl.innerText = '0';
            if (minutesEl) minutesEl.innerText = '0';
        }
    };

    // Actualizar cada minuto ya que no mostramos segundos
    updateCountdown();
    setInterval(updateCountdown, 60000);
}

// Modales RSVP
function toggleModal() {
    const modal = document.getElementById('rsvpModal');
    if (modal) {
        modal.classList.toggle('hidden');
        modal.classList.toggle('flex');
    }
}

function sendToWhatsApp() {
    const nombre = document.getElementById('nombre')?.value;
    const asistentes = document.getElementById('asistentes')?.value;
    const alergias = document.getElementById('alergias')?.value || 'Ninguna';
    const ninos = document.getElementById('ninos')?.value;

    if (!nombre) {
        alert('Por favor, indica tu nombre o grupo familiar.');
        return;
    }

    const message = `¡Hola! Confirmamos nuestra asistencia(Boda Kathleen & Yair).\n\nNombre/Grupo: ${nombre}\nTotal personas: ${asistentes}\nAlergias/Med: ${alergias}\nCantidad de niños: ${ninos}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/573151201339?text=${encodedMessage}`, '_blank');
    toggleModal();
}

// Lógica de Lightbox (Visor de imágenes grande con soporte Swipe y Teclado)
window.currentLightboxIndex = 0;

function openLightbox(indexOrSrc) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (!lb || !img) return;

    if (typeof indexOrSrc === 'number' && window.galleryImages && window.galleryImages.length > 0) {
        window.currentLightboxIndex = indexOrSrc;
        img.src = window.galleryImages[indexOrSrc];
    } else if (typeof indexOrSrc === 'string') {
        img.src = indexOrSrc;
    } else {
        return;
    }

    lb.classList.remove('hidden');
    lb.classList.add('flex');
    document.body.classList.add('overflow-hidden'); // Prevenir scroll de fondo
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) {
        lb.classList.add('hidden');
        lb.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
    }
}

function showNextImage() {
    if (!window.galleryImages || window.galleryImages.length === 0) return;
    window.currentLightboxIndex = (window.currentLightboxIndex + 1) % window.galleryImages.length;
    const img = document.getElementById('lightbox-img');
    if (img) {
        img.src = window.galleryImages[window.currentLightboxIndex];
    }
}

function showPrevImage() {
    if (!window.galleryImages || window.galleryImages.length === 0) return;
    window.currentLightboxIndex = (window.currentLightboxIndex - 1 + window.galleryImages.length) % window.galleryImages.length;
    const img = document.getElementById('lightbox-img');
    if (img) {
        img.src = window.galleryImages[window.currentLightboxIndex];
    }
}

// Configurar los eventos de clic, teclado y deslizamiento (swipe) para el lightbox
document.addEventListener('DOMContentLoaded', () => {
    const lb = document.getElementById('lightbox');
    if (!lb) return;

    // Cerrar si se hace click fuera de la imagen (en el backdrop)
    lb.addEventListener('click', (e) => {
        if (e.target === lb) {
            closeLightbox();
        }
    });

    // Soporte para navegación con teclado (Esc, Flechas)
    document.addEventListener('keydown', (e) => {
        if (lb.classList.contains('hidden')) return;
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        }
    });

    // Variables para el control del swipe táctil
    let touchStartX = 0;
    let touchEndX = 0;

    lb.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lb.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50; // Mínimo de píxeles a desplazar para considerarlo un swipe
        if (touchEndX < touchStartX - swipeThreshold) {
            // Deslizamiento a la izquierda -> Siguiente imagen
            showNextImage();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Deslizamiento a la derecha -> Imagen anterior
            showPrevImage();
        }
    }
});

// ====== LÓGICA DE MÚSICA ======
document.addEventListener('DOMContentLoaded', () => {
    const musicBtn = document.getElementById('music-control');
    const audio = document.getElementById('wedding-music');
    const musicIcon = document.getElementById('music-icon');
    const musicText = document.getElementById('music-text');

    if (musicBtn && audio) {
        musicBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                musicText.innerText = "PAUSAR MÚSICA";
                musicIcon.innerText = "pause";
                musicIcon.classList.add('animate-pulse');
            } else {
                audio.pause();
                musicText.innerText = "REPRODUCIR MÚSICA";
                musicIcon.innerText = "music_note";
                musicIcon.classList.remove('animate-pulse');
            }
        });
    }
});