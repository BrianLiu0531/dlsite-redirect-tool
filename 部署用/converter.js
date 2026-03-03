// converter.js - 轉換頁邏輯

/**
 * 將字串轉換為 Base64
 */
function encodeToBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
    }));
}

/**
 * 驗證 URL 格式
 */
function isValidUrl(urlString) {
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * 生成跳轉網址
 */
function convertUrl() {
    const inputElement = document.getElementById('dlsiteUrl');
    const errorElement = document.getElementById('error');
    const resultElement = document.getElementById('result');
    const resultUrlElement = document.getElementById('resultUrl');

    const dlsiteUrl = inputElement.value.trim();

    // 隱藏錯誤訊息
    errorElement.classList.remove('show');

    // 驗證輸入
    if (!dlsiteUrl) {
        errorElement.textContent = '請輸入網址';
        errorElement.classList.add('show');
        return;
    }

    if (!isValidUrl(dlsiteUrl)) {
        errorElement.textContent = '請輸入有效的網址格式';
        errorElement.classList.add('show');
        return;
    }

    // 將 DLsite URL 轉換為 Base64
    const encodedUrl = encodeToBase64(dlsiteUrl);

    // 取得當前網域,生成跳轉頁網址
    const currentDomain = window.location.origin;
    const redirectUrl = `${currentDomain}/redirect.html?target=${encodedUrl}`;

    // 顯示結果
    resultUrlElement.textContent = redirectUrl;
    resultElement.classList.add('show');
}

/**
 * 複製到剪貼簿
 */
function copyToClipboard() {
    const resultUrlElement = document.getElementById('resultUrl');
    const textToCopy = resultUrlElement.textContent || '';

    navigator.clipboard.writeText(textToCopy).then(function() {
        const copyBtn = event.target;
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ 已複製!';
        
        setTimeout(function() {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(function(err) {
        // 降級方案:使用舊方法
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            const copyBtn = event.target;
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ 已複製!';
            
            setTimeout(function() {
                copyBtn.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('複製失敗:', err);
        }
        
        document.body.removeChild(textArea);
    });
}

// Enter 鍵觸發轉換
const urlInput = document.getElementById('dlsiteUrl');
if (urlInput) {
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertUrl();
        }
    });
}

