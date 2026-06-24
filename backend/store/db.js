const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data.json');

const defaultData = {
  users: [],
  questions: [],
  answers: [],
  votes: [],
  faqs: [],
  reports: []
};

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(defaultData));
}

function save(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {}
}

let db = load();

const DB = {
  get users() { return db.users; },
  get questions() { return db.questions; },
  get answers() { return db.answers; },
  get votes() { return db.votes; },
  get faqs() { return db.faqs; },
  get reports() { return db.reports; },
  save() { save(db); }
};

module.exports = DB;
