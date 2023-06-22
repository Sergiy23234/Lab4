const express = require('express');
const app = express();
const session = require('express-session');
const port = 3000;

app.get('/', (req, res) => {
    res.send('Привіт! Сервер працює.');
});

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Додали middleware для обробки JSON-даних

class User {
    constructor(username, password, userType) {
        this.username = username;
        this.password = password;
        this.userType = userType;
    }
}

let topics = [];
let users = [];

// GET метод для отримання списку тем
app.get('/api/v1/topics', (req, res) => {
    res.json(topics);
});

// GET метод для отримання окремої теми за ідентифікатором
app.get('/api/v1/topics/:id', (req, res) => {
    const id = req.params.id;
    const topic = topics[id];

    if (!topic) {
        res.status(404).json({ error: 'Тема не знайдена' });
        return;
    }

    res.json(topic);
});

// POST метод для створення нової теми
app.post('/api/v1/topics', isAuthenticated, (req, res) => {
    const title = req.body.title;
    topics.push({ title: title, posts: [] });
    res.status(201).json({ message: 'Тема успішно створена' });
});

// DELETE метод для видалення теми
app.delete('/api/v1/topics/:id', isAuthenticated, (req, res) => {
    const id = req.params.id;

    if (id >= 0 && id < topics.length) {
        topics.splice(id, 1);
        res.json({ message: 'Тема успішно видалена' });
    } else {
        res.status(404).json({ error: 'Тема не знайдена' });
    }
});

// GET метод для отримання списку користувачів
app.get('/api/v1/users', (req, res) => {
    res.json(users);
});

// GET метод для отримання окремого користувача за ідентифікатором
app.get('/api/v1/users/:id', (req, res) => {
    const id = req.params.id;
    const user = users[id];

    if (!user) {
        res.status(404).json({ error: 'Користувача не знайдено' });
        return;
    }

    res.json(user);
});

// POST метод для створення нового користувача
app.post('/api/v1/users', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const userType = req.body.userType;

    const user = new User(username, password, userType);
    users.push(user);
    res.status(201).json({ message: 'Користувач успішно створений' });
});

// DELETE метод для видалення користувача
app.delete('/api/v1/users/:id', (req, res) => {
    const id = req.params.id;

    if (id >= 0 && id < users.length) {
        users.splice(id, 1);
        res.json({ message: 'Користувач успішно видалений' });
    } else {
        res.status(404).json({ error: 'Користувача не знайдено' });
    }
});

// GET метод для отримання списку дописів у темі
app.get('/api/v1/topics/:id/posts', (req, res) => {
    const id = req.params.id;
    const topic = topics[id];

    if (!topic) {
        res.status(404).json({ error: 'Тема не знайдена' });
        return;
    }

    res.json(topic.posts);
});

// POST метод для створення нового допису у темі
app.post('/api/v1/topics/:id/posts', isAuthenticated, (req, res) => {
    const id = req.params.id;
    const post = req.body.post;
    const topic = topics[id];

    if (!topic) {
        res.status(404).json({ error: 'Тема не знайдена' });
        return;
    }

    topic.posts.push(post);
    res.status(201).json({ message: 'Допис успішно створений' });
});

// DELETE метод для видалення допису з теми
app.delete('/api/v1/topics/:id/posts/:postId', isAuthenticated, (req, res) => {
    const id = req.params.id;
    const postId = req.params.postId;
    const topic = topics[id];

    if (!topic) {
        res.status(404).json({ error: 'Тема не знайдена' });
        return;
    }

    if (postId >= 0 && postId < topic.posts.length) {
        topic.posts.splice(postId, 1);
        res.json({ message: 'Допис успішно видалений' });
    } else {
        res.status(404).json({ error: 'Допис не знайдений' });
    }
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(403).json({ error: 'Необхідно авторизуватися' });
    }
}

app.listen(port, () => {
    console.log(`Сервер запущено на порту ${port}`);
});