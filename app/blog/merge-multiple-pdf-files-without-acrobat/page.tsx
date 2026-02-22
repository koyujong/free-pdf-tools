import React from 'react';
import { Metadata } from 'next';
import BlogPostClient from '../../../components/BlogPostClient';
import { post1Content } from './content';

export const metadata: Metadata = {
    title: 'How to Merge Multiple PDF Files Into One Without Acrobat',
    description: 'Learn exactly how to merge multiple pdf files into one without Acrobat. Discover free, fast, and secure browser-based methods to combine your documents easily.',
    keywords: ['how to merge multiple pdf files into one without acrobat', 'combine pdf files free', 'merge pdf no adobe', 'browser pdf merger'],
};

export default function Blog1() {
    return <BlogPostClient {...post1Content} />;
}
