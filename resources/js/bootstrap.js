import axios from 'axios';

// Penjaga agar berkas ini aman bila ikut dievaluasi di lingkungan tanpa `window`
// (mis. proses SSR / build).
if (typeof window !== 'undefined') {
    window.axios = axios;

    // Laravel memakai header ini untuk `request()->ajax()`. Tanpa header ini,
    // endpoint yang dijaga `abort_if(!request()->ajax(), 404)` akan membalas 404.
    window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}

export default axios;
