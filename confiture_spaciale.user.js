// ==UserScript==
// @name         confiture_spaciale
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  confiture_spaciale
// @author       Kenshiroi
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/KenshiroiC/Analayse-Nanochimique-de-la-confiture-dans-l-espace/raw/main/confiture_spaciale.user.js
// @downloadURL  https://github.com/KenshiroiC/Analayse-Nanochimique-de-la-confiture-dans-l-espace/raw/main/confiture_spaciale.user.js
// @grant        none
// ==/UserScript==

/*
2.0 le code du gars ne fonctionne que pour la premiere video, la meilleure solution trouvé est de recharge la page quand c la deuxieme video :) comme ca pas de bug
*/

(function()
{
    // Variables
    let hasIgnoredUpdate = false;
    const updateModal = { enable: true, timer: 5000 };
    let currentUrl = window.location.href;
    let isVideoPlayerModified = false;
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
        setInterval(() => {
            if (window.location.href !== currentUrl) { window.location.reload(); }
            if (isVideoPlayerModified) { return; }

            var video = document.querySelector('video');
            if (video) video.volume = 0;
            if (video) video.pause();
            if (video) video.remove();
            if(!clearAllPlayers()) { return; }

            let videoID = '';
            const baseURL = 'https://www.youtube.com/watch?v=';
            const startIndex = currentUrl.indexOf(baseURL);

            if (startIndex !== -1)
            {
                const videoIDStart = startIndex + baseURL.length;
                videoID = currentUrl.substring(videoIDStart);
                const ampersandIndex = videoID.indexOf('&');
                if (ampersandIndex !== -1) { videoID = videoID.substring(0, ampersandIndex); }

            }
            else { return null; }

            const startOfUrl = "https://www.youtube-nocookie.com/embed/";
            const endOfUrl = "?autoplay=1&modestbranding=1";
            const finalUrl = startOfUrl + videoID + endOfUrl;

            const iframe = document.createElement('iframe');

            iframe.setAttribute('src', finalUrl);
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            iframe.setAttribute('allowfullscreen', true);
            iframe.setAttribute('mozallowfullscreen', "mozallowfullscreen");
            iframe.setAttribute('msallowfullscreen', "msallowfullscreen");
            iframe.setAttribute('oallowfullscreen', "oallowfullscreen");
            iframe.setAttribute('webkitallowfullscreen', "webkitallowfullscreen");

            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.zIndex = '9999';
            iframe.style.pointerEvents = 'all';

            const videoPlayerElement = document.querySelector('.html5-video-player');
            videoPlayerElement.appendChild(iframe);

            isVideoPlayerModified = true;
        }, 500);
    }

    // Fonction de nettoyage
    function clearAllPlayers() {

        const videoPlayerElements = document.querySelectorAll('.html5-video-player');
        if (videoPlayerElements.length === 0)
        {
            console.error("No elements with class 'html5-video-player' found.");
            return false;
        }
        videoPlayerElements.forEach(videoPlayerElement =>
        {
            while (videoPlayerElement.firstChild) { videoPlayerElement.removeChild(videoPlayerElement.firstChild); }
        });
        console.log("Removed all current players!");
        return true;
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
