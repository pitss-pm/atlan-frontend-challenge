/**
 * Script to generate sample data JSON file with 10,000+ rows
 * Run with: node scripts/generateSampleData.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOTAL_RECORDS = 10000;

// Sample data pools
const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'James',
  'Mia', 'Alexander', 'Charlotte', 'Michael', 'Amelia', 'Benjamin', 'Harper', 'Elijah', 'Evelyn', 'Daniel',
  'Abigail', 'Henry', 'Emily', 'Sebastian', 'Elizabeth', 'Jack', 'Sofia', 'Aiden', 'Avery', 'Owen',
  'Ella', 'Samuel', 'Scarlett', 'Ryan', 'Grace', 'Nathan', 'Chloe', 'Leo', 'Victoria', 'Isaac',
  'Riley', 'Luke', 'Aria', 'Gabriel', 'Lily', 'Anthony', 'Aurora', 'Dylan', 'Zoey', 'Lincoln'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const DEPARTMENTS = [
  'Engineering', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Operations', 
  'Customer Support', 'Product', 'Design', 'Legal', 'IT', 'Research', 'Quality Assurance'
];

const JOB_TITLES = [
  'Software Engineer', 'Senior Developer', 'Product Manager', 'Data Analyst', 'UX Designer',
  'Sales Representative', 'Marketing Specialist', 'HR Coordinator', 'Financial Analyst', 'Operations Manager',
  'Customer Support Agent', 'DevOps Engineer', 'QA Engineer', 'Technical Lead', 'Business Analyst',
  'Project Manager', 'Account Executive', 'Content Writer', 'Graphic Designer', 'System Administrator',
  'Database Administrator', 'Security Analyst', 'Network Engineer', 'Scrum Master', 'Solutions Architect'
];

const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 
  'San Diego', 'Dallas', 'Austin', 'San Francisco', 'Seattle', 'Denver', 'Boston', 'Atlanta',
  'Miami', 'Portland', 'Las Vegas', 'Detroit', 'Minneapolis', 'Orlando', 'Nashville', 'Charlotte'
];

const COUNTRIES = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia', 'Japan', 'India', 'Brazil', 'Mexico'];

const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.io', 'work.com', 'email.org'];

// Seeded random number generator for reproducibility
class SeededRandom {
  constructor(seed = 12345) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
  
  pick(arr) {
    return arr[Math.floor(this.next() * arr.length)];
  }
  
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  float(min, max, decimals = 2) {
    return parseFloat((this.next() * (max - min) + min).toFixed(decimals));
  }
  
  date(startYear, endYear) {
    const start = new Date(startYear, 0, 1).getTime();
    const end = new Date(endYear, 11, 31).getTime();
    const randomTime = start + this.next() * (end - start);
    return new Date(randomTime).toISOString().split('T')[0];
  }
  
  boolean(probability = 0.5) {
    return this.next() < probability;
  }
}

function generateData() {
  const rng = new SeededRandom(42);
  const rows = [];
  
  for (let i = 1; i <= TOTAL_RECORDS; i++) {
    const firstName = rng.pick(FIRST_NAMES);
    const lastName = rng.pick(LAST_NAMES);
    
    rows.push({
      id: i,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${rng.pick(DOMAINS)}`,
      department: rng.pick(DEPARTMENTS),
      job_title: rng.pick(JOB_TITLES),
      salary: rng.int(35000, 250000),
      hire_date: rng.date(2015, 2024),
      is_active: rng.boolean(0.85),
      city: rng.pick(CITIES),
      country: rng.pick(COUNTRIES),
      performance_score: rng.float(1.0, 5.0, 1)
    });
  }
  
  return rows;
}

function main() {
  console.log(`Generating ${TOTAL_RECORDS} sample records...`);
  
  const data = {
    metadata: {
      totalRecords: TOTAL_RECORDS,
      generatedAt: new Date().toISOString(),
      description: 'Sample employee data for SQL Runner demo',
      seed: 42
    },
    columns: [
      { key: 'id', label: 'ID', type: 'number', width: 80, visible: true },
      { key: 'first_name', label: 'First Name', type: 'string', width: 120, visible: true },
      { key: 'last_name', label: 'Last Name', type: 'string', width: 120, visible: true },
      { key: 'email', label: 'Email', type: 'string', width: 220, visible: true },
      { key: 'department', label: 'Department', type: 'string', width: 130, visible: true },
      { key: 'job_title', label: 'Job Title', type: 'string', width: 150, visible: true },
      { key: 'salary', label: 'Salary', type: 'number', width: 100, visible: true },
      { key: 'hire_date', label: 'Hire Date', type: 'date', width: 110, visible: true },
      { key: 'is_active', label: 'Active', type: 'boolean', width: 80, visible: true },
      { key: 'city', label: 'City', type: 'string', width: 120, visible: true },
      { key: 'country', label: 'Country', type: 'string', width: 100, visible: true },
      { key: 'performance_score', label: 'Performance', type: 'number', width: 110, visible: true }
    ],
    rows: generateData()
  };
  
  const outputPath = path.join(__dirname, '..', 'public', 'data', 'sampleData.json');
  const outputDir = path.dirname(outputPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  const stats = fs.statSync(outputPath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`✓ Generated ${outputPath}`);
  console.log(`  - ${TOTAL_RECORDS} records`);
  console.log(`  - ${fileSizeMB} MB`);
}

main();

