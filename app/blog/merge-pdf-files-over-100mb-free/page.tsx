import React from 'react';
import { Metadata } from 'next';
import BlogPostClient from '../../../components/BlogPostClient';
import { post5Content } from './content';

export const metadata: Metadata = {
    title: 'Merge PDF Files Over 100MB Free No Registration',
    description: 'Struggling with large files? Learn how to merge pdf files over 100mb free no registration using the latest in local browser WebAssembly technology.',
    keywords: ['merge pdf files over 100mb free no registration', 'merge large pdf free', 'combine huge pdf online', 'pdf joiner over 100mb'],
};

export default function Blog5() {
    return <BlogPostClient {...post5Content} />;
}
