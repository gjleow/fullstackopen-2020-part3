const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}
const password = process.argv[2];

const url = `mongodb+srv://fullstackopen-gj:${password}@cluster0.hvjjg.mongodb.net/fullstackopen?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length == 3) {
  console.log("phonebook:");

  Person.find({}).then((persons) => {
    persons.forEach((person) => console.log(`${person.name} ${person.number}`));
    mongoose.connection.close();
  });
}

if (process.argv.length == 4) {
  const name = process.argv[3];
  console.log(`Please provide the phone number for ${name}`);
  process.exit(1);
}

if (process.argv.length == 5) {
  const name = process.argv[3];
  const number = process.argv[4];

  console.log(name);
  console.log(number);

  const person = new Person({
    name: name,
    number: number,
  });

  person.save().then((result) => {
    mongoose.connection.close();
  });
}
