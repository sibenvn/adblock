// ==UserScript==
// @name         Adblock Youtube
// @namespace    https://siben.vn/
// @version      1.1
// @description  Adblock Youtube
// @author       siben.vn
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/sibenvn/adblock/raw/main/script.user.js
// @downloadURL  https://github.com/sibenvn/adblock/raw/main/script.user.js
// @grant        none
// ==/UserScript==

(function() {
    let currentUrl = window.location.href;

    const updateModal = {
        enable: true, // if true, replaces default window popup with a custom modal
        timer: 5000, // timer: number | false
    };

    function isWatch() {
        return window.location.href.startsWith('https://www.youtube.com/watch');
    }

    function hiddenPlayer()
    {
        let player = document.getElementById('ytd-player');
        if (player) {
            player.setAttribute('style', 'display: none');
        }
    }

    function removeAll(query) {
        const elements = document.querySelectorAll(query);
        elements.forEach((element) => {
            element.remove();
        });
    }

    function getVideoId() {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
        }
        let videoID = '';
        const baseURL = 'https://www.youtube.com/watch?v=';
        const startIndex = currentUrl.indexOf(baseURL);
        if (startIndex !== -1) {
            const videoIDStart = startIndex + baseURL.length;
            videoID = currentUrl.substring(videoIDStart);
            const ampersandIndex = videoID.indexOf('&');
            if (ampersandIndex !== -1) {
                videoID = videoID.substring(0, ampersandIndex);
            }
        }
        return videoID;
    }

    function removeAds() {
        if (!isWatch()) {
            clearPlayer();
            return;
        }
        removeAll('#player-ads');
        removeAll('#chat-container');
        let videoID = getVideoId();
        if (videoID == '') {
            log('YouTube video URL not found.', 'error');
            return;
        }
        clearPlayer(videoID);
        log("Video ID: " + videoID);
        createPlayer(videoID);
    }

    function autoPaused() {
        if (!isWatch()) {
            return;
        }
        let videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.paused) {
                video.volume = 0;
                video.pause();
            }
        });
    }

    function createURLPlayer(videoId)
    {
        // https://www.youtube-nocookie.com/embed/
        return 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&loop=1&playlist=' + videoId;
    }

    function clearPlayer(ignoreVideoID = '') {
        const iframes = document.querySelectorAll('#player-container.ytd-watch-flexy iframe');
        if (ignoreVideoID !== '') {
            const url = createURLPlayer(ignoreVideoID);
            let i = 0;
            iframes.forEach(iframe => {
                if (iframe.src !== url || i > 1) {
                    iframe.remove();
                }
                if (iframe.src === url) {
                    i++;
                }
            });
            return;
        }
        iframes.forEach(iframe => {
            iframe.remove();
        });
    }

    function createPlayer(videoID) {
        const iframes = document.querySelectorAll('#player-container.ytd-watch-flexy iframe');
        if (iframes.length <= 0) {
            createIframe(videoID);
        }
    }

    function createIframe(videoID) {
        const url = createURLPlayer(videoID);
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', url);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute(
            'allow',
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        );
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
        iframe.style.zIndex = '1';
        iframe.style.pointerEvents = 'all';
        const videoPlayerElement = document.querySelector('#player-container.ytd-watch-flexy');
        videoPlayerElement.appendChild(iframe);
    }

    function checkForUpdate() {
        if (!isWatch()) {
            return;
        }
        const scriptUrl = 'https://raw.githubusercontent.com/sibenvn/adblock/main/script.user.js';
        fetch(scriptUrl)
        .then(response => response.text())
        .then(data => {
            const match = data.match(/@version\s+(\d+\.\d+)/);
            if (!match) {
                return;
            }
            const githubVersion = parseFloat(match[1]);
            const currentVersion = parseFloat(GM_info.script.version);
            if (githubVersion <= currentVersion) {
                log('You have the latest version of the script. ' + githubVersion + " : " + currentVersion);
                return;
            }
            if (updateModal.enable) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
                document.head.appendChild(script);
                const style = document.createElement('style');
                style.textContent = '.swal2-container { z-index: 2400; }';
                document.head.appendChild(style);
                script.onload = function () {
                    Swal.fire({
                        position: "top-end",
                        backdrop: false,
                        title: 'Adblock: New version.',
                        text: 'Do you want to update?',
                        showCancelButton: true,
                        showDenyButton: false,
                        confirmButtonText: 'Update',
                        cancelButtonText: 'Close',
                        timer: updateModal.timer ?? 5000,
                        timerProgressBar: true,
                        didOpen: (modal) => {
                            modal.onmouseenter = Swal.stopTimer;
                            modal.onmouseleave = Swal.resumeTimer;
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.replace(scriptUrl);
                        } else if(result.isDenied) {
                           // is denied
                        }
                    });
                };
                script.onerror = function () {
                    var result = window.confirm("Adblock: A new version is available. Please update your script.");
                    if (result) {
                        window.location.replace(scriptUrl);
                    }
                }
            } else {
                var result = window.confirm("Adblock: A new version is available. Please update your script.");
                if (result) {
                    window.location.replace(scriptUrl);
                }
            }
        })
        .catch(error => {
            log("Error checking for updates:", "e", error)
        });
    }

    function log(log, level, ...args) {
        const prefix = '🔧 Remove Adblock Thing:';
        const message = `${prefix} ${log}`;
        switch (level) {
            case 'error':
                console.error(`❌ ${message}`, ...args);
                break;
            case 'log':
                console.log(`✅ ${message}`, ...args);
                break;
            case 'warning':
                console.warn(`⚠️ ${message}`, ...args);
                break;
            default:
                console.info(`ℹ️ ${message}`, ...args);
        }
    }

    checkForUpdate();
    hiddenPlayer();
    setInterval(() => {
        hiddenPlayer();
        autoPaused();
    }, 1);
    setInterval(() => {
        removeAds();
    }, 500);
})();