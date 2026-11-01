import { Card, CardContent } from '@/components/ui/card';
import { useAppearance } from '@/hooks/use-appearance';
import { toast } from '@/hooks/use-toast';
import { cn, config, getFile, toHTML } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster } from '../ui/toaster';
import AppHeader from './app-header';
import LanguageToggleDropdown from './language-dropdown';

export default function Auth({ header, description, pageTitle, children }) {
    const { responseTime, responseError, responseSuccess, theme, configs } = usePage().props;
    const { appearance, updateAppearance } = useAppearance();
    // const canvasRef = useRef(null);

    useEffect(() => {
        const root = document.documentElement;

        const applyCssVariables = () => {
            const isDark = root.classList.contains('dark');
            const currentTheme = isDark ? configs.theme.dark : configs.theme.light;

            if (currentTheme) {
                for (const [key, value] of Object.entries(currentTheme)) {
                    root.style.setProperty(`--${key}`, value);
                }
            }
        };

        applyCssVariables();

        const observer = new MutationObserver(applyCssVariables);
        observer.observe(root, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (responseError)
            toast({
                variant: 'error',
                description: toHTML(responseError),
            });
        if (responseSuccess)
            toast({
                variant: 'success',
                description: toHTML(responseSuccess),
            });
    }, [responseTime]);

    // useEffect(() => {
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');

    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeight;

    //     const images = [];
    //     const imageSources = [
    //         '/assets/images/heart.png',
    //         '/assets/images/thumb.png',
    //         // '/assets/images/avatar.avif',
    //         // "assets/images/thumbs3.png",
    //         // "assets/images/thumbs4.png",
    //     ];

    //     const numFlakes = 50;
    //     const flakes = [];

    //     class Flake {
    //         constructor(x, y, speed, size, image) {
    //             this.x = x;
    //             this.y = y;
    //             this.speed = speed;
    //             this.size = size;
    //             this.image = image;
    //         }

    //         update() {
    //             this.y += this.speed * 0.5;
    //             if (this.y > canvas.height) {
    //                 this.y = -this.size;
    //                 this.x = Math.random() * canvas.width;
    //             }
    //         }

    //         draw() {
    //             ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    //         }
    //     }

    //     let loadedImages = 0;

    //     imageSources.forEach((src) => {
    //         const img = new Image();
    //         img.src = src;
    //         img.onload = () => {
    //             images.push(img);
    //             loadedImages++;
    //             if (loadedImages === imageSources.length) {
    //                 initFlakes();
    //                 animate();
    //             }
    //         };
    //     });

    //     const initFlakes = () => {
    //         for (let i = 0; i < numFlakes; i++) {
    //             const randomImage = images[Math.floor(Math.random() * images.length)];
    //             flakes.push(new Flake(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3 + 1, 30, randomImage));
    //         }
    //     };

    //     const animate = () => {
    //         ctx.clearRect(0, 0, canvas.width, canvas.height);

    //         flakes.forEach((flake) => {
    //             flake.update();
    //             flake.draw();
    //         });

    //         requestAnimationFrame(animate);
    //     };

    //     window.addEventListener('resize', () => {
    //         canvas.width = window.innerWidth;
    //         canvas.height = window.innerHeight;
    //     });

    //     return () => {
    //         window.removeEventListener('resize', () => {
    //             canvas.width = window.innerWidth;
    //             canvas.height = window.innerHeight;
    //         });
    //     };
    // }, []);

    return (
        <>
            <Toaster />
            <AppHeader pageTitle={pageTitle} />
            <LanguageToggleDropdown
                className={cn(
                    route().current('admin.websites.configs.*') ? 'bottom-[54px]' : 'bottom-5',
                    'fixed right-5 z-40 flex items-center gap-1 rounded-lg border shadow-sm',
                )}
            />
            <div className="bg-muted/40 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
                {/* <canvas
                    ref={canvasRef}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                    }}
                ></canvas> */}
                <div className="relative w-full max-w-lg md:max-w-3xl">
                    <div className={cn('flex flex-col gap-6')}>
                        <div className="flex flex-col items-center gap-2">
                            <Link href={route('guest.dashboard')} className="flex flex-col items-center gap-2 font-medium">
                                {!config().logo_lg_light || !config().logo_lg_dark ? (
                                    <span className="text-xl font-semibold">{config().name}</span>
                                ) : (
                                    <div className="flex w-48 items-center justify-center rounded-md">
                                        <img className="block dark:hidden" src={getFile('website', config().logo_lg_light)} alt={config().name} />
                                        <img className="hidden dark:block" src={getFile('website', config().logo_lg_dark)} alt={config().name} />
                                    </div>
                                )}
                            </Link>
                            <div className="text-center">
                                <p className="text-muted-foreground text-center text-sm">{config().sub_name}</p>
                            </div>
                        </div>
                        <Card className="overflow-hidden">
                            <CardContent className="grid p-0 md:grid-cols-2">
                                {children}
                                <div className="bg-muted relative hidden md:block">
                                    <img
                                        src="/assets/images/auth-vector.jpg"
                                        // src="https://ui.shadcn.com/placeholder.svg"
                                        alt="Image"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
