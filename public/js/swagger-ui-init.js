window.onload = function() {
    // load swagger.yaml file
    fetch('./public/docs/swagger.yaml')
        .then(response => response.text())
        .then(yamlText => {
            // use js-yaml to parse YAML (if needed, we directly use the result of fetch)
            const ui = SwaggerUIBundle({
                url: './public/docs/swagger.yaml',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                validatorUrl: null,
                docExpansion: 'list',
                filter: true,
                showRequestHeaders: true,
                tryItOutEnabled: true,
                requestInterceptor: function(request) {
                    // 添加 CORS 支援
                    request.headers['Access-Control-Allow-Origin'] = '*';
                    return request;
                },
                responseInterceptor: function(response) {
                    return response;
                }
            });
        })
        .catch(error => {
            console.error('Error loading swagger.yaml:', error);
            document.getElementById('swagger-ui').innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h2>無法載入 API 文檔</h2>
                    <p>請確保 swagger.yaml 文件存在於同一目錄下。</p>
                    <p>錯誤訊息: ${error.message}</p>
                </div>
            `;
        });
};
