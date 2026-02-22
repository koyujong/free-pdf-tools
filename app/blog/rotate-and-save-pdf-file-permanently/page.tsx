import React from 'react';
import { Metadata } from 'next';
import BlogPostClient from '../../../components/BlogPostClient';
import { post6Content } from './content';

export const metadata: Metadata = {
    title: 'How to Rotate and Save a PDF File Permanently Online',
    description: 'If your PDF is displaying sideways, you need to know how to rotate and save a pdf file permanently online. Read our guide to fix orientation metadata forever.',
    keywords: ['how to rotate and save a pdf file permanently online', 'rotate pdf forever', 'fix upside down pdf', 'permanent pdf rotation'],
};

export default function Blog6() {
    return <BlogPostClient {...post6Content} />;
}
