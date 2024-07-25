// app.js
document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    socket.on('top-news-update', (change) => {
        console.log('DB update:', change);
        document.getElementById('message').textContent = 'Database updated!';
    });

    window.login = async function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.token) {
            localStorage.setItem('jwt', data.token);
            document.getElementById('message').textContent = 'Login successful!';
        } else {
            document.getElementById('message').textContent = 'Login failed!';
        }
    }
});
