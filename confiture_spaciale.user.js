// ==UserScript==
// @name         confiture_spaciale
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  NO PUB YTP
// @author       Kenshiroi
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/KenshiroiC/Analayse-Nanochimique-de-la-confiture-dans-l-espace/raw/main/confiture_spaciale.user.js
// @downloadURL  https://github.com/KenshiroiC/Analayse-Nanochimique-de-la-confiture-dans-l-espace/raw/main/confiture_spaciale.user.js
// @grant        none
// ==/UserScript==

(function() {
    let isAdFound = false;
    let adLoop = 0;
    let videoPlayback = 1;
    let originalVolume = 1;
    let hasIgnoredUpdate = false;
    const updateModal = { enable: true, timer: 5000 };

    const event = new PointerEvent('click', {
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

    function removeAds() {
        setInterval(() => {
            const video = document.querySelector('video');
            const ad = document.querySelector('.ad-showing');

            if (ad) {
                isAdFound = true;
                adLoop += 1;

                if (adLoop >= 2) {
                    if (video.currentTime < (video.duration / 2)) {
                        let randomNumber = Math.floor(Math.random() * 2) + 1;
                        video.playbackRate = 10 - randomNumber;
                        originalVolume = video.volume;
                        video.volume = 0;
                    }
                }

                skipAd();
                video.play();
            } else {
                handleVideoPlayback(video);
            }
        }, 50);
    }

    function skipAd() {
        const skipButtons = [
            '.ytp-ad-skip-button-container',
            '.ytp-ad-skip-button-modern',
            '.videoAdUiSkipButton',
            '.ytp-ad-skip-button',
            '.ytp-ad-skip-button-modern',
            '.ytp-ad-skip-button-slot',
            '.ytp-skip-ad-button',
            '#skip-button\\:3', // Specific ID from the provided image
            '#skip-button'
        ];

        skipButtons.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements && elements.length > 0) {
                elements.forEach(element => {
                    element.dispatchEvent(event);
                });
            }
        });
    }

    function handleVideoPlayback(video) {
        if (video && video.playbackRate === 10) {
            video.playbackRate = videoPlayback;
            video.volume = originalVolume;
        }

        if (isAdFound) {
            isAdFound = false;
            if (videoPlayback === 10) videoPlayback = 1;
            if (video && isFinite(videoPlayback)) video.playbackRate = videoPlayback;
            adLoop = 0;
        } else {
            if (video) videoPlayback = video.playbackRate;
        }
    }

    function checkForUpdate() {
        const scriptUrl = 'https://raw.githubusercontent.com/KenshiroiC/Analayse-Nanochimique-de-la-confiture-dans-l-espace/main/confiture_spaciale.user.js';

        fetch(scriptUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.text();
            })
            .then(content => {
                const match = content.match(/@version\s+(\d+\.\d+)/);
                if (!match) {
                    console.error("Unable to extract version from the GitHub script.");
                    return;
                }

                const githubVersion = parseFloat(match[1]);
                const currentVersion = parseFloat(GM_info.script.version);

                if (githubVersion <= currentVersion) {
                    console.log('You have the latest version of the script. ' + githubVersion + " : " + currentVersion);
                    return;
                }

                console.log('NO PUB YTP: A new version is available. Please update your script. ' + githubVersion + " : " + currentVersion);

                if (updateModal.enable) {
                    if (parseFloat(localStorage.getItem('skipNoPubYTPVersion')) === githubVersion) {
                        return;
                    }
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
                    document.head.appendChild(script);

                    const style = document.createElement('style');
                    style.textContent = '.swal2-container { z-index: 2400; }';
                    document.head.appendChild(style);

                    script.onload = function () {
                        if (typeof Swal !== 'undefined') {
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
                                didOpen: (modal) => {
                                    modal.onmouseenter = Swal.stopTimer;
                                    modal.onmouseleave = Swal.resumeTimer;
                                }
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    window.location.replace('https://github.com/KenshiroiC/Analayse-Nanochimique-de-la-confiture-dans-l-espace/raw/main/confiture_spaciale.user.js');
                                } else if (result.isDenied) {
                                    localStorage.setItem('skipNoPubYTPVersion', githubVersion);
                                }
                            });
                        } else {
                            console.error("SweetAlert2 not loaded properly.");
                        }
                    };

                    script.onerror = function () {
                        var result = window.confirm("NO PUB YTP: A new version is available. Please update your script.");
                        if (result) {
                            window.location.replace('https://github.com/KenshiroiC/Analayse-Nanochimique-de-la-confiture-dans-l-espace/raw/main/confiture_spaciale.user.js');
                        }
                    }
                } else {
                    var result = window.confirm("NO PUB YTP: A new version is available. Please update your script.");
                    if (result) {
                        window.location.replace('https://github.com/KenshiroiC/Analayse-Nanochimique-de-la-confiture-dans-l-espace/raw/main/confiture_spaciale.user.js');
                    }
                }
            })
            .catch(error => {
                hasIgnoredUpdate = true;
                console.error("Error checking for updates:", error);
            });
        hasIgnoredUpdate = true;
    }

    checkForUpdate();
    removeAds();
})();
