module.exports = {
    apps: [
        {
            name: 'Recipe Finder Server',
            script: 'index.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'development',
                PORT: 8000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 8000
            }
        }
    ]
}