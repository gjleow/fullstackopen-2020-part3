require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const app = express();
const Person = require('./models/person');

app.use(express.json());
morgan.token('res-body', (req) => JSON.stringify(req.body));
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :res-body',
  ),
);
app.use(express.static('build'));

app.get('/info', (req, res, next) => {
  Person.count({})
    .then((count) => {
      res.send(`<p>Phonebook has info for ${count} people</p>
  <p>${Date().toString()}</p>
  `);
    })
    .catch((err) => {
      next(err);
    });
});

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body;
  if (!name) {
    return res.status(400).json({
      error: 'name missing',
    });
  }

  if (!number) {
    return res.status(400).json({
      error: 'number missing',
    });
  }

  const person = new Person({
    name,
    number,
  });

  return person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson.toJSON());
    })
    .catch((err) => {
      next(err);
    });
});

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons.map((person) => person.toJSON()));
    })
    .catch((err) => {
      next(err);
    });
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person.toJSON());
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => {
      next(err);
    });
});

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;
  const person = {
    name,
    number,
  };
  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
  })
    .then((updatedPerson) => {
      res.json(updatedPerson.toJSON());
    })
    .catch((error) => {
      next(error);
    });
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => {
      next(err);
    });
});

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  return next(error);
};

app.use(errorHandler);

const unknownEndpoint = (error, req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
