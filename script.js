document.addEventListener('DOMContentLoaded', function () {
  /* ════ STICKY HEADER SCROLL ════ */
  var header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        header.style.padding = '0.5rem 1.25rem';
      } else {
        header.style.padding = '1rem 1.25rem';
      }
    });
  }

  /* ════ SCROLL REVEAL ANIMATION ════ */
  var observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.sport-item, .testi-card, .zone-card, .product-card, .tip-card').forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
});

/* ════ ESCAPE KEY CLOSES MODALS ════ */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if (typeof closeModal === 'function') closeModal();
  }
});

/* ════ FAQ ACCORDION ════ */
function toggleFaq(el) {
  var item   = el.parentElement;
  var isOpen = item.classList.contains('active');
  document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('active'); });
  if (!isOpen) item.classList.add('active');
}
window.toggleFaq = toggleFaq;

/* ════ SPORT SEARCH & FILTER ════ */
function updateSportsGroupHeadings() {
  document.querySelectorAll('.sports-grid').forEach(function (grid) {
    var hasVisible = Array.prototype.some.call(
      grid.querySelectorAll('.sport-item'),
      function (item) { return item.style.display !== 'none'; }
    );
    var heading = grid.previousElementSibling;
    if (heading && heading.classList.contains('sports-group-heading')) {
      heading.style.display = hasVisible ? '' : 'none';
    }
    grid.style.display = hasVisible ? '' : 'none';
  });
}

function filterSports() {
  var q = document.getElementById('sportSearch').value.toLowerCase();
  document.querySelectorAll('.sport-item').forEach(function (item) {
    var name = item.querySelector('.sport-name').textContent.toLowerCase();
    item.style.display = name.includes(q) ? '' : 'none';
  });
  updateSportsGroupHeadings();
}
window.filterSports = filterSports;

function filterByTag(tag, el) {
  document.querySelectorAll('.pill').forEach(function (p) { p.classList.remove('active'); });
  el.classList.add('active');
  document.querySelectorAll('.sport-item').forEach(function (item) {
    item.style.display = (tag === 'all' || item.dataset.tag === tag) ? '' : 'none';
  });
  document.getElementById('sportSearch').value = '';
  updateSportsGroupHeadings();
}
window.filterByTag = filterByTag;

/* ════ GEAR RECOMMENDER ════ */
function getRecommendation() {
  var sport = document.getElementById('recSport').value;
  var style = document.getElementById('recStyle').value;
  var age   = parseInt(document.getElementById('recAge').value, 10);
  var el    = document.getElementById('recResult');

  if (!sport || !style) {
    el.textContent = '⚠️ Please choose a sport and playing style.';
    return;
  }

  var recs = {
    'Cricket':       { Casual: 'Tennis-ball bat + soft ball kit',             Competitive: 'SG / SS Kashmir willow bat + leather ball', Professional: 'English willow bat + full match kit' },
    'Badminton':     { Casual: 'Entry-level Yonex racket + feather shuttles', Competitive: 'Yonex Arcsaber + high-tension strings',      Professional: 'Yonex Nanoray + premium grip set' },
    'Football':      { Casual: 'Size 4 TPU ball + shin guards',               Competitive: 'Match ball + cleats',                       Professional: 'FIFA-approved ball + full kit' },
    'Basketball':    { Casual: 'Indoor rubber ball + knee support',            Competitive: 'Spalding outdoor ball + ankle support',      Professional: 'Full practice kit + court shoes' },
    'Tennis':        { Casual: 'Beginner graphite racket + pressureless balls',Competitive: 'Mid-weight 100sq racket + premium balls',   Professional: 'Pro-staff series + dampeners' },
    'Gym / Fitness': { Casual: 'Resistance bands + yoga mat',                  Competitive: 'Dumbbell set + lifting belt',               Professional: 'Full gym equipment bundle' }
  };

  var rec     = (recs[sport] && recs[sport][style]) ? recs[sport][style] : 'Visit our store for personalised guidance!';
  var ageNote = (age && age < 14) ? ' (Junior sizing recommended)' : (age && age > 50) ? ' (Lightweight options available)' : '';

  el.innerHTML =
    '✅ Recommended for <strong>' + sport + ' – ' + style + '</strong>:<br/>' +
    rec + ageNote +
    '<br/><small style="color:#666;font-size:0.78rem;">Visit any JK Sports branch for expert fitting &amp; selection.</small>';
}
window.getRecommendation = getRecommendation;

