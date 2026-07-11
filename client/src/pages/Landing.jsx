import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  FiMenu, FiX, FiBriefcase, FiList, FiMessageSquare, 
  FiVideo, FiFileText, FiTrendingUp, FiArrowRight, FiCheckCircle 
} from 'react-icons/fi';

// ─── Custom Hook for Scroll Reveal ───
const useScrollReveal = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

// ─── Counter Animation Component ───
const AnimatedNumber = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useScrollReveal(0.5);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ─── Main Landing Page Component ───
const Landing = () => {
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary font-body overflow-x-hidden">
      
      {/* ─── 1. Navigation Bar ─── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">

            <span className="text-xl font-bold tracking-tight text-text-primary">
              InterviewAce
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('testimonials')} className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Testimonials</button>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <SignedIn>
              <Link to="/dashboard" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                Log In
              </Link>
              <Link to="/register" className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-800 transition-all shadow-md hover-lift">
                Get Started Free
              </Link>
            </SignedOut>
          </div>

        </div>
      </header>

      {/* ─── 2. Hero Section ─── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden isolate">
        {/* Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover -z-30 opacity-100"
        >
          <source src="/interview.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Overlay removed as requested */}

        {/* Decorative Blobs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-light/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-soft" />
        <div className="absolute bottom-0 left-[-10%] w-80 h-80 bg-accent-light/10 rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse-soft" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Content (Left Text, Center Bottom Buttons) */}
          <div className="lg:col-span-12 z-10 flex flex-col min-h-[50vh]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col h-full flex-1">
              
              <div className="text-left max-w-3xl pt-10">
                <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-1.5 mb-6 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">AI-Powered Interview Prep</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold font-display leading-[1.1] tracking-tight text-white mb-6">
                  Master Your <span className="text-orange-500">Interviews</span>
                </h1>
                
                <p className="text-lg lg:text-xl text-white/90 leading-relaxed max-w-2xl">
                  AI-driven mock sessions. Smart resume matching. Your dream job awaits.
                </p>
              </div>
              
              <div className="mt-auto pt-24 flex flex-col items-center justify-center w-full">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                  <Link to="/register" className="w-full sm:w-auto bg-white text-gray-900 px-8 py-3.5 rounded-full font-bold text-base hover:bg-gray-100 shadow-xl shadow-black/10 hover-lift text-center flex items-center justify-center transition-all">
                    Start Free Trial <FiArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>

            </motion.div>
          </div>

          {/* Right Visuals Removed as requested */}
        </div>
      </section>

      {/* ─── 3. Social Proof Bar ─── */}
      <section className="py-8 bg-surface border-y border-border-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
          <p className="text-sm font-medium text-text-muted uppercase tracking-widest">Trusted by professionals preparing for top companies</p>
        </div>
        <div className="relative w-full flex overflow-x-hidden">
          {/* We use a single w-max container with two sets to correctly translate -50% */}
          <div className="flex w-max animate-scroll-logos opacity-60">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Airbnb', 'Uber', 'Stripe'].map((company, i) => (
              <span key={i} className="text-2xl font-bold text-text-secondary mx-12 font-display shrink-0">{company}</span>
            ))}
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Airbnb', 'Uber', 'Stripe'].map((company, i) => (
              <span key={`dup-${i}`} className="text-2xl font-bold text-text-secondary mx-12 font-display shrink-0">{company}</span>
            ))}
          </div>
          {/* Gradient masks for fading edges */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface to-transparent pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface to-transparent pointer-events-none"></div>
        </div>
      </section>

      {/* ─── 4. Features Grid ─── */}
      <section id="features" className="section-padding bg-background relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-text-primary mb-4">
              Everything You Need to Ace Your Interview
            </h2>
            <p className="text-lg text-text-secondary">
              A complete toolkit designed to build your confidence and sharpen your skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <FeatureCard 
              bg="bg-[#a6c1d1]" 
              title="Job Analysis"
              description="AI analyzes job requirements, extracts key skills, and creates personalized prep roadmaps."
              tags={["Role Analysis", "Skill Extraction", "Roadmap"]}
            />
            {/* Feature 2 */}
            <FeatureCard 
              bg="bg-[#d8b598]" 
              title="MCQ Generator"
              description="Auto-generate role-specific MCQs with varying difficulty levels and detailed explanations."
              tags={["Dynamic MCQs", "Explanations"]}
            />
            {/* Feature 3 */}
            <FeatureCard 
              bg="bg-[#9f94b1]" 
              title="Questions Bank"
              description="Get curated interview questions with ideal answers, key points to cover, and common mistakes."
              tags={["Curated Questions", "Ideal Answers"]}
            />
            {/* Feature 4 */}
            <FeatureCard 
              bg="bg-[#9bb8a8]" 
              title="Mock Interviews"
              description="Practice with our AI interviewer that evaluates your responses in real-time with actionable feedback."
              tags={["Real-time Feedback", "AI Interviwer"]}
            />
            {/* Feature 5 */}
            <FeatureCard 
              bg="bg-[#f0c8c6]" 
              title="Resume Analyzer"
              description="Match your resume against job descriptions to find gaps, missing skills, and improvement areas."
              tags={["Resume Matching", "Gap Analysis"]}
            />
            {/* Feature 6 */}
            <FeatureCard 
              bg="bg-[#d1c8b0]" 
              title="Performance Dashboard"
              description="Track your progress with detailed analytics, topic strength charts, and readiness scores."
              tags={["Analytics", "Readiness Score"]}
            />
          </div>
        </div>
      </section>

      {/* ─── 5. Stats Counter Section ─── */}
      <section className="py-20 bg-gradient-stats relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <StatItem value={10000} suffix="+" label="Users Joined" />
            <StatItem value={50000} suffix="+" label="Questions Generated" />
            <StatItem value={95} suffix="%" label="Success Rate" />
            <StatItem value={250} suffix="+" label="Job Roles Covered" />
          </div>
        </div>
      </section>

      {/* ─── 6. How It Works ─── */}
      <section id="how-it-works" className="section-padding bg-surface-alt border-y border-border-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-text-primary mb-4">
              Get Interview-Ready in 3 Simple Steps
            </h2>
            <p className="text-lg text-text-secondary">
              Our streamlined process takes you from unprepared to confident.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Dashed line connecting steps (desktop only) */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-gray-300 -translate-y-1/2 z-0"></div>

            <StepCard 
              number="01" 
              title="Analyze" 
              description="Upload your target job description and let our AI extract the key requirements and skills."
            />
            <StepCard 
              number="02" 
              title="Practice" 
              description="Take tailored MCQ tests and practice with our realistic AI mock interviewer to hone your answers."
            />
            <StepCard 
              number="03" 
              title="Excel" 
              description="Track your progress, identify weak areas, and improve continuously until you're ready to ace it."
            />
          </div>
        </div>
      </section>

      {/* ─── 7. Testimonials ─── */}
      <section id="testimonials" className="section-padding bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-text-primary mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-text-secondary">
              Don't just take our word for it. Here's how InterviewAce has helped professionals land their dream jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="The AI mock interviews were incredibly realistic. The feedback on my communication style helped me fix issues I didn't even know I had. Landed a senior dev role at a FAANG company!"
              name="Sarah Jenkins"
              role="Senior Frontend Developer"
              initials="SJ"
              color="bg-blue-100 text-blue-700"
            />
            <TestimonialCard 
              quote="I was struggling to tailor my prep for specific roles. The Job Description Analyzer broke down exactly what I needed to study. The 4-week roadmap was a game-changer."
              name="Michael Chen"
              role="Product Manager"
              initials="MC"
              color="bg-emerald-100 text-emerald-700"
            />
            <TestimonialCard 
              quote="As a recent grad, interviews terrified me. Practicing with InterviewAce built my confidence immensely. The curated question bank was spot-on for what I was actually asked."
              name="Emily Rodriguez"
              role="Data Analyst"
              initials="ER"
              color="bg-purple-100 text-purple-700"
            />
          </div>
        </div>
      </section>

      {/* ─── 8. CTA Section ─── */}
      <section className="py-24 bg-gradient-primary relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who have already transformed their interview preparation and landed their dream roles.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 shadow-xl hover-lift transition-all">
              Start Free Today
            </Link>
          </div>
          <p className="text-sm text-indigo-200 mt-6">
            No credit card required. Free plan available.
          </p>
        </div>
      </section>

      {/* ─── 9. Footer ─── */}
      <footer className="bg-gray-900 pt-20 pb-10 text-gray-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Column */}
            <div className="col-span-1 lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-6">

                <span className="text-xl font-bold tracking-tight text-white font-display">
                  InterviewAce
                </span>
              </Link>
              <p className="text-sm mb-6 max-w-xs">
                The ultimate AI-powered platform for interview preparation. Build confidence, practice effectively, and land your dream job.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Product</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Job Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mock Interviews</a></li>
                <li><a href="#" className="hover:text-white transition-colors">MCQ Generator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resume Analyzer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Resources</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Interview Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© {new Date().getFullYear()} InterviewAce. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {/* Social placeholders */}
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

// ─── Reusable Micro-components ───

const FeatureCard = ({ bg, title, description, tags }) => {
  const [ref, isVisible] = useScrollReveal();
  
  return (
    <div 
      ref={ref}
      className={`rounded-[24px] p-8 flex flex-col h-full hover-lift shadow-sm ${bg} ${isVisible ? 'animate-slide-up' : 'opacity-0'} min-h-[320px]`}
    >
      <h3 className="text-[28px] font-bold font-display text-gray-900 mb-3 tracking-tight leading-tight">{title}</h3>
      <p className="text-gray-800 text-base leading-relaxed mb-6 font-medium opacity-90">{description}</p>
      
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag, i) => (
            <span key={i} className="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-black/5 text-gray-800">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="font-bold text-gray-900 text-[17px]">Explore</span>
        <div className="w-10 h-10 rounded-[10px] bg-black/5 flex items-center justify-center text-gray-900 hover:bg-black/10 transition-colors">
          <FiArrowRight size={20} />
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ value, suffix, label }) => {
  return (
    <div className="flex flex-col items-center justify-center py-4 px-2">
      <div className="text-4xl md:text-5xl font-bold font-display text-white mb-2">
        <AnimatedNumber end={value} suffix={suffix} />
      </div>
      <div className="text-indigo-200 font-medium">{label}</div>
    </div>
  );
};

const StepCard = ({ number, title, description }) => {
  const [ref, isVisible] = useScrollReveal();
  
  return (
    <div 
      ref={ref}
      className={`relative z-10 flex flex-col items-center text-center ${isVisible ? 'animate-fade-rise' : 'opacity-0'}`}
    >
      <div className="w-16 h-16 rounded-full bg-white border-4 border-indigo-100 flex items-center justify-center text-primary font-bold text-xl shadow-md mb-6 z-10">
        {number}
      </div>
      <div className="bg-white rounded-2xl p-8 border border-border-light shadow-sm w-full hover-lift">
        <h3 className="text-2xl font-bold font-display text-text-primary mb-4">{title}</h3>
        <p className="text-text-secondary">{description}</p>
      </div>
    </div>
  );
};

const TestimonialCard = ({ quote, name, role, initials, color }) => {
  const [ref, isVisible] = useScrollReveal();
  
  return (
    <div 
      ref={ref}
      className={`bg-white rounded-2xl p-8 border border-border-light shadow-sm flex flex-col h-full hover-lift ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}
    >
      <div className="flex text-amber-400 mb-6">
        {[1, 2, 3, 4, 5].map(i => (
          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-text-secondary text-lg mb-8 italic flex-1">"{quote}"</p>
      <div className="flex items-center gap-4 mt-auto">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${color}`}>
          {initials}
        </div>
        <div>
          <h4 className="font-bold text-text-primary">{name}</h4>
          <p className="text-sm text-text-muted">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
