const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Sharp = require('../models/sharp');
const Review = require('../models/review');
const User = require('../models/user');

mongoose.connect('mongodb://localhost:27017/sharp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const sharpImages = [
    { url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png', filename: 'YelpCamp/ahfnenvca4tha00h2ubt' },
    { url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png', filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi' },
    { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', filename: 'unsplash/campsite1' },
    { url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800', filename: 'unsplash/campsite2' },
    { url: 'https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=800', filename: 'unsplash/campsite3' },
    { url: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800', filename: 'unsplash/campsite4' },
    { url: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=800', filename: 'unsplash/campsite5' },
    { url: 'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?w=800', filename: 'unsplash/campsite6' },
    { url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800', filename: 'unsplash/campsite7' },
    { url: 'https://images.unsplash.com/photo-1504851149312-7ad075b934e7?w=800', filename: 'unsplash/campsite8' },
    { url: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800', filename: 'unsplash/campsite9' },
    { url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=800', filename: 'unsplash/campsite10' },
    { url: 'https://images.unsplash.com/photo-1484960055659-a39d25adcb3c?w=800', filename: 'unsplash/campsite11' },
    { url: 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800', filename: 'unsplash/campsite12' },
    { url: 'https://images.unsplash.com/photo-1537565266759-34bbc16be345?w=800', filename: 'unsplash/campsite13' },
    { url: 'https://images.unsplash.com/photo-1471115853179-bb1d604434e0?w=800', filename: 'unsplash/campsite14' },
    { url: 'https://images.unsplash.com/photo-1526491109672-74740652b963?w=800', filename: 'unsplash/campsite15' },
    { url: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800', filename: 'unsplash/campsite16' },
    { url: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=800', filename: 'unsplash/campsite17' },
    { url: 'https://images.unsplash.com/photo-1515408320194-59643816c5b2?w=800', filename: 'unsplash/campsite18' },
    { url: 'https://images.unsplash.com/photo-1532339142463-fd0a8979791a?w=800', filename: 'unsplash/campsite19' },
];

const descOptions = [
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium.',
    'A beautiful spot nestled among the trees with stunning views of the surrounding landscape.',
    'Perfect getaway for those seeking peace and quiet. The stars at night are absolutely breathtaking.',
    'Rugged terrain with challenging hikes but totally worth it for the panoramic views at the summit.',
    'Crystal clear waters and soft sandy shores make this a perfect summer destination.',
    'Hidden gem off the beaten path. Quiet, serene, and the wildlife is incredible.',
    'Family-friendly location with plenty of activities for kids and adults alike.',
    'Remote and wild - this is where you go to truly disconnect from the modern world.',
    'Stunning autumn colors make this spot a photographer\'s dream. Highly recommended in October.',
    'The fishing here is world-class. Caught my personal best right off the dock.',
    'Rolling hills and endless meadows - feels like something out of a painting.',
    'Incredible rock formations and geological wonders around every corner.',
    'A cozy retreat with a warm, welcoming atmosphere. The hosts are fantastic.',
    'Adventure seekers will love the white water rapids and climbing spots nearby.',
    'Sunrise over the mountains here is something everyone should experience at least once.',
    'Dense forests, chirping birds, and fresh pine air - nature at its finest.',
    'Great spot for winter sports. The snow-covered trails are magical.',
    'An unexpected oasis in the desert. The contrast of green against the sand is stunning.',
    'The local food scene around here is amazing - worth the trip just for that.',
    'Perfect base camp for exploring the surrounding national parks and monuments.',
];

const reviewBodies = [
    'Absolutely loved this place! Will definitely be coming back next year.',
    'Great location, clean facilities, and friendly atmosphere.',
    'The views were incredible but the bugs were pretty intense in the evening.',
    'Perfect for a weekend getaway. Not too crowded when we went.',
    'Really enjoyed our stay. The hiking trails nearby are amazing.',
    'Could use some maintenance but overall a nice spot.',
    'Best camping trip we\'ve ever had. Kids loved it!',
    'The map coordinates were a bit off. Took us a while to find it.',
    'Stunning scenery and peaceful. Exactly what we needed.',
    'Well worth the drive. The pictures don\'t do it justice.',
    'Met some wonderful people here. Great community vibe.',
    'A bit muddy in the spring but still beautiful.',
    'Great value for the price. Will recommend to friends.',
    'The sunsets here are unreal. Bring a good camera!',
    'Quiet and secluded. Perfect for some alone time in nature.',
];

const seedDB = async () => {
    // Clear existing data
    await Sharp.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create test users
    const demo = await User.register(
        new User({ email: 'demo@sharps.com', username: 'demo' }),
        'password123'
    );
    const alice = await User.register(
        new User({ email: 'alice@sharps.com', username: 'alice' }),
        'password123'
    );
    const bob = await User.register(
        new User({ email: 'bob@sharps.com', username: 'bob' }),
        'password123'
    );
    const users = [demo, alice, bob];
    console.log('Created 3 test users (demo, alice, bob - password: password123)');

    // Create sharps
    const sharpIds = [];
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 50) + 5;
        const numImages = Math.floor(Math.random() * 3) + 1;
        const images = [];
        for (let j = 0; j < numImages; j++) {
            images.push(sample(sharpImages));
        }
        const sharp = new Sharp({
            author: sample(users)._id,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: sample(descOptions),
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images
        });
        await sharp.save();
        sharpIds.push(sharp._id);
    }
    console.log(`Created ${sharpIds.length} sharps`);

    // Create reviews
    let reviewCount = 0;
    for (const sharpId of sharpIds) {
        // 30% chance of having reviews
        if (Math.random() < 0.3) {
            const numReviews = Math.floor(Math.random() * 3) + 1;
            for (let r = 0; r < numReviews; r++) {
                const review = new Review({
                    body: sample(reviewBodies),
                    rating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
                    author: sample(users)._id,
                });
                await review.save();
                await Sharp.findByIdAndUpdate(sharpId, {
                    $push: { reviews: review._id }
                });
                reviewCount++;
            }
        }
    }
    console.log(`Created ${reviewCount} reviews`);

    console.log('\n--- Seeding Complete ---');
    console.log('Login credentials:');
    console.log('  username: demo  | password: password123');
    console.log('  username: alice | password: password123');
    console.log('  username: bob   | password: password123');
};

seedDB().then(() => {
    mongoose.connection.close();
    process.exit(0);
}).catch(err => {
    console.error('Seed error:', err);
    mongoose.connection.close();
    process.exit(1);
});
