// ==UserScript==
// @name         Adblock Youtube
// @namespace    https://siben.vn/
// @version      1.0
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
    hiddenPlayer();
    setInterval(() => {
        hiddenPlayer();
        autoPaused();
    }, 1);
    setInterval(() => {
        removeAds();
    }, 500);
})();