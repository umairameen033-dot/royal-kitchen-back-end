'use strict';
/* Daily backup of the database and payment screenshots. Keeps the last KEEP_DAYS days (default 14). */
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process'), { DatabaseSync } = require('node:sqlite');
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data'), OUT = process.env.BACKUP_DIR || path.join(DATA, 'backups'), KEEP = +process.env.KEEP_DAYS || 14;
fs.mkdirSync(OUT, { recursive: true });
const d = new Date().toISOString().slice(0, 10), dbf = path.join(OUT, `rk-${d}.db`);
if (fs.existsSync(dbf)) fs.unlinkSync(dbf);
const db = new DatabaseSync(path.join(DATA, 'rk.db'));
db.exec(`VACUUM INTO '${dbf.replace(/'/g, "''")}'`);   // consistent copy even while the server is running
db.close();
if (fs.existsSync(path.join(DATA, 'uploads'))) cp.execFileSync('tar', ['-czf', path.join(OUT, `uploads-${d}.tar.gz`), '-C', DATA, 'uploads']);
for (const f of fs.readdirSync(OUT)) { const p = path.join(OUT, f); if (/^(rk-|uploads-)/.test(f) && Date.now() - fs.statSync(p).mtimeMs > KEEP * 864e5) fs.unlinkSync(p); }
console.log('Backup done', d, '->', OUT);

