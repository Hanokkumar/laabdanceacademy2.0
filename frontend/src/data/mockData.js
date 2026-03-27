const BASE_IMG = 'https://demo.kamleshyadav.com/themeforest/dance-academy/demo-v1/wp-content/uploads/sites/2';

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Classes', href: '#classes' },
  { label: 'Events', href: '#events' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
];

export const heroSlides = [
  {
    id: 1,
    title: 'Dance',
    titleAccent: 'Academy',
    description: 'Step into the rhythm of pure excellence. Discover world-class training, inspiring choreography, and a vibrant community that moves with purpose and heart.',
    image: `${BASE_IMG}/2025/02/bnr-main-2.png`,
    bgImage: 'https://images.unsplash.com/photo-1550026593-dd8ce0749590?w=1920&q=80',
  },
  {
    id: 2,
    title: 'Dance',
    titleAccent: 'Studio',
    description: 'Step into a studio where passion meets precision. Explore diverse styles, learn from seasoned instructors, and grow with a community that lives to dance.',
    image: `${BASE_IMG}/2025/02/bnr-main-2.png`,
    bgImage: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=1920&q=80',
  },
  {
    id: 3,
    title: 'Dance',
    titleAccent: 'Night Club',
    description: 'Experience electrifying nights filled with music, lights, and unforgettable moves. Dance freely, connect deeply, and make every night a celebration.',
    image: `${BASE_IMG}/2025/02/bnr-main-2.png`,
    bgImage: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=1920&q=80',
  },
];

export const aboutData = {
  image: `${BASE_IMG}/2025/01/about-img-1.png`,
  subtitle: 'About us',
  title: 'Leading To The Dance Of Heart...',
  description: 'Discover the rhythm that awakens your soul and sets your spirit free. Our studio brings movement, emotion, and artistry together in perfect harmony. Each step is more than a motion — it\'s a language of the heart, a journey of self-expression.',
  descriptionExtra: 'Feel the pulse of every beat, the grace of every turn, and the energy of every performance.',
  buttonText: 'Know More',
};

export const danceSchoolCategories = ['All', 'Ballet', 'Belly', 'Contemporary', 'Hip Hop', 'Irish', 'Jazz', 'Kathak', 'Modern', 'Salsa', 'Tap'];

export const danceSchoolItems = [
  {
    id: 1,
    image: `${BASE_IMG}/2016/11/da-sc-5-1.png`,
    title: 'London',
    category: 'Modern',
    tags: ['Ballet', 'Belly', 'Contemporary', 'Hip Hop', 'Irish', 'Modern'],
  },
  {
    id: 2,
    image: `${BASE_IMG}/2016/11/da-sc-2-1.png`,
    title: 'China',
    category: 'Modern',
    tags: ['Contemporary', 'Hip Hop', 'Irish', 'Jazz', 'Kathak', 'Modern'],
  },
  {
    id: 3,
    image: `${BASE_IMG}/2016/11/da-sc-6-1.png`,
    title: 'Australia',
    category: 'Tap',
    tags: ['Ballet', 'Belly', 'Irish', 'Jazz', 'Salsa', 'Tap'],
  },
  {
    id: 4,
    image: `${BASE_IMG}/2016/11/da-sc-4-1.png`,
    title: 'India',
    category: 'Tap',
    tags: ['Ballet', 'Belly', 'Contemporary', 'Hip Hop', 'Modern', 'Salsa', 'Tap'],
  },
  {
    id: 5,
    image: `${BASE_IMG}/2016/11/da-sc-3-1.png`,
    title: 'New York',
    category: 'Salsa',
    tags: ['Hip Hop', 'Irish', 'Modern', 'Salsa'],
  },
  {
    id: 6,
    image: `${BASE_IMG}/2016/11/da-sc-6-1.png`,
    title: 'Brazil',
    category: 'Salsa',
    tags: ['Ballet', 'Belly', 'Contemporary', 'Hip Hop', 'Irish', 'Salsa'],
  },
];

export const events = [
  {
    id: 1,
    image: `${BASE_IMG}/2025/02/tim-gouw-tYpp-eIZH44-unsplash-1-1.jpg`,
    date: '30',
    month: 'Mar',
    title: 'Neon Light Dance',
    description: 'A dazzling fusion of light and motion—watch dancers light up the night with electrifying steps and glowing...',
    location: 'wilson.byrne@gmail.com',
    price: '$80',
  },
  {
    id: 2,
    image: `${BASE_IMG}/2025/02/evn-2-1.png`,
    date: '15',
    month: 'Apr',
    title: 'Rhythm & Soul Night',
    description: 'An evening celebrating the beauty of rhythm and soulful movement with live music and stunning dance...',
    location: 'dance.events@studio.com',
    price: '$65',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=600&q=80',
    date: '22',
    month: 'May',
    title: 'Urban Dance Fest',
    description: 'Join the biggest urban dance festival featuring hip hop, breaking, and freestyle battles from top performers...',
    location: 'urban.fest@dance.com',
    price: '$95',
  },
];

export const galleryImages = [
  `${BASE_IMG}/2025/01/g-1-1.jpg`,
  `${BASE_IMG}/2025/01/g-2-1.jpg`,
  `${BASE_IMG}/2025/01/g-3-1.jpg`,
  `${BASE_IMG}/2025/01/g-4-1.jpg`,
  `${BASE_IMG}/2025/01/g-5-1.jpg`,
  `${BASE_IMG}/2025/01/g-6-1.jpg`,
  `${BASE_IMG}/2025/01/g-7-1.jpg`,
  `${BASE_IMG}/2025/01/g-8-1.jpg`,
  `${BASE_IMG}/2025/01/g-9-1.jpg`,
];

