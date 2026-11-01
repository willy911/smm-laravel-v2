import { Button } from '@/components/ui/button';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { CheckIcon } from 'lucide-react';
import { useState } from 'react';

export default function LanguageToggleDropdown({ className = '', ...props }) {
    const { locales } = usePage().props;
    const { language, setLanguage } = useLanguage();
    const [open, setOpen] = useState(false);

    return (
        <div className={className} {...props}>
            <Button variant="outline" size="icon" className="size-8" onClick={() => setOpen(true)}>
                <img
                    src={`https://react-circle-flags.pages.dev/language/${language === 'pt' ? 'pt-br' : language}.svg`}
                    className="size-5 rounded-xl"
                    alt={`flag-${language}`}
                />
                <span className="sr-only">Toggle language</span>
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search language or currency..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Language & Currency">
                        {locales.map((locale, index) => (
                            <CommandItem
                                key={locale.locale}
                                onSelect={() => {
                                    setLanguage(locale.locale);
                                    setOpen(false);
                                }}
                            >
                                <img
                                    src={`https://react-circle-flags.pages.dev/language/${locale.locale === 'pt' ? 'pt-br' : locale.locale}.svg`}
                                    className="size-5 rounded-xl"
                                    alt={`flag-${locale.locale}`}
                                />
                                {locale.language_name} ({locale.currency_code} - {locale.currency_symbol})
                                <CheckIcon className={cn('ml-auto h-4 w-4', locale.locale === language ? 'opacity-100' : 'opacity-0')} />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </div>
    );

    return (
        <div className={className} {...props}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="size-8">
                        <img
                            src={`https://react-circle-flags.pages.dev/language/${language === 'pt' ? 'pt-br' : language}.svg`}
                            className="size-5 rounded-xl"
                            alt={`flag-${language}`}
                        />
                        <span className="sr-only">Toggle language</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {locales.map((locale, index) => (
                        <DropdownMenuItem
                            key={locale.locale}
                            onClick={() => setLanguage(locale.locale)}
                            className="flex cursor-pointer items-center gap-2"
                        >
                            <img
                                src={`https://react-circle-flags.pages.dev/language/${locale.locale === 'pt' ? 'pt-br' : locale.locale}.svg`}
                                className="size-5 rounded-xl"
                                alt={`flag-${locale.locale}`}
                            />
                            {locale.language_name} ({locale.currency_code})
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
