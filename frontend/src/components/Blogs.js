// frontend/src/components/Blogs.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import { FilterChips } from '../ui/motion';

const blogs = [
  {
    id: 1,
    title: '5 Coping Strategies for Anxiety',
    summary: 'Learn effective ways to manage anxiety naturally through proven techniques.',
    category: 'Anxiety',
    readTime: '5 min read',
    source: 'Psych Central',
    link: 'https://psychcentral.com/anxiety/coping-strategies',
  },
  {
    id: 2,
    title: 'Mental Health and Mindfulness',
    summary: 'How mindfulness practices can significantly improve your mental well-being.',
    category: 'Mindfulness',
    readTime: '8 min read',
    source: 'Mindful.org',
    link: 'https://www.mindful.org/meditation/mindfulness-getting-started/',
  },
  {
    id: 3,
    title: 'The Science of Gratitude',
    summary: 'Explore how gratitude practices can reduce depression and boost happiness.',
    category: 'Depression',
    readTime: '6 min read',
    source: 'Greater Good, UC Berkeley',
    link: 'https://greatergood.berkeley.edu/topic/gratitude/definition',
  },
  {
    id: 4,
    title: 'Sleep and Mental Health',
    summary: 'Understanding the crucial connection between quality sleep and mental wellness.',
    category: 'Sleep',
    readTime: '7 min read',
    source: 'Sleep Foundation',
    link: 'https://www.sleepfoundation.org/how-sleep-works/why-do-we-need-sleep',
  },
  {
    id: 5,
    title: 'Building Resilience in Difficult Times',
    summary: 'Practical strategies to develop emotional resilience and bounce back from setbacks.',
    category: 'Resilience',
    readTime: '9 min read',
    source: 'American Psychological Association',
    link: 'https://www.apa.org/topics/resilience',
  },
  {
    id: 6,
    title: 'The Power of Social Connections',
    summary: 'How maintaining strong relationships impacts your mental health and overall well-being.',
    category: 'Relationships',
    readTime: '6 min read',
    source: 'Harvard Health',
    link: 'https://www.health.harvard.edu/newsletter_article/the-health-benefits-of-strong-relationships',
  },
  {
    id: 7,
    title: 'Managing Work-Life Balance',
    summary: 'Essential tips for maintaining mental health while juggling professional and personal life.',
    category: 'Stress',
    readTime: '8 min read',
    source: 'Mayo Clinic',
    link: 'https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/work-life-balance/art-20048134',
  },
  {
    id: 8,
    title: 'Nutrition for Mental Wellness',
    summary: 'Discover how your diet directly affects your mood, energy, and mental clarity.',
    category: 'Nutrition',
    readTime: '10 min read',
    source: 'Harvard Health',
    link: 'https://www.health.harvard.edu/blog/nutritional-psychiatry-your-brain-on-food-201511168626',
  },
  {
    id: 9,
    title: 'Understanding Panic Attacks',
    summary: 'Learn to recognize, understand, and effectively manage panic attacks when they occur.',
    category: 'Anxiety',
    readTime: '7 min read',
    source: 'NIMH',
    link: 'https://www.nimh.nih.gov/health/topics/panic-disorder',
  }
];

const categories = [
  { id: 'all', name: 'All topics' },
  { id: 'Anxiety', name: 'Anxiety' },
  { id: 'Depression', name: 'Depression' },
  { id: 'Mindfulness', name: 'Mindfulness' },
  { id: 'Sleep', name: 'Sleep' },
  { id: 'Stress', name: 'Stress' },
  { id: 'Nutrition', name: 'Nutrition' }
];

const Blogs = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredBlogs = selectedCategory === 'all'
    ? blogs
    : blogs.filter((blog) => blog.category === selectedCategory);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Articles"
        title="Reading for your wellbeing"
        italic={[3]}
        subtitle="Hand-picked, evidence-based articles from trusted health organisations."
      />

      <div style={{ marginBottom: '1.75rem' }}>
        <FilterChips options={categories} value={selectedCategory} onChange={setSelectedCategory} layoutId="blog-chip" />
      </div>

      <motion.div className="article-list card" layout>
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredBlogs.map((blog) => (
            <motion.a
              key={blog.id}
              layout
              className="article-row"
              href={blog.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="article-meta">
                <span className="article-cat">{blog.category}</span>
                <span className="faint small">{blog.readTime}</span>
              </div>
              <div className="article-main">
                <h3>{blog.title}</h3>
                <p className="muted small">{blog.summary}</p>
                <span className="faint small">{blog.source}</span>
              </div>
              <span className="article-go" aria-hidden="true"><ArrowUpRight size={20} /></span>
            </motion.a>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Blogs;
