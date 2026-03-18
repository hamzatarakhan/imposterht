/**
 * English words for the Imposter game
 * Same categories as Arabic: things, places, food, jobs, animals, sports, celebrities, movies
 */

import { Category } from './words';

export const wordsEn: Record<Exclude<Category, 'random' | 'custom'>, string[]> = {
  things: [
    // Home items
    'Television', 'Remote Control', 'Refrigerator', 'Washing Machine', 'Air Conditioner', 'Fan', 'Heater', 'Vacuum Cleaner', 'Bucket',
    'Pot', 'Pan', 'Tray', 'Spoon', 'Fork', 'Knife', 'Plate', 'Glass', 'Cup',
    'Kettle', 'Thermos', 'Ladle', 'Strainer', 'Rolling Pin', 'Oven', 'Microwave',
    'Couch', 'Chair', 'Table', 'Bed', 'Mattress', 'Pillow', 'Blanket', 'Carpet', 'Curtain',
    'Door', 'Window', 'Mirror', 'Wall Clock', 'Lamp', 'Candle', 'Lighter',
    // Bathroom
    'Soap', 'Shampoo', 'Towel', 'Toothbrush', 'Toothpaste', 'Comb', 'Hair Dryer', 'Iron',
    // Electronics
    'Phone', 'Charger', 'Headphones', 'Laptop', 'Computer', 'Mouse', 'Keyboard', 'Router', 'PlayStation',
    'iPad', 'Tablet', 'Flash Drive', 'Power Bank', 'Smart Watch', 'Xbox', 'Nintendo', 'Camera',
    'Projector', 'Speaker', 'Microphone', 'Drone', 'Screen', 'Printer', 'Scanner',
    // Clothing
    'Shirt', 'Pants', 'T-Shirt', 'Jacket', 'Coat', 'Dress', 'Skirt', 'Blouse', 'Pajamas',
    'Boots', 'Sandals', 'Flip Flops', 'High Heels', 'Socks', 'Belt', 'Watch', 'Glasses', 'Sunglasses',
    'Bag', 'Wallet', 'Ring', 'Necklace', 'Earrings', 'Tie', 'Scarf', 'Hat', 'Beanie', 'Jeans',
    'Shorts', 'Sweater', 'Hoodie',
    // Daily items
    'Key', 'Lock', 'Notebook', 'Pen', 'Book', 'Newspaper', 'Envelope', 'Scissors', 'Tape', 'Stapler',
    'Umbrella', 'Bag', 'Box', 'Bottle', 'Eraser', 'Ruler', 'Calculator', 'Pin', 'Needle', 'Thread',
    'Flashlight', 'Battery',
    // Car & street
    'Car', 'Bicycle', 'Motorcycle', 'Tire', 'Car Key', 'Brake', 'Steering Wheel',
    // Games & entertainment
    'Ball', 'Chess', 'Dice', 'Playing Cards', 'Balloon', 'Doll', 'Uno', 'Monopoly',
    'Puzzle', 'Lego', 'Paper Airplane', 'Yo-Yo',
    // Tools
    'Hammer', 'Screwdriver', 'Pliers', 'Saw', 'Nail', 'Screw', 'Drill', 'Ladder',
    'Tape Measure', 'Scale', 'Paint Brush', 'Glue',
    // Office
    'Desk', 'Office Chair', 'File Cabinet', 'Folder', 'Printer Paper', 'Ink', 'Stamp',
    'Whiteboard', 'Marker', 'Paper Clip',
    // Travel
    'Suitcase', 'Passport', 'Plane Ticket', 'Map', 'Tent', 'Sleeping Bag',
    'Cooler', 'Sunscreen', 'Swimming Goggles',
    // Medical
    'Pills', 'Medicine', 'Bandage', 'Gauze', 'Thermometer', 'Face Mask',
    'Hand Sanitizer', 'Cotton', 'Stethoscope', 'Wheelchair', 'Crutches',
  ],

  places: [
    // Common places
    'School', 'University', 'Hospital', 'Pharmacy', 'Clinic', 'Bank', 'ATM',
    'Supermarket', 'Grocery Store', 'Bakery', 'Butcher Shop',
    'Restaurant', 'Cafe', 'Coffee Shop',
    'Mosque', 'Church', 'Park', 'Stadium', 'Gym', 'Swimming Pool',
    'Gas Station', 'Car Wash', 'Garage', 'Barber Shop', 'Salon',
    'Bus Stop', 'Train Station', 'Airport', 'Post Office', 'Police Station', 'Court', 'City Hall',
    'Library', 'Cinema', 'Theater', 'Museum', 'Zoo', 'Amusement Park', 'Bowling Alley',
    // Countries
    'Egypt', 'Lebanon', 'Syria', 'Palestine', 'Saudi Arabia', 'UAE', 'Kuwait', 'Qatar', 'Iraq',
    'Bahrain', 'Oman', 'Yemen', 'Libya', 'Tunisia', 'Algeria', 'Morocco', 'Sudan',
    'USA', 'UK', 'France', 'Germany', 'Italy', 'Spain', 'Turkey', 'India', 'China',
    'Japan', 'South Korea', 'Russia', 'Brazil', 'Canada', 'Australia', 'Malaysia', 'Indonesia',
    // Famous cities
    'New York', 'London', 'Paris', 'Rome', 'Berlin', 'Madrid', 'Barcelona', 'Amsterdam',
    'Tokyo', 'Beijing', 'Shanghai', 'Moscow', 'Sydney', 'Los Angeles', 'Miami', 'Las Vegas',
    'Istanbul', 'Dubai', 'Singapore', 'Hong Kong', 'Bangkok', 'Bali',
    'Cairo', 'Beirut', 'Mecca', 'Riyadh', 'Jeddah',
    // World landmarks
    'Eiffel Tower', 'Statue of Liberty', 'Colosseum', 'Leaning Tower of Pisa', 'Great Wall of China', 'Taj Mahal',
    'Big Ben', 'White House', 'Disneyland', 'Hollywood', 'Pyramids', 'Burj Khalifa',
    // Home areas
    'Kitchen', 'Living Room', 'Bedroom', 'Bathroom', 'Balcony', 'Roof', 'Stairs', 'Elevator', 'Garage', 'Storage',
    'Basement', 'Garden', 'Entrance', 'Hallway', 'Dining Room', 'Home Office',
  ],

  food: [
    // Middle Eastern food
    'Mansaf', 'Maqluba', 'Musakhan', 'Stuffed Grape Leaves', 'Stuffed Zucchini', 'Molokhia',
    'Shawarma', 'Falafel', 'Hummus', 'Foul', 'Labneh', 'Manakeesh',
    'Kibbeh', 'Samosa', 'Fatayer', 'Baba Ghanoush',
    // Grilled
    'Shish Tawook', 'Kebab', 'Kofta', 'BBQ', 'Grilled Chicken', 'Lamb Chops',
    // Daily food
    'Rice', 'Bread', 'Eggs', 'Fried Eggs', 'Omelette', 'Shakshuka', 'Cheese', 'Olives', 'Pickles', 'Salad',
    'Fattoush', 'Tabbouleh', 'Lentil Soup', 'Soup', 'Potato', 'French Fries', 'Pasta', 'Spaghetti',
    'Lasagna',
    // Fast food
    'Pizza', 'Burger', 'Fries', 'Sandwich', 'Hot Dog', 'Nuggets',
    'Taco', 'Burrito', 'Sushi', 'Ramen', 'Noodles', 'Fried Chicken', 'Wrap',
    // Desserts
    'Kunafa', 'Baklava', 'Basbousa', 'Cake', 'Ice Cream',
    'Cookies', 'Cupcake', 'Brownies', 'Cheesecake', 'Crepe', 'Waffle',
    'Donut', 'Croissant', 'Muffin', 'Tiramisu', 'Pancake', 'Chocolate',
    'Rice Pudding',
    // Drinks
    'Tea', 'Coffee', 'Arabic Coffee', 'Instant Coffee', 'Juice', 'Orange Juice', 'Lemonade',
    'Milk', 'Water', 'Cola', 'Pepsi', 'Sprite', 'Fanta',
    'Latte', 'Cappuccino', 'Espresso', 'Mocha', 'Frappuccino', 'Smoothie', 'Milkshake',
    'Green Tea', 'Mint Tea',
    // Fruits & vegetables
    'Apple', 'Banana', 'Orange', 'Grapes', 'Watermelon', 'Cantaloupe', 'Strawberry', 'Mango', 'Dates',
    'Tomato', 'Cucumber', 'Onion', 'Garlic', 'Carrot', 'Lettuce', 'Potato', 'Eggplant', 'Pepper',
    'Kiwi', 'Pineapple', 'Cherry', 'Peach', 'Pomegranate', 'Fig', 'Avocado', 'Lemon',
    // Snacks
    'Chips', 'Popcorn', 'Pistachio', 'Almonds', 'Seeds', 'Walnuts', 'Cashew', 'Peanuts',
    // World cuisines
    'Biryani', 'Tagine', 'Couscous',
    // Seafood
    'Fish', 'Grilled Fish', 'Fried Fish', 'Shrimp', 'Calamari', 'Salmon', 'Tuna',
    // Meat
    'Chicken', 'Lamb', 'Beef', 'Steak',
  ],

  jobs: [
    // Medical
    'Doctor', 'Nurse', 'Pharmacist', 'Dentist', 'Surgeon',
    'Eye Doctor', 'Pediatrician', 'Cardiologist', 'Orthopedic', 'Dermatologist', 'Psychiatrist',
    'Nutritionist', 'Physical Therapist', 'Lab Technician', 'Paramedic',
    // Education
    'Teacher', 'Professor', 'School Principal', 'Tutor',
    'PE Teacher', 'Music Teacher', 'Art Teacher', 'Counselor',
    // Security & government
    'Police Officer', 'Soldier', 'Officer', 'Firefighter', 'Judge', 'Lawyer', 'Minister', 'Ambassador',
    'President', 'King', 'Prince', 'Security Guard', 'Detective',
    // Daily jobs
    'Driver', 'Taxi Driver', 'Bus Driver', 'Delivery Driver',
    'Salesperson', 'Cashier', 'Employee', 'Secretary', 'Accountant', 'Manager', 'Sales Rep',
    'Bank Teller', 'Receptionist', 'Customer Service', 'HR Manager',
    // Craftsmen
    'Mechanic', 'Electrician', 'Plumber', 'Carpenter', 'Blacksmith', 'Painter', 'Tiler', 'Builder',
    'Welder', 'Tailor',
    // Food service
    'Cook', 'Chef', 'Waiter', 'Baker', 'Pastry Chef', 'Barista',
    // Beauty
    'Barber', 'Hairdresser', 'Makeup Artist', 'Nail Technician', 'Massage Therapist',
    // Modern jobs
    'Programmer', 'Designer', 'Photographer', 'YouTuber', 'Engineer', 'Web Developer', 'App Developer',
    'Graphic Designer', 'UI Designer', 'Social Media Manager', 'Digital Marketer', 'Blogger', 'Influencer',
    'Data Analyst', 'Software Engineer', 'Project Manager',
    'Game Designer', 'Streamer', 'TikToker', 'Podcaster',
    // Media & art
    'News Anchor', 'Journalist', 'Actor', 'Singer', 'Football Player', 'Director', 'Producer', 'Screenwriter',
    'Musician', 'Composer', 'Radio Host', 'Reporter', 'Video Editor',
    'Sound Engineer', 'Stand-up Comedian', 'Dancer',
    // General
    'Pilot', 'Flight Attendant', 'Guard', 'Janitor',
    'Farmer', 'Fisherman', 'Veterinarian',
    // Engineering
    'Civil Engineer', 'Architect', 'Electrical Engineer', 'Mechanical Engineer', 'Chemical Engineer',
    // Business
    'CEO', 'CFO', 'Financial Analyst', 'Auditor', 'Tax Expert',
    'Consultant', 'Coach', 'Translator',
    // Sports
    'Football Coach', 'Fitness Trainer', 'Referee', 'Pro Player', 'Sports Commentator',
  ],

  animals: [
    // Pets
    'Cat', 'Dog', 'Rabbit', 'Turtle', 'Parrot', 'Bird', 'Fish', 'Hamster', 'Horse',
    // Farm
    'Cow', 'Sheep', 'Goat', 'Donkey', 'Camel', 'Chicken', 'Rooster', 'Duck', 'Turkey', 'Goose', 'Calf', 'Bull',
    // Wild large
    'Lion', 'Tiger', 'Cheetah', 'Wolf', 'Fox', 'Hyena', 'Bear', 'Monkey', 'Gorilla',
    'Elephant', 'Giraffe', 'Deer', 'Kangaroo', 'Panda', 'Rhinoceros', 'Hippopotamus',
    'Raccoon', 'Koala', 'Llama',
    // Birds
    'Eagle', 'Falcon', 'Owl', 'Pigeon', 'Peacock', 'Ostrich', 'Crow', 'Seagull', 'Swan', 'Penguin', 'Flamingo',
    // Marine
    'Whale', 'Dolphin', 'Shark', 'Octopus', 'Crab', 'Starfish', 'Jellyfish', 'Seal', 'Sea Lion', 'Seahorse', 'Lobster', 'Shrimp', 'Squid',
    // Reptiles
    'Snake', 'Crocodile', 'Lizard', 'Chameleon',
    // Insects
    'Butterfly', 'Bee', 'Ant', 'Spider', 'Fly', 'Mosquito', 'Grasshopper', 'Cockroach', 'Centipede', 'Worm', 'Beetle',
    // Extinct
    'Dinosaur', 'Mammoth',
  ],

  sports: [
    // Popular
    'Football', 'Basketball', 'Volleyball', 'Tennis', 'Ping Pong', 'Padel', 'Handball',
    'Rugby', 'Cricket', 'Hockey', 'Golf', 'Bowling', 'Billiards', 'Snooker',
    // Combat
    'Boxing', 'Karate', 'Taekwondo', 'Judo', 'Kung Fu', 'Wrestling', 'UFC', 'Kickboxing',
    // Water
    'Swimming', 'Diving', 'Water Skiing', 'Surfing', 'Jet Ski', 'Rowing',
    // Winter
    'Skiing', 'Ice Hockey', 'Figure Skating', 'Snowboarding',
    // Light
    'Walking', 'Running', 'Jogging', 'Cycling', 'Climbing', 'Yoga', 'Pilates', 'Zumba', 'CrossFit',
    // Olympic
    'High Jump', 'Long Jump', 'Shot Put', 'Discus Throw', 'Javelin Throw', 'Hurdles',
    'Gymnastics', 'Fencing', 'Shooting', 'Weightlifting',
    // Motor
    'Formula 1', 'Car Racing', 'Drift', 'Rally', 'NASCAR', 'MotoGP',
    // Esports
    'FIFA', 'Fortnite', 'PUBG', 'League of Legends', 'Counter Strike',
    // Famous clubs
    'Real Madrid', 'Barcelona', 'Manchester United', 'Liverpool', 'Bayern Munich',
    'Al Ahly', 'Al Hilal',
    // Championships
    'World Cup', 'Champions League', 'Premier League', 'La Liga', 'Bundesliga',
    'Olympics', 'Asian Cup',
  ],

  celebrities: [
    // Arab actors
    'Adel Imam', 'Ahmed Helmy', 'Mohamed Ramadan', 'Karim Abdel Aziz', 'Ahmed El Sakka',
    'Mona Zaki', 'Yousra', 'Nelly Karim',
    // Arab singers
    'Amr Diab', 'Mohamed Hamaki', 'Tamer Hosny', 'Angham', 'Sherine', 'Elissa', 'Nancy Ajram',
    'Haifa Wehbe', 'Wael Kfoury', 'Ragheb Alama', 'Fairuz', 'Umm Kulthum',
    'Kadim Al Sahir', 'Hussain Al Jassmi', 'Mohammed Abdo', 'Assala', 'Balqees',
    // Hollywood actors
    'Tom Cruise', 'Leonardo DiCaprio', 'Brad Pitt', 'Johnny Depp', 'Will Smith',
    'Robert Downey Jr', 'Chris Hemsworth', 'Dwayne Johnson', 'Scarlett Johansson',
    'Angelina Jolie', 'Jennifer Lawrence', 'Margot Robbie', 'Emma Watson',
    // International singers
    'Beyonce', 'Rihanna', 'Taylor Swift', 'Adele', 'Lady Gaga', 'Shakira',
    'Justin Bieber', 'Ed Sheeran', 'Drake', 'Kanye West', 'Eminem', 'Michael Jackson',
    'Selena Gomez', 'Ariana Grande', 'Dua Lipa',
    // Football players
    'Cristiano Ronaldo', 'Messi', 'Neymar', 'Mbappe', 'Haaland', 'Benzema',
    'Mohamed Salah', 'Zidane', 'Ronaldinho', 'Maradona', 'Pele', 'Beckham',
    // Other athletes
    'LeBron James', 'Michael Jordan', 'Kobe Bryant', 'Roger Federer', 'Nadal', 'Serena Williams',
    'Tiger Woods', 'Mike Tyson', 'Muhammad Ali', 'Conor McGregor', 'Khabib Nurmagomedov',
    // YouTubers
    'MrBeast', 'PewDiePie',
    // Historical
    'Saladin', 'Nelson Mandela', 'Gandhi', 'Napoleon',
    // Business
    'Elon Musk', 'Bill Gates', 'Jeff Bezos', 'Mark Zuckerberg', 'Steve Jobs',
  ],

  movies: [
    // Disney
    'The Lion King', 'Aladdin', 'Frozen', 'Moana', 'Ratatouille', 'Coco',
    'Beauty and the Beast', 'Cinderella', 'Finding Nemo', 'Monsters Inc',
    'Toy Story', 'Cars', 'The Incredibles', 'Up', 'Inside Out', 'Zootopia',
    // Action
    'Avatar', 'The Avengers', 'Batman', 'Spider-Man', 'Superman', 'Iron Man',
    'Fast and Furious', 'Mission Impossible', 'John Wick', 'The Matrix',
    'James Bond', 'Transformers', 'Jurassic Park',
    // Sci-fi
    'Star Wars', 'Interstellar', 'Inception', 'The Martian', 'Gravity', 'Alien',
    'Terminator', 'Back to the Future', 'E.T.',
    // Horror
    'The Conjuring', 'It', 'The Ring', 'Saw', 'Annabelle', 'The Exorcist',
    // Comedy
    'The Hangover', 'Home Alone', 'Mr. Bean', 'The Mask', 'Ice Age', 'Shrek',
    // Drama
    'Titanic', 'Forrest Gump', 'The Godfather', 'The Shawshank Redemption', 'The Green Mile',
    'Fight Club', 'The Wolf of Wall Street',
    // Animation / Anime
    'SpongeBob', 'Tom and Jerry', 'Naruto', 'Dragon Ball', 'One Piece',
    // TV Shows
    'Friends', 'Breaking Bad', 'Game of Thrones', 'The Office', 'Stranger Things',
    'Peaky Blinders', 'Money Heist', 'Squid Game', 'The Witcher', 'The Mandalorian',
  ],
};

export const categoryNamesEn: Record<Exclude<Category, 'custom'>, string> = {
  random: 'Random 🎲',
  things: 'Things 📦',
  places: 'Places 🏠',
  food: 'Food 🍕',
  jobs: 'Jobs 💼',
  animals: 'Animals 🐾',
  sports: 'Sports ⚽',
  celebrities: 'Celebrities ⭐',
  movies: 'Movies 🎬',
};

export const CATEGORIES_EN: { id: Category; label: string; icon: string }[] = [
  { id: 'random', label: 'Random', icon: '🎲' },
  { id: 'things', label: 'Things', icon: '📦' },
  { id: 'places', label: 'Places', icon: '🏠' },
  { id: 'food', label: 'Food', icon: '🍕' },
  { id: 'jobs', label: 'Jobs', icon: '💼' },
  { id: 'animals', label: 'Animals', icon: '🐾' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'celebrities', label: 'Celebrities', icon: '⭐' },
  { id: 'movies', label: 'Movies', icon: '🎬' },
];
