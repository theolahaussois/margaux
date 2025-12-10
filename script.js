document.addEventListener('DOMContentLoaded', () => {
    const envelope = document.getElementById('envelope');
    const letterContent = document.getElementById('letterContent');
    const closeLetterBtn = document.getElementById('closeLetter');
    const letterTitle = document.getElementById('letterTitle');
    const mainTitle = document.getElementById('mainTitle');
    
    // Musique
    const music1 = document.getElementById('music1');
    const music2 = document.getElementById('music2');
    
    // Vidéos
    const introVideoOverlay = document.getElementById('introVideoOverlay');
    const introVideo = document.getElementById('introVideo');
    const skipVideoBtn = document.getElementById('skipVideo');
    
    // Éléments pour la vidéo 2
    const secondVideoOverlay = document.getElementById('secondVideoOverlay');
    const secondVideo = document.getElementById('secondVideo');
    const skipSecondVideoBtn = document.getElementById('skipSecondVideo');
    
    const typedMessageElement = document.getElementById('typedMessage');
    const fixedPhotos = document.querySelectorAll('.fixed-photo');

    const fullMessage = `Yooooo mon pti loup, j'espère que tu es bien en route pour ce deuxième entretien !
    Je suis trop fier de toi hihi c'est génial t'es tellement forte et impressionnante !! 
    Je trouve ça trop fort ta motivation quand tu as envie de faire quelques chose c'est incroyable, par exemple finir ton 10km en moins de 50min avec le genou tout cassé sous la pluie et te dire pendant toute la course que tu vas finir je trouve que ça te représente bien haha !
    J'espère que tu ne stresses pas trop, il n'y a aucune raison, je suis sîur que tout va bien se passer, je pense très fort à toi. 
    Merci pour tout ce qu'on vit tous les deux, sincèrement c'est vraiment incroyable d'avoir la chance de partager autant de choses avec toi.
    Je t'aime tellement fort, j'ai envie de retourner sur des plages paradisiaques avec toi, de refaire des courses sous la pluie ou au soleil, d'aller voir plein d'expositions, de faire plein de recettes, de voyager enfin tout...
    Et surtout d'aller au super cadeau que tu m'as fait ce soir ça va être trop génial
    Bref bref bref, donne tout mon pti loup tu vas tout casser t'es la meilleure, n'aie aucun regret tu me raconteras après à quel point c'était génial !!
    Tu peux m'appeler si tu as besoin je suis là 
    Gros bisous plein de muscles et de neurones 
    JE T'AIME`;

    let isMusicPlaying = false;
    let typeWriterTimeout;
    let messageTyped = false;
    let secondVideoPlayed = false;
    let isVideo2Active = false; // Pour savoir si on est en mode "Vidéo 2"

    // --- Gestion de la musique en séquence ---
    music1.addEventListener('ended', () => {
         // Si la musique 1 finit, on lance la 2
         // MAIS on vérifie si on est pendant la vidéo 2 pour ajuster le volume tout de suite
         if (isVideo2Active) {
             music2.volume = 0.05;
         } else {
             music2.volume = 1.0;
         }
         music2.play().catch(e => console.error("Échec de la lecture de music2 :", e));
    });

    function stopAllMusic() {
        music1.pause();
        music2.pause();
        music1.currentTime = 0; 
        music2.currentTime = 0; 
        // Reset volume
        music1.volume = 1.0;
        music2.volume = 1.0;
        isMusicPlaying = false;
    }

    function startMusicSequence() {
        music2.pause();
        music2.currentTime = 0;
        music1.volume = 1.0;
        music2.volume = 1.0;
        
        music1.play().then(() => {
            isMusicPlaying = true;
        }).catch(error => {
            console.error("Échec music1, tentative music2");
            music2.play().then(() => {
                isMusicPlaying = true;
            }).catch(e => console.error("Échec total musique :", e));
        });
    }

    // --- Logique Dactylographie ---
    function typeWriter(text, i, fnCallback) {
        if (i < text.length) {
            typedMessageElement.innerHTML = text.substring(0, i + 1) + '<span class="typing-cursor"></span>';
            // Vitesse d'écriture
            typeWriterTimeout = setTimeout(() => typeWriter(text, i + 1, fnCallback), 50); 
        } else {
            typedMessageElement.innerHTML = text.substring(0, i) + ' '; 
            if (typeof fnCallback === 'function') {
                fnCallback();
            }
        }
    }

    // --- Fonction pour lancer automatiquement la vidéo 2 ---
    function launchSecondVideo() {
        isVideo2Active = true;
        
        // --- CORRECTION : BAISSER LES DEUX MUSIQUES ---
        // On baisse le volume des deux, au cas où la 1 n'est pas finie
        music1.volume = 0.05; // 5% de volume
        music2.volume = 0.05; 
        
        // Si la musique était en pause (bug possible), on force la lecture à bas volume
        if (isMusicPlaying) {
            if (music1.paused && music2.paused) {
                 // Si tout est en pause mais que ça devrait jouer, on relance la 2 doucement
                 music2.play();
            }
        }
        
        // Cacher la lettre
        letterContent.classList.remove('visible');
        
        setTimeout(() => {
            secondVideoOverlay.classList.remove('hidden');
            secondVideo.play().then(() => {
                console.log("Vidéo 2 lancée automatiquement");
            }).catch(e => {
                console.log("Lecture vidéo 2 bloquée, nécessite un clic");
            });
        }, 500);
    }

    // --- Fonction pour afficher directement le texte ---
    function displayFullMessage() {
        typedMessageElement.innerHTML = fullMessage;
        messageTyped = true;
        
        if (!secondVideoPlayed) {
            setTimeout(() => {
                launchSecondVideo();
            }, 1500); 
        }
    }

    // --- Logique Principale : Séquence ---
    function startLetterPhase() {
        introVideoOverlay.classList.add('hidden');
        startMusicSequence();

        fixedPhotos.forEach(photo => {
            photo.classList.remove('hidden-initially');
        });

        letterContent.classList.add('visible'); 
        letterTitle.classList.remove('hidden'); 
        
        if (!messageTyped) {
            typeWriter(fullMessage, 0, () => {
                console.log("Message terminé.");
                messageTyped = true;
                
                if (!secondVideoPlayed) {
                    setTimeout(() => {
                        launchSecondVideo();
                    }, 1500); 
                }
            });
        } else {
            displayFullMessage();
        }
    }

    // --- Gestion de la vidéo 1 ---
    introVideo.addEventListener('ended', () => {
        startLetterPhase();
    });

    skipVideoBtn.addEventListener('click', () => {
        introVideo.pause();
        startLetterPhase();
    });

    // --- Gestion de la vidéo 2 ---
    // Fonction commune pour la fin de la vidéo 2
    function endSecondVideo() {
        console.log("Vidéo 2 terminée/passée");
        secondVideoPlayed = true;
        isVideo2Active = false;
        
        secondVideoOverlay.classList.add('hidden');
        letterContent.classList.add('visible');
        letterTitle.classList.remove('hidden');
        
        // --- ON REMET LE SON FORT ---
        // On remonte le volume des deux
        music1.volume = 1.0;
        music2.volume = 1.0;
        
        // Si aucune musique ne joue, on relance la 2
        if (music1.paused && music2.paused && isMusicPlaying) {
            music2.play().catch(e => console.error("Erreur reprise musique:", e));
        }
    }

    secondVideo.addEventListener('ended', () => {
        endSecondVideo();
    });

    skipSecondVideoBtn.addEventListener('click', () => {
        secondVideo.pause();
        endSecondVideo();
    });

    // --- Clic sur l'enveloppe ---
    envelope.addEventListener('click', () => {
        envelope.classList.add('open');
        mainTitle.classList.add('hidden'); 

        setTimeout(() => {
            envelope.style.display = 'none'; 
            introVideoOverlay.classList.remove('hidden');
            introVideo.play().catch(e => {
                console.log("Lecture auto bloquée, clic requis");
            });
        }, 800); 
    });

    // --- Fermeture de la lettre ---
    closeLetterBtn.addEventListener('click', () => {
        secondVideoOverlay.classList.add('hidden');
        introVideoOverlay.classList.add('hidden');
        
        introVideo.pause();
        secondVideo.pause();
        introVideo.currentTime = 0;
        secondVideo.currentTime = 0;
        
        letterContent.classList.remove('visible');
        letterTitle.classList.add('hidden');
        
        clearTimeout(typeWriterTimeout);
        stopAllMusic(); // Cela reset aussi le volume

        fixedPhotos.forEach(photo => {
            photo.classList.add('hidden-initially');
        });

        setTimeout(() => {
            envelope.style.display = 'flex'; 
            envelope.classList.remove('open');
            mainTitle.classList.remove('hidden'); 
            typedMessageElement.innerHTML = '';
            
            messageTyped = false;
            secondVideoPlayed = false;
            isVideo2Active = false;
        }, 800); 
    });

    // Cœurs animation
    const heartsBackground = document.querySelector('.hearts-background');
    function createFallingHeart() {
        const heart = document.createElement('span');
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = Math.random() * 5 + 5 + 's'; 
        heart.style.animationDelay = Math.random() * 5 + 's';
        heart.style.fontSize = Math.random() * 1.5 + 0.8 + 'em';
        heartsBackground.appendChild(heart);
        heart.addEventListener('animationend', () => { heart.remove(); });
    }
    setInterval(createFallingHeart, 300); 

    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'VIDEO') return;
        const heartClick = document.createElement('div');
        heartClick.classList.add('heart-click-animation');
        heartClick.textContent = '❤️';
        heartClick.style.left = e.clientX + 'px';
        heartClick.style.top = e.clientY + 'px';
        document.body.appendChild(heartClick);
        heartClick.addEventListener('animationend', () => { heartClick.remove(); });
    });
});