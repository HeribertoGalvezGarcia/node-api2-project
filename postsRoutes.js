const express = require('express');
const db = require('./data/db');

const router = express.Router();
router.use(express.json());

router.post('/', ({body: {title, contents}}, res) => {
  if (title === undefined || contents === undefined)
    return res.status(400).json({errorMessage: 'Please provide title and contents for the post.'});

  db.insert({title, contents})
    .then(({id}) => {
      db.findById(id)
        .then(post => res.status(201).json(post))
        .catch(() => res.status(500).json({error: 'The new post information could not be retrieved.'}));
    })
    .catch(() => res.status(500).json({error: 'There was an error while saving the post to the database.'}));
});

router.post('/:id/comments', ({params: {id: post_id}, body: {text}}, res) => {
  if (text === undefined) return res.status(400).json({errorMessage: 'Please provide text for the comment.'});

  db.findById(post_id)
    .then(post => {
      if (!post) return res.status(404).json({message: 'The post with the specified ID does not exist.'});

      db.insertComment({post_id, text})
        .then(({id: commentID}) => {
          db.findCommentById(commentID)
            .then(comment => res.status(201).json(comment))
            .catch(() => res.status(500).json({error: 'The new comment information could not be retrieved.'}));
        })
        .catch(() => res.status(500).json({error: 'There was an error while saving the comment to the database'}));
    })
    .catch(() => res.status(500).json({error: 'The posts information could not be retrieved.'}));
});

router.get('/', (req, res) => {
  db.find()
    .then(posts => res.status(200).json(posts))
    .catch(() => res.status(500).json({error: 'The posts information could not be retrieved.'}));
});

router.get('/:id', ({params: {id}}, res) => {
  db.findById(id)
    .then(post => {
      if (!post) return res.status(404).json({message: 'The post with the specified ID does not exist.'});

      res.status(200).json(post);
    })
    .catch(() => res.status(500).json({error: 'The post information could not be retrieved.'}));
});

router.get('/:id/comments', ({params: {id}}, res) => {
  db.findPostComments(id)
    .then(comment => {
      if (!comment) return res.status(404).json({message: 'The post with the specified ID does not exist.'});

      res.status(200).json(comment);
    })
    .catch(() => res.status(500).json({error: 'The comments information could not be retrieved.'}));
});

router.delete('/:id', ({params: {id}}, res) => {
  db.findById(id)
    .then(post => {
      if (!post) return res.status(404).json({message: 'The post with the specified ID does not exist.'});

      db.remove(id)
        .then(() => {
          res.status(200).json(post);
        })
        .catch(() => res.status(500).json({error: 'The post could not be removed'}));
    })
    .catch(() => res.status(500).json({error: 'The post information could not be retrieved.'}));
});

router.put('/:id', ({params: {id}, body: {title, contents}}, res) => {
  if (title === undefined || contents === undefined)
    return res.status(400).json({errorMessage: 'Please provide title and contents for the post.'});

  db.findById(id)
    .then(post => {
      if (!post) return res.status(404).json({message: 'The post with the specified ID does not exist.'});

      db.update(id, {title, contents})
        .then(() => {
          db.findById(id)
            .then(post => res.status(200).json(post))
            .catch(() => res.status(500).json({error: 'The new post information could not be retireved.'}));
        })
        .catch(() => res.status(500).json({error: 'The post information could not be modified.'}));
    })
    .catch(e => {
      console.log(e);
      res.status(500).json({error: 'The post information could not be retrieved.'});
    });

});

module.exports = router;
