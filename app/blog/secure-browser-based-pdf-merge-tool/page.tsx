import React from 'react';
import { Metadata } from 'next';
import BlogPostClient from '../../../components/BlogPostClient';
import { post7Content } from './content';

export const metadata: Metadata = {
    title: 'Secure Browser Based PDF Merge Tool for Sensitive Documents',
    description: 'Ensure critical data remains yours by utilizing a secure browser based pdf merge tool for sensitive documents. Prevent data leaks with local browser tech.',
    keywords: ['secure browser based pdf merge tool for sensitive documents', 'private pdf merger', 'offline pdf combiner online', 'zero trust pdf joiner'],
};

export default function Blog7() {
    return <BlogPostClient {...post7Content} />;
}
