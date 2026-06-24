const defaultSeo: Record<string, any> = {
  home: {
    title: '246Sports | Barbados Sports Management Platform',
    description: 'Track fixtures, results, standings, teams, associations, and sports news across Barbados and the Caribbean.',
  },
  about: {
    title: 'About 246Sports | Barbados Sports Management Platform',
    description: 'Learn about 246Sports and our mission to modernize sports management across Barbados and the Caribbean.',
  },
  'how-it-works': {
    title: 'How It Works | 246Sports Platform Guide',
    description: 'Get started with 246Sports in simple steps, from registration to fixtures, results, and live scoring.',
  },
  features: {
    title: 'Features | 246Sports - Platform Features',
    description: 'Explore sports management, live scoring, communication, analytics, and secure administration features.',
  },
  faq: {
    title: 'FAQ | 246Sports - Frequently Asked Questions',
    description: 'Answers to common questions about 246Sports accounts, fixtures, live scoring, teams, privacy, and support.',
  },
  privacy: {
    title: 'Privacy Policy | 246Sports - Data Protection',
    description: 'Learn how 246Sports collects, uses, and protects your information.',
  },
  terms: {
    title: 'Terms & Conditions | 246Sports - Legal Terms',
    description: 'Read the legal terms governing use of the 246Sports platform.',
  },
  contact: {
    title: 'Contact Us | 246Sports - Get in Touch',
    description: 'Contact 246Sports for platform questions, demos, support, and partnership enquiries.',
  },
  footer: {
    title: '246Sports Footer Settings',
    description: 'Global footer, newsletter, logo, links, and social profile settings for 246Sports.',
  },
  competitions: {
    title: 'Competitions | 246Sports',
    description: 'Browse leagues, tournaments, cups, and competitions across Barbados sports.',
  },
  fixtures: {
    title: 'Fixtures & Schedule | 246Sports',
    description: 'Explore upcoming fixtures and match schedules across the Barbados sporting landscape.',
  },
  results: {
    title: 'Competition Results | 246Sports',
    description: 'Browse verified results and historical match outcomes from Barbados competitions.',
  },
  standings: {
    title: 'League Standings | 246Sports',
    description: 'View live standings and rankings for active sports competitions.',
  },
  news: {
    title: 'Sports News | 246Sports',
    description: 'Stay up to date with sports news, announcements, and updates from across Barbados.',
  },
  calendar: {
    title: 'Sports Calendar | 246Sports',
    description: 'Track fixtures and events on the 246Sports calendar.',
  },
  streams: {
    title: 'Live Streams | 246Sports',
    description: 'Watch live streams, replays, and video highlights from Barbados sports.',
  },
  sports: {
    title: 'Sports Directory | 246Sports',
    description: 'Explore sports disciplines and competitions available on 246Sports.',
  },
  associations: {
    title: 'Sports Associations | 246Sports',
    description: 'Discover official sports associations and governing bodies across Barbados.',
  },
};

