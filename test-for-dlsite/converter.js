function encodeToBase64(str) {
    return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        })
    );
}

function isValidUrl(urlString) {
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function convertUrl() {
    const inputElement = document.getElementById('dlsiteUrl');
    const errorElement = document.getElementById('error');
    const resultElement = document.getElementById('result');
    const resultUrlElement = document.getElementById('resultUrl');

    const dlsiteUrl = inputElement.value.trim();

    errorElement.classList.remove('show');

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

    const encodedUrl = encodeToBase64(dlsiteUrl);
    const safeEncodedUrl = encodeURIComponent(encodedUrl);

    const currentDomain = window.location.origin;

    const redirectUrl = `${currentDomain}/redirect.html?target=${safeEncodedUrl}`;

    resultUrlElement.textContent = redirectUrl;
    resultElement.classList.add('show');
}
