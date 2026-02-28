import { BlogPost } from '../blogData';
import React from 'react';

export const post999: BlogPost = {
    slug: "test-auto-indexing-verification-pdf",
    language: "en",
    translationGroup: "post999",
    title: "Test: Auto URL Indexing Verification",
    description: "This is a test post to verify GitHub Actions auto URL indexing workflow for PDF Tools.",
    date: "2026-02-28",
    category: "Test",
    keywords: ["test", "auto indexing"],
    content: (
        <article className="prose prose-lg prose-blue max-w-none">
            <h1>Auto Indexing Test</h1>
            <p>This post verifies that the GitHub Actions workflow automatically submits URLs to Google and Naver.</p>
        </article>
    )
};
