import { config, getFile } from '@/lib/utils';

export default function AppSkeleton({ pageProps }) {
    return (
        <div className="bg-accent relative flex h-full min-h-screen w-full animate-pulse items-center justify-center rounded-xl">
            <div className="absolute z-10 flex items-center justify-center rounded-2xl">
                <img src={getFile('website', config().icon)} alt="Logo" className="h-12 w-12 rounded-2xl" />
            </div>
        </div>
    );
}