const defaultContent: Record<string, any> = {
  home: {
    badge: 'Official Bajan Sports Platform',
    heroTitle: 'The Home of|Athletic Excellence',
    heroDescription: 'Track real-time fixtures, explore disciplines, and follow national associations in one unified ecosystem.',
    stats: [
      { label: 'Sports Covered', value: '12+' },
      { label: 'Live Events', value: '24/7' },
      { label: 'Competitions', value: '100+' },
      { label: 'Associations', value: '18+' },
    ],
    primaryCta: { label: 'Live Fixtures', href: '/fixtures' },
    secondaryCta: { label: 'Browse Sports', href: '/sports' },
    sections: [
      {
        eyebrow: 'Unified Experience',
        title: 'Platform Features',
        body: 'Our ecosystem connects fans, athletes, clubs, and associations with every aspect of the Barbadian sporting landscape.',
        cards: [
          { title: 'Explore', body: 'Browse sports, competitions, associations, teams, and public profiles from one clean directory.' },
          { title: 'Track', body: 'Follow fixtures, live match status, results, standings, and calendar updates in real time.' },
          { title: 'Compete', body: 'Give associations and clubs the tools to manage competitions, squads, venues, and official records.' },
        ],
      },
      {
        eyebrow: 'National Platform',
        title: 'About 246Sports',
        body: '246Sports is the official national platform dedicated to celebrating and promoting athletic excellence across Barbados. We bring together sports associations, clubs, athletes, and supporters in one digital home.',
        items: ['Real-time fixture and result tracking', 'Association and club visibility', 'Competition and standings management', 'Sports news, media, and public updates'],
        ctaLabel: 'Learn More',
        ctaHref: '/about',
      },
      {
        eyebrow: 'Match Center',
        title: "Today's Fixtures",
        body: 'Stay close to the action with upcoming matches, venues, times, and live competition updates.',
        ctaLabel: 'Full Schedule',
        ctaHref: '/fixtures',
      },
      {
        eyebrow: 'The Full Spectrum',
        title: 'Explore Sports',
        body: 'Discover every discipline on the platform, from grassroots competitions to national events.',
        ctaLabel: 'Browse Sports',
        ctaHref: '/sports',
      },
      {
        eyebrow: 'Governing Bodies',
        title: 'National Associations',
        body: 'Find the official associations powering sport across Barbados and follow their competitions, teams, and updates.',
        ctaLabel: 'View Directory',
        ctaHref: '/associations',
      },
      {
        eyebrow: 'Ready to Join Us?',
        title: 'The Home of Bajan Excellence',
        body: 'Join thousands of Bajans celebrating athletic achievement across our island.',
        cards: [
          { title: 'Explore Sports', href: '/sports' },
          { title: 'Match Center', href: '/fixtures' },
        ],
      },
    ],
  },
  about: {
    badge: 'Our Story',
    heroTitle: 'About 246Sports',
    heroDescription: 'Empowering Barbados & Caribbean sports with modern technology for fixtures, results, live scoring, and team management.',
    stats: [
      { label: 'Associations', value: '18+' },
      { label: 'Sports Covered', value: '12+' },
      { label: 'Teams Managed', value: '500+' },
      { label: 'Events Tracked', value: '2000+' },
    ],
    sections: [
      {
        eyebrow: 'Mission',
        title: 'Our Mission',
        body: '246Sports is dedicated to revolutionizing sports management in Barbados and the Caribbean. We provide associations, clubs, and teams with powerful, easy-to-use tools for managing fixtures, tracking results, live scoring, and engaging with fans.\n\nOur platform brings professional-grade sports administration to every level of competition, from grassroots to national leagues, helping sports organizations operate more efficiently and connect with their communities.',
        ctaLabel: 'Explore Features',
        ctaHref: '/features',
      },
      { title: 'Who We Serve', body: 'Sports Organizations', items: ['National & Regional Associations', 'Sports Clubs & Academies', 'Team Managers & Coaches', 'Players & Athletes', 'Fans & Sports Enthusiasts'] },
      { title: 'What We Offer', cards: [{ title: 'Fixture Management', body: 'Schedule and manage fixtures with ease. Support for leagues, tournaments, cups, and multi-stage competitions with automatic standings calculation.' }, { title: 'Live Scoring', body: 'Real-time score updates during matches. Keep fans engaged with live statistics, match events, and instant result publication.' }, { title: 'Team Management', body: 'Comprehensive team and player management. Rosters, profiles, statistics, and squad tracking across multiple age groups and divisions.' }, { title: 'Results & Standings', body: 'Automated league tables and standings. Historical results, head-to-head records, and comprehensive statistics for analysis.' }, { title: 'Secure Platform', body: 'Enterprise-grade security with role-based access control. Your data is protected with modern encryption and security best practices.' }, { title: 'Analytics & Insights', body: 'Powerful analytics for performance tracking, fan engagement metrics, and data-driven decision making for sports organizations.' }] },
      { eyebrow: 'Our Coverage', title: 'Sports Supported', items: ['Football', 'Cricket', 'Basketball', 'Netball', 'Rugby', 'Hockey', 'Athletics', 'Swimming', 'Tennis', 'Volleyball', 'Table Tennis', 'And More...'] },
      { title: 'Service Region', cards: [{ title: 'Barbados', body: 'Full coverage of all national associations and competitions' }, { title: 'Eastern Caribbean', body: 'Expanding to serve OECS member states' }, { title: 'CARICOM Region', body: 'Available to all Caribbean Community nations' }] },
      { title: 'Ready to Get Started?', body: 'Join the growing community of sports organizations using 246Sports to manage their competitions and engage with fans.', cards: [{ title: 'Register Your Association', href: '/register' }, { title: 'Learn More', href: '/how-it-works' }] },
      { title: 'Why Choose 246Sports?', body: '246Sports is the leading sports management platform specifically designed for Caribbean sports organizations. Built with a deep understanding of local sports administration needs, our platform combines powerful features with simplicity and affordability.\n\nFrom small club competitions to national leagues, 246Sports scales to meet your needs. Our cloud-based platform requires no software installation, works on any device, and includes automatic backups and security updates. Focus on your sport while we handle the technology.\n\nJoin sports associations across Barbados and the Eastern Caribbean who trust 246Sports for their fixture management, live scoring, and fan engagement needs. Experience the difference that modern sports administration can make for your organization.' },
    ],
  },
  'how-it-works': {
    badge: 'Platform Guide',
    heroTitle: 'How 246Sports Works',
    heroDescription: 'Get started with 246Sports in 6 simple steps. From registration to live scoring, we make sports management easy.',
    stats: [
      { label: 'Setup Time', value: '< 10 min' },
      { label: 'Steps to Launch', value: '6 Steps' },
      { label: 'Support Available', value: '24/7' },
    ],
    sections: [
      {
        title: 'Getting Started',
        body: 'Follow these simple steps to get your sports organization up and running on 246Sports',
        cards: [
          { title: '01 Register Your Association', body: 'Create your sports association account with basic information about your organization.', label: 'Sign up with your association details | Verify your email address | Set up your admin account | Configure basic settings' },
          { title: '02 Add Clubs & Teams', body: 'Import or create your member clubs and teams to the platform.', label: 'Create club profiles with logos | Add teams and squads | Import player rosters | Assign team managers' },
          { title: '03 Create Competitions', body: 'Set up leagues, tournaments, or cup competitions.', label: 'Define competition format | Set scoring rules | Configure match schedules | Add venue information' },
          { title: '04 Schedule Fixtures', body: 'Create your fixture calendar with matches, dates, and venues.', label: 'Generate fixture lists | Assign match officials | Set match dates and times | Publish to fans' },
          { title: '05 Track Live Scores', body: 'Update scores in real time during matches for instant results.', label: 'Start live scoring | Update match events | Real-time fan updates | Automatic result publication' },
          { title: '06 Publish Results & Standings', body: 'Results and league tables update automatically after each match.', label: 'Automatic standings calculation | Result notifications | Historical data storage | Share to social media' },
        ],
      },
      { title: 'Tailored for Every User', body: '246Sports serves everyone in the sports ecosystem - associations, clubs, and fans', cards: [{ title: 'For Associations', body: 'Manage multiple clubs and teams, organize leagues and tournaments, track player registrations, publish fixtures and results, generate reports, and communicate with members.' }, { title: 'For Clubs', body: 'Manage team rosters, track player statistics, submit match results, view league standings, communicate with players, and access fixture calendars.' }, { title: 'For Fans', body: 'View live scores, check fixture schedules, browse league standings, read match results, watch live streams, and follow favorite teams.' }] },
      { title: 'Powerful Features', body: 'Everything you need to manage sports competitions professionally', cards: [{ title: 'Smart Scheduling', body: 'Automated fixture generation' }, { title: 'Live Scoring', body: 'Real-time match updates' }, { title: 'Analytics', body: 'Performance insights' }, { title: 'Documentation', body: 'Comprehensive guides' }] },
      { title: 'Need Help?', body: 'Our support team is here to help you get the most out of 246Sports. Check out our FAQ or contact us for assistance.', cards: [{ title: 'Visit FAQ', href: '/faq' }, { title: 'Explore Features', href: '/features' }] },
      { title: 'Platform Workflow', body: 'Visual guide to the 246Sports workflow', items: ['Register', 'Setup', 'Schedule', 'Score', 'Publish'] },
    ],
  },
  features: {
    badge: 'Feature Suite',
    heroTitle: 'Platform Features',
    heroDescription: 'Comprehensive features designed for modern sports management. Everything you need to run your sports organization professionally.',
    sections: [
      {
        title: 'Core Capabilities',
        cards: [
          { title: 'Organization Management', body: 'Manage associations, clubs, teams, users, and permissions.' },
          { title: 'Fixtures & Competitions', body: 'Create competitions, schedule fixtures, and assign venues.' },
          { title: 'Live Scoring', body: 'Capture scores and match updates from mobile-friendly admin screens.' },
        ],
      },
      { title: 'Management Tools', cards: [{ title: 'Association Management', body: 'Complete control over your sports association. Manage member clubs, assign administrators, and oversee all competitions from one centralized dashboard.', label: 'Centralized administration | Role-based access control | Multi-level organization structure | Audit trail for all actions' }, { title: 'Team & Player Management', body: 'Comprehensive tools for managing teams and player rosters. Track player profiles, squad numbers, positions, and career statistics.', label: 'Player profiles with photos | Squad and jersey number management | Position and role tracking | Career statistics history' }, { title: 'Fixture Scheduling', body: 'Powerful fixture management with support for leagues, tournaments, and cups. Generate fixture lists automatically or schedule manually.', label: 'Automated fixture generation | Multi-format support | Venue and official assignment | Season management' }] },
      { title: 'Live Scoring & Results', cards: [{ title: 'Live Scoring System', body: 'Real-time match updates that keep fans engaged. Authorized scorers can update goals, events, and match status from any device.', label: 'Real-time score updates | Mobile-optimized scoring interface | Match event tracking | Automatic result publication' }, { title: 'Automatic Standings', body: 'League tables update automatically as results are confirmed. Customizable scoring rules for different competition formats.', label: 'Automatic point calculations | Goal difference tracking | Head-to-head tiebreakers | Custom scoring rules' }, { title: 'Live Streaming Integration', body: 'Embed YouTube or other streaming services directly into fixture pages. Fans can watch live matches while viewing scores.', label: 'YouTube integration | Stream URL per fixture | Mobile-friendly video player | Archive replays' }] },
      { title: 'Communication & Media', cards: [{ title: 'Notifications & Alerts', body: 'Keep stakeholders informed with automated notifications for fixtures, results, and important updates.', label: 'Email notifications | Platform alerts | Subscription preferences | Scheduled reminders' }, { title: 'Public Results Portal', body: 'Professional public-facing pages for fixtures, results, and standings. Share your content with fans and media.', label: 'Responsive design | SEO-friendly URLs | Social media sharing | Embeddable widgets' }, { title: 'Media Library', body: 'Store and organize photos, videos, and news articles. Rich content to engage your sports community.', label: 'Video management | News publishing | Image galleries | Content categorization' }] },
      { title: 'Analytics & Insights', cards: [{ title: 'Analytics & Reporting', body: 'Comprehensive analytics platform for tracking performance, engagement, and trends across your competitions.', label: 'Performance statistics | Engagement metrics | Historical data analysis | Exportable reports' }, { title: 'Historical Data', body: 'Complete archive of all matches, results, and statistics. Never lose your sports history.', label: 'Unlimited history storage | Searchable archives | Data export functionality | Backup and recovery' }, { title: 'Performance Insights', body: 'Track team and player performance over time. Identify trends, top performers, and areas for improvement.', label: 'Player statistics | Team performance tracking | Season comparisons | Leaderboards' }] },
      { title: 'Security & Reliability', cards: [{ title: 'Enterprise Security', body: 'Bank-level security for your data. Encryption, secure authentication, and compliance with data protection laws.', label: 'SSL/TLS encryption | Secure authentication | Role-based permissions | Data protection compliance' }, { title: 'Mobile-First Design', body: 'Full functionality on any device. Manage your sports on the go from your smartphone or tablet.', label: 'Responsive design | Touch-optimized interface | Offline capabilities | Fast mobile loading' }, { title: 'Reliable Infrastructure', body: 'Cloud-hosted platform with 99.9% uptime. Your data is always available when you need it.', label: 'Cloud hosting | Automatic backups | Disaster recovery | Scalable architecture' }] },
      { title: 'Choose Your Plan', body: "Select the plan that fits your organization's needs", cards: [{ title: 'Starter', body: 'Free plan for small clubs and organizations: up to 2 teams, basic fixtures, manual results, and public standings.', href: '/register' }, { title: 'Professional', body: '$49/month plan for growing associations: unlimited teams, live scoring, auto standings, analytics, and custom branding.', href: '/register' }, { title: 'Enterprise', body: 'Custom plan for national associations: everything in Pro, multi-association support, API access, dedicated support, and custom development.', href: '/contact' }] },
      { title: 'Ready to Transform Your Sports Management?', body: 'Join hundreds of associations, clubs, and teams already using 246Sports to manage their competitions.', cards: [{ title: 'Start Free Trial', href: '/register' }, { title: 'See How It Works', href: '/how-it-works' }] },
      { title: 'Seamless Integrations', body: 'Connect 246Sports with tools you already use', items: ['YouTube', 'Facebook', 'Twitter', 'Instagram', 'Google Calendar', 'RSS Feeds'] },
    ],
  },
  faq: {
    badge: 'Help Center',
    heroTitle: 'Frequently Asked Questions',
    heroDescription: 'Find quick answers about using 246Sports.',
    sections: [
      {
        title: 'Common Questions',
        faqs: [
          { question: 'How do I register my sports association?', answer: 'Use the registration page or contact the platform team with your organization details. After approval, you can manage clubs, teams, competitions, and users.' },
          { question: 'Which sports are supported?', answer: '246Sports supports football, cricket, basketball, netball, athletics, swimming, tennis, volleyball, and many other sports.' },
          { question: 'Can I score matches from my phone?', answer: 'Yes. The live scoring interface is responsive and works from phones, tablets, and desktop browsers.' },
          { question: 'Are standings calculated automatically?', answer: 'Yes. Confirmed results can update standings based on the competition point rules.' },
          { question: 'Is my data secure?', answer: 'The platform uses authenticated access, role permissions, and secure administration patterns to protect organization data.' },
          { question: 'Is 246Sports free to use?', answer: '246Sports offers flexible pricing plans, including a free tier for small associations and clubs with basic features.' },
          { question: 'How do I reset my password?', answer: 'Click Forgot Password on the login page, enter your email address, and use the secure reset link sent to your inbox.' },
          { question: 'Can I change my user role?', answer: "User roles are assigned by your association or club administrator. Contact your organization's administrator or support if you need a different role." },
          { question: 'How do I create a new fixture?', answer: 'Navigate to Fixtures in your dashboard, add a fixture, select the competition, teams, date, time, and venue.' },
          { question: 'Can I edit a fixture after it is created?', answer: 'Yes, fixtures can be edited before the match starts. In-progress matches restrict changes to protect data integrity.' },
          { question: 'How are results published and shared?', answer: 'Results are published to public standings when match officials confirm them and can be shared across public pages.' },
          { question: 'How do I add teams and players?', answer: 'Use the Teams dashboard to create a team profile, then add player details such as name, jersey number, position, and photo.' },
          { question: 'Who owns the sports data on 246Sports?', answer: 'Your association, club, team, and player data belongs to your organization. 246Sports provides the platform to manage it.' },
        ],
      },
      { title: 'FAQ Quick Links', cards: [{ title: 'Documentation', body: 'Detailed guides for every feature', href: '/how-it-works' }, { title: 'Features', body: 'Explore all platform features', href: '/features' }, { title: 'Still Need Help?', body: 'Our support team is here to help', href: 'mailto:support@246sports.com' }] },
      { title: 'Browse by Topic', items: ['Getting Started', 'Account Management', 'Fixtures & Results', 'Live Scoring', 'Teams & Players', 'Privacy & Security'] },
    ],
  },
  privacy: {
    badge: 'Data Protection',
    heroTitle: 'Privacy Policy',
    heroDescription: 'Learn how 246Sports collects, uses, and protects your information.',
    sections: [
      { title: 'Information We Collect', body: 'We collect account information, organization details, contact details, association and club records, team and player profiles, fixture data, results, media uploads, support messages, and technical usage information needed to operate the platform.' },
      { title: 'How We Use Information', body: 'We use information to provide sports management tools, authenticate users, manage permissions, publish public sports information, send service communications, improve performance, prevent abuse, and maintain platform security.' },
      { title: 'Public Sports Data', body: 'Certain sports information such as association names, competitions, fixtures, results, standings, venues, team names, player profiles, news, and media may be displayed publicly when published by authorized administrators.' },
      { title: 'Cookies & Analytics', body: '246Sports may use cookies, local storage, logs, and analytics tools to keep users signed in, remember preferences, measure usage, detect errors, and improve the service experience.' },
      { title: 'Data Sharing', body: 'We do not sell personal information. We may share information with service providers, hosting partners, email providers, analytics tools, or legal authorities when necessary to operate the service, comply with law, or protect users and the platform.' },
      { title: 'Data Retention', body: 'We retain information for as long as needed to provide the service, support sports records, meet legal obligations, resolve disputes, and maintain audit history. Deleted or archived records may remain in backups for a limited period.' },
      { title: 'Security', body: 'We use role-based access, authentication controls, secure infrastructure practices, and administrative safeguards to protect information. No online service can guarantee absolute security, but we work to reduce risk and respond to issues quickly.' },
      { title: 'Your Rights', body: 'Users may request access, correction, export, or deletion of eligible personal information subject to legal, operational, audit, and sports record-keeping requirements.' },
      { title: 'Children & Youth Data', body: 'Sports organizations may manage youth athlete information. Administrators are responsible for collecting appropriate permissions and publishing only information they are authorized to share.' },
      { title: 'Contact', body: 'For privacy questions, correction requests, or data protection concerns, contact the 246Sports support team through the contact page.' },
    ],
  },
  terms: {
    badge: 'Legal',
    heroTitle: 'Terms & Conditions',
    heroDescription: 'Terms governing your use of 246Sports platform services.',
    sections: [
      { title: 'Acceptance of Terms', body: 'By using 246Sports, you agree to follow these terms and all applicable laws and platform policies.' },
      { title: 'Account Responsibility', body: 'You are responsible for keeping login credentials secure, using the platform only through authorized accounts, and notifying administrators if you suspect unauthorized access.' },
      { title: 'Platform Use', body: 'You agree to use 246Sports for lawful sports administration, communication, publication, and fan engagement. You must not misuse the service, interfere with security, scrape data without permission, or upload harmful content.' },
      { title: 'Organization Responsibilities', body: 'Associations, clubs, teams, and administrators are responsible for the accuracy, legality, permissions, and publication status of the information they enter, including fixtures, results, standings, player profiles, media, and announcements.' },
      { title: 'Published Content', body: 'Content published through 246Sports may be visible to the public. Administrators should review content before publishing and ensure they have the rights and permissions required to share text, images, video, names, and statistics.' },
      { title: 'Results & Sports Records', body: '246Sports provides tools for submitting, confirming, and displaying sports records. Final responsibility for official results, standings, eligibility, and competition rulings remains with the relevant sports organization.' },
      { title: 'Intellectual Property', body: '246Sports owns or licenses the platform software, interface, and system materials. Organizations retain responsibility for their own uploaded content while granting 246Sports the permission needed to host, display, process, and deliver that content through the service.' },
      { title: 'Availability & Changes', body: 'We aim to keep the platform reliable, but services may be interrupted for maintenance, upgrades, outages, or events outside our control. Features, workflows, and terms may be updated to improve security, performance, or compliance.' },
      { title: 'Limitations', body: '246Sports is provided as a sports management platform. To the maximum extent allowed by law, we are not responsible for indirect loss, inaccurate data entered by users, third-party services, or decisions made by sports organizations based on platform records.' },
      { title: 'Suspension or Termination', body: 'Access may be limited, suspended, or removed if accounts misuse the platform, violate these terms, create security risks, or are no longer authorized by their organization.' },
      { title: 'Contact', body: 'Questions about these terms can be sent through the contact page. Organizations should review these terms with their own legal or governance advisors where needed.' },
    ],
  },
  contact: {
    badge: 'Get In Touch',
    heroTitle: 'Contact Us',
    heroDescription: "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    stats: [
      { label: 'Response Time', value: '< 24hrs' },
      { label: 'Support Channels', value: '5+' },
      { label: 'Availability', value: '6 days' },
    ],
    sections: [
      {
        title: 'Contact Information Cards',
        cards: [
          { title: 'Email Us', body: 'support@246sports.com', label: 'For general inquiries', href: 'mailto:support@246sports.com' },
          { title: 'Business Inquiries', body: 'business@246sports.com', label: 'For partnerships & enterprise', href: 'mailto:business@246sports.com' },
          { title: 'Call Us', body: '+1 246-123-4567', label: 'Mon-Fri, 9am-5pm AST', href: 'tel:+12461234567' },
          { title: 'Location', body: 'Bridgetown, Barbados', label: 'Caribbean Region', href: 'https://maps.google.com/?q=Bridgetown,Barbados' },
        ],
      },
      { title: 'Contact Form', body: 'Send us a Message', items: ['General Inquiry', 'Technical Support', 'Sales & Pricing', 'Partnership Inquiry', 'Feedback', 'Other'] },
      { title: 'Office Hours', body: 'All times in Atlantic Standard Time (AST)', items: ['Monday - Friday|9:00 AM - 5:00 PM', 'Saturday|10:00 AM - 2:00 PM', 'Sunday|Closed'] },
      {
        title: 'Quick Links',
        cards: [
          { title: 'Documentation', href: '/how-it-works' },
          { title: 'FAQ', href: '/faq' },
          { title: 'Features', href: '/features' },
          { title: 'Privacy Policy', href: '/privacy' },
          { title: 'Terms & Conditions', href: '/terms' },
        ],
      },
      {
        title: 'Social Links',
        cards: [
          { title: 'Twitter', body: '@246sports', href: 'https://twitter.com/246sports' },
          { title: 'Facebook', body: '246Sports', href: 'https://facebook.com/246sports' },
          { title: 'Instagram', body: '@246sports', href: 'https://instagram.com/246sports' },
          { title: 'YouTube', body: '@246sports', href: 'https://youtube.com/@246sports' },
          { title: 'LinkedIn', body: '246Sports', href: 'https://linkedin.com/company/246sports' },
        ],
      },
      { title: 'Fast Response', body: 'We typically respond within 24 hours during business days.' },
      {
        title: 'Other Ways to Reach Us',
        cards: [
          { title: 'Social Media', body: 'DM us on Twitter or Instagram for quick questions and updates.' },
          { title: 'Community Forum', body: 'Join our community forum to connect with other users and share tips.' },
          { title: 'Email Support', body: "For detailed inquiries, email us directly and we'll respond within 24 hours." },
        ],
      },
      {
        title: 'Our Location',
        body: 'Proudly serving Barbados and the Eastern Caribbean region',
        items: ['Bridgetown, Barbados', 'In the heart of the Caribbean'],
        ctaLabel: 'Open in Google Maps',
        ctaHref: 'https://maps.google.com/?q=Bridgetown,Barbados',
      },
    ],
  },
  footer: {
    logoUrl: '/246logo.png',
    newsletterBadge: 'Global Broadcast',
    newsletterTitle: 'Stay in the Game',
    newsletterDescription: 'Get the latest scores, official news, and premium highlights delivered directly to your inbox.',
    brandTitle: 'Driving the Future of',
    brandAccent: 'Barbadian Excellence',
    brandDescription: 'The definitive digital ecosystem for national sporting achievement, connecting athletes, officials, and the Bajan community.',
    badge: 'Official National Platform',
    copyright: '© 2026 246 Sports Barbados. All Rights Reserved',
    statusText: 'Network Operational',
    sections: [
      { title: 'Social Links', cards: [{ title: 'Facebook', href: 'https://facebook.com/246sports' }, { title: 'Twitter', href: 'https://twitter.com/246sports' }, { title: 'Instagram', href: 'https://instagram.com/246sports' }, { title: 'YouTube', href: 'https://youtube.com/@246sports' }] },
      { title: 'Discover', cards: [{ title: 'Associations', href: '/associations' }, { title: 'Competitions', href: '/competitions' }, { title: 'Fixtures', href: '/fixtures' }, { title: 'Live Streams', href: '/streams' }, { title: 'Sports Directory', href: '/sports' }] },
      { title: 'Results', cards: [{ title: 'Match Results', href: '/results' }, { title: 'Standings', href: '/standings' }, { title: 'Event Calendar', href: '/calendar' }, { title: 'Sports News', href: '/news' }] },
      { title: 'Information', cards: [{ title: 'About Us', href: '/about' }, { title: 'How It Works', href: '/how-it-works' }, { title: 'Features', href: '/features' }, { title: 'FAQ', href: '/faq' }] },
      { title: 'Support', cards: [{ title: 'Contact Us', href: '/contact' }, { title: 'Privacy Policy', href: '/privacy' }, { title: 'Terms & Conditions', href: '/terms' }] },
      { title: 'Bottom Links', cards: [{ title: 'Privacy Policy', href: '/privacy' }, { title: 'Terms of Service', href: '/terms' }, { title: 'Cookie Policy', href: '/cookies' }] },
    ],
  },
  competitions: {
    badge: 'Tournament Directory',
    heroTitle: 'Competition Elite',
    heroDescription: 'Discover the pinnacle of Barbadian athletics across professional leagues and community tournaments.',
  },
  fixtures: {
    badge: 'Match Schedule',
    heroTitle: 'Fixtures & Schedule',
    heroDescription: 'Explore fixtures across the Barbadian sporting landscape.',
  },
  results: {
    badge: 'Match Archives',
    heroTitle: 'Competition Results',
    heroDescription: 'Browse through the historical data and outcomes of all professional competitions.',
  },
  standings: {
    badge: 'Rankings',
    heroTitle: 'League Standings',
    heroDescription: 'Real-time analytical data for all professional competitions.',
  },
  news: {
    badge: 'Press Room',
    heroTitle: 'Sports News',
    heroDescription: 'Stay up to date with articles and updates from across the Barbados sports landscape.',
  },
  calendar: {
    badge: 'Event Timeline',
    heroTitle: 'Sports Calendar',
    heroDescription: 'Monitor active events across the sports network.',
  },
  streams: {
    badge: 'Live Broadcasting',
    heroTitle: 'Live Streams',
    heroDescription: 'Watch live streams, replays, and media from Barbados sports.',
  },
  sports: {
    badge: 'Strategic Directory Index',
    heroTitle: 'Global Sports Matrix',
    heroDescription: 'Explore sports disciplines and active competitions across Barbados.',
  },
  associations: {
    badge: 'National Directory',
    heroTitle: 'Sports Associations',
    heroDescription: 'Discover and connect with sports governing bodies across our island.',
  },
};

