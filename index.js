const express = require('express');
const postsRoutes = require('./postsRoutes');

const server = express();

server.use('/api/posts', postsRoutes);

server.use('/', (req, res) => res.send('API up and running!'));

server.listen(5000, () => console.log('API running on port 5000'));
