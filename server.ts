import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use /tmp for SQLite on Vercel to allow write access (temporary)
const dbPath = process.env.VERCEL ? '/tmp/database.db' : 'database.db';
const db = new Database(dbPath);
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
  }
}

export const app = express();

async function startServer() {
  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // API Routes
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
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

    if (req.user.role === 'media_center') {
      query += ` JOIN access_grants ag ON i.id = ag.influencer_id WHERE ag.media_center_id = ?`;
      params.push(req.user.id);
    } else {
        query += ` WHERE 1=1`;
    }

    const influencers = db.prepare(query).all(...params) as any[];
    res.json(influencers.map(inf => ({
      ...inf,
      verticals: JSON.parse(inf.verticals || '[]'),
      languages: JSON.parse(inf.languages || '[]'),
      project_types: JSON.parse(inf.project_types || '[]'),
      has_case_studies: !!inf.has_case_studies
    })));
  });

  app.get('/api/influencers/:id', authenticate, (req: any, res) => {
    const influencer = db.prepare('SELECT * FROM influencers WHERE id = ?').get(req.params.id) as any;
    if (!influencer) return res.status(404).json({ error: 'Not found' });

    // Check access for media_center
    if (req.user.role === 'media_center') {
      const access = db.prepare('SELECT * FROM access_grants WHERE media_center_id = ? AND influencer_id = ?').get(req.user.id, influencer.id);
      if (!access) return res.status(403).json({ error: 'No access to this influencer' });
    }

    const pricing = db.prepare('SELECT * FROM pricing_items WHERE influencer_id = ?').all(influencer.id);
    const caseStudies = db.prepare('SELECT * FROM case_studies WHERE influencer_id = ?').all(influencer.id);

    res.json({
      ...influencer,
      verticals: JSON.parse(influencer.verticals || '[]'),
      languages: JSON.parse(influencer.languages || '[]'),
      project_types: JSON.parse(influencer.project_types || '[]'),
      pricing_items: pricing,
      case_studies: caseStudies
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
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  
  // Only listen if not running as a Vercel function
  if (!process.env.VERCEL) {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

// Start the server initialization
startServer().catch(console.error);
