# Dockerfile for DLsite Redirect Tool

FROM nginx:alpine

# 複製網站檔案到 Nginx 默認目錄
COPY index.html /usr/share/nginx/html/
COPY converter.html /usr/share/nginx/html/
COPY converter.js /usr/share/nginx/html/
COPY redirect.html /usr/share/nginx/html/
COPY redirect.js /usr/share/nginx/html/

# 複製自定義 Nginx 配置
COPY nginx-docker.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]
