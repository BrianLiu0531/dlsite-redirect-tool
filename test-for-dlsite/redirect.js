function decodeFromBase64(str) {
    try {
        return decodeURIComponent(
            Array.prototype.map.call(atob(str), function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
        );
    } catch (error) {
        console.error('Base64 解碼失敗:', error);
        return '';
    }
}

function getBase64Target() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('target');
}

function showManualOptions() {
    const spinner = document.querySelector('.spinner');
    const loading = document.querySelector('.loading');
    const buttons = document.getElementById('buttons');

    if (spinner) spinner.style.display = 'none';
    if (loading) loading.style.display = 'none';
    if (buttons) buttons.style.display = 'flex';

    // 若是自動跳轉流程顯示了手動選項，視為可能自動跳轉失敗
    if (window.__dlbAutoDeepLinkTried) {
        console.log('[DL Booster] 自動 Deep Link 可能未成功跳轉，已顯示手動選項');
    }
}

function getEnvironmentInfo() {

    const ua = navigator.userAgent;

    const isAndroid = /Android/i.test(ua);
    const isChrome = /Chrome/i.test(ua) && !/Edg|OPR|SamsungBrowser/i.test(ua);
    const isLine = /Line/i.test(ua);
    const isFB = /FBAN|FBAV/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);
    const isWeChat = /MicroMessenger/i.test(ua);

    const isWebView =
        /(wv|WebView)/i.test(ua) ||
        isLine ||
        isFB ||
        isInstagram ||
        isWeChat;

    return {
        isAndroid,
        isChrome,
        isWebView
    };
}

function buildDeepLink(base64Target) {
    return `dlb://b/${base64Target}`;
}

function attemptDeepLink(base64Target) {

    const env = getEnvironmentInfo();
    const deepLink = buildDeepLink(base64Target);

    if (env.isAndroid && env.isChrome && !env.isWebView) {

        const fallback = encodeURIComponent("https://dlbooster.com/adn");

        const intentUrl =
            `intent://b/${base64Target}#Intent;scheme=dlb;package=com.dlbooster.app;S.browser_fallback_url=${fallback};end`;

        window.location.href = intentUrl;

    } else {

        window.location.href = deepLink;

    }

    setTimeout(showManualOptions, 1800);
}

function initializeRedirect() {

    const base64Target = getBase64Target();

    if (!base64Target) {
        return;
    }

    const targetUrl = decodeFromBase64(base64Target);

    const openBtn = document.getElementById("openApp");
    const directLink = document.getElementById("directLink");

    if (directLink) {
        directLink.href = targetUrl;
    }

    if (openBtn) {

        // 讓超連結本身就帶有 Deep Link，視覺上與實際連結一致
        const deepLink = buildDeepLink(base64Target);
        openBtn.href = deepLink;

        openBtn.onclick = function (e) {

            // 由我們自己處理跳轉（包含 Android Chrome 的 intent 邏輯）
            if (e && typeof e.preventDefault === 'function') {
                e.preventDefault();
            }

            attemptDeepLink(base64Target);

        };

    }

    // Android Chrome 非 WebView：載入時自動嘗試一次 Deep Link
    const env = getEnvironmentInfo();
    if (env.isAndroid && env.isChrome && !env.isWebView) {
        // 標記這是自動嘗試，之後 showManualOptions 出現時可視為自動跳轉未成功
        window.__dlbAutoDeepLinkTried = true;
        attemptDeepLink(base64Target);
    }

    // 仍保留手動選項（例如 WebView、其他瀏覽器）
    setTimeout(showManualOptions, 2000);
}

document.addEventListener("DOMContentLoaded", initializeRedirect);
