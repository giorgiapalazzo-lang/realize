import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

console.log('Server starting...');

let Database: any;
try {
  // Try standard import first for tsx compatibility
  const betterSqlite3 = await import('better-sqlite3');
  Database = betterSqlite3.default || betterSqlite3;
  console.log('better-sqlite3 loaded successfully');
} catch (err) {
  console.warn('Failed to load better-sqlite3, using in-memory mock:', err);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use /tmp for SQLite on Vercel to allow write access (temporary)
const dbPath = process.env.VERCEL ? '/tmp/database.db' : path.join(process.cwd(), 'database.db');
let db: any;

// Simple in-memory store for fallback
const memoryStore: Record<string, any[]> = {
  users: [],
  influencers: [],
  pricing_items: [],
  case_studies: [],
  access_grants: [],
  shortlist_items: [],
  briefs: []
};

if (Database) {
  try {
    db = new Database(dbPath);
    console.log(`Database connected at ${dbPath}`);
  } catch (err) {
    console.error('Failed to connect to database file, using :memory::', err);
    db = new Database(':memory:');
  }
} else {
  console.warn('Database class not available, creating functional mock db object');
  db = {
    exec: () => {},
    prepare: (sql: string) => ({
      get: (...params: any[]) => {
        const lowerSql = sql.toLowerCase();
        if (lowerSql.includes('count(*)')) {
          if (lowerSql.includes('from users')) return { count: memoryStore.users.length };
          if (lowerSql.includes('from influencers')) return { count: memoryStore.influencers.length };
          return { count: 0 };
        }
        if (lowerSql.includes('from users where email = ?')) {
          return memoryStore.users.find(u => u.email === params[0]) || null;
        }
        if (lowerSql.includes('from users where id = ?')) {
          return memoryStore.users.find(u => u.id === params[0]) || null;
        }
        if (lowerSql.includes('from influencers where id = ?')) {
          return memoryStore.influencers.find(i => i.id === Number(params[0])) || null;
        }
        return null;
      },
      run: (...params: any[]) => {
        const lowerSql = sql.toLowerCase();
        if (lowerSql.includes('insert into users')) {
          let newUser: any;
          if (sql.includes('(id, name, email, password_hash, role)')) {
            newUser = { id: params[0], name: params[1], email: params[2], password_hash: params[3], role: params[4] };
          } else if (sql.includes('(name, email, password_hash, role)')) {
            newUser = { id: memoryStore.users.length + 1, name: params[0], email: params[1], password_hash: params[2], role: params[3] };
          } else {
            newUser = { id: memoryStore.users.length + 1, email: params[0], password_hash: params[1], name: params[2], role: params[3] };
          }
          memoryStore.users.push(newUser);
          return { lastInsertRowid: newUser.id };
        }
        if (lowerSql.includes('insert into influencers')) {
          const influencer = { id: memoryStore.influencers.length + 1, name: params[0], avatar_url: params[1], bio_short: params[2], verticals: params[3], languages: params[4], location: params[5], engagement_rate: params[11], follower_ig: params[12] };
          memoryStore.influencers.push(influencer);
          return { lastInsertRowid: influencer.id };
        }
        if (lowerSql.includes('insert into pricing_items')) {
          memoryStore.pricing_items.push({ influencer_id: params[0], label: params[1], min_price: params[2], max_price: params[3], currency: params[4] });
        }
        if (lowerSql.includes('insert into case_studies')) {
          memoryStore.case_studies.push({ influencer_id: params[0], title: params[1], brand: params[2], objective: params[3], deliverables: params[4], results_kpi: params[5] });
        }
        if (lowerSql.includes('insert into access_grants')) {
          memoryStore.access_grants.push({ media_center_id: params[0], influencer_id: params[1] });
        }
        return { lastInsertRowid: 1 };
      },
      all: (...params: any[]) => {
        const lowerSql = sql.toLowerCase();
        if (lowerSql.includes('from influencers')) {
          return memoryStore.influencers;
        }
        if (lowerSql.includes('from pricing_items')) {
          return memoryStore.pricing_items.filter(p => p.influencer_id === Number(params[0]));
        }
        if (lowerSql.includes('from case_studies')) {
          return memoryStore.case_studies.filter(c => c.influencer_id === Number(params[0]));
        }
        if (lowerSql.includes('from briefs')) {
          return memoryStore.briefs.filter(b => b.media_center_id === params[0]);
        }
        return [];
      }
    })
  };
}
const JWT_SECRET = process.env.JWT_SECRET || 'influencer-portal-secret-key';

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL -- 'admin' or 'media_center'
  );

  CREATE TABLE IF NOT EXISTS influencers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar_url TEXT,
    bio_short TEXT,
    verticals TEXT, -- JSON array
    languages TEXT, -- JSON array
    location TEXT,
    works_abroad INTEGER DEFAULT 0,
    available_for_events INTEGER DEFAULT 0,
    does_collabs INTEGER DEFAULT 0,
    available_ambassador INTEGER DEFAULT 0,
    professional INTEGER DEFAULT 0,
    engagement_rate REAL,
    follower_ig INTEGER,
    follower_tiktok INTEGER,
    follower_yt INTEGER,
    project_types TEXT, -- JSON array
    media_tv INTEGER DEFAULT 0,
    media_radio INTEGER DEFAULT 0,
    media_press INTEGER DEFAULT 0,
    media_notes TEXT,
    strengths TEXT
  );

  CREATE TABLE IF NOT EXISTS pricing_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    influencer_id INTEGER,
    label TEXT,
    min_price REAL,
    max_price REAL,
    currency TEXT,
    FOREIGN KEY(influencer_id) REFERENCES influencers(id)
  );

  CREATE TABLE IF NOT EXISTS case_studies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    influencer_id INTEGER,
    title TEXT,
    brand TEXT,
    objective TEXT,
    deliverables TEXT,
    results_kpi TEXT,
    link TEXT,
    FOREIGN KEY(influencer_id) REFERENCES influencers(id)
  );

  CREATE TABLE IF NOT EXISTS access_grants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_center_id INTEGER,
    influencer_id INTEGER,
    FOREIGN KEY(media_center_id) REFERENCES users(id),
    FOREIGN KEY(influencer_id) REFERENCES influencers(id)
  );

  CREATE TABLE IF NOT EXISTS shortlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_center_id INTEGER,
    influencer_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(media_center_id) REFERENCES users(id),
    FOREIGN KEY(influencer_id) REFERENCES influencers(id)
  );

  CREATE TABLE IF NOT EXISTS briefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_center_id INTEGER,
    campaign_name TEXT,
    brand_name TEXT,
    brand_values TEXT,
    objectives TEXT, -- JSON array
    target_audience TEXT,
    budget TEXT,
    timeline TEXT,
    creative_direction TEXT,
    key_messages TEXT,
    competitors TEXT,
    notes TEXT,
    influencer_ids TEXT, -- JSON array of selected influencer IDs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(media_center_id) REFERENCES users(id)
  );
