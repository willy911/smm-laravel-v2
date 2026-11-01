import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

export default function Theme({ form }) {
    useEffect(() => {
        const root = document.documentElement;

        const applyCssVariables = () => {
            const isDark = root.classList.contains('dark');
            const currentTheme = isDark ? form.data.theme.dark : form.data.theme.light;

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
    }, [form.data.theme]);

    const hslToCss = (h, s, l, a = 1) => {
        return `hsl(${h} ${s}% ${l}% / ${a})`;
    };

    const hslToHex = (h, s, l) => {
        s /= 100;
        l /= 100;

        const k = (n) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

        const toHex = (x) =>
            Math.round(x * 255)
                .toString(16)
                .padStart(2, '0');

        return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
    };

    const [h, setH] = useState(236);
    const [s, setS] = useState(73.9);
    const [l, setL] = useState(61);
    const [a, setA] = useState(1);

    const css = hslToCss(h, s, l, a);
    const hex = hslToHex(h, s, l);

    useEffect(() => {
        const primary = `hsl(${h} ${s}% ${l}%)`;

        form.setData('theme', {
            light: {
                ...form.data.theme.light,
                primary,
                ring: primary,
                'sidebar-ring': primary,
            },
            dark: {
                ...form.data.theme.dark,
                primary,
                ring: primary,
                'sidebar-ring': primary,
            },
        });
    }, [h, s, l]);

    useEffect(() => {
        const primary = form.data.theme?.light?.primary;

        if (!primary) return;

        const match = primary.match(/hsl\((\d+)\s+([\d.]+)%\s+([\d.]+)%\)/);

        if (match) {
            setH(Number(match[1]));
            setS(Number(match[2]));
            setL(Number(match[3]));
        }
    }, []);

    return (
        <div className="grid items-start gap-4">
            <div className="grid gap-2">
                <Label>Warna Primer</Label>
                <div className="bg-muted flex gap-4 rounded-xl p-4 text-white shadow-lg">
                    {/* PREVIEW */}
                    <div className="h-24 w-24 rounded-lg" style={{ background: css }} />

                    {/* SLIDERS */}
                    <div className="flex-1 space-y-3">
                        {/* HUE */}
                        <div className="flex items-center gap-3">
                            <Slider
                                value={h}
                                min={0}
                                max={360}
                                step={1}
                                onChange={setH}
                                style={{
                                    background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)',
                                }}
                            />
                            <input
                                type="number"
                                value={h}
                                onChange={(e) => setH(+e.target.value)}
                                className="w-18 rounded bg-neutral-800 px-2 py-1 text-right"
                            />
                        </div>

                        {/* SATURATION */}
                        <div className="flex items-center gap-3">
                            <Slider
                                value={s}
                                min={0}
                                max={100}
                                step={0.1}
                                onChange={setS}
                                style={{
                                    background: `linear-gradient(to right,
                hsl(${h} 0% ${l}%),
                hsl(${h} 100% ${l}%)
              )`,
                                }}
                            />
                            <input
                                type="number"
                                value={s}
                                onChange={(e) => setS(+e.target.value)}
                                className="w-18 rounded bg-neutral-800 px-2 py-1 text-right"
                            />
                        </div>

                        {/* LIGHTNESS */}
                        <div className="flex items-center gap-3">
                            <Slider
                                value={l}
                                min={0}
                                max={100}
                                step={0.1}
                                onChange={setL}
                                style={{
                                    background: `linear-gradient(to right,
                hsl(${h} ${s}% 0%),
                hsl(${h} ${s}% 50%),
                hsl(${h} ${s}% 100%)
              )`,
                                }}
                            />
                            <input
                                type="number"
                                value={l}
                                onChange={(e) => setL(+e.target.value)}
                                className="w-18 rounded bg-neutral-800 px-2 py-1 text-right"
                            />
                        </div>

                        {/* ALPHA */}
                        <div className="flex items-center gap-3">
                            <Slider
                                value={a}
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={setA}
                                style={{
                                    background: `
                linear-gradient(to right,
                  hsla(${h} ${s}% ${l}% / 0),
                  hsla(${h} ${s}% ${l}% / 1)
                ),
                repeating-conic-gradient(#777 0% 25%, #444 0% 50%) 0 0 / 12px 12px
              `,
                                }}
                            />
                            <input
                                type="number"
                                step="0.01"
                                value={a}
                                onChange={(e) => setA(+e.target.value)}
                                className="w-18 rounded bg-neutral-800 px-2 py-1 text-right"
                            />
                        </div>

                        {/* OUTPUT */}
                        <div className="flex items-center justify-between pt-2 text-sm">
                            <span>{hex}</span>
                            <span>
                                hsl({h} {s}% {l}%)
                            </span>
                        </div>
                    </div>
                </div>
                {form.invalid('website.sub_name') && <InputError message={form.errors['website.sub_name']} />}
            </div>
        </div>
    );
}

const Slider = ({ value, min, max, step, onChange, style }) => {
    return (
        <input
            type="range"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(+e.target.value)}
            className="h-3 w-full cursor-pointer appearance-none rounded-full"
            style={style}
        />
    );
};
