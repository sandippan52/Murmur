const adjectives = [
  "Silent",
  "Hidden",
  "Misty",
  "Quiet",
  "Shadow",
  "Lost",
  "Blue",
  "Golden",
];

const animals = [
  "Crow",
  "Fox",
  "Rabbit",
  "Wolf",
  "Owl",
  "Cat",
  "Raven",
  "Deer",
];

export function generateUsername() {
  const adjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];

  const animal =
    animals[Math.floor(Math.random() * animals.length)];

  const number =
    Math.floor(1000 + Math.random() * 9000);

  return `${adjective}${animal}${number}`;
}