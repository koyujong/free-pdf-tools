
import React from 'react';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  content: React.ReactNode;
  cta?: { title: string; desc: string; btn: string };
  keywords: string[];
  language: string;
  translationGroup: string;
}

import { post1, post1_ko, post1_ja, post1_es } from './posts/post1';
import { post2, post2_ko, post2_ja, post2_es } from './posts/post2';
import { post3, post3_ko, post3_ja, post3_es } from './posts/post3';
import { post4, post4_ko, post4_ja, post4_es } from './posts/post4';
import { post5, post5_ko, post5_ja, post5_es } from './posts/post5';
import { post6, post6_ko, post6_ja, post6_es } from './posts/post6';
import { post7, post7_ko, post7_ja, post7_es } from './posts/post7';
import { post8, post8_ko, post8_ja, post8_es } from './posts/post8';
import { post9, post9_ko, post9_ja, post9_es } from './posts/post9';
import { post10, post10_ko, post10_ja, post10_es } from './posts/post10';
import { post11, post11_ko, post11_ja, post11_es } from './posts/post11';

export const blogPosts: BlogPost[] = [
  // English
  post1, post2, post3, post4, post5, post6, post7, post8, post9, post10, post11,
  // Korean
  post1_ko, post2_ko, post3_ko, post4_ko, post5_ko, post6_ko, post7_ko, post8_ko, post9_ko, post10_ko, post11_ko,
  // Japanese
  post1_ja, post2_ja, post3_ja, post4_ja, post5_ja, post6_ja, post7_ja, post8_ja, post9_ja, post10_ja, post11_ja,
  // Spanish
  post1_es, post2_es, post3_es, post4_es, post5_es, post6_es, post7_es, post8_es, post9_es, post10_es, post11_es,
];
