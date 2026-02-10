#!/bin/bash

# DLsite 深度鏈結工具 - VPS 部署腳本
# 適用於 Ubuntu 20.04+ / Debian 10+

set -e

echo "================================"
echo "DLsite 深度鏈結工具 - 自動部署"
echo "================================"
echo ""

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 檢查是否為 root 用戶
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}請使用 root 權限執行此腳本${NC}"
    echo "使用方法: sudo bash deploy.sh"
    exit 1
fi

echo -e "${YELLOW}步驟 1/6: 更新系統套件...${NC}"
apt update
apt upgrade -y

echo ""
echo -e "${YELLOW}步驟 2/6: 安裝 Nginx...${NC}"
apt install -y nginx

echo ""
echo -e "${YELLOW}步驟 3/6: 創建網站目錄...${NC}"
mkdir -p /var/www/dlsite-redirect-tool
chmod 755 /var/www/dlsite-redirect-tool

echo ""
echo -e "${YELLOW}步驟 4/6: 複製網站檔案...${NC}"
# 假設檔案已經上傳到 /tmp/dlsite-redirect-tool
if [ -d "/tmp/dlsite-redirect-tool" ]; then
    cp -r /tmp/dlsite-redirect-tool/* /var/www/dlsite-redirect-tool/
    echo -e "${GREEN}✓ 檔案複製完成${NC}"
else
    echo -e "${RED}錯誤: 找不到 /tmp/dlsite-redirect-tool 目錄${NC}"
    echo "請先將檔案上傳到 /tmp/dlsite-redirect-tool/"
    exit 1
fi

echo ""
echo -e "${YELLOW}步驟 5/6: 配置 Nginx...${NC}"

# 讀取域名
read -p "請輸入你的域名 (例如: example.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}域名不能為空!${NC}"
    exit 1
fi

# 創建 Nginx 配置
cat > /etc/nginx/sites-available/dlsite-redirect << EOF
server {
    listen 80;
    listen [::]:80;
    
    server_name ${DOMAIN} www.${DOMAIN};
    
    root /var/www/dlsite-redirect-tool;
    index index.html;

    access_log /var/log/nginx/dlsite-redirect-access.log;
    error_log /var/log/nginx/dlsite-redirect-error.log;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        try_files \$uri \$uri/ =404;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    location ~* \.(html)$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# 啟用站點
ln -sf /etc/nginx/sites-available/dlsite-redirect /etc/nginx/sites-enabled/

# 刪除默認站點
rm -f /etc/nginx/sites-enabled/default

# 測試 Nginx 配置
nginx -t

echo ""
echo -e "${YELLOW}步驟 6/6: 重啟 Nginx...${NC}"
systemctl restart nginx
systemctl enable nginx

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}部署完成!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "網站地址: ${YELLOW}http://${DOMAIN}${NC}"
echo ""
echo -e "${YELLOW}下一步建議:${NC}"
echo "1. 確保域名 DNS 已指向此 VPS IP"
echo "2. 安裝 SSL 證書 (Let's Encrypt):"
echo "   ${GREEN}sudo apt install certbot python3-certbot-nginx -y${NC}"
echo "   ${GREEN}sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}${NC}"
echo ""
echo "3. 設置自動續期:"
echo "   ${GREEN}sudo certbot renew --dry-run${NC}"
echo ""
echo -e "${YELLOW}管理指令:${NC}"
echo "  重啟 Nginx: ${GREEN}sudo systemctl restart nginx${NC}"
echo "  查看狀態: ${GREEN}sudo systemctl status nginx${NC}"
echo "  查看日誌: ${GREEN}sudo tail -f /var/log/nginx/dlsite-redirect-error.log${NC}"
echo ""
