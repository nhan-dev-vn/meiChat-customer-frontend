let path = require('path');
let OUTPUT = path.join(__dirname, '../meiChat-admin-frontend');


module.exports = {
    mode: 'development',
    devtool: 'inline-sourcemap',
    module: {
        rules: [
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.html$/, use: 'html-loader' }
        ]
    },
    entry: [
        './app.js'
    ],
    output: {
        path: OUTPUT,
        filename: 'mei-chat-customer.js',
    }
}
