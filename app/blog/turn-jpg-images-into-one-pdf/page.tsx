import React from 'react';
import { Metadata } from 'next';
import BlogPostClient from '../../../components/BlogPostClient';
import { post10Content } from './content';

export const metadata: Metadata = {
    title: 'Turn JPG Images Into One PDF Without Losing Quality',
    description: 'Learn the exact steps to turn jpg images into one pdf without losing quality. Avoid aggressive server compression and keep your pixels pristine.',
    keywords: ['turn jpg images into one pdf without losing quality', 'high quality jpg to pdf', 'image to pdf locally', 'preserve image resolution pdf'],
};

export default function Blog8() {
    return <BlogPostClient {...post10Content} />;
}
