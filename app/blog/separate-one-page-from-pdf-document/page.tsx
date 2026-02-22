import React from 'react';
import { Metadata } from 'next';
import BlogPostClient from '../../../components/BlogPostClient';
import { post8Content } from './content';

export const metadata: Metadata = {
    title: 'Separate One Page from PDF Document Free Online',
    description: 'Learn how to separate one page from pdf document free online using secure, browser-based tools without uploading your private data to cloud servers.',
    keywords: ['separate one page from pdf document free online', 'extract single pdf page', 'pdf page extractor free', 'split pdf locally'],
};

export default function Blog8() {
    return <BlogPostClient {...post8Content} />;
}
