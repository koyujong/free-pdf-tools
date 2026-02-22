import React from 'react';
import { Metadata } from 'next';
import BlogPostClient from '../../../components/BlogPostClient';
import { post4Content } from './content';

export const metadata: Metadata = {
    title: 'Best Way to Combine PDF Files Locally in Browser',
    description: 'Looking for the best way to combine pdf files locally in browser? Find out how WebAssembly and JavaScript can securely merge documents on your own hardware.',
    keywords: ['best way to combine pdf files locally in browser', 'local pdf merger', 'combine offline', 'secure browser pdf tool'],
};

export default function Blog4() {
    return <BlogPostClient {...post4Content} />;
}
