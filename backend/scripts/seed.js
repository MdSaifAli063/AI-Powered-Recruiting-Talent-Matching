require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Job = require('../models/Job');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hiremind';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('🌱 Connected to MongoDB. Seeding...');

  await User.deleteMany({});
  await Job.deleteMany({});

  // Create recruiters
  const recruiter1 = await User.create({
    name: 'Sarah Chen',
    email: 'sarah@techcorp.com',
    password: 'password123',
    role: 'recruiter',
    company: 'TechCorp',
    title: 'Senior Recruiter',
    location: 'San Francisco, CA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  });

  const recruiter2 = await User.create({
    name: 'Marcus Williams',
    email: 'marcus@innovate.io',
    password: 'password123',
    role: 'recruiter',
    company: 'Innovate.io',
    title: 'Head of Talent',
    location: 'New York, NY',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
  });

  // Create candidates
  const candidates = await User.create([
    {
      name: 'Alex Rivera',
      email: 'alex@candidate.com',
      password: 'password123',
      role: 'candidate',
      title: 'Full Stack Developer',
      location: 'Austin, TX',
      bio: '5+ years building scalable web apps. Passionate about React and Node.js.',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL', 'Redis'],
      profileScore: 82,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      experience: [
        { title: 'Senior Developer', company: 'StartupXYZ', duration: '2021-2024', description: 'Led frontend development for SaaS platform.' },
        { title: 'Developer', company: 'WebAgency', duration: '2019-2021', description: 'Built client websites using React.' }
      ]
    },
    {
      name: 'Priya Patel',
      email: 'priya@candidate.com',
      password: 'password123',
      role: 'candidate',
      title: 'Machine Learning Engineer',
      location: 'Seattle, WA',
      bio: 'ML researcher turned engineer. Love building AI products.',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'MLflow', 'Kubernetes', 'SQL', 'NLP'],
      profileScore: 91,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      experience: [{ title: 'ML Engineer', company: 'AI Startup', duration: '2022-2024', description: 'Built NLP pipelines for text classification.' }]
    },
    {
      name: 'Jordan Kim',
      email: 'jordan@candidate.com',
      password: 'password123',
      role: 'candidate',
      title: 'DevOps Engineer',
      location: 'Chicago, IL',
      bio: 'Infrastructure enthusiast. CI/CD pipelines are my love language.',
      skills: ['Kubernetes', 'Terraform', 'AWS', 'GCP', 'Jenkins', 'Ansible', 'Linux', 'Python'],
      profileScore: 76,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan'
    },
    {
      name: 'Lena Müller',
      email: 'lena@candidate.com',
      password: 'password123',
      role: 'candidate',
      title: 'Product Designer',
      location: 'Remote',
      bio: 'UX designer who codes. Figma → React in one breath.',
      skills: ['Figma', 'UI/UX', 'React', 'CSS', 'User Research', 'Prototyping', 'Design Systems'],
      profileScore: 79,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lena'
    }
  ]);

  // Create jobs
  await Job.create([
    {
      title: 'Senior React Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA (Hybrid)',
      type: 'full-time',
      level: 'senior',
      salary: { min: 140000, max: 180000, currency: 'USD' },
      description: 'We are looking for a Senior React Developer to join our product team. You will own the frontend architecture of our core SaaS platform serving 50k+ users.',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
      requirements: ['5+ years React experience', 'Strong TypeScript skills', 'Experience with GraphQL APIs', 'AWS deployment experience'],
      responsibilities: ['Lead frontend architecture decisions', 'Mentor junior developers', 'Collaborate with design and backend teams'],
      benefits: ['401k matching', 'Health insurance', 'Remote stipend', '$3,000 learning budget'],
      postedBy: recruiter1._id,
      isFeatured: true,
      tags: ['react', 'frontend', 'typescript']
    },
    {
      title: 'ML Engineer - NLP',
      company: 'Innovate.io',
      location: 'New York, NY (Remote OK)',
      type: 'full-time',
      level: 'mid',
      salary: { min: 130000, max: 170000, currency: 'USD' },
      description: 'Join our AI team to build next-generation NLP models powering our document intelligence platform.',
      skills: ['Python', 'PyTorch', 'NLP', 'Transformers', 'MLflow', 'Kubernetes'],
      requirements: ['3+ years ML engineering', 'Hands-on PyTorch/TensorFlow experience', 'NLP/LLM experience preferred'],
      responsibilities: ['Design and train NLP models', 'Deploy models to production', 'Monitor model performance'],
      benefits: ['Stock options', 'Unlimited PTO', 'Top-tier equipment'],
      postedBy: recruiter2._id,
      isFeatured: true,
      tags: ['ml', 'nlp', 'python', 'ai']
    },
    {
      title: 'DevOps / Platform Engineer',
      company: 'TechCorp',
      location: 'Remote',
      type: 'full-time',
      level: 'mid',
      salary: { min: 120000, max: 155000, currency: 'USD' },
      description: 'Build and maintain cloud infrastructure for a rapidly growing SaaS platform. Own the CI/CD pipeline and Kubernetes clusters.',
      skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Docker', 'Python'],
      requirements: ['3+ years DevOps experience', 'Kubernetes expertise', 'Terraform/IaC experience'],
      responsibilities: ['Manage Kubernetes clusters', 'Build CI/CD pipelines', 'Implement security best practices'],
      postedBy: recruiter1._id,
      tags: ['devops', 'kubernetes', 'aws', 'infrastructure']
    },
    {
      title: 'Product Designer (UI/UX)',
      company: 'Innovate.io',
      location: 'New York, NY',
      type: 'full-time',
      level: 'mid',
      salary: { min: 100000, max: 135000, currency: 'USD' },
      description: 'Create beautiful, intuitive interfaces for our AI-powered products. Work closely with engineering to bring designs to life.',
      skills: ['Figma', 'UI/UX', 'User Research', 'Prototyping', 'Design Systems'],
      requirements: ['4+ years product design experience', 'Strong Figma skills', 'Portfolio with shipped products'],
      postedBy: recruiter2._id,
      tags: ['design', 'ui', 'ux', 'figma']
    },
    {
      title: 'Backend Engineer (Node.js)',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      type: 'full-time',
      level: 'mid',
      salary: { min: 125000, max: 160000, currency: 'USD' },
      description: 'Build scalable backend services for our platform. You will work on APIs, data pipelines, and real-time features.',
      skills: ['Node.js', 'PostgreSQL', 'Redis', 'REST APIs', 'Docker', 'AWS'],
      requirements: ['3+ years Node.js experience', 'Database design skills', 'Experience with distributed systems'],
      postedBy: recruiter1._id,
      isFeatured: true,
      tags: ['backend', 'nodejs', 'api']
    },
    {
      title: 'Data Scientist',
      company: 'Innovate.io',
      location: 'Remote',
      type: 'full-time',
      level: 'senior',
      salary: { min: 135000, max: 165000, currency: 'USD' },
      description: 'Drive data-driven decisions across product and marketing. Build predictive models and dashboards.',
      skills: ['Python', 'SQL', 'Machine Learning', 'Tableau', 'Spark', 'Statistics'],
      requirements: ['4+ years data science experience', 'Strong SQL and Python', 'Experience with A/B testing'],
      postedBy: recruiter2._id,
      tags: ['data-science', 'python', 'ml', 'analytics']
    }
  ]);

  console.log('✅ Seed complete!');
  console.log('\n📧 Test Accounts:');
  console.log('  Recruiter: sarah@techcorp.com / password123');
  console.log('  Recruiter: marcus@innovate.io / password123');
  console.log('  Candidate: alex@candidate.com / password123');
  console.log('  Candidate: priya@candidate.com / password123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