export const instructors = [
  {
    id: 1,
    image: `${BASE_IMG}/2025/02/team-4-1.png`,
    name: 'Leslie Alexander',
    role: 'Just Dance',
    socials: { facebook: '#', twitter: '#', linkedin: '#', instagram: '#' },
  },
  {
    id: 2,
    image: `${BASE_IMG}/2025/02/team-3-1.png`,
    name: 'Gloria Jenkins',
    role: 'Break Dance',
    socials: { facebook: '#', twitter: '#', linkedin: '#', instagram: '#' },
  },
  {
    id: 3,
    image: `${BASE_IMG}/2025/02/team-2-1.png`,
    name: 'Devin Bennett',
    role: 'Hip Hop',
    socials: { facebook: '#', twitter: '#', linkedin: '#', instagram: '#' },
  },
  {
    id: 4,
    image: `${BASE_IMG}/2025/02/team-1-1.png`,
    name: 'Danna Martinez',
    role: 'Dance Fitness',
    socials: { facebook: '#', twitter: '#', linkedin: '#', instagram: '#' },
  },
];

export const blogPosts = [
  {
    id: 1,
    image: `${BASE_IMG}/2025/02/tim-gouw-tYpp-eIZH44-unsplash-1-1.jpg`,
    title: 'Fabulous Dancing And Choreography…',
    description: 'Experience show-stopping moves and stunning choreography designed to captivate every...',
    date: 'Feb 21, 2025',
    category: 'Uncategorized',
  },
  {
    id: 2,
    image: `${BASE_IMG}/2025/02/ilja-tulit-ucAMMD36Si0-unsplash-1-1.jpg`,
    title: 'Move To The Beat…',
    description: 'Let the music take control. Whether you\'re just beginning or refining your skills, our studio helps you connect with every...',
    date: 'Feb 5, 2025',
    category: 'Salsa Dance',
  },
  {
    id: 3,
    image: `${BASE_IMG}/2025/02/ss-1.jpg`,
    title: 'Dance Is For The Free Soul…',
    description: 'In our space, dance becomes a journey of freedom, expression, and discovery. No judgment. No...',
    date: 'Feb 5, 2025',
    category: 'Tap Dance',
  },
];

export const testimonials = [
  {
    id: 1,
    text: 'This studio changed the way I see dance. The instructors are so supportive, and every session is full of energy and passion. I have grown so much as a dancer here.',
    image: `${BASE_IMG}/2025/02/testi-1-1.png`,
    name: 'Brooklyn Simmons',
    role: 'Junior Dancer',
  },
  {
    id: 2,
    text: 'From day one, I felt welcomed and inspired. The vibe here is amazing, and the choreography always pushes you to be your best. Truly a transformative experience.',
    image: `${BASE_IMG}/2025/02/Ellipse-55.png`,
    name: 'Niklas Romain',
    role: 'Professional Instructor',
  },
  {
    id: 3,
    text: 'A perfect blend of discipline and creativity. I have learned so much, and the experience has truly helped me grow as both a dancer and a person.',
    image: `${BASE_IMG}/2025/02/Ellipse-56.png`,
    name: 'Friendrich Gabriel',
    role: 'Dance Student',
  },
];

export const partnerLogos = [
  `${BASE_IMG}/2025/02/part-4-2.png`,
  `${BASE_IMG}/2025/02/part-3-2.png`,
  `${BASE_IMG}/2025/02/part-1-2.png`,
  `${BASE_IMG}/2025/02/part-2-2.png`,
  `${BASE_IMG}/2025/02/part-1-1-1.png`,
  `${BASE_IMG}/2025/02/part-2-1-1.png`,
  `${BASE_IMG}/2025/02/part-3-1-1.png`,
  `${BASE_IMG}/2025/02/part-4-1-1.png`,
];

export const classSchedule = [
  { time: '8:00 AM', monday: 'Ballet', tuesday: 'Hip Hop', wednesday: 'Jazz', thursday: 'Contemporary', friday: 'Salsa', saturday: 'Tap' },
  { time: '9:30 AM', monday: 'Contemporary', tuesday: 'Ballet', wednesday: 'Belly', thursday: 'Hip Hop', friday: 'Jazz', saturday: 'Modern' },
  { time: '11:00 AM', monday: 'Hip Hop', tuesday: 'Salsa', wednesday: 'Ballet', thursday: 'Kathak', friday: 'Contemporary', saturday: 'Ballet' },
  { time: '1:00 PM', monday: 'Jazz', tuesday: 'Contemporary', wednesday: 'Hip Hop', thursday: 'Ballet', friday: 'Modern', saturday: 'Belly' },
  { time: '3:00 PM', monday: 'Salsa', tuesday: 'Tap', wednesday: 'Contemporary', thursday: 'Jazz', friday: 'Ballet', saturday: 'Hip Hop' },
  { time: '5:00 PM', monday: 'Tap', tuesday: 'Jazz', wednesday: 'Salsa', thursday: 'Modern', friday: 'Hip Hop', saturday: 'Contemporary' },
];

export const footerData = {
  logo: `${BASE_IMG}/2025/02/logo.png`,
  description: 'Sign Up To Get Updates & News About Us..',
  copyright: 'Copyright © 2025 Dance Theme. All Rights Reserved.',
};
