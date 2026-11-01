import { cn, config, getFile } from '@/lib/utils';
import { Head } from '@inertiajs/react';

export default function Header({ pageTitle }) {
    return (
        <Head>
            {/* Website Title */}
            <title>{pageTitle ? cn(pageTitle, '|', config().name) : cn(config().sub_name, '|', config().name)}</title>

            {/* Website Favicon */}
            <link rel="shortcut icon" href={config().icon && getFile('website', config().icon)} />

            {/* Website Meta Tags */}
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="robots" content="index, follow" />
            <meta name="title" content={pageTitle ? cn(pageTitle, '-', config().name) : cn(config().sub_name, '-', config().name)} />
            <meta name="author" content="jhonroot" />
            <meta name="keywords" content={config().meta_keywords} />
            <meta name="description" content={config().meta_description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={'/'} />
            <meta property="og:title" content={pageTitle ? cn(pageTitle, '-', config().name) : cn(config().sub_name, '-', config().name)} />
            <meta property="og:description" content={config().meta_description} />
            <meta property="og:image" content={config().meta_image && getFile('website', config().meta_image)} />
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={'/'} />
            <meta property="twitter:title" content={config().name} />
            <meta property="twitter:description" content={config().meta_description} />
            <meta property="twitter:image" content={config().meta_image && getFile('website', config().meta_image)} />
        </Head>
    );
}