export const defaultCmsPages: Record<string, any> = {
  home: { title: 'Home', routePath: '/' },
  about: { title: 'About 246Sports', routePath: '/about' },
  'how-it-works': { title: 'How It Works', routePath: '/how-it-works' },
  features: { title: 'Platform Features', routePath: '/features' },
  faq: { title: 'FAQ', routePath: '/faq' },
  privacy: { title: 'Privacy Policy', routePath: '/privacy' },
  terms: { title: 'Terms & Conditions', routePath: '/terms' },
  contact: { title: 'Contact Us', routePath: '/contact' },
  footer: { title: 'Footer & Newsletter', routePath: 'global-footer' },
  competitions: { title: 'Competitions', routePath: '/competitions' },
  fixtures: { title: 'Fixtures & Schedule', routePath: '/fixtures' },
  results: { title: 'Competition Results', routePath: '/results' },
  standings: { title: 'League Standings', routePath: '/standings' },
  news: { title: 'Sports News', routePath: '/news' },
  calendar: { title: 'Sports Calendar', routePath: '/calendar' },
  streams: { title: 'Live Streams', routePath: '/streams' },
  sports: { title: 'Sports Directory', routePath: '/sports' },
  associations: { title: 'Sports Associations', routePath: '/associations' },
};

export const mergeCmsContentWithTemplate = (pageKey: string, content?: any) => {
  const template = defaultContent[pageKey];
  const cleanAssetUrl = (_url?: string) => undefined;

  if (!template) {
    return content || {};
  }

  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return template;
  }

  const savedSections = Array.isArray(content.sections) ? content.sections : [];
  const mergedSections = (template.sections || []).map((templateSection: any) => {
    const savedSection = savedSections.find((section: any) => section.title === templateSection.title);

    if (!savedSection) {
      return templateSection;
    }

    const mergedCards = templateSection.cards
      ? templateSection.cards.map((templateCard: any, index: number) => {
          const savedCard = savedSection.cards?.[index];
          return savedCard ? { ...templateCard, ...savedCard } : templateCard;
        })
      : undefined;

    return {
      ...templateSection,
      ...savedSection,
      logoUrl: undefined,
      imageUrl: cleanAssetUrl(savedSection.imageUrl),
      items: templateSection.items
        ? savedSection.items && savedSection.items.length > 0
          ? savedSection.items
          : templateSection.items
        : undefined,
      cards: mergedCards?.map((card: any) => ({ ...card, imageUrl: cleanAssetUrl(card.imageUrl) })),
      faqs: templateSection.faqs
        ? savedSection.faqs && savedSection.faqs.length > 0
          ? savedSection.faqs
          : templateSection.faqs
        : undefined,
    };
  });

  const customSections = savedSections
    .filter((section: any) => !(template.sections || []).some((templateSection: any) => templateSection.title === section.title))
    .map((section: any) => ({
      ...section,
      imageUrl: cleanAssetUrl(section.imageUrl),
      cards: section.cards?.map((card: any) => ({ ...card, imageUrl: cleanAssetUrl(card.imageUrl) })),
    }));

  return {
    ...template,
    ...content,
    logoUrl: cleanAssetUrl(content.logoUrl),
    imageUrl: cleanAssetUrl(content.imageUrl),
    stats: content.stats && content.stats.length > 0 ? content.stats : template.stats,
    primaryCta: content.primaryCta || template.primaryCta,
    secondaryCta: content.secondaryCta || template.secondaryCta,
    sections: [...mergedSections, ...customSections],
  };
};

export const getDefaultCmsPage = (pageKey: string, status = 'PUBLISHED') => {
  const page = defaultCmsPages[pageKey];
  if (!page) return null;

  const now = new Date().toISOString();
  return {
    id: `default-${pageKey}`,
    pageKey,
    routePath: page.routePath,
    title: page.title,
    status,
    content: mergeCmsContentWithTemplate(pageKey, defaultContent[pageKey] || {}),
    seo: defaultSeo[pageKey] || {},
    publishedAt: status === 'PUBLISHED' ? now : null,
    createdBy: null,
    updatedBy: null,
    createdAt: now,
    updatedAt: now,
    isDefault: true,
  };
};