`);

// Seed Data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const adminHash = bcrypt.hashSync('admin123', 10);
  const mediaHash = bcrypt.hashSync('media123', 10);
  
  // Ensure demo users exist with fixed IDs to satisfy foreign key constraints
  db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(999, 'Demo User', 'demo@realize.com', adminHash, 'admin');
  db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(888, 'Demo Login User', 'guest@realize.com', mediaHash, 'media_center');
  
  db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run('Admin User', 'admin@portal.com', adminHash, 'admin');
  const mediaId = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run('Global Media Agency', 'media@center.com', mediaHash, 'media_center').lastInsertRowid;

  // Seed Influencers
  const influencers = [
    {
      name: 'Benedetta Parodi',
      avatar_url: 'https://www.realizenetworks.com/wp-content/uploads/2023/05/benedetta-parodi.jpg',
      bio_short: 'The queen of Italian cooking and lifestyle.',
      verticals: JSON.stringify(['Cooking', 'Lifestyle', 'TV']),
      languages: JSON.stringify(['Italian']),
      location: 'Milan, Italy',
      works_abroad: 0,
      available_for_events: 1,
      does_collabs: 1,
      available_ambassador: 1,
      professional: 1,
      engagement_rate: 4.2,
      follower_ig: 1100000,
      project_types: JSON.stringify(['IG Reel', 'TV Guest', 'Book Launch']),
      media_tv: 1,
      media_press: 1,
      strengths: 'Highest credibility in food, household name, premium audience.'
    },
    {
      name: 'Luca Pappagallo',
      avatar_url: 'https://www.realizenetworks.com/wp-content/uploads/2023/05/luca-pappagallo.jpg',
      bio_short: 'Authentic cooking and traditional Italian flavors.',
      verticals: JSON.stringify(['Food', 'Tradition', 'Family']),
      languages: JSON.stringify(['Italian']),
      location: 'Grosseto, Italy',
      works_abroad: 0,
      available_for_events: 1,
      does_collabs: 1,
      available_ambassador: 1,
      professional: 1,
      engagement_rate: 5.8,
      follower_ig: 1800000,
      follower_tiktok: 500000,
      project_types: JSON.stringify(['Video Recipe', 'Events', 'UGC']),
      media_tv: 1,
      media_radio: 1,
      strengths: 'Extremely high engagement, cross-platform success, authentic voice.'
    },
    {
      name: 'Mocho',
      avatar_url: 'https://www.realizenetworks.com/wp-content/uploads/2023/05/mocho.jpg',
      bio_short: 'American food expert and street food explorer.',
      verticals: JSON.stringify(['Street Food', 'Travel', 'Entertainment']),
      languages: JSON.stringify(['Italian', 'English']),
      location: 'Milan, Italy',
      works_abroad: 1,
      available_for_events: 1,
      does_collabs: 1,
      available_ambassador: 1,
      professional: 1,
      engagement_rate: 6.5,
      follower_ig: 450000,
      follower_yt: 300000,
      project_types: JSON.stringify(['YouTube Series', 'Events', 'PR']),
      media_tv: 1,
      strengths: 'Niche authority, high production value, young male audience.'
    },
    {
      name: 'Cristina Parodi',
      avatar_url: 'https://www.realizenetworks.com/wp-content/uploads/2023/05/cristina-parodi.jpg',
      bio_short: 'Journalist, TV host and fashion entrepreneur.',
      verticals: JSON.stringify(['Journalism', 'Fashion', 'Elegance']),
      languages: JSON.stringify(['Italian', 'English', 'French']),
      location: 'Bergamo, Italy',
      works_abroad: 1,
      available_for_events: 1,
      does_collabs: 0,
      available_ambassador: 1,
      professional: 1,
      engagement_rate: 2.1,
      follower_ig: 500000,
      project_types: JSON.stringify(['Ambassador', 'Press', 'Luxury Events']),
      media_tv: 1,
      media_press: 1,
      strengths: 'Unmatched elegance, institutional credibility, luxury positioning.'
    },
    {
      name: 'Ida Di Filippo',
      avatar_url: 'https://www.realizenetworks.com/wp-content/uploads/2023/05/ida-di-filippo.jpg',
      bio_short: 'Real estate expert and TV personality.',
      verticals: JSON.stringify(['Real Estate', 'Lifestyle', 'Home']),
      languages: JSON.stringify(['Italian']),
      location: 'Salerno, Italy',
      works_abroad: 0,
      available_for_events: 1,
      does_collabs: 1,
      available_ambassador: 1,
      professional: 1,
      engagement_rate: 3.9,
      follower_ig: 250000,
      project_types: JSON.stringify(['IG Reel', 'Events', 'TV']),
      media_tv: 1,
      strengths: 'Spontaneous and engaging, strong TV presence, home niche leader.'
    },
    {
      name: 'Tommaso Foglia',
      avatar_url: 'https://www.realizenetworks.com/wp-content/uploads/2023/05/tommaso-foglia.jpg',
      bio_short: 'Pastry chef and TV judge.',
      verticals: JSON.stringify(['Pastry', 'Fine Dining', 'TV']),
      languages: JSON.stringify(['Italian']),
      location: 'Naples, Italy',
      works_abroad: 1,
      available_for_events: 1,
      does_collabs: 1,
      available_ambassador: 1,
      professional: 1,
      engagement_rate: 4.5,
      follower_ig: 150000,
      project_types: JSON.stringify(['Masterclass', 'Shooting', 'TV']),
      media_tv: 1,
      strengths: 'Technical excellence, professional authority, rising TV star.'
    },
    {
      name: 'Michela Coppa',
      avatar_url: 'https://www.realizenetworks.com/wp-content/uploads/2023/05/michela-coppa.jpg',
      bio_short: 'Wellness, yoga and healthy living expert.',
      verticals: JSON.stringify(['Wellness', 'Yoga', 'Healthy Food']),
      languages: JSON.stringify(['Italian']),
      location: 'Milan, Italy',
      works_abroad: 0,
      available_for_events: 1,
      does_collabs: 1,
      available_ambassador: 1,
      professional: 1,
      engagement_rate: 3.2,
      follower_ig: 400000,
      project_types: JSON.stringify(['Yoga Class', 'Ambassador', 'IG Reel']),
      media_tv: 1,
      strengths: 'Clean image, health-conscious audience, consistent engagement.'
    },
    {
      name: 'Damiano Carrara',
      avatar_url: 'https://www.realizenetworks.com/wp-content/uploads/2023/05/damiano-carrara.jpg',
      bio_short: 'World-renowned pastry chef and TV personality.',
      verticals: JSON.stringify(['Pastry', 'Lifestyle', 'TV']),
      languages: JSON.stringify(['Italian', 'English']),
      location: 'Lucca, Italy',
      works_abroad: 1,
      available_for_events: 1,
      does_collabs: 1,
      available_ambassador: 1,
      professional: 1,
      engagement_rate: 5.1,
      follower_ig: 1300000,
      project_types: JSON.stringify(['TV Show', 'Ambassador', 'Shooting']),
      media_tv: 1,
      strengths: 'Massive female audience, international appeal, top-tier production.'
    }
  ];

  for (const inf of influencers) {
    const id = db.prepare(`
      INSERT INTO influencers (
        name, avatar_url, bio_short, verticals, languages, location, 
        works_abroad, available_for_events, does_collabs, available_ambassador, 
        professional, engagement_rate, follower_ig, follower_tiktok, project_types, 
        media_tv, media_radio, media_press, strengths
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      inf.name, inf.avatar_url, inf.bio_short, inf.verticals, inf.languages, inf.location,
      inf.works_abroad, inf.available_for_events, inf.does_collabs, inf.available_ambassador,
      inf.professional, inf.engagement_rate, inf.follower_ig || null, inf.follower_tiktok || null,
      inf.project_types, inf.media_tv || 0, inf.media_radio || 0, inf.media_press || 0, inf.strengths
    ).lastInsertRowid;

    // Add Pricing
    db.prepare('INSERT INTO pricing_items (influencer_id, label, min_price, max_price, currency) VALUES (?, ?, ?, ?, ?)').run(id, 'IG Reel', 5000, 15000, 'EUR');
    db.prepare('INSERT INTO pricing_items (influencer_id, label, min_price, max_price, currency) VALUES (?, ?, ?, ?, ?)').run(id, 'TikTok Video', 3000, 10000, 'EUR');
    db.prepare('INSERT INTO pricing_items (influencer_id, label, min_price, max_price, currency) VALUES (?, ?, ?, ?, ?)').run(id, 'Ambassador (Monthly)', 20000, 50000, 'EUR');

    // Add Case Studies
    db.prepare('INSERT INTO case_studies (influencer_id, title, brand, objective, deliverables, results_kpi) VALUES (?, ?, ?, ?, ?, ?)').run(id, 'Summer Campaign', 'Luxury Brand', 'Brand Awareness', '3 Reels, 5 Stories', '2M Impressions, 5% CTR');
    db.prepare('INSERT INTO case_studies (influencer_id, title, brand, objective, deliverables, results_kpi) VALUES (?, ?, ?, ?, ?, ?)').run(id, 'Product Launch', 'Tech Co', 'Lead Generation', '1 YouTube Video', '50k Clicks, 2k Conversions');
    db.prepare('INSERT INTO case_studies (influencer_id, title, brand, objective, deliverables, results_kpi) VALUES (?, ?, ?, ?, ?, ?)').run(id, 'Event Presence', 'Fashion Week', 'Hype Generation', 'Live Coverage', '500k Live Views');

    // Grant access to the demo media center
    db.prepare('INSERT INTO access_grants (media_center_id, influencer_id) VALUES (?, ?)').run(mediaId, id);
    // Also grant access to the demo users
    db.prepare('INSERT INTO access_grants (media_center_id, influencer_id) VALUES (?, ?)').run(999, id);
    db.prepare('INSERT INTO access_grants (media_center_id, influencer_id) VALUES (?, ?)').run(888, id);
  }
}

