export interface FamousPerson {
  name: string;
  profession: string;
  birthYear: number;
  emoji: string;
}

type MonthDay = string; // Format: "MM-DD"

export const famousBirthdays: Record<MonthDay, FamousPerson[]> = {
  "01-01": [
    { name: "J.D. Salinger", profession: "Author", birthYear: 1919, emoji: "📚" },
    { name: "Betsy Ross", profession: "Flag Designer", birthYear: 1752, emoji: "🇺🇸" },
    { name: "Paul Revere", profession: "Silversmith & Patriot", birthYear: 1735, emoji: "🐎" },
  ],
  "01-04": [
    { name: "Isaac Newton", profession: "Physicist", birthYear: 1643, emoji: "🍎" },
    { name: "Louis Braille", profession: "Inventor", birthYear: 1809, emoji: "👨‍🦯" },
  ],
  "01-08": [
    { name: "Elvis Presley", profession: "Musician", birthYear: 1935, emoji: "🎸" },
    { name: "Stephen Hawking", profession: "Physicist", birthYear: 1942, emoji: "🌌" },
    { name: "David Bowie", profession: "Musician", birthYear: 1947, emoji: "👨‍🎤" },
  ],
  "01-15": [
    { name: "Martin Luther King Jr.", profession: "Civil Rights Leader", birthYear: 1929, emoji: "✊" },
  ],
  "01-17": [
    { name: "Benjamin Franklin", profession: "Founding Father", birthYear: 1706, emoji: "⚡" },
    { name: "Muhammad Ali", profession: "Boxer", birthYear: 1942, emoji: "🥊" },
    { name: "Betty White", profession: "Actress", birthYear: 1922, emoji: "📺" },
  ],
  "01-27": [
    { name: "Wolfgang Amadeus Mozart", profession: "Composer", birthYear: 1756, emoji: "🎼" },
    { name: "Lewis Carroll", profession: "Author", birthYear: 1832, emoji: "🐇" },
  ],
  "02-04": [
    { name: "Rosa Parks", profession: "Civil Rights Activist", birthYear: 1913, emoji: "🚌" },
    { name: "Charles Lindbergh", profession: "Aviator", birthYear: 1902, emoji: "✈️" },
  ],
  "02-06": [
    { name: "Bob Marley", profession: "Musician", birthYear: 1945, emoji: "🎵" },
    { name: "Babe Ruth", profession: "Baseball Player", birthYear: 1895, emoji: "⚾" },
  ],
  "02-11": [
    { name: "Thomas Edison", profession: "Inventor", birthYear: 1847, emoji: "💡" },
  ],
  "02-12": [
    { name: "Abraham Lincoln", profession: "16th US President", birthYear: 1809, emoji: "🎩" },
    { name: "Charles Darwin", profession: "Naturalist", birthYear: 1809, emoji: "🦎" },
  ],
  "02-14": [
    { name: "Alexander Graham Bell", profession: "Inventor", birthYear: 1847, emoji: "📞" },
    { name: "Frederick Douglass", profession: "Abolitionist", birthYear: 1818, emoji: "📜" },
  ],
  "02-15": [
    { name: "Galileo Galilei", profession: "Astronomer", birthYear: 1564, emoji: "🔭" },
  ],
  "02-22": [
    { name: "George Washington", profession: "1st US President", birthYear: 1732, emoji: "🇺🇸" },
  ],
  "02-24": [
    { name: "Steve Jobs", profession: "Entrepreneur", birthYear: 1955, emoji: "💻" },
  ],
  "03-03": [
    { name: "Alexander Graham Bell", profession: "Inventor", birthYear: 1847, emoji: "☎️" },
  ],
  "03-14": [
    { name: "Albert Einstein", profession: "Physicist", birthYear: 1879, emoji: "🧠" },
    { name: "Stephen Curry", profession: "Basketball Player", birthYear: 1988, emoji: "🏀" },
  ],
  "03-15": [
    { name: "Ruth Bader Ginsburg", profession: "Supreme Court Justice", birthYear: 1933, emoji: "⚖️" },
  ],
  "03-24": [
    { name: "Harry Houdini", profession: "Illusionist", birthYear: 1874, emoji: "🪄" },
  ],
  "03-26": [
    { name: "Robert Frost", profession: "Poet", birthYear: 1874, emoji: "🍂" },
  ],
  "03-31": [
    { name: "René Descartes", profession: "Philosopher", birthYear: 1596, emoji: "🤔" },
  ],
  "04-03": [
    { name: "Jane Goodall", profession: "Primatologist", birthYear: 1934, emoji: "🦍" },
  ],
  "04-15": [
    { name: "Leonardo da Vinci", profession: "Artist & Inventor", birthYear: 1452, emoji: "🎨" },
  ],
  "04-16": [
    { name: "Charlie Chaplin", profession: "Actor", birthYear: 1889, emoji: "🎬" },
    { name: "Pope Benedict XVI", profession: "Former Pope", birthYear: 1927, emoji: "⛪" },
  ],
  "04-22": [
    { name: "Earth Day", profession: "Environmental Movement", birthYear: 1970, emoji: "🌍" },
    { name: "J. Robert Oppenheimer", profession: "Physicist", birthYear: 1904, emoji: "⚛️" },
  ],
  "04-23": [
    { name: "William Shakespeare", profession: "Playwright", birthYear: 1564, emoji: "🎭" },
    { name: "Shirley Temple", profession: "Actress", birthYear: 1928, emoji: "⭐" },
  ],
  "05-04": [
    { name: "Audrey Hepburn", profession: "Actress", birthYear: 1929, emoji: "👗" },
  ],
  "05-05": [
    { name: "Karl Marx", profession: "Philosopher", birthYear: 1818, emoji: "📖" },
  ],
  "05-12": [
    { name: "Florence Nightingale", profession: "Nurse", birthYear: 1820, emoji: "🏥" },
  ],
  "05-19": [
    { name: "Malcolm X", profession: "Civil Rights Activist", birthYear: 1925, emoji: "✊" },
  ],
  "05-21": [
    { name: "Plato", profession: "Philosopher", birthYear: -428, emoji: "🏛️" },
  ],
  "06-01": [
    { name: "Marilyn Monroe", profession: "Actress", birthYear: 1926, emoji: "👱‍♀️" },
  ],
  "06-06": [
    { name: "Alexander Pushkin", profession: "Poet", birthYear: 1799, emoji: "✍️" },
  ],
  "06-14": [
    { name: "Che Guevara", profession: "Revolutionary", birthYear: 1928, emoji: "⭐" },
  ],
  "06-23": [
    { name: "Alan Turing", profession: "Computer Scientist", birthYear: 1912, emoji: "💻" },
  ],
  "06-25": [
    { name: "George Orwell", profession: "Author", birthYear: 1903, emoji: "📕" },
  ],
  "06-27": [
    { name: "Helen Keller", profession: "Author & Activist", birthYear: 1880, emoji: "👁️" },
  ],
  "06-28": [
    { name: "Elon Musk", profession: "Entrepreneur", birthYear: 1971, emoji: "🚀" },
  ],
  "07-01": [
    { name: "Princess Diana", profession: "Princess of Wales", birthYear: 1961, emoji: "👑" },
  ],
  "07-03": [
    { name: "Franz Kafka", profession: "Author", birthYear: 1883, emoji: "🪲" },
    { name: "Tom Cruise", profession: "Actor", birthYear: 1962, emoji: "🎬" },
  ],
  "07-04": [
    { name: "Independence Day (USA)", profession: "National Holiday", birthYear: 1776, emoji: "🎆" },
  ],
  "07-06": [
    { name: "Frida Kahlo", profession: "Artist", birthYear: 1907, emoji: "🎨" },
    { name: "Dalai Lama", profession: "Spiritual Leader", birthYear: 1935, emoji: "🕊️" },
  ],
  "07-10": [
    { name: "Nikola Tesla", profession: "Inventor", birthYear: 1856, emoji: "⚡" },
  ],
  "07-18": [
    { name: "Nelson Mandela", profession: "President & Activist", birthYear: 1918, emoji: "✊" },
  ],
  "07-21": [
    { name: "Ernest Hemingway", profession: "Author", birthYear: 1899, emoji: "📝" },
  ],
  "07-24": [
    { name: "Amelia Earhart", profession: "Aviator", birthYear: 1897, emoji: "🛩️" },
  ],
  "08-04": [
    { name: "Barack Obama", profession: "44th US President", birthYear: 1961, emoji: "🇺🇸" },
  ],
  "08-05": [
    { name: "Neil Armstrong", profession: "Astronaut", birthYear: 1930, emoji: "👨‍🚀" },
  ],
  "08-06": [
    { name: "Alexander Fleming", profession: "Biologist", birthYear: 1881, emoji: "🔬" },
  ],
  "08-15": [
    { name: "Napoleon Bonaparte", profession: "French Emperor", birthYear: 1769, emoji: "👑" },
  ],
  "08-29": [
    { name: "Michael Jackson", profession: "Musician", birthYear: 1958, emoji: "🎤" },
  ],
  "09-05": [
    { name: "Mother Teresa", profession: "Humanitarian", birthYear: 1910, emoji: "🙏" },
    { name: "Freddie Mercury", profession: "Musician", birthYear: 1946, emoji: "👨‍🎤" },
  ],
  "09-09": [
    { name: "Leo Tolstoy", profession: "Author", birthYear: 1828, emoji: "📚" },
    { name: "Colonel Sanders", profession: "Entrepreneur", birthYear: 1890, emoji: "🍗" },
  ],
  "09-15": [
    { name: "Agatha Christie", profession: "Author", birthYear: 1890, emoji: "🔍" },
  ],
  "09-21": [
    { name: "H.G. Wells", profession: "Author", birthYear: 1866, emoji: "🛸" },
    { name: "Stephen King", profession: "Author", birthYear: 1947, emoji: "📖" },
  ],
  "09-23": [
    { name: "Sigmund Freud", profession: "Psychoanalyst", birthYear: 1856, emoji: "🧠" },
  ],
  "09-26": [
    { name: "Serena Williams", profession: "Tennis Player", birthYear: 1981, emoji: "🎾" },
  ],
  "10-02": [
    { name: "Mahatma Gandhi", profession: "Independence Leader", birthYear: 1869, emoji: "🕊️" },
  ],
  "10-09": [
    { name: "John Lennon", profession: "Musician", birthYear: 1940, emoji: "�" },
  ],
  "10-16": [
    { name: "Oscar Wilde", profession: "Author", birthYear: 1854, emoji: "🎭" },
  ],
  "10-25": [
    { name: "Pablo Picasso", profession: "Artist", birthYear: 1881, emoji: "🎨" },
  ],
  "10-27": [
    { name: "Theodore Roosevelt", profession: "26th US President", birthYear: 1858, emoji: "🦬" },
    { name: "Sylvia Plath", profession: "Poet", birthYear: 1932, emoji: "🖋️" },
  ],
  "10-28": [
    { name: "Bill Gates", profession: "Entrepreneur", birthYear: 1955, emoji: "💻" },
  ],
  "11-07": [
    { name: "Marie Curie", profession: "Physicist", birthYear: 1867, emoji: "☢️" },
  ],
  "11-09": [
    { name: "Carl Sagan", profession: "Astronomer", birthYear: 1934, emoji: "🌟" },
  ],
  "11-11": [
    { name: "Fyodor Dostoevsky", profession: "Author", birthYear: 1821, emoji: "📖" },
    { name: "Leonardo DiCaprio", profession: "Actor", birthYear: 1974, emoji: "🎬" },
  ],
  "11-14": [
    { name: "Claude Monet", profession: "Artist", birthYear: 1840, emoji: "🌸" },
    { name: "King Charles III", profession: "Monarch", birthYear: 1948, emoji: "👑" },
  ],
  "11-30": [
    { name: "Mark Twain", profession: "Author", birthYear: 1835, emoji: "✒️" },
    { name: "Winston Churchill", profession: "Prime Minister", birthYear: 1874, emoji: "🎩" },
  ],
  "12-05": [
    { name: "Walt Disney", profession: "Animator", birthYear: 1901, emoji: "🏰" },
  ],
  "12-10": [
    { name: "Ada Lovelace", profession: "Mathematician", birthYear: 1815, emoji: "💻" },
    { name: "Emily Dickinson", profession: "Poet", birthYear: 1830, emoji: "📜" },
  ],
  "12-16": [
    { name: "Jane Austen", profession: "Author", birthYear: 1775, emoji: "📚" },
    { name: "Ludwig van Beethoven", profession: "Composer", birthYear: 1770, emoji: "🎹" },
  ],
  "12-21": [
    { name: "Jane Fonda", profession: "Actress", birthYear: 1937, emoji: "🎬" },
  ],
  "12-25": [
    { name: "Isaac Newton", profession: "Physicist", birthYear: 1642, emoji: "🍎" },
    { name: "Christmas Day", profession: "Holiday", birthYear: 1, emoji: "🎄" },
    { name: "Justin Trudeau", profession: "Prime Minister", birthYear: 1971, emoji: "🇨🇦" },
  ],
  "12-28": [
    { name: "Stan Lee", profession: "Comic Book Writer", birthYear: 1922, emoji: "🦸‍♂️" },
  ],
  "12-31": [
    { name: "Henri Matisse", profession: "Artist", birthYear: 1869, emoji: "🎨" },
    { name: "Anthony Hopkins", profession: "Actor", birthYear: 1937, emoji: "🎭" },
  ],
};

export function getFamousBirthdays(month: number, day: number): FamousPerson[] {
  const key: MonthDay = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return famousBirthdays[key] || [];
}
