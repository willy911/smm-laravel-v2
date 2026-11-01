import { Component, useEffect, useRef, useState } from 'react';

function toPascalCase(str) {
    return str.replace(/(^\w|_\w)/g, (match) => match.replace('_', '').toUpperCase());
}

// Hanya terima bentuk yang benar-benar bisa dirender React:
// fungsi komponen, forwardRef, atau memo. Element React (object dengan
// $$typeof 'react.element'/'react.transitional.element') SENGAJA ditolak,
// karena me-render element sebagai type memicu React error #130
// ("Element type is invalid ... got: <HugeiconsIcon />") yang memblank-kan
// seluruh halaman.
function isValidIconComponent(value) {
    if (!value) return false;
    if (typeof value === 'function') return true;
    if (typeof value === 'object') {
        const t = value.$$typeof;
        return t === Symbol.for('react.forward_ref') || t === Symbol.for('react.memo');
    }
    return false;
}

// Boundary agar kegagalan render satu icon tidak menjatuhkan pohon React
// seluruh halaman.
class IconErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { failed: false };
    }

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error) {
        console.warn('[DynamicIcon] render icon gagal:', error?.message);
    }

    render() {
        return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
    }
}

let iconCache = {};

export default function DynamicIcon({ iconName, fallback = null, ...props }) {
    const [IconComponent, setIconComponent] = useState(null);
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) return;
        isMounted.current = true;

        let alive = true;
        const formattedIconName = toPascalCase(String(iconName ?? ''));

        if (!formattedIconName) {
            setIconComponent(false);
            return;
        }

        if (iconCache[formattedIconName]) {
            setIconComponent(iconCache[formattedIconName]);
            return;
        }

        import('hugeicons-react')
            .then((Icons) => {
                if (!alive) return;
                const candidate = Icons[formattedIconName] || null;

                if (candidate && !isValidIconComponent(candidate)) {
                    console.warn(
                        `[DynamicIcon] export '${formattedIconName}' bukan komponen (${Object.prototype.toString.call(candidate)}), diabaikan.`,
                    );
                    setIconComponent(false);
                    return;
                }

                if (candidate) {
                    iconCache[formattedIconName] = candidate;
                    setIconComponent(candidate);
                } else {
                    setIconComponent(false);
                }
            })
            .catch((error) => {
                if (!alive) return;
                console.warn('[DynamicIcon] gagal memuat modul icon:', error?.message);
                setIconComponent(false);
            });

        return () => {
            alive = false;
        };
    }, [iconName]);

    // null = sedang memuat modul
    if (IconComponent === null) {
        return fallback;
    }

    if (!isValidIconComponent(IconComponent)) {
        // Icon tidak ditemukan / tidak valid: render placeholder senyap
        // (mempertahankan lebar layout) alih-alih crash.
        return <span className="inline-block size-4 shrink-0" aria-hidden="true" />;
    }

    return (
        <IconErrorBoundary fallback={fallback}>
            <IconComponent {...props} />
        </IconErrorBoundary>
    );
}
