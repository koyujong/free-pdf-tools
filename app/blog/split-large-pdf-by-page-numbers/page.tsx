import React from 'react';
import { Metadata } from 'next';
import BlogPostClient from '../../../components/BlogPostClient';
import { post9Content } from './content';

export const metadata: Metadata = {
    title: 'How to Split a Large PDF by Page Numbers Easily',
    description: 'Stop struggling with massive documents. Learn exactly how to split a large pdf by page numbers easily using free, secure offline browser tools.',
    keywords: ['how to split a large pdf by page numbers easily', 'split pdf by range', 'extract pages easily', 'pdf parsing tool'],
};

export default function Blog10() {
    return <BlogPostClient {...post9Content} />;
}
