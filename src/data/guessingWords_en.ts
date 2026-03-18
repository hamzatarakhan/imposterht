/**
 * English words for the Guessing game
 * Same categories: things, sport players, countries, food, animals
 */

import { GuessingCategory } from './guessingWords';

export const guessingWordsEn: Record<Exclude<GuessingCategory, "random">, string[]> = {
  things: [
    // Home items
    'Television', 'Remote Control', 'Refrigerator', 'Washing Machine', 'Air Conditioner',
    'Fan', 'Vacuum Cleaner', 'Pot', 'Spoon', 'Fork',
    'Knife', 'Plate', 'Glass', 'Cup', 'Kettle',
    'Electric Kettle', 'Oven', 'Couch', 'Chair', 'Table',
    'Bed', 'Pillow', 'Blanket', 'Carpet', 'Curtain',
    'Door', 'Window', 'Mirror', 'Clock', 'Lamp',
    'Candle',
    // Electronics
    'Phone', 'Charger', 'Headphones', 'Laptop', 'Computer',
    'PlayStation', 'iPad', 'Camera', 'Speaker',
    // Clothing
    'Shirt', 'Pants', 'Jacket', 'Dress', 'Boots',
    'Glasses', 'Bag', 'Wallet', 'Ring', 'Hat',
    // Daily items
    'Key', 'Pen', 'Book', 'Scissors', 'Umbrella',
    'Car', 'Bicycle', 'Ball', 'Balloon', 'Chess',
    // Extra items
    'Lock', 'Soap', 'Brush', 'Towel', 'Shampoo',
    'Perfume', 'Cream', 'Rope', 'Hammer', 'Nail',
    'Screw', 'Screwdriver', 'Saw', 'Lighter', 'Fire Extinguisher',
    'Paint', 'Paint Brush', 'Ladder', 'Bag', 'Box',
    'Can', 'Barrel', 'Bucket', 'Scale', 'Ruler',
    'Calculator', 'Notebook', 'Eraser', 'Sharpener', 'Board',
    'Chalk', 'Backpack', 'Envelope', 'Stamp', 'Screen',
    'Mouse', 'Keyboard', 'Flash Drive', 'Printer', 'Microphone',
    'Cable', 'Router',
    'Sandals', 'Slippers', 'Socks', 'Belt', 'Tie',
    'Cushion', 'Mattress', 'Wardrobe', 'Drawer', 'Shelf',
    'Faucet', 'Shower', 'Sink', 'Toilet', 'Bathtub',
    'Satellite Dish', 'Antenna', 'Doorbell', 'Cage', 'Fish Tank',
    'Grill', 'Pressure Cooker', 'Blender', 'Toaster', 'Frying Pan',
    'Tray', 'Thermos', 'Bottle', 'Straw', 'Lid',
    'Iron', 'Laundry Basket', 'Clothes Hanger',
    'Truck', 'Bus', 'Taxi', 'Boat', 'Airplane',
    'Train', 'Metro', 'Cable Car', 'Scooter',
    'Tent', 'Flashlight', 'Compass', 'Map', 'Backpack',
    'Telescope', 'Thermometer',
  ],

  sportPlayers: [
    'Cristiano Ronaldo', 'Messi', 'Neymar', 'Mbappe', 'Haaland',
    'Benzema', 'Mohamed Salah', 'Zidane', 'Ronaldinho', 'Maradona',
    'Pele', 'Beckham', 'Ronaldo Nazario', 'Thierry Henry', 'Iniesta',
    'Xavi', 'Neuer', 'Ramos', 'Roberto Carlos', 'Buffon',
    'Luka Modric', 'Suarez', "Eto'o", 'Drogba', 'Rooney',
    'Gerrard', 'Lampard', 'Pirlo', 'Kaka', 'Rivaldo',
    'Figo', 'Del Piero',
  ],

  countries: [
    'Jordan', 'Palestine', 'Egypt', 'Saudi Arabia', 'UAE',
    'Kuwait', 'Qatar', 'Bahrain', 'Oman', 'Yemen',
    'Iraq', 'Syria', 'Lebanon', 'Libya', 'Tunisia',
    'Algeria', 'Morocco', 'Sudan', 'Mauritania', 'Somalia',
    'Djibouti', 'Comoros', 'Turkey', 'Iran', 'Afghanistan',
    'Pakistan', 'India', 'Bangladesh', 'Sri Lanka', 'Nepal',
    'China', 'Japan', 'South Korea', 'North Korea', 'Taiwan',
    'Mongolia', 'Thailand', 'Malaysia', 'Indonesia', 'Singapore',
    'Philippines', 'Vietnam', 'Brunei', 'Russia', 'Ukraine',
    'Belarus', 'Poland', 'Germany', 'France', 'Italy',
    'Spain', 'Portugal', 'United Kingdom', 'Ireland', 'Netherlands',
    'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway',
    'Denmark', 'Finland', 'Iceland', 'Greece', 'Bulgaria',
    'Romania', 'Hungary', 'Czech Republic', 'Slovakia', 'Slovenia',
    'Croatia', 'Serbia', 'Bosnia and Herzegovina', 'Albania', 'Lithuania',
    'Estonia', 'Georgia', 'Armenia', 'United States', 'Canada',
    'Mexico', 'Cuba', 'Costa Rica', 'Panama', 'Brazil',
    'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela',
    'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay', 'South Africa',
    'Nigeria', 'Ghana', 'Senegal', 'Cameroon', 'Ethiopia',
    'Kenya', 'Tanzania', 'Uganda', 'Congo', 'Australia',
    'New Zealand',
  ],

  food: [
    // Famous Middle Eastern food
    'Mansaf', 'Maqluba', 'Musakhan', 'Stuffed Grape Leaves',
    'Stuffed Vegetables', 'Molokhia', 'Shawarma', 'Falafel', 'Hummus', 'Foul',
    'Manakeesh', 'Kibbeh', 'Samosa', 'Fatayer', 'Kabsa',
    'Biryani', 'Koshari',
    // Grilled
    'Kebab', 'Kofta', 'Shish Tawook', 'Grilled Chicken',
    // Daily food
    'Rice', 'Bread', 'Eggs', 'French Fries', 'Salad',
    'Lentil Soup', 'Pasta', 'Spaghetti', 'Pizza', 'Burger',
    'Sandwich',
    // Desserts
    'Kunafa', 'Baklava', 'Basbousa', 'Cake', 'Ice Cream',
    'Chocolate', 'Donut', 'Pancake', 'Crepe', 'Waffle',
    // Drinks
    'Tea', 'Coffee', 'Orange Juice', 'Milk', 'Latte',
    'Cappuccino',
    // Fruits & vegetables
    'Apple', 'Banana', 'Orange', 'Watermelon', 'Strawberry',
    'Mango', 'Grapes', 'Tomato', 'Cucumber', 'Onion',
    'Carrot', 'Lemon',
  ],

  animals: [
    // Pets
    'Cat', 'Dog', 'Rabbit', 'Turtle', 'Parrot',
    'Bird', 'Fish', 'Hamster',
    // Farm
    'Cow', 'Sheep', 'Goat', 'Horse', 'Donkey',
    'Camel', 'Chicken', 'Rooster', 'Duck',
    // Wild
    'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Monkey',
    'Bear', 'Wolf', 'Fox', 'Gorilla', 'Panda',
    'Kangaroo', 'Cheetah', 'Deer', 'Rhinoceros', 'Hippopotamus',
    // Birds
    'Eagle', 'Falcon', 'Owl', 'Pigeon', 'Peacock',
    'Ostrich', 'Flamingo',
    // Marine
    'Shark', 'Dolphin', 'Whale', 'Octopus', 'Penguin',
    // Insects
    'Butterfly', 'Bee', 'Ant', 'Spider', 'Snake',
  ],
};

export const GUESSING_CATEGORIES_EN: { id: GuessingCategory; label: string; icon: string }[] = [
  { id: "random", label: "All", icon: "🎲" },
  { id: "things", label: "Things", icon: "📦" },
  { id: "sportPlayers", label: "Sports", icon: "⚽" },
  { id: "countries", label: "Countries", icon: "🌍" },
  { id: "food", label: "Food", icon: "🍕" },
  { id: "animals", label: "Animals", icon: "🐾" },
];
