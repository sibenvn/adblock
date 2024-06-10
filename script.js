// ==UserScript==
// @name         Adblock Youtube
// @namespace    Adblock Youtube
// @version      1.0
// @description  Adblock Youtube
// @author       siben.vn
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/sibenvn/adblock/raw/main/script.js
// @downloadURL  https://github.com/sibenvn/adblock/raw/main/script.js
// @grant        none
// ==/UserScript==

(function() {
    let currentUrl = window.location.href;
    let isVideoPlayerModified = false;
    function getVideoId() {
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
        let video = document.querySelector('video');
        if (video && !video.paused) {
            video.volume = 0;
            video.pause();
        }
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            isVideoPlayerModified = false;
            const iframes = document.querySelectorAll('.html5-video-player iframe');
            iframes.forEach(iframe => {
                iframe.remove();
            });
        }
        if (isVideoPlayerModified) {
            return;
        }
        let videoID = getVideoId();
        if (videoID == '') {
            log('YouTube video URL not found.', 'error');
            return;
        }
        log("Video ID: " + videoID);
        createPlayer(videoID);
        isVideoPlayerModified = true;
    }
    function createPlayer(videoID) {
        const startOfUrl = "https://www.youtube-nocookie.com/embed/";
        const endOfUrl = "?autoplay=1&modestbranding=1";
        const finalUrl = startOfUrl + videoID + endOfUrl;
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', finalUrl);
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
        iframe.style.zIndex = '9999';
        iframe.style.pointerEvents = 'all'; 
        const videoPlayerElement = document.querySelector('.html5-video-player');
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
    setInterval(() => {
        removeAds();
    }, 100);
})();