/* ════ SPORT CATALOG MODAL ════
   Each sport/category maps to a LIST of related products.
   Clicking any sport image opens a catalog showing every
   product available for that sport — not just one item.

   NOTE: Chess and Carrom used to both point at a shared 'indoor'
   catalog entry, so clicking either card opened the same modal.
   They now have their own dedicated 'chess' and 'carrom' entries.
*/
var CATALOG = {
  cricket: {
    title: 'Cricket Gear',
    tag:   'CRICKET ZONE',
    desc:  'Everything you need for cricket — bats, balls, protective gear, and accessories.',
    items: [
      { img: 'https://images.jdmagicbox.com/comp/namakkal/b2/9999p4286.4286.210910111823.j4b2/catalogue/-hn65ksaxy5-250.jpg', name: 'Premium Cricket Bat', desc: 'Kashmir & English willow, Grade 1–3', stock: true },
      { img: 'https://images.jdmagicbox.com/comp/namakkal/b2/9999p4286.4286.210910111823.j4b2/catalogue/jk-sports-namakkal-namakkal-ho-namakkal-sports-goods-dealers-xzgfv5zd2t.jpg', name: 'Match-Grade Ball', desc: 'SG, Kookaburra & local leather balls', stock: true },
      { img: 'https://images.unsplash.com/photo-1646282814550-f521d9b57a59?w=400&auto=format&fit=crop', name: 'Sri Lankan Turf Bats', desc: 'Premium Ceylon willow, turf wickets', stock: true },
      { img: 'https://images.unsplash.com/photo-1595210382266-2d0077c1f541?w=400&auto=format&fit=crop', name: 'Batting Pads & Gloves', desc: 'Protective gear for batsmen', stock: true },
      { img: 'https://images.unsplash.com/photo-1593766832792-804353f52dbf?w=400&auto=format&fit=crop', name: 'Cricket Helmets', desc: 'ICC-spec protective helmets', stock: true },
      { img: 'https://images.unsplash.com/photo-1644984785457-facabdba5b16?w=400&auto=format&fit=crop', name: 'Wicket Keeping Kit', desc: 'Gloves, pads & inner gloves', stock: true }
    ]
  },
  badminton: {
    title: 'Badminton Gear',
    tag:   'BADMINTON ZONE',
    desc:  'Yonex rackets, shuttles, and accessories for every skill level.',
    items: [
      { img: 'https://images.jdmagicbox.com/comp/namakkal/b2/9999p4286.4286.210910111823.j4b2/catalogue/jk-sports-namakkal-namakkal-ho-namakkal-sports-goods-dealers-yonex-04zxd27huf.jpg', name: 'Yonex Racket Pro', desc: 'Arcsaber / Astrox / Nanoray series', stock: true },
      { img: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&auto=format&fit=crop', name: 'Feather Shuttlecocks', desc: 'Tournament & practice grade', stock: true },
      { img: 'https://images.unsplash.com/photo-1708312604109-16c0be9326cd?w=400&auto=format&fit=crop', name: 'Grip Tape & Overgrips', desc: 'Sweat-absorbent racket grips', stock: true },
      { img: 'https://images.unsplash.com/photo-1617696618050-b0fef0c666af?w=400&auto=format&fit=crop', name: 'Badminton Shoes', desc: 'Non-marking court soles', stock: true },
      { img: 'https://images.unsplash.com/photo-1599391398131-cd12dfc6c24e?w=400&auto=format&fit=crop', name: 'Racket Stringing Service', desc: 'Custom tension stringing in-store', stock: true }
    ]
  },
  football: {
    title: 'Football & Ball Sports',
    tag:   'BALL SPORTS ZONE',
    desc:  'Match balls and gear for football, volleyball, kabaddi, basketball and hockey.',
    items: [
      { img: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&auto=format&fit=crop', name: 'Match-Grade Football', desc: 'Size 4 & 5, TPU and leather', stock: true },
      { img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop', name: 'Shin Guards', desc: 'Lightweight protective guards', stock: true },
      { img: 'https://images.unsplash.com/photo-1551958219-acbc608c6623?w=400&auto=format&fit=crop', name: 'Football Boots / Cleats', desc: 'Firm-ground & turf studs', stock: true },
      { img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop', name: 'Goal Nets & Cones', desc: 'Training equipment for clubs', stock: true }
    ]
  },
  basketball: {
    title: 'Basketball Gear',
    tag:   'BALL SPORTS ZONE',
    desc:  'Indoor and outdoor basketballs plus support gear.',
    items: [
      { img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop', name: 'Spalding Outdoor Ball', desc: 'Durable rubber outdoor ball', stock: true },
      { img: 'https://images.unsplash.com/photo-1519861531473-9200626188a1?w=400&auto=format&fit=crop', name: 'Indoor Rubber Ball', desc: 'Indoor court grip ball', stock: true },
      { img: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=400&auto=format&fit=crop', name: 'Ankle Support Guards', desc: 'Compression ankle braces', stock: true }
    ]
  },
  volleyball: {
    title: 'Volleyball Gear',
    tag:   'BALL SPORTS ZONE',
    desc:  'Match volleyballs and knee support gear.',
    items: [
      { img: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&auto=format&fit=crop', name: 'Match Volleyball', desc: 'Official size & weight', stock: true },
      { img: 'https://images.unsplash.com/photo-1616347853803-5bc49f9e4e27?w=400&auto=format&fit=crop', name: 'Knee Pads', desc: 'Cushioned protective pads', stock: true }
    ]
  },
  kabaddi: {
    title: 'Kabaddi Gear',
    tag:   'BALL SPORTS ZONE',
    desc:  'Local favourite — court gear and accessories for kabaddi teams.',
    items: [
      { img: 'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=400&auto=format&fit=crop', name: 'Kabaddi Mat / Court Marking', desc: 'Standard court setup kit', stock: true },
      { img: 'https://images.unsplash.com/photo-1655089131279-8029e8a21ac6?w=400&auto=format&fit=crop', name: 'Team Jerseys', desc: 'Custom printed team kits', stock: true }
    ]
  },
  hockey: {
    title: 'Hockey Gear',
    tag:   'BALL SPORTS ZONE',
    desc:  'Sticks, balls, and protective gear for hockey players.',
    items: [
      { img: 'https://images.unsplash.com/photo-1548865379-3a7ddf7abe01?w=400&auto=format&fit=crop', name: 'Hockey Stick', desc: 'Composite & wooden sticks', stock: true },
      { img: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=400&auto=format&fit=crop', name: 'Hockey Ball', desc: 'Hard plastic match ball', stock: true },
      { img: 'assets/hockey-shin-guards.jpg', name: 'Hockey Shin Guards', desc: 'Protective shin guards for hockey players', stock: true }
    ]
  },
  tennis: {
    title: 'Tennis Gear',
    tag:   'RACKET ZONE',
    desc:  'Rackets and balls for casual to professional play.',
    items: [
      { img: 'https://images.unsplash.com/photo-1551773188-0801da12ddae?w=400&auto=format&fit=crop', name: 'Graphite Tennis Racket', desc: 'Beginner to pro-staff series', stock: true },
      { img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400&auto=format&fit=crop', name: 'Pressureless Tennis Balls', desc: 'Practice & match cans', stock: true },
      { img: 'https://images.unsplash.com/photo-1612364741797-c3c1756afb91?w=400&auto=format&fit=crop', name: 'Vibration Dampeners', desc: 'String vibration control', stock: true },
      { img: 'assets/weighted-tennis-racket.jpg', name: 'Weighted Training Racket', desc: 'Extra-weight racket for strength & swing training', stock: true }
    ]
  },
  tabletennis: {
    title: 'Table Tennis Gear',
    tag:   'RACKET ZONE',
    desc:  'Paddles, balls and table accessories.',
    items: [
      { img: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400&auto=format&fit=crop', name: 'TT Paddle / Racket', desc: 'Rubber-faced paddles, all grades', stock: true },
      { img: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=400&auto=format&fit=crop', name: 'TT Balls (3-Star)', desc: 'Tournament-grade balls', stock: true }
    ]
  },
  fitness: {
    title: 'Gym & Fitness Equipment',
    tag:   'GYM EQUIPMENT AVAILABLE',
    desc:  'Dumbbells, barbells, benches, resistance bands, and full home-gym sets from trusted brands.',
    items: [
      { img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop', name: 'Dumbbell Sets', desc: 'Adjustable & fixed weight options', stock: true },
      { img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop', name: 'Barbells & Weight Plates', desc: 'Olympic & standard bars', stock: true },
      { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d45?w=400&auto=format&fit=crop', name: 'Resistance Bands', desc: 'Multiple resistance levels', stock: true },
      { img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&auto=format&fit=crop', name: 'Gym Benches', desc: 'Flat & adjustable incline benches', stock: true },
      { img: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&auto=format&fit=crop', name: 'Pull-Up Bars', desc: 'Wall-mounted & doorway bars', stock: true }
    ]
  },
  yoga: {
    title: 'Yoga & Wellness',
    tag:   'WELLNESS ZONE',
    desc:  'Mats and accessories for yoga and wellness routines.',
    items: [
      { img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop', name: 'Yoga Mats', desc: 'Non-slip, multiple thicknesses', stock: true },
      { img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&auto=format&fit=crop', name: 'Yoga Blocks & Straps', desc: 'Support props for practice', stock: true }
    ]
  },
  athletics: {
    title: 'Athletics Gear',
    tag:   'ATHLETICS ZONE',
    desc:  'Track and field essentials for athletes.',
    items: [
      { img: 'https://images.unsplash.com/photo-1547941126-3d5322b218b0?w=400&auto=format&fit=crop', name: 'Running Spikes', desc: 'Track shoes for sprint & distance', stock: true },
      { img: 'https://images.unsplash.com/photo-1761225291317-6bbf383011f2?w=400&auto=format&fit=crop', name: 'Stopwatches & Batons', desc: 'Relay & timing equipment', stock: true },
      { img: 'https://images.unsplash.com/photo-1579156618441-0f9f420e2a25?w=400&auto=format&fit=crop', name: 'Javelins', desc: 'Competition & training javelins, all weights', stock: true },
      { img: 'https://images.unsplash.com/photo-1742111281708-407b8f75da6f?w=400&auto=format&fit=crop', name: 'Shot Put', desc: 'Indoor & outdoor shot put balls, various weights', stock: true },
      { img: 'https://images.unsplash.com/photo-1742495212062-eace5ce3b532?w=400&auto=format&fit=crop', name: 'Discus', desc: 'Training & competition discus', stock: true },
      { img: 'https://images.unsplash.com/photo-1774748863093-f6935b7f49f8?w=400&auto=format&fit=crop', name: 'Hurdles', desc: 'Adjustable height training hurdles', stock: true },
      { img: 'https://images.unsplash.com/photo-1526676317768-d9b14f15615a?w=400&auto=format&fit=crop', name: 'Starting Blocks', desc: 'Sprint starting blocks for track meets', stock: true },
      { img: 'https://images.unsplash.com/photo-1776705865346-3f32edc23b60?w=400&auto=format&fit=crop', name: 'Long & High Jump Gear', desc: 'Measuring tapes, landing mats & crossbars', stock: true }
    ]
  },
  chess: {
    title: 'Chess',
    tag:   'INDOOR ZONE',
    desc:  'Chess boards and sets for casual play, clubs and tournaments.',
    items: [
      { img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400&auto=format&fit=crop', name: 'Wooden Chess Set', desc: 'Classic wooden board with weighted pieces', stock: true },
      { img: 'https://images.unsplash.com/photo-1585856262121-33f7c37eb2c3?w=400&auto=format&fit=crop', name: 'Tournament Chess Set', desc: 'Vinyl roll-up board, tournament-standard pieces', stock: true },
      { img: 'https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=400&auto=format&fit=crop', name: 'Chess Clock', desc: 'Digital & analog timers for competitive play', stock: true }
    ]
  },
  carrom: {
    title: 'Carrom',
    tag:   'INDOOR ZONE',
    desc:  'Carrom boards, coins and accessories for home and club play.',
    items: [
      { img: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400&auto=format&fit=crop', name: 'Standard Carrom Board', desc: 'Full-size board with coins & striker', stock: true },
      { img: 'https://images.unsplash.com/photo-1590490350977-a5b6f1f1a1b6?w=400&auto=format&fit=crop', name: 'Tournament Carrom Board', desc: 'Championship-grade board, smooth finish', stock: true },
      { img: 'https://images.unsplash.com/photo-1622037022824-0c71d511ee3c?w=400&auto=format&fit=crop', name: 'Carrom Powder & Coins', desc: 'Boric powder, coin & striker refill sets', stock: true }
    ]
  },
  swimming: {
    title: 'Swimming Gear',
    tag:   'AQUATICS ZONE',
    desc:  'Goggles, caps and accessories for swimmers.',
    items: [
      { img: 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=400&auto=format&fit=crop', name: 'Swimming Goggles', desc: 'Anti-fog, UV protection', stock: true },
      { img: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400&auto=format&fit=crop', name: 'Swim Caps', desc: 'Silicone caps, all sizes', stock: true },
      { img: 'assets/swimming-jacket.jpg', name: 'Swimming Jackets', desc: 'Buoyancy & thermal swim jackets, all sizes', stock: true }
    ]
  },
  boxing: {
    title: 'Boxing Gear',
    tag:   'COMBAT SPORTS ZONE',
    desc:  'Gloves, pads, and training gear for boxing.',
    items: [
      { img: 'https://images.unsplash.com/photo-1716307043003-dbe6a5cc496e?w=400&auto=format&fit=crop', name: 'Boxing Gloves', desc: 'Training & sparring gloves, all sizes', stock: true },
      { img: 'https://images.unsplash.com/photo-1716307043224-f5b67e3f64a8?w=400&auto=format&fit=crop', name: 'Punching Bags', desc: 'Heavy bags & speed bags', stock: true },
      { img: 'https://images.unsplash.com/photo-1734104378584-d4e5bff97e56?w=400&auto=format&fit=crop', name: 'Hand Wraps', desc: 'Wrist & knuckle support wraps', stock: true },
      { img: 'https://images.unsplash.com/photo-1708073088059-3e0c7a0e6d18?w=400&auto=format&fit=crop', name: 'Focus Pads & Mitts', desc: 'Coach training pads', stock: true }
    ]
  },
  turfbats: {
    title: 'Sri Lankan Turf Bats',
    tag:   'PREMIUM TURF BATS',
    desc:  'Premium Ceylon willow turf bats, built for turf wicket cricket.',
    items: [
      { img: 'https://images.unsplash.com/photo-1593766821405-f605e0f9535f?w=400&auto=format&fit=crop', name: 'Sri Lankan Turf Bat', desc: 'Premium Ceylon willow, turf wickets', stock: true },
      { img: 'https://images.unsplash.com/photo-1677785643764-179393bc3842?w=400&auto=format&fit=crop', name: 'SL Turf Bat — Pro Grade', desc: 'Heavier profile for power hitters', stock: true },
      { img: 'https://images.unsplash.com/photo-1593766788306-28561086694e?w=400&auto=format&fit=crop', name: 'SL Turf Bat — Lightweight', desc: 'Quicker pick-up, junior to club level', stock: true }
    ]
  },
  skating: {
    title: 'Skating Gear',
    tag:   'JONEX SKATING ZONE',
    desc:  'Jonex skates for training, fitness and everyday practice.',
    items: [
      { img: 'assets/reagan-m-Q68s5Vf40GM-unsplash.jpg', name: 'Jonex Tenacity Skates', desc: 'Durable Jonex Tenacity quad skates for training & recreational use', stock: true },
      { img: 'assets/susan-weber-9RuN5pzalr4-unsplash.jpg', name: 'Jonex Fix Body Professional Skates', desc: 'Jonex Fix Body Professional — reinforced fixed-body skates for serious skaters', stock: true },
      { img: 'assets/indira-tjokorda-Y-VYK0SDLxs-unsplash.jpg', name: 'Inline Skates', desc: 'All-purpose inline skates, beginner to intermediate levels', stock: true }
    ]
  },
  accessories: {
    title: 'Sports Accessories',
    tag:   'ACCESSORIES ZONE',
    desc:  'Caps, bands, bags and everyday essentials to complete your sports kit.',
    items: [
      { img: 'assets/sonu-kumar-8XZBP38QJFM-unsplash.jpg', name: 'Sports Caps', desc: 'Breathable caps for sun and sweat protection', stock: true },
      { img: 'assets/luigi-estuye-lucreative-4w1353S-Drs-unsplash.jpg', name: 'Wrist Bands', desc: 'Sweat-absorbent wrist bands for training and matches', stock: true },
      { img: 'assets/nathan-dumlao-4GLI-k4wmFg-unsplash.jpg', name: 'Sweat Bands', desc: 'Elastic sweat bands for active wear', stock: true },
      { img: 'assets/brett-wharton-ZgwoBY6CwGI-unsplash.jpg', name: 'Head Bands', desc: 'Non-slip head bands for everyday training', stock: true },
      { img: 'assets/andriyko-podilnyk-sGRJ36ogml8-unsplash.jpg', name: 'Sports Bags', desc: 'Durable kit bags for gear and equipment', stock: true },
      { img: 'assets/joan-tran-reEySFadyJQ-unsplash.jpg', name: 'Water Bottles', desc: 'Sports water bottles, multiple sizes', stock: true },
      { img: 'assets/anton-savinov-Q5t8eNYgDsA-unsplash.jpg', name: 'Air Pumps', desc: 'Ball and tube air pumps with needles', stock: true },
      { img: 'assets/arm-bands.jpg', name: 'Arm Bands', desc: 'Elastic arm bands for training and everyday wear', stock: true }
    ]
  }
};

var CATALOG_FALLBACK_IMAGE =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 500%22%3E%3Crect width=%22800%22 height=%22500%22 fill=%22%23dbeafe%22/%3E%3Crect x=%2220%22 y=%2220%22 width=%22760%22 height=%22460%22 rx=%2228%22 fill=%22%23eff6ff%22 stroke=%22%2393c5fd%22 stroke-width=%224%22/%3E%3Ctext x=%22400%22 y=%22240%22 text-anchor=%22middle%22 font-family=%22Arial%2Csans-serif%22 font-size=%2232%22 fill=%22%2307304a%22%3EImage unavailable%3C/text%3E%3C/svg%3E';

function getAssetPath(src) {
  if (!src) return src;
  if (/^(data:|blob:|assets\/)/i.test(src)) return src;

  var cleanSrc = String(src).split('?')[0].split('#')[0];
  var fileName = cleanSrc.substring(cleanSrc.lastIndexOf('/') + 1);
  if (!fileName) return src;
  if (!/\.[a-z0-9]+$/i.test(fileName)) fileName += '.jpg';

  return 'assets/' + fileName;
}

function normalizeCatalogImages(catalog) {
  Object.keys(catalog || {}).forEach(function (categoryKey) {
    var category = catalog[categoryKey];
    var items = category && category.items;
    if (!Array.isArray(items)) return;

    items.forEach(function (item) {
      if (!item || typeof item !== 'object') return;
      var src = item.img || item.image || item.src;
      if (src) item.img = getAssetPath(src);
    });
  });
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isBrokenImagePath(src) {
  return !src;
}

function getCatalogImage(item, categoryKey, itemIndex) {
  var src = item && (item.img || item.image || item.src);
  if (isBrokenImagePath(src)) {
    return CATALOG_FALLBACK_IMAGE;
  }
  return getAssetPath(src);
}

function renderCatalogItem(item, categoryKey, itemIndex) {
  var imgSrc = getCatalogImage(item, categoryKey, itemIndex);
  var itemName = escapeHtml(item && item.name ? item.name : 'Untitled product');
  var itemDesc = escapeHtml(item && item.desc ? item.desc : '');

  return (
    '<div class="catalog-item">' +
      '<img src="' + imgSrc + '" alt="' + itemName + '" loading="lazy" />' +
      '<div class="catalog-item-body">' +
        '<h4>' + itemName + '</h4>' +
        '<p>' + itemDesc + '</p>' +
        (item && item.stock
          ? '<span class="catalog-stock">✅ In Stock</span>'
          : '<span class="catalog-stock" style="color:#a15c00;background:rgba(245,197,24,0.18);">📞 Enquire</span>') +
      '</div>' +
    '</div>'
  );
}

function scanCatalogImageIssues(catalog) {
  var issues = [];
  Object.keys(catalog || {}).forEach(function (categoryKey) {
    var category = catalog[categoryKey] || {};
    (category.items || []).forEach(function (item, itemIndex) {
      var src = item && (item.img || item.image || item.src);
      if (isBrokenImagePath(src)) {
        issues.push({
          category: categoryKey,
          index: itemIndex,
          name: item && item.name,
          src: src || null
        });
      }
    });
  });
  return issues;
}

normalizeCatalogImages(CATALOG);
var catalogImageIssues = scanCatalogImageIssues(CATALOG);
window.catalogImageIssues = catalogImageIssues;
if (catalogImageIssues.length && typeof console !== 'undefined' && console.warn) {
  console.warn('JK Sports catalog image issues detected', catalogImageIssues);
}

var CATALOG_SOURCE_URL = 'catalog.json?v=20260708';

function refreshCatalogIssues() {
  catalogImageIssues = scanCatalogImageIssues(CATALOG);
  window.catalogImageIssues = catalogImageIssues;
  if (catalogImageIssues.length && typeof console !== 'undefined' && console.warn) {
    console.warn('JK Sports catalog image issues detected', catalogImageIssues);
  }
}

function loadCatalogFromJson() {
  if (typeof fetch !== 'function') return;

  fetch(CATALOG_SOURCE_URL, { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to load catalog.json: ' + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      if (data && typeof data === 'object') {
        CATALOG = data;
        normalizeCatalogImages(CATALOG);
        refreshCatalogIssues();
      }
    })
    .catch(function (error) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('Falling back to embedded catalog data', error);
      }
    });
}

loadCatalogFromJson();

function openCatalog(key) {
  var c = CATALOG[key];
  if (!c) return;

  var titleEl = document.getElementById('catalogTitle');
  var tagEl   = document.getElementById('catalogTag');
  var descEl  = document.getElementById('catalogDesc');
  var itemsEl = document.getElementById('catalogItems');
  var modalEl = document.getElementById('catalogModal');

  if (titleEl) titleEl.textContent = c.title;
  if (tagEl)   tagEl.textContent   = c.tag;
  if (descEl)  descEl.textContent  = c.desc;

  if (itemsEl) {
    itemsEl.innerHTML = c.items.map(function (item, itemIndex) {
      return renderCatalogItem(item, key, itemIndex);
    }).join('');
  }

  if (modalEl) {
    modalEl.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
window.openCatalog = openCatalog;

function closeModal() {
  var modalEl = document.getElementById('catalogModal');
  if (modalEl) {
    modalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}
window.closeModal = closeModal;

/* close on backdrop click */
var catalogModalEl = document.getElementById('catalogModal');
if (catalogModalEl) {
  catalogModalEl.addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });
}

var catalogCloseBtn = document.getElementById('catalogCloseBtn');
if (catalogCloseBtn) catalogCloseBtn.addEventListener('click', closeModal);

var catalogStoreCTA = document.getElementById('catalogStoreCTA');
if (catalogStoreCTA) catalogStoreCTA.addEventListener('click', closeModal);

/* keyboard accessibility for role="button" cards */
document.querySelectorAll('[role="button"]').forEach(function (el) {
  el.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
  });
});
