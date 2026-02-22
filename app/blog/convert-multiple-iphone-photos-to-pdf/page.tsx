import React from 'react';
import { Metadata } from 'next';
import BlogPostClient from '../../../components/BlogPostClient';
import { post3Content } from './content';

export const metadata: Metadata = {
    title: 'Convert Multiple iPhone Photos to PDF Document Free',
    description: 'Learn how to easily convert multiple iPhone photos to a PDF document for free without losing quality. Step-by-step guide for iOS users and beyond.',
    keywords: ['convert multiple iphone photos to pdf document free', 'iphone image to pdf', 'ios photo converter', 'jpeg to pdf free'],
};

export default function Blog3() {
    return <BlogPostClient {...post3Content} />;
}
