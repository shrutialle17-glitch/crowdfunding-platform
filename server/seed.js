require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');
const Campaign = require('./src/models/Campaign');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);

    /* 1. Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@kindfund.com',
      passwordHash,
      role: 'admin',
      isVerified: true
    });

    // 2. Create Creator
    const creator = await User.create({
      name: 'Jane Creator',
      email: 'creator@kindfund.com',
      passwordHash,
      role: 'creator',
      isVerified: true,
      bio: 'I love making tech accessible to everyone.'
    });

    // 3. Create Donor
    const donor = await User.create({
      name: 'John Donor',
      email: 'donor@kindfund.com',
      passwordHash,
      role: 'donor',
      isVerified: true
    });

    console.log('Created Users:');
    console.log(`Admin: ${admin.email} / Password123`);
    console.log(`Creator: ${creator.email} / Password123`);
    console.log(`Donor: ${donor.email} / Password123`);*/

    // 4. Create some Campaigns for the creator
    await Campaign.create([
      {
        title: 'Clean Water for Rural Villages',
        shortDescription: 'Help us build 5 wells in rural areas without access to clean drinking water.',
        fullStory: 'Access to clean water is a fundamental human right, yet many rural villages still rely on contaminated sources. This campaign aims to construct 5 sustainable wells in severely affected areas. The funds will be used for geological surveying, drilling, installing hand pumps, and conducting community hygiene workshops to ensure long-term health benefits. Your contribution directly reduces waterborne diseases and empowers these communities.',
        fundingGoal: 500000,
        amountRaised: 125000,
        creator: '6a421f4252e3a0a8d3c007d0',
        category: 'Community Development',
        status: 'approved',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        location: 'Rural Rajasthan, India',
        coverImage: {
          url: 'https://images.unsplash.com/photo-1541819050961-d70c9ddf0bba?q=80&w=1600&auto=format&fit=crop',
          publicId: 'seed_image_1'
        }
      },
      {
        title: 'Tech Education for Underprivileged Kids',
        shortDescription: 'Providing laptops and coding classes to 100 students.',
        fullStory: 'In the digital age, tech literacy is essential for escaping the cycle of poverty. We are partnering with local community centers to provide 100 refurbished laptops and 6 months of comprehensive coding bootcamps for underprivileged youth. This initiative will equip them with valuable skills in HTML, CSS, and basic JavaScript, opening doors to future employment opportunities. Join us in bridging the digital divide.',
        fundingGoal: 200000,
        amountRaised: 180000,
        creator: '6a421f4252e3a0a8d3c007d0',
        category: 'Education',
        status: 'approved',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        location: 'Mumbai, India',
        coverImage: {
          url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1600&auto=format&fit=crop',
          publicId: 'seed_image_2'
        }
      }
    ]);

    console.log('Created Campaigns');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