[
 {
  "name": "Chicken Drum Stick 4 PCS",
  "group": "Pakistani",
  "sub": "Starters",
  "desc": "",
  "opts": [
   [
    "Regular",
    1050
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 0
 },
 {
  "name": "Honey Garlic Wings 10 PCS",
  "group": "Pakistani",
  "sub": "Starters",
  "desc": "",
  "opts": [
   [
    "Regular",
    850
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 1
 },
 {
  "name": "Dhaka Chicken 300g",
  "group": "Pakistani",
  "sub": "Starters",
  "desc": "",
  "opts": [
   [
    "Regular",
    780
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 2
 },
 {
  "name": "Dabo Chicken 300g",
  "group": "Pakistani",
  "sub": "Starters",
  "desc": "",
  "opts": [
   [
    "Regular",
    780
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 3
 },
 {
  "name": "Flaming Wings",
  "group": "Pakistani",
  "sub": "Starters",
  "desc": "",
  "opts": [
   [
    "5 PCS",
    320
   ],
   [
    "10 PCS",
    600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 4
 },
 {
  "name": "Fried Wings",
  "group": "Pakistani",
  "sub": "Starters",
  "desc": "",
  "opts": [
   [
    "5 PCS",
    270
   ],
   [
    "10 PCS",
    490
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 5
 },
 {
  "name": "Chicken Hot Shots",
  "group": "Pakistani",
  "sub": "Starters",
  "desc": "",
  "opts": [
   [
    "10 PCS",
    270
   ],
   [
    "14 PCS",
    390
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 6
 },
 {
  "name": "Mutton Afghani Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    1850
   ],
   [
    "Full",
    3700
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 7
 },
 {
  "name": "Mutton Nawabi Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    1850
   ],
   [
    "Full",
    3700
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 8
 },
 {
  "name": "Mutton Charsi Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    1800
   ],
   [
    "Full",
    3600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 9
 },
 {
  "name": "Mutton Makhni Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    1800
   ],
   [
    "Full",
    3600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 10
 },
 {
  "name": "Mutton Black Paper Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    1800
   ],
   [
    "Full",
    3600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 11
 },
 {
  "name": "Mutton Hara Masala Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    1800
   ],
   [
    "Full",
    3600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 12
 },
 {
  "name": "Mutton White Paper Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    1800
   ],
   [
    "Full",
    3600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 13
 },
 {
  "name": "Mutton Achari Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    1800
   ],
   [
    "Full",
    3600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 14
 },
 {
  "name": "Special Beef Makhni Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    1100
   ],
   [
    "Full",
    2200
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 15
 },
 {
  "name": "Chicken Afghani Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    950
   ],
   [
    "Full",
    1700
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 16
 },
 {
  "name": "Chicken Charsi Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    850
   ],
   [
    "Full",
    1600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 17
 },
 {
  "name": "Chicken White Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    850
   ],
   [
    "Full",
    1600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 18
 },
 {
  "name": "Chicken Achari Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    850
   ],
   [
    "Full",
    1600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 19
 },
 {
  "name": "Chicken Black Paper Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    850
   ],
   [
    "Full",
    1600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 20
 },
 {
  "name": "Chicken Hara Masala Karahi",
  "group": "Pakistani",
  "sub": "Royal Karahi",
  "desc": "",
  "opts": [
   [
    "Half",
    850
   ],
   [
    "Full",
    1600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 21
 },
 {
  "name": "Chicken Hara Mirch Handi",
  "group": "Pakistani",
  "sub": "Royal Handi",
  "desc": "",
  "opts": [
   [
    "Regular",
    1500
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 22
 },
 {
  "name": "Chicken Mughali Handi",
  "group": "Pakistani",
  "sub": "Royal Handi",
  "desc": "",
  "opts": [
   [
    "Regular",
    1500
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 23
 },
 {
  "name": "Chicken Jalfrezi Handi",
  "group": "Pakistani",
  "sub": "Royal Handi",
  "desc": "",
  "opts": [
   [
    "Regular",
    1500
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 24
 },
 {
  "name": "Chicken Achari Handi",
  "group": "Pakistani",
  "sub": "Royal Handi",
  "desc": "",
  "opts": [
   [
    "Regular",
    1500
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 25
 },
 {
  "name": "Chicken Makhni Handi",
  "group": "Pakistani",
  "sub": "Royal Handi",
  "desc": "",
  "opts": [
   [
    "Regular",
    1500
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 26
 },
 {
  "name": "Chicken Ginger Handi",
  "group": "Pakistani",
  "sub": "Royal Handi",
  "desc": "",
  "opts": [
   [
    "Regular",
    1500
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 27
 },
 {
  "name": "Chicken Handi (Special)",
  "group": "Pakistani",
  "sub": "Royal Handi",
  "desc": "",
  "opts": [
   [
    "Regular",
    1500
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 28
 },
 {
  "name": "Chicken Kabab Masala Handi",
  "group": "Pakistani",
  "sub": "Royal Handi",
  "desc": "",
  "opts": [
   [
    "Regular",
    1500
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 29
 },
 {
  "name": "Angara Boti",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Half",
    490
   ],
   [
    "Full",
    980
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 30
 },
 {
  "name": "Sheesh Tawook Boti",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Half",
    490
   ],
   [
    "Full",
    980
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 31
 },
 {
  "name": "Malai Boti",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Half",
    490
   ],
   [
    "Full",
    980
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 32
 },
 {
  "name": "Tikka Boti",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Half",
    440
   ],
   [
    "Full",
    890
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 33
 },
 {
  "name": "Achari Boti",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Half",
    440
   ],
   [
    "Full",
    890
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 34
 },
 {
  "name": "Cheese Kabab",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Half",
    480
   ],
   [
    "Full",
    960
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 35
 },
 {
  "name": "Lebanese Kabab",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Half",
    480
   ],
   [
    "Full",
    960
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 36
 },
 {
  "name": "Chicken Reshmi Kabab",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Half",
    430
   ],
   [
    "Full",
    860
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 37
 },
 {
  "name": "Chicken Sheekh Kabab",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Half",
    380
   ],
   [
    "Full",
    760
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 38
 },
 {
  "name": "Chicken Gola Kabab",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Half",
    380
   ],
   [
    "Full",
    760
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 39
 },
 {
  "name": "Chicken Leg Piece",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Regular",
    400
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 40
 },
 {
  "name": "Chicken Chest Piece",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Regular",
    450
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 41
 },
 {
  "name": "Chicken Malai Piece",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Regular",
    550
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 42
 },
 {
  "name": "Mutton Chops (Per Kg)",
  "group": "BBQ",
  "sub": "Royal BBQ",
  "desc": "",
  "opts": [
   [
    "Half",
    1800
   ],
   [
    "Full",
    3600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 43
 },
 {
  "name": "Mongolian Chicken",
  "group": "Chinese & Thai",
  "sub": "Chinese & Thai",
  "desc": "",
  "opts": [
   [
    "Regular",
    850
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 44
 },
 {
  "name": "Chicken Cashew Nut",
  "group": "Chinese & Thai",
  "sub": "Chinese & Thai",
  "desc": "",
  "opts": [
   [
    "Regular",
    850
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 45
 },
 {
  "name": "Chicken Chilli Dry",
  "group": "Chinese & Thai",
  "sub": "Chinese & Thai",
  "desc": "",
  "opts": [
   [
    "Regular",
    850
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 46
 },
 {
  "name": "Kung Pao Chicken",
  "group": "Chinese & Thai",
  "sub": "Chinese & Thai",
  "desc": "",
  "opts": [
   [
    "Regular",
    850
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 47
 },
 {
  "name": "Hot Szechuan Chicken",
  "group": "Chinese & Thai",
  "sub": "Chinese & Thai",
  "desc": "",
  "opts": [
   [
    "Regular",
    850
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 48
 },
 {
  "name": "Chicken with Roasted Almond",
  "group": "Chinese & Thai",
  "sub": "Chinese & Thai",
  "desc": "",
  "opts": [
   [
    "Regular",
    850
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 49
 },
 {
  "name": "Fish Chilli Dry",
  "group": "Chinese & Thai",
  "sub": "Chinese & Thai",
  "desc": "",
  "opts": [
   [
    "Regular",
    1050
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 50
 },
 {
  "name": "Chicken Manchurian (with Rice)",
  "group": "Chinese & Thai",
  "sub": "Chinese & Thai",
  "desc": "",
  "opts": [
   [
    "Regular",
    1070
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 51
 },
 {
  "name": "Chicken Shashlik (with Rice)",
  "group": "Chinese & Thai",
  "sub": "Chinese & Thai",
  "desc": "",
  "opts": [
   [
    "Regular",
    1070
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 52
 },
 {
  "name": "Royal Special Chowmein",
  "group": "Chinese & Thai",
  "sub": "Noodles & Rice",
  "desc": "",
  "opts": [
   [
    "Regular",
    890
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 53
 },
 {
  "name": "Chicken Chowmein",
  "group": "Chinese & Thai",
  "sub": "Noodles & Rice",
  "desc": "",
  "opts": [
   [
    "Regular",
    850
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 54
 },
 {
  "name": "Vegetable Chowmein",
  "group": "Chinese & Thai",
  "sub": "Noodles & Rice",
  "desc": "",
  "opts": [
   [
    "Regular",
    750
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 55
 },
 {
  "name": "Royal Special Afghani Pulao",
  "group": "Pakistani",
  "sub": "Rice & Biryani",
  "desc": "Two prices supplied, labels to be confirmed by the restaurant",
  "opts": [
   [
    "Option 1",
    1200
   ],
   [
    "Option 2",
    1400
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 56
 },
 {
  "name": "Royal Special Rice",
  "group": "Pakistani",
  "sub": "Rice & Biryani",
  "desc": "",
  "opts": [
   [
    "Half",
    580
   ],
   [
    "Full",
    1050
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 57
 },
 {
  "name": "Chicken Fried Rice",
  "group": "Chinese & Thai",
  "sub": "Noodles & Rice",
  "desc": "",
  "opts": [
   [
    "Half",
    550
   ],
   [
    "Full",
    950
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 58
 },
 {
  "name": "Egg Fried Rice",
  "group": "Chinese & Thai",
  "sub": "Noodles & Rice",
  "desc": "",
  "opts": [
   [
    "Half",
    500
   ],
   [
    "Full",
    900
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 59
 },
 {
  "name": "Vegetable Fried Rice",
  "group": "Chinese & Thai",
  "sub": "Noodles & Rice",
  "desc": "",
  "opts": [
   [
    "Half",
    500
   ],
   [
    "Full",
    900
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 60
 },
 {
  "name": "Royal Special Biryani",
  "group": "Pakistani",
  "sub": "Rice & Biryani",
  "desc": "",
  "opts": [
   [
    "Half",
    550
   ],
   [
    "Full",
    950
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 61
 },
 {
  "name": "Finger Fish (Per Kg)",
  "group": "Pakistani",
  "sub": "Royal Sea Food",
  "desc": "Broasted, served with fries and dip sauce",
  "opts": [
   [
    "Full",
    2400
   ],
   [
    "Half",
    1200
   ],
   [
    "Quarter",
    600
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 62
 },
 {
  "name": "Rahu Grill Fish (Per Kg)",
  "group": "Pakistani",
  "sub": "Royal Sea Food",
  "desc": "Final price depends on weight",
  "opts": [
   [
    "Regular",
    1500
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 63
 },
 {
  "name": "Dhaka Fish",
  "group": "Pakistani",
  "sub": "Royal Sea Food",
  "desc": "",
  "opts": [],
  "eligible": 1,
  "topping": 0,
  "sort": 64
 },
 {
  "name": "Chicken Cheese Naan",
  "group": "Sides",
  "sub": "Royal Tandoor",
  "desc": "",
  "opts": [
   [
    "Regular",
    490
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 65
 },
 {
  "name": "Cheese Naan",
  "group": "Sides",
  "sub": "Royal Tandoor",
  "desc": "",
  "opts": [
   [
    "Regular",
    400
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 66
 },
 {
  "name": "Coconut Naan",
  "group": "Sides",
  "sub": "Royal Tandoor",
  "desc": "",
  "opts": [
   [
    "Regular",
    350
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 67
 },
 {
  "name": "Achari Naan",
  "group": "Sides",
  "sub": "Royal Tandoor",
  "desc": "",
  "opts": [
   [
    "Regular",
    150
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 68
 },
 {
  "name": "Kalwanji Naan",
  "group": "Sides",
  "sub": "Royal Tandoor",
  "desc": "",
  "opts": [
   [
    "Regular",
    110
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 69
 },
 {
  "name": "Garlic Naan",
  "group": "Sides",
  "sub": "Royal Tandoor",
  "desc": "",
  "opts": [
   [
    "Regular",
    110
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 70
 },
 {
  "name": "Ginger Naan",
  "group": "Sides",
  "sub": "Royal Tandoor",
  "desc": "",
  "opts": [
   [
    "Regular",
    110
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 71
 },
 {
  "name": "Tandoori Paratha",
  "group": "Sides",
  "sub": "Royal Tandoor",
  "desc": "",
  "opts": [
   [
    "Regular",
    110
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 72
 },
 {
  "name": "Roghni Naan",
  "group": "Sides",
  "sub": "Royal Tandoor",
  "desc": "",
  "opts": [
   [
    "Regular",
    90
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 73
 },
 {
  "name": "Roti Per Head",
  "group": "Sides",
  "sub": "Royal Tandoor",
  "desc": "",
  "opts": [
   [
    "Regular",
    80
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 74
 },
 {
  "name": "Royal Special Soup",
  "group": "Chinese & Thai",
  "sub": "Soups",
  "desc": "",
  "opts": [
   [
    "Half",
    730
   ],
   [
    "Full",
    1050
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 75
 },
 {
  "name": "Hot and Sour Soup",
  "group": "Chinese & Thai",
  "sub": "Soups",
  "desc": "",
  "opts": [
   [
    "Half",
    750
   ],
   [
    "Full",
    1050
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 76
 },
 {
  "name": "Chicken Corn Soup",
  "group": "Chinese & Thai",
  "sub": "Soups",
  "desc": "",
  "opts": [
   [
    "Half",
    680
   ],
   [
    "Full",
    990
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 77
 },
 {
  "name": "Thai Soup",
  "group": "Chinese & Thai",
  "sub": "Soups",
  "desc": "",
  "opts": [
   [
    "Half",
    600
   ],
   [
    "Full",
    900
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 78
 },
 {
  "name": "Chicken Vegetable Soup",
  "group": "Chinese & Thai",
  "sub": "Soups",
  "desc": "",
  "opts": [
   [
    "Half",
    500
   ],
   [
    "Full",
    800
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 79
 },
 {
  "name": "Royal Special Russian Salad",
  "group": "Sides",
  "sub": "Salad & Raita",
  "desc": "",
  "opts": [
   [
    "Regular",
    420
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 80
 },
 {
  "name": "Kachumar Salad",
  "group": "Sides",
  "sub": "Salad & Raita",
  "desc": "",
  "opts": [
   [
    "Regular",
    140
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 81
 },
 {
  "name": "Fresh Salad",
  "group": "Sides",
  "sub": "Salad & Raita",
  "desc": "",
  "opts": [
   [
    "Regular",
    130
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 82
 },
 {
  "name": "Zeera Raita",
  "group": "Sides",
  "sub": "Salad & Raita",
  "desc": "",
  "opts": [
   [
    "Regular",
    130
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 83
 },
 {
  "name": "Mint Raita",
  "group": "Sides",
  "sub": "Salad & Raita",
  "desc": "",
  "opts": [
   [
    "Regular",
    130
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 84
 },
 {
  "name": "Bangali Gulab Jamun",
  "group": "Desserts",
  "sub": "Desserts",
  "desc": "",
  "opts": [
   [
    "Regular",
    80
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 85
 },
 {
  "name": "Molten Lava Cake",
  "group": "Desserts",
  "sub": "Desserts",
  "desc": "",
  "opts": [
   [
    "Regular",
    550
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 86
 },
 {
  "name": "Ice Cream Scoop",
  "group": "Desserts",
  "sub": "Desserts",
  "desc": "",
  "opts": [
   [
    "Single",
    110
   ],
   [
    "Double",
    200
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 87
 },
 {
  "name": "Mango Shake",
  "group": "Drinks",
  "sub": "Royal Shakes",
  "desc": "",
  "opts": [
   [
    "Regular",
    320
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 88
 },
 {
  "name": "Vanilla Shake",
  "group": "Drinks",
  "sub": "Royal Shakes",
  "desc": "",
  "opts": [
   [
    "Regular",
    320
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 89
 },
 {
  "name": "Strawberry Shake",
  "group": "Drinks",
  "sub": "Royal Shakes",
  "desc": "",
  "opts": [
   [
    "Regular",
    320
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 90
 },
 {
  "name": "Chocolate Shake",
  "group": "Drinks",
  "sub": "Royal Shakes",
  "desc": "",
  "opts": [
   [
    "Regular",
    320
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 91
 },
 {
  "name": "Kulfa Shake",
  "group": "Drinks",
  "sub": "Royal Shakes",
  "desc": "",
  "opts": [
   [
    "Regular",
    320
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 92
 },
 {
  "name": "Nutella Shake",
  "group": "Drinks",
  "sub": "Royal Shakes",
  "desc": "",
  "opts": [
   [
    "Regular",
    320
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 93
 },
 {
  "name": "Pista Shake",
  "group": "Drinks",
  "sub": "Royal Shakes",
  "desc": "",
  "opts": [
   [
    "Regular",
    370
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 94
 },
 {
  "name": "Kit-Kat Shake",
  "group": "Drinks",
  "sub": "Royal Shakes",
  "desc": "",
  "opts": [
   [
    "Regular",
    370
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 95
 },
 {
  "name": "Mint Margarita",
  "group": "Drinks",
  "sub": "Cold Beverages & Tea",
  "desc": "",
  "opts": [
   [
    "Regular",
    220
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 96
 },
 {
  "name": "Fresh Lime",
  "group": "Drinks",
  "sub": "Cold Beverages & Tea",
  "desc": "",
  "opts": [
   [
    "Regular",
    120
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 97
 },
 {
  "name": "1.5 Ltr Drink",
  "group": "Drinks",
  "sub": "Cold Beverages & Tea",
  "desc": "",
  "opts": [
   [
    "Regular",
    230
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 98
 },
 {
  "name": "1.5 Ltr GMT",
  "group": "Drinks",
  "sub": "Cold Beverages & Tea",
  "desc": "",
  "opts": [
   [
    "Regular",
    180
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 99
 },
 {
  "name": "1 Ltr Drink",
  "group": "Drinks",
  "sub": "Cold Beverages & Tea",
  "desc": "",
  "opts": [
   [
    "Regular",
    170
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 100
 },
 {
  "name": "1 Ltr GMT",
  "group": "Drinks",
  "sub": "Cold Beverages & Tea",
  "desc": "",
  "opts": [
   [
    "Regular",
    140
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 101
 },
 {
  "name": "0.5 Ltr Drink",
  "group": "Drinks",
  "sub": "Cold Beverages & Tea",
  "desc": "",
  "opts": [
   [
    "Regular",
    130
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 102
 },
 {
  "name": "Teen Pack",
  "group": "Drinks",
  "sub": "Cold Beverages & Tea",
  "desc": "",
  "opts": [
   [
    "Regular",
    120
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 103
 },
 {
  "name": "Regular 345ml",
  "group": "Drinks",
  "sub": "Cold Beverages & Tea",
  "desc": "",
  "opts": [
   [
    "Regular",
    90
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 104
 },
 {
  "name": "Mix Tea",
  "group": "Drinks",
  "sub": "Cold Beverages & Tea",
  "desc": "",
  "opts": [
   [
    "Regular",
    100
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 105
 },
 {
  "name": "Royal BBQ Family Platter (Meal 1)",
  "group": "Deals",
  "sub": "Platters & Combos",
  "desc": "Half Reshmi Kabab, Half Chicken Kabab, Half Malai Boti, Half Tikka Boti, 1 Tikka Leg, Raita, Salad, BBQ Sauce, 2 Roghni Naan, 3 Roti, Half Rice, 1 Ltr Drink. Serves 5-6",
  "opts": [
   [
    "Regular",
    3399
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 106
 },
 {
  "name": "Chicken Meal (Meal 2)",
  "group": "Deals",
  "sub": "Platters & Combos",
  "desc": "Half Chicken Karahi, Half Biryani, Half Chicken Kabab, Half Malai Boti, 8 Roti, 1 Ltr Drink, Raita, Salad, BBQ Sauce. Serves 4",
  "opts": [
   [
    "Regular",
    2799
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 107
 },
 {
  "name": "Meal 3",
  "group": "Deals",
  "sub": "Platters & Combos",
  "desc": "1 Full Chicken Karahi, 4 Pcs Chicken Kabab, 1 Full Fried Rice, 12 Pcs Tikka Boti, Russian Salad, BBQ Sauce, 10 Roti, 2 Naan, 2 Raita, 2 Salad, 1.5 Ltr Drink. Serves 7-8",
  "opts": [
   [
    "Regular",
    5699
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 108
 },
 {
  "name": "Combo 1",
  "group": "Deals",
  "sub": "Platters & Combos",
  "desc": "Rice, Chicken Manchurian, Chicken Chowmein + 1 Reg Drink",
  "opts": [
   [
    "Regular",
    1359
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 109
 },
 {
  "name": "Combo 2",
  "group": "Deals",
  "sub": "Platters & Combos",
  "desc": "Rice, Chicken Shashlik, Chicken Dhaka + 1 Reg Drink",
  "opts": [
   [
    "Regular",
    1359
   ]
  ],
  "eligible": 1,
  "topping": 0,
  "sort": 110
 },
 {
  "name": "Reggy Burger",
  "group": "Burgers",
  "sub": "Burgers",
  "desc": "",
  "opts": [
   [
    "Regular",
    270
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 111
 },
 {
  "name": "Chapli Burger",
  "group": "Burgers",
  "sub": "Burgers",
  "desc": "",
  "opts": [
   [
    "Regular",
    270
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 112
 },
 {
  "name": "Zinger Burger",
  "group": "Burgers",
  "sub": "Burgers",
  "desc": "",
  "opts": [
   [
    "Regular",
    350
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 113
 },
 {
  "name": "King Burger",
  "group": "Burgers",
  "sub": "Burgers",
  "desc": "",
  "opts": [
   [
    "Regular",
    390
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 114
 },
 {
  "name": "Havey Burger",
  "group": "Burgers",
  "sub": "Burgers",
  "desc": "",
  "opts": [
   [
    "Regular",
    450
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 115
 },
 {
  "name": "Tower Burger",
  "group": "Burgers",
  "sub": "Burgers",
  "desc": "",
  "opts": [
   [
    "Regular",
    550
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 116
 },
 {
  "name": "Lawa Zinger Burger",
  "group": "Burgers",
  "sub": "Burgers",
  "desc": "",
  "opts": [
   [
    "Regular",
    450
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 117
 },
 {
  "name": "Fish Burger",
  "group": "Burgers",
  "sub": "Burgers",
  "desc": "",
  "opts": [
   [
    "Regular",
    450
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 118
 },
 {
  "name": "Injected Burger",
  "group": "Burgers",
  "sub": "Burgers",
  "desc": "",
  "opts": [
   [
    "Regular",
    490
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 119
 },
 {
  "name": "Add On Patty",
  "group": "Burgers",
  "sub": "Burgers",
  "desc": "",
  "opts": [
   [
    "Regular",
    150
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 120
 },
 {
  "name": "Add On Zinger Fillet",
  "group": "Burgers",
  "sub": "Burgers",
  "desc": "",
  "opts": [
   [
    "Regular",
    190
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 121
 },
 {
  "name": "Cheese Slice",
  "group": "Burgers",
  "sub": "Burgers",
  "desc": "",
  "opts": [
   [
    "Regular",
    60
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 122
 },
 {
  "name": "Dip Sauce",
  "group": "Burgers",
  "sub": "Burgers",
  "desc": "",
  "opts": [
   [
    "Regular",
    100
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 123
 },
 {
  "name": "Royal Crown Crust",
  "group": "Pizza",
  "sub": "Signature Pizzas",
  "desc": "Special sauce with 4 types of chicken, onion, cheese, olives, capsicum",
  "opts": [
   [
    "Small",
    699
   ],
   [
    "Medium",
    1100
   ],
   [
    "Large",
    1550
   ],
   [
    "XL 16\"",
    2190
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 124
 },
 {
  "name": "Stuff Chicken",
  "group": "Pizza",
  "sub": "Signature Pizzas",
  "desc": "Edges stuffed with cheese-sauce and chicken, onion, sausages, mushroom, bell pepper",
  "opts": [
   [
    "Small",
    699
   ],
   [
    "Medium",
    1100
   ],
   [
    "Large",
    1550
   ],
   [
    "XL 16\"",
    2190
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 125
 },
 {
  "name": "Stuff Kabab",
  "group": "Pizza",
  "sub": "Signature Pizzas",
  "desc": "Edges stuffed with cheese-sauce and kabab, onion, sausages, mushroom, bell pepper",
  "opts": [
   [
    "Small",
    699
   ],
   [
    "Medium",
    1100
   ],
   [
    "Large",
    1550
   ],
   [
    "XL 16\"",
    2190
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 126
 },
 {
  "name": "Stuff Cheese",
  "group": "Pizza",
  "sub": "Signature Pizzas",
  "desc": "Edges stuffed with cheese-sauce, onion, sausages, mushroom, bell pepper",
  "opts": [
   [
    "Small",
    699
   ],
   [
    "Medium",
    1100
   ],
   [
    "Large",
    1550
   ],
   [
    "XL 16\"",
    2190
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 127
 },
 {
  "name": "Malai Boti Pizza",
  "group": "Pizza",
  "sub": "Signature Pizzas",
  "desc": "Malai sauce, black pepper, tomatoes, onions, mushrooms, jalapeno, cheese, parsley",
  "opts": [
   [
    "Small",
    699
   ],
   [
    "Medium",
    1100
   ],
   [
    "Large",
    1550
   ],
   [
    "XL 16\"",
    2190
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 128
 },
 {
  "name": "Crunchy Chicken Pizza",
  "group": "Pizza",
  "sub": "Signature Pizzas",
  "desc": "Juicy fried chicken with special sauce",
  "opts": [
   [
    "Small",
    699
   ],
   [
    "Medium",
    1100
   ],
   [
    "Large",
    1550
   ],
   [
    "XL 16\"",
    2190
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 129
 },
 {
  "name": "Beef Pepperoni Pizza",
  "group": "Pizza",
  "sub": "Signature Pizzas",
  "desc": "Classical dough, tomato sauce, mozzarella cheese",
  "opts": [
   [
    "Small",
    699
   ],
   [
    "Medium",
    1100
   ],
   [
    "Large",
    1550
   ],
   [
    "XL 16\"",
    2190
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 130
 },
 {
  "name": "Royal Square Pizza",
  "group": "Pizza",
  "sub": "Special & Regular Pizzas",
  "desc": "Medium and Large only",
  "opts": [
   [
    "Medium",
    1190
   ],
   [
    "Large",
    1690
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 131
 },
 {
  "name": "Royal Treat Bonfire Pizza",
  "group": "Pizza",
  "sub": "Special & Regular Pizzas",
  "desc": "Small 8\", Medium 10\", Large 13\", XL 16\"",
  "opts": [
   [
    "Small",
    650
   ],
   [
    "Medium",
    1050
   ],
   [
    "Large",
    1650
   ],
   [
    "XL 16\"",
    2190
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 132
 },
 {
  "name": "Royal Treat Behari Kabab Pizza",
  "group": "Pizza",
  "sub": "Special & Regular Pizzas",
  "desc": "Small 8\", Medium 10\", Large 13\", XL 16\"",
  "opts": [
   [
    "Small",
    650
   ],
   [
    "Medium",
    1050
   ],
   [
    "Large",
    1650
   ],
   [
    "XL 16\"",
    2190
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 133
 },
 {
  "name": "Royal Treat Peri Peri Pizza",
  "group": "Pizza",
  "sub": "Special & Regular Pizzas",
  "desc": "Small 8\", Medium 10\", Large 13\", XL 16\"",
  "opts": [
   [
    "Small",
    650
   ],
   [
    "Medium",
    1050
   ],
   [
    "Large",
    1650
   ],
   [
    "XL 16\"",
    2190
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 134
 },
 {
  "name": "Royal Treat Extreme Special Pizza",
  "group": "Pizza",
  "sub": "Special & Regular Pizzas",
  "desc": "Small 8\", Medium 10\", Large 13\", XL 16\"",
  "opts": [
   [
    "Small",
    650
   ],
   [
    "Medium",
    1050
   ],
   [
    "Large",
    1650
   ],
   [
    "XL 16\"",
    2190
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 135
 },
 {
  "name": "Regular Chicken Tikka Pizza",
  "group": "Pizza",
  "sub": "Special & Regular Pizzas",
  "desc": "Small 8\", Medium 10\", Large 13\", XL 16\"",
  "opts": [
   [
    "Small",
    550
   ],
   [
    "Medium",
    1090
   ],
   [
    "Large",
    1390
   ],
   [
    "XL 16\"",
    1950
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 136
 },
 {
  "name": "Regular Chicken Fajita Pizza",
  "group": "Pizza",
  "sub": "Special & Regular Pizzas",
  "desc": "Small 8\", Medium 10\", Large 13\", XL 16\"",
  "opts": [
   [
    "Small",
    550
   ],
   [
    "Medium",
    1090
   ],
   [
    "Large",
    1390
   ],
   [
    "XL 16\"",
    1950
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 137
 },
 {
  "name": "Regular Vegetable Pizza",
  "group": "Pizza",
  "sub": "Special & Regular Pizzas",
  "desc": "Small 8\", Medium 10\", Large 13\", XL 16\"",
  "opts": [
   [
    "Small",
    550
   ],
   [
    "Medium",
    1090
   ],
   [
    "Large",
    1390
   ],
   [
    "XL 16\"",
    1950
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 138
 },
 {
  "name": "Regular Cheesy Cheese Pizza",
  "group": "Pizza",
  "sub": "Special & Regular Pizzas",
  "desc": "Small 8\", Medium 10\", Large 13\", XL 16\"",
  "opts": [
   [
    "Small",
    550
   ],
   [
    "Medium",
    1090
   ],
   [
    "Large",
    1390
   ],
   [
    "XL 16\"",
    1950
   ]
  ],
  "eligible": 0,
  "topping": 1,
  "sort": 139
 },
 {
  "name": "Royal Special Sandwich",
  "group": "Fast Food",
  "sub": "Sandwiches",
  "desc": "",
  "opts": [
   [
    "Regular",
    690
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 140
 },
 {
  "name": "Pizza Stacker",
  "group": "Fast Food",
  "sub": "Sandwiches",
  "desc": "",
  "opts": [
   [
    "Regular",
    780
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 141
 },
 {
  "name": "Mexican Sandwich",
  "group": "Fast Food",
  "sub": "Sandwiches",
  "desc": "",
  "opts": [
   [
    "Regular",
    640
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 142
 },
 {
  "name": "Crunchy Chicken Pasta",
  "group": "Pasta",
  "sub": "Pasta",
  "desc": "White sauce macaroni, crispy chicken, cheese",
  "opts": [
   [
    "Small",
    450
   ],
   [
    "Large",
    700
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 143
 },
 {
  "name": "Alfredo Pasta",
  "group": "Pasta",
  "sub": "Pasta",
  "desc": "White sauce pasta, chicken chunks, cheese",
  "opts": [
   [
    "Small",
    400
   ],
   [
    "Large",
    650
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 144
 },
 {
  "name": "Kababish Pasta",
  "group": "Pasta",
  "sub": "Pasta",
  "desc": "White sauce macaroni with kabab",
  "opts": [
   [
    "Small",
    450
   ],
   [
    "Large",
    700
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 145
 },
 {
  "name": "Chicken Shawarma",
  "group": "Fast Food",
  "sub": "Wraps, Rolls & Shawarma",
  "desc": "",
  "opts": [
   [
    "Regular",
    200
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 146
 },
 {
  "name": "Zinger Shawarma",
  "group": "Fast Food",
  "sub": "Wraps, Rolls & Shawarma",
  "desc": "",
  "opts": [
   [
    "Regular",
    250
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 147
 },
 {
  "name": "Seekh Kabab Paratha",
  "group": "Fast Food",
  "sub": "Wraps, Rolls & Shawarma",
  "desc": "",
  "opts": [
   [
    "Regular",
    300
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 148
 },
 {
  "name": "Grilled Chicken Paratha",
  "group": "Fast Food",
  "sub": "Wraps, Rolls & Shawarma",
  "desc": "",
  "opts": [
   [
    "Regular",
    350
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 149
 },
 {
  "name": "Zinger Roll Paratha",
  "group": "Fast Food",
  "sub": "Wraps, Rolls & Shawarma",
  "desc": "",
  "opts": [
   [
    "Regular",
    350
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 150
 },
 {
  "name": "Spin Roll",
  "group": "Fast Food",
  "sub": "Wraps, Rolls & Shawarma",
  "desc": "",
  "opts": [
   [
    "BBQ",
    490
   ],
   [
    "Behari Chapli Kabab",
    490
   ],
   [
    "Malai Boti",
    490
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 151
 },
 {
  "name": "Ferry / Thunder Chicken Wrap",
  "group": "Fast Food",
  "sub": "Wraps, Rolls & Shawarma",
  "desc": "",
  "opts": [
   [
    "Regular",
    590
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 152
 },
 {
  "name": "French Fries",
  "group": "Sides",
  "sub": "Fries, Wings & Snacks",
  "desc": "",
  "opts": [
   [
    "Regular",
    170
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 153
 },
 {
  "name": "Regular Fries",
  "group": "Sides",
  "sub": "Fries, Wings & Snacks",
  "desc": "",
  "opts": [
   [
    "Small",
    250
   ],
   [
    "Large",
    350
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 154
 },
 {
  "name": "Pizza Fries",
  "group": "Sides",
  "sub": "Fries, Wings & Snacks",
  "desc": "",
  "opts": [
   [
    "Small",
    400
   ],
   [
    "Large",
    700
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 155
 },
 {
  "name": "Loaded Fries",
  "group": "Sides",
  "sub": "Fries, Wings & Snacks",
  "desc": "",
  "opts": [
   [
    "Small",
    390
   ],
   [
    "Large",
    650
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 156
 },
 {
  "name": "Fried Chicken Wings",
  "group": "Sides",
  "sub": "Fries, Wings & Snacks",
  "desc": "",
  "opts": [
   [
    "5 PCS",
    270
   ],
   [
    "10 PCS",
    490
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 157
 },
 {
  "name": "Flaming Wings (Fast Food)",
  "group": "Sides",
  "sub": "Fries, Wings & Snacks",
  "desc": "",
  "opts": [
   [
    "5 PCS",
    320
   ],
   [
    "10 PCS",
    600
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 158
 },
 {
  "name": "Crispy Poppers",
  "group": "Sides",
  "sub": "Fries, Wings & Snacks",
  "desc": "",
  "opts": [
   [
    "Regular",
    470
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 159
 },
 {
  "name": "Chicken Hot Shots (Fast Food)",
  "group": "Sides",
  "sub": "Fries, Wings & Snacks",
  "desc": "",
  "opts": [
   [
    "10 PCS",
    270
   ],
   [
    "14 PCS",
    390
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 160
 },
 {
  "name": "Chicken Nuggets",
  "group": "Sides",
  "sub": "Fries, Wings & Snacks",
  "desc": "",
  "opts": [
   [
    "5 PCS",
    270
   ],
   [
    "10 PCS",
    490
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 161
 },
 {
  "name": "Student Platter",
  "group": "Deals",
  "sub": "Platters",
  "desc": "4 Pc Oven Baked Roll, 6 Pc Wings with Fries and Dip Sauce",
  "opts": [
   [
    "Regular",
    799
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 162
 },
 {
  "name": "Special Roasted Platter",
  "group": "Deals",
  "sub": "Platters",
  "desc": "2 Pc Oven Baked Roll, 3 Pc Wings with Fries and Dip Sauce",
  "opts": [
   [
    "Regular",
    499
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 163
 },
 {
  "name": "Injected Broast",
  "group": "Fast Food",
  "sub": "Injected Broast",
  "desc": "",
  "opts": [
   [
    "Full (8 PCS)",
    2400
   ],
   [
    "Half (4 PCS)",
    1390
   ],
   [
    "Quarter (2 PCS)",
    690
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 164
 },
 {
  "name": "Extra Bun",
  "group": "Fast Food",
  "sub": "Injected Broast",
  "desc": "",
  "opts": [
   [
    "Regular",
    50
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 165
 },
 {
  "name": "Deal 1",
  "group": "Deals",
  "sub": "Royal Discount Deals",
  "desc": "1 Zinger Burger + Reg Fries + 345ml Drink",
  "opts": [
   [
    "Regular",
    620
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 166
 },
 {
  "name": "Deal 7",
  "group": "Deals",
  "sub": "Royal Discount Deals",
  "desc": "5 Zinger + 20 Pcs Wings + 1.5 Ltr Drink",
  "opts": [
   [
    "Regular",
    2999
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 167
 },
 {
  "name": "Deal 8",
  "group": "Deals",
  "sub": "Royal Discount Deals",
  "desc": "8 Zinger Burger + 1.5 Ltr Drink",
  "opts": [
   [
    "Regular",
    3190
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 168
 },
 {
  "name": "Deal 12",
  "group": "Deals",
  "sub": "Royal Discount Deals",
  "desc": "1 Medium Pizza + 2 Zinger Burger + 1 Ltr Drink",
  "opts": [
   [
    "Regular",
    2050
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 169
 },
 {
  "name": "Deal 15",
  "group": "Deals",
  "sub": "Royal Discount Deals",
  "desc": "4 Small Pizza + 1.5 Ltr Drink",
  "opts": [
   [
    "Regular",
    2850
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 170
 },
 {
  "name": "Deal 18",
  "group": "Deals",
  "sub": "Royal Discount Deals",
  "desc": "2 Medium Pizza + 4 Zinger + 1.5 Ltr Drink",
  "opts": [
   [
    "Regular",
    3950
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 171
 },
 {
  "name": "Deal 20",
  "group": "Deals",
  "sub": "Royal Discount Deals",
  "desc": "1 Medium Pizza + 10 Pcs Wings + 500ml Drink",
  "opts": [
   [
    "Regular",
    1730
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 172
 },
 {
  "name": "Deal 21",
  "group": "Deals",
  "sub": "Royal Discount Deals",
  "desc": "1 Large Pizza + 20 Pcs Wings + 1.5 Ltr Drink",
  "opts": [
   [
    "Regular",
    2750
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 173
 },
 {
  "name": "Deal 22",
  "group": "Deals",
  "sub": "Royal Discount Deals",
  "desc": "1 Large Pizza + 4 Zinger Burger + 1.5 Ltr Drink",
  "opts": [
   [
    "Regular",
    3300
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 174
 },
 {
  "name": "Deal 24",
  "group": "Deals",
  "sub": "Royal Discount Deals",
  "desc": "2 Large Pizza + 1.5 Ltr Drink",
  "opts": [
   [
    "Regular",
    3450
   ]
  ],
  "eligible": 0,
  "topping": 0,
  "sort": 175
 }
]
