import React from 'react';
import { Metadata } from 'next';
import BlogIndexUI from '../../components/BlogIndexUI';

export const metadata: Metadata = {
    title: 'Blog & Tutorials | Free PDF Tools',
    description: 'Read our ultimate guides and tutorials on how to effectively merge, split, rotate, and manipulate PDF documents securely in your browser.',
    keywords: ['pdf blog', 'pdf tutorials', 'how to merge pdf', 'how to split pdf'],
};

export default function BlogIndexPage() {
    return <BlogIndexUI />;
}
