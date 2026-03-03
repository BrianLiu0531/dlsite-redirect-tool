// redirect.js - 跳轉頁邏輯

/**
 * 從 Base64 解碼字串
 */
function decodeFromBase64(str) {
    try {
        return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (error) {
        console.error('Base64 解碼失敗:', error);
        return '';
    }
}

/**
 * 從 URL 參數取得目標網址
 */
function getTargetUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const targetParam = urlParams.get('target');
    
    if (!targetParam) {
        return null;
    }

    return decodeFromBase64(targetParam);
}

/**
 * 嘗試開啟深度鏈結
 */
function attemptDeepLink(base64Target) {
    const deepLink = `dlb://b/${base64Target}`;
    
    console.log('嘗試開啟深度鏈結:', deepLink);

    // 創建隱藏的 iframe 來觸發深度鏈結
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);

    // 也嘗試直接改變 window.location
    setTimeout(function() {
        window.location.href = deepLink;
    }, 25);

    // 如果沒有成功跳轉,2.5 秒後顯示手動選項
    setTimeout(function() {
        showManualOptions();
    }, 2500);
}

/**
 * 顯示手動跳轉選項
 */
function showManualOptions() {
    const spinner = document.querySelector('.spinner');
    const loading = document.querySelector('.loading');
    const buttons = document.getElementById('buttons');
    
    if (spinner) spinner.style.display = 'none';
    if (loading) spinner.style.display = 'none';
    if (buttons) buttons.style.display = 'flex';
}

/**
 * 初始化跳轉邏輯
 */
function initializeRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const base64Target = urlParams.get('target');

    if (!base64Target) {
        // 沒有目標參數,顯示錯誤
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="icon">⚠️</div>
            <h1>無效的連結</h1>
            <p class="message">此連結缺少必要的參數,無法進行跳轉。</p>
            <div class="buttons" style="display: flex;">
                <a href="https://dlbooster.com/adn" class="btn btn-secondary" target="_blank">
                    無法前往 DLsite?請點我
                </a>
            </div>
        `;
        return;
    }

    // 解碼目標 URL
    const targetUrl = decodeFromBase64(base64Target);

    if (!targetUrl) {
        // 解碼失敗
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="icon">⚠️</div>
            <h1>解析失敗</h1>
            <p class="message">無法解析目標網址,請確認連結是否正確。</p>
            <div class="buttons" style="display: flex;">
                <a href="https://dlbooster.com/adn" class="btn btn-secondary" target="_blank">
                    無法前往 DLsite?請點我
                </a>
            </div>
        `;
        return;
    }

    // 設定直接連結按鈕
    const directLink = document.getElementById('directLink');
    if (directLink) {
        directLink.href = targetUrl;
    }

    // 嘗試開啟深度鏈結
    attemptDeepLink(base64Target);
}

// 頁面載入時執行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRedirect);
} else {
    initializeRedirect();
}

// 處理頁面可見性變化(用戶切回來時顯示按鈕)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        setTimeout(function() {
            showManualOptions();
        }, 500);
    }
});