// Ensure demo users exist even if DB was already seeded
try {
  const demoAdmin = db.prepare('SELECT * FROM users WHERE id = 999').get();
  if (!demoAdmin) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(999, 'Demo User', 'demo@realize.com', hash, 'admin');
  }
  const demoGuest = db.prepare('SELECT * FROM users WHERE id = 888').get();
  if (!demoGuest) {
    const hash = bcrypt.hashSync('media123', 10);
    db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(888, 'Demo Login User', 'guest@realize.com', hash, 'media_center');
  }
} catch (e) {
  console.warn('Note: Could not ensure demo users exist (might be using mock DB):', e);
}

export const app = express();
export default app;
app.use(express.json());
app.use(cookieParser());

// Helper for auth middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  
  // PERMISSIVE AUTH FOR DEMO: If no token, provide a default demo user
  if (!token) {
    req.user = { id: 999, email: 'demo@realize.com', role: 'admin', name: 'Demo User' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // If token is invalid, also provide a default demo user instead of failing
    req.user = { id: 999, email: 'demo@realize.com', role: 'admin', name: 'Demo User' };
    next();
  }
};

// API Routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role } = req.body;
  
  // Check if user exists
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const result = db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(email, hashedPassword, name, role || 'media_center');
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as any;
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ id: user.id, email: user.email, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Hardcoded fallback for demo credentials to ensure access in all environments
    if ((email === 'media@center.com' && password === 'media123') || 
        (email === 'admin@portal.com' && password === 'admin123')) {
      const role = email.includes('admin') ? 'admin' : 'media_center';
      const name = email.includes('admin') ? 'Admin User' : 'Media Agency';
      const token = jwt.sign({ id: 999, email, role, name }, JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      return res.json({ id: 999, email, role, name });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    // PERMISSIVE LOGIN FOR DEMO: If user not found, allow login with any password as a new demo user
    if (!user) {
      console.log(`Demo login: Auto-creating user for ${email}`);
      const role = email.includes('admin') ? 'admin' : 'media_center';
      const name = email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      const token = jwt.sign({ id: 888, email, role, name }, JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      return res.json({ id: 888, email, role, name });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ id: user.id, email: user.email, role: user.role, name: user.name });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not logged in' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json(decoded);
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.get('/api/influencers', authenticate, (req: any, res) => {
    let query = `
      SELECT i.*, 
      (SELECT COUNT(*) FROM case_studies cs WHERE cs.influencer_id = i.id) > 0 as has_case_studies
      FROM influencers i
    `;
    const params: any[] = [];

    query += ` WHERE 1=1`;

    const influencers = db.prepare(query).all(...params) as any[];
    res.json(influencers.map(inf => {
      // Generate mock analytics for demo
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const follower_growth = months.map((month, i) => ({
        name: month,
        value: (inf.follower_ig || 100000) + (i * 15000) + Math.floor(Math.random() * 5000)
      }));
      const engagement_trends = months.map((month, i) => ({
        name: month,
        value: (inf.engagement_rate || 4.0) + (Math.sin(i) * 0.5) + (Math.random() * 0.2)
      }));
      const campaign_roi = [
        { name: 'Spring 24', value: 3.2 + Math.random() },
        { name: 'Summer 24', value: 4.5 + Math.random() },
        { name: 'Autumn 24', value: 3.8 + Math.random() }
      ];

      return {
        ...inf,
        verticals: JSON.parse(inf.verticals || '[]'),
        languages: JSON.parse(inf.languages || '[]'),
        project_types: JSON.parse(inf.project_types || '[]'),
        has_case_studies: !!inf.has_case_studies,
        analytics: {
          follower_growth,
          engagement_trends,
          campaign_roi
        }
      };
    }));
  });

  app.get('/api/influencers/:id', authenticate, (req: any, res) => {
    const influencer = db.prepare('SELECT * FROM influencers WHERE id = ?').get(req.params.id) as any;
    if (!influencer) return res.status(404).json({ error: 'Not found' });

    const pricing = db.prepare('SELECT * FROM pricing_items WHERE influencer_id = ?').all(influencer.id);
    const caseStudies = db.prepare('SELECT * FROM case_studies WHERE influencer_id = ?').all(influencer.id);

    // Generate mock analytics for demo
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const follower_growth = months.map((month, i) => ({
      name: month,
      value: (influencer.follower_ig || 100000) + (i * 15000) + Math.floor(Math.random() * 5000)
    }));
    const engagement_trends = months.map((month, i) => ({
      name: month,
      value: (influencer.engagement_rate || 4.0) + (Math.sin(i) * 0.5) + (Math.random() * 0.2)
    }));
    const campaign_roi = [
      { name: 'Spring 24', value: 3.2 + Math.random() },
      { name: 'Summer 24', value: 4.5 + Math.random() },
      { name: 'Autumn 24', value: 3.8 + Math.random() }
    ];

    res.json({
      ...influencer,
      verticals: JSON.parse(influencer.verticals || '[]'),
      languages: JSON.parse(influencer.languages || '[]'),
      project_types: JSON.parse(influencer.project_types || '[]'),
      pricing_items: pricing,
      case_studies: caseStudies,
      analytics: {
        follower_growth,
        engagement_trends,
        campaign_roi
      }
    });
  });

  app.get('/api/shortlist', authenticate, (req: any, res) => {
    const items = db.prepare(`
      SELECT i.* FROM influencers i
      JOIN shortlist_items si ON i.id = si.influencer_id
      WHERE si.media_center_id = ?
    `).all(req.user.id) as any[];
    
    res.json(items.map(inf => ({
      ...inf,
      verticals: JSON.parse(inf.verticals || '[]'),
      languages: JSON.parse(inf.languages || '[]'),
      project_types: JSON.parse(inf.project_types || '[]')
    })));
  });

  app.post('/api/shortlist/:id', authenticate, (req: any, res) => {
    const exists = db.prepare('SELECT * FROM shortlist_items WHERE media_center_id = ? AND influencer_id = ?').get(req.user.id, req.params.id);
    if (exists) return res.json({ success: true });
    
    db.prepare('INSERT INTO shortlist_items (media_center_id, influencer_id) VALUES (?, ?)').run(req.user.id, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/shortlist/:id', authenticate, (req: any, res) => {
    db.prepare('DELETE FROM shortlist_items WHERE media_center_id = ? AND influencer_id = ?').run(req.user.id, req.params.id);
    res.json({ success: true });
  });

  app.post('/api/briefs', authenticate, (req: any, res) => {
    const { 
      campaignName, brandName, brandValues, objectives, targetAudience, 
      budget, timeline, creativeDirection, keyMessages, competitors, notes, influencerIds 
    } = req.body;

    const result = db.prepare(`
      INSERT INTO briefs (
        media_center_id, campaign_name, brand_name, brand_values, objectives, 
        target_audience, budget, timeline, creative_direction, key_messages, 
        competitors, notes, influencer_ids
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id, campaignName, brandName, brandValues, JSON.stringify(objectives),
      targetAudience, budget, timeline, creativeDirection, keyMessages,
      competitors, notes, JSON.stringify(influencerIds)
    );

    res.json({ id: result.lastInsertRowid });
  });

  app.get('/api/briefs', authenticate, (req: any, res) => {
    const briefs = db.prepare('SELECT * FROM briefs WHERE media_center_id = ? ORDER BY created_at DESC').all(req.user.id) as any[];
    res.json(briefs.map(b => ({
      ...b,
      objectives: JSON.parse(b.objectives || '[]'),
      influencer_ids: JSON.parse(b.influencer_ids || '[]')
    })));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    }).then(vite => {
      app.use(vite.middlewares);
    });
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      res.sendFile(indexPath);
    });
  }

  const PORT = process.env.PORT || 3000;
  
  if (!process.env.VERCEL) {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
