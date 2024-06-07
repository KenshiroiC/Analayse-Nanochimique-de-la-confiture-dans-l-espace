// ==UserScript==
// @name         confiture_spaciale
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  confiture_spaciale
// @author       Kenshiroi
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/KenshiroiC/Analayse-Nanochimique-de-la-confiture-dans-l-espace/raw/main/confiture_spaciale.user.js
// @downloadURL  https://github.com/KenshiroiC/Analayse-Nanochimique-de-la-confiture-dans-l-espace/raw/main/confiture_spaciale.user.js
// @grant        none
// ==/UserScript==

/*
2.1 on croise les doigts
*/

(function()
{
    // Variables
    let isAdFound = false;
    let adLoop = 0;
    let videoPlayback = 1;
    let originalVolume = 1;
    let hasIgnoredUpdate = false;
    const updateModal = { enable: true, timer: 5000 };
    const scriptUrl = 'https://raw.githubusercontent.com/KenshiroiC/Analayse-Nanochimique-de-la-confiture-dans-l-espace/main/confiture_spaciale.user.js';

    const event = new PointerEvent('click',
    {
        pointerId: 1,
        bubbles: true,
        cancelable: true,
        view: window,
        detail: 1,
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        button: 0,
        buttons: 1,
        width: 1,
        height: 1,
        pressure: 0.5,
        tiltX: 0,
        tiltY: 0,
        pointerType: 'mouse',
        isPrimary: true
    });

    // Fonction principale pour supprimer les publicités
    function removeAds()
    {
        setInterval(() =>
        {
            const video = document.querySelector('video');
            const ad = document.querySelector('.ad-showing');

            if (ad)
            {
                if (adLoop == 0)
                { originalVolume = video.volume; }
                video.volume = 0;
                isAdFound = true;
                adLoop += 1;

                if (adLoop >= 2 && video.currentTime > 0.112)
                {
                    let randomNumber = Math.floor(Math.random() * 2) + 1;
                    video.playbackRate = 14 - randomNumber;
                    console.log('test');
                }
                if (adLoop >= 3 && video.currentTime > 0.112) skipAd();
                video.play();
            }
            else handleVideoPlayback(video);
        }, 50);
    }

    // Fonction pour ignorer les publicités
    function skipAd()
    {
        const skipButtons =
        [
            '.ytp-ad-skip-button-container',
            '.ytp-ad-skip-button-modern',
            '.videoAdUiSkipButton',
            '.ytp-ad-skip-button',
            '.ytp-ad-skip-button-modern',
            '.ytp-ad-skip-button-slot',
            '.ytp-skip-ad-button',
            '#skip-button\\:3',
            '#skip-button'
        ];

        skipButtons.forEach(selector =>
        {
            document.querySelectorAll(selector).forEach(element => { element.dispatchEvent(event); });
        });
    }

    // Fonction pour gérer la lecture de la vidéo
    function handleVideoPlayback(video)
    {
        if (video && video.playbackRate === 10)
        {
            video.playbackRate = videoPlayback;
        }

        if (isAdFound)
        {
            isAdFound = false;
            videoPlayback = videoPlayback === 10 ? 1 : videoPlayback;
            if (video && isFinite(videoPlayback)) video.playbackRate = videoPlayback;
            adLoop = 0;
            video.volume = originalVolume;
        }
        else
        {
            if (video) videoPlayback = video.playbackRate;
        }
    }

    // Fonction pour vérifier les mises à jour du script
    function checkForUpdate()
    {
        fetch(scriptUrl)
            .then(response =>
            {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.text();
            })
            .then(content =>
            {
                const match = content.match(/@version\s+(\d+\.\d+)/);
                if (!match)
                {
                    console.error("Unable to extract version from the GitHub script.");
                    return;
                }

                const githubVersion = parseFloat(match[1]);
                const currentVersion = parseFloat(GM_info.script.version);

                if (githubVersion <= currentVersion)
                {
                    console.log(`You have the latest version of the script. ${githubVersion} : ${currentVersion}`);
                    return;
                }

                console.log(`NO PUB YTP: A new version is available. Please update your script. ${githubVersion} : ${currentVersion}`);

                if (updateModal.enable)
                {
                    if (parseFloat(localStorage.getItem('skipNoPubYTPVersion')) === githubVersion) return;
                    loadSweetAlert(githubVersion);
                }
                else confirmUpdate();
            })
            .catch(error =>
            {
                hasIgnoredUpdate = true;
                console.error("Error checking for updates:", error);
            });
        hasIgnoredUpdate = true;
    }

    // Fonction pour charger SweetAlert
    function loadSweetAlert(githubVersion)
    {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        document.head.appendChild(script);

        const style = document.createElement('style');
        style.textContent = '.swal2-container { z-index: 2400; }';
        document.head.appendChild(style);

        script.onload = function ()
        {
            if (typeof Swal !== 'undefined')
            {
                Swal.fire({
                    position: "top-end",
                    backdrop: false,
                    title: 'NO PUB YTP: New version is available.',
                    text: 'Do you want to update?',
                    showCancelButton: true,
                    showDenyButton: true,
                    confirmButtonText: 'Update',
                    denyButtonText: 'Skip',
                    cancelButtonText: 'Close',
                    timer: updateModal.timer ?? 5000,
                    timerProgressBar: true,
                    didOpen: (modal) =>
                    {
                        modal.onmouseenter = Swal.stopTimer;
                        modal.onmouseleave = Swal.resumeTimer;
                    }
                }).then((result) =>
                {
                    if (result.isConfirmed) window.location.replace(scriptUrl);
                    else if (result.isDenied) localStorage.setItem('skipNoPubYTPVersion', githubVersion);
                });
            }
            else console.error("SweetAlert2 not loaded properly.");
        };

        script.onerror = function () { confirmUpdate(); }
    }

    // Fonction pour confirmer la mise à jour
    function confirmUpdate()
    {
        const result = window.confirm("NO PUB YTP: A new version is available. Please update your script.");
        if (result) window.location.replace(scriptUrl);
    }

    checkForUpdate();
    removeAds();
})();
