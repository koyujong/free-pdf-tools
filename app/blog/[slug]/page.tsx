import { blogPosts } from "../../../lib/blogData";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import BlogPostClient from "../../../components/BlogPostClient";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return { title: "Post Not Found" };

    const translations = blogPosts.filter(
        (p) => p.translationGroup === post.translationGroup
    );

    const DOMAIN = 'https://freepdf.4kdrivewalk.com';
    const languages: Record<string, string> = {};
    translations.forEach((t) => {
        languages[t.language] = `${DOMAIN}/blog/${t.slug}`;
    });
    const enPost = translations.find((t) => t.language === "en");
    if (enPost) {
        languages["x-default"] = `${DOMAIN}/blog/${enPost.slug}`;
    }

    return {
        title: post.title,
        description: post.description,
        keywords: post.keywords,
        alternates: {
            canonical: `${DOMAIN}/blog/${post.slug}`,
            languages,
        },
        openGraph: {
            title: post.title,
            description: post.description,
            type: "article",
        }
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) notFound();

    return <BlogPostClient content={post.content} cta={post.cta} />;
}
