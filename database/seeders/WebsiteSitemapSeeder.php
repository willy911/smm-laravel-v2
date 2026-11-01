<?php

/*
|--------------------------------------------------------------------------
| Source by jhonroot
|--------------------------------------------------------------------------
| * Facebook : https://fb.me/jhonroott  
| * Whatsapp : https://wa.me/6285349680016  
| * Telegram : https://t.me/jhondelton   
| * Web      : www.jhonroot.dev
|--------------------------------------------------------------------------
*/

namespace Database\Seeders;

use App\Models\User\User;
use App\Models\Website\WebsiteNews;
use App\Models\Website\WebsiteSitemap;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class WebsiteSitemapSeeder extends Seeder
{
    public function run(): void
    {
        if (!WebsiteSitemap::where('title', 'Pertanyaan Umum')->first()) WebsiteSitemap::create([
            'title'   => 'Pertanyaan Umum',
            'slug'    => 'faq',
            'content' => '-',
        ]);
        if (!WebsiteSitemap::where('title', 'Ketentuan Layanan')->first()) WebsiteSitemap::create([
            'title'   => 'Ketentuan Layanan',
            'slug'    => 'tos',
            'content' => '<p>Ketentuan Layanan yang disediakan oleh <em>SMM Kita</em> telah ditetapkan kesepakatan-kesepakatan berikut.</p>
<p><strong>1. Umum</strong></p>
<ul>
<li>Dengan mendaftar dan menggunakan layanan <em>SMM Kita</em>, Anda secara otomatis menyetujui semua ketentuan layanan kami. Kami berhak mengubah ketentuan layanan ini tanpa pemberitahuan terlebih dahulu. Anda diharapkan membaca semua ketentuan layanan kami sebelum membuat pesanan.</li>
<li>Syarat dan Ketentuan Penggunaan ini merupakan catatan elektronik dalam arti hukum yang berlaku. Catatan elektronik ini dibuat oleh sistem komputer dan tidak memerlukan tanda tangan fisik atau digital.</li>
<li>Penolakan: <em>SMM Kita</em> tidak akan bertanggung jawab jika Anda mengalami kerugian dalam bisnis Anda.</li>
<li>Kewajiban: <em>SMM Kita</em> tidak bertanggung jawab jika Anda mengalami suspensi atau penghapusan akun yang dilakukan oleh Instagram, Twitter, Facebook, Youtube, dan lain-lain.</li>
</ul>
<p><strong>2. Layanan</strong></p>
<ul>
<li><em>SMM Kita</em> dapat digunakan untuk media promosi sosial media dan membantu meningkatkan penampilan atau popularitas akun Anda.</li>
<li><em>SMM Kita</em> tidak menjamin pengikut baru Anda dapat berinteraksi dengan Anda, kami hanya menjamin bahwa Anda mendapat pengikut yang Anda beli.</li>
<li><em>SMM Kita</em> tidak menjamin bahwa 100% akun kami akan memiliki gambar profil, gambar bio dan unggahan penuh, meskipun kami berusaha keras mewujudkan realitas ini untuk semua akun.</li>
<li><em>SMM Kita</em> tidak memiliki estimasi atau jendela waktu kapan pesanan Anda akan diselesaikan, namun kami menjamin seluruh pesanan tuntas tanpa terkecuali. Estimasi pada deskripsi layanan hanya perkiraan.</li>
<li><em>SMM Kita</em> berusaha sebaik mungkin untuk memberikan apa yang Anda / Reseller harapkan kepada kami.</li>
<li><em>SMM Kita</em> tidak menjamin bahwa pesanan Anda tidak mengalami drop atau penurunan, karena pada dasarnya seluruh layanan kami dapat mengalami drop dan drop pada pesanan itu murni atau pure dari sistem platform. Anda dapat menggunakan layanan refill untuk mendapat jaminan isi ulang jika sewaktu-waktu pesanan Anda mengalami drop.</li>
<li><em>SMM Kita</em> hanya melakukan pengecekan berdasarkan satu data pesanan terakhir yang Anda pesan dan bukan total keseluruhan pesanan.</li>
<li>Proses pesanan pada umumnya selesai dalam hitungan menit atau jam tergantung dari layanan yang Anda pilih.</li>
<li>Data target seperti username dan url yang Anda input saat membuat pesanan hanyalah untuk keperluan proses pesanan dan kami tidak akan menyebarluaskannya karena kami menjaga dengan baik Privasi Anda.</li>
</ul>
<p><strong>3. Transaksi</strong></p>
<ul>
<li>Transaksi atau pemesanan yang telah anda telah buat tidak dapat dibatalkan.</li>
<li><em>SMM Kita</em> berhak melakukan pembatalan pesanan terhadap pembelian layanan yang berhubungan dengan pelanggaran hukum.</li>
<li>Harga layanan yang kami sediakan dapat berubah sewaktu-waktu tanpa pemberitahuan.</li>
<li>Dengan melakukan pemesanan di SMM Kita, anda telah menyetujui dan membaca peraturan sebelum membeli layanan kami.</li>
</ul>
<p><strong>4. Refund</strong></p>
<ul>
<li>Kami tidak menerima permintaan pengembalian saldo dalam bentuk apapun setelah deposit berhasil dilakukan, tidak ada cara untuk mengembalikannya. Anda harus menggunakan saldo Anda untuk memesan dari <em>SMM Kita</em>.</li>
<li>Deposit yang tidak di konfirmasi selama 24 jam akan kita anggap hangus, dikarenakan sangat sulit untuk melakukan pengecekan data ataupun mutasi. Karena kami menerima ratusan data deposit setiap hari.</li>
<li>Kami tidak menerima permintaan pembatalan/pengembalian dana setelah pesanan masuk ke sistem kami. Kami memberikan pengembalian dana yang sesuai jika pesanan tidak dapat diselesaikan.</li>
<li>Jika kami mendapat laporan adanya aktifitas penipuan atau kecurangan. Kami berhak nonaktifkan akun Anda.</li>
<li>Jika Anda melakukan double pesan ke target yang sama, atau Anda membuat pesanan kedua sebelum pesanan pertama selesai, kami tidak bertanggung jawab dan tidak ada pengembalian saldo jika terjadi masalah pada salah satu pesanan Anda. Harap berhati-hati dan luangkan waktu Anda untuk menunggu proses pesanan yang telah dibuat.</li>
<li>Jika pesanan Anda melebihi batas maksimal pertarget dan pesanan Anda bermasalah, maka tidak ada pengembalian dana dikarenakan itu kesalahan dari pengguna, (Maksimal order pertarget yang tertera di label layanan).</li>
<li>Pesanan dengan target akun private atau salah target, tidak akan mendapat pengembalian dana dikarenakan itu kesalahan dari pengguna. Pastikan Anda selalu mengecek kembali pesanan sebelum pesanan dibuat.</li>
</ul>
<p><strong>5. Privacy</strong></p>
<ul>
<li>Kami menjaga privasi Anda dengan serius dan akan mengambil semua tindakan untuk melindungi informasi pribadi Anda.</li>
<li>Informasi / data pribadi yang Anda berikan kepada kami selama penggunaan situs akan diperlakukan sebagai kerahasiaan ketat sesuai dengan hukum dan peraturan yang berlaku.</li>
<li>Setiap informasi pribadi yang diterima hanya akan digunakan untuk mengisi pesanan Anda. Kami tidak akan menjual atau mendistribusikan ulang informasi Anda kepada siapa pun. Semua informasi dienkripsi dan disimpan di server yang aman.</li>
</ul>',
        ]);
    }
}
