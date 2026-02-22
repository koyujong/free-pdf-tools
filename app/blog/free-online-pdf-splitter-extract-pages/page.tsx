import React from 'react';
import { Metadata } from 'next';
import BlogPostClient from '../../../components/BlogPostClient';
import { post2Content } from './content';

export const metadata: Metadata = {
    title: 'Free Online PDF Splitter Extract Pages Without Uploading',
    description: 'Looking for a free online pdf splitter extract pages without uploading? Discover the most secure way to separate your PDF pages instantly offline in-browser.',
    keywords: ['free online pdf splitter extract pages without uploading', 'extract pdf pages', 'split pdf locally', 'no upload pdf splitter'],
};

export default function Blog2() {
    return <BlogPostClient {...post2Content} />;
}
