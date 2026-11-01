<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <title>Service Monitor DB</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />
    <style>
        :root {
            --primary: #6879ef;
            --primary-dark: #5a6ad8;
            --primary-light: #eef2ff;
            --bg: #f8fafc;
            --surface: #ffffff;
            --text-main: #334155;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --success: #10b981;
            --danger: #ef4444;
            --warning: #f59e0b;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg);
            color: var(--text-main);
            margin: 0;
            padding: 0;
            font-size: 13px;
            -webkit-font-smoothing: antialiased;
        }

        /* Container dipaskan untuk Mobile */
        .container {
            padding: 16px 12px 80px;
            width: 100%;
        }

        /* Header Ringkas */
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        h1 {
            font-size: 16px;
            /* Dikecilkan agar tidak turun baris */
            color: var(--text-main);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 700;
        }

        h1 i {
            color: var(--primary);
            font-size: 14px;
        }

        .window-badge {
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            color: var(--text-muted);
            white-space: nowrap;
        }

        /* Stats dipaksa 1 baris (3 kolom) */
        .stats-summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 20px;
        }

        .stat-box {
            background: var(--surface);
            border-radius: 12px;
            padding: 12px 4px;
            text-align: center;
            border: 1px solid var(--border);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .stat-box .num {
            font-size: 20px;
            font-weight: 700;
            color: var(--primary);
            display: block;
            margin-bottom: 2px;
            line-height: 1;
        }

        .stat-box .lbl {
            font-size: 10px;
            color: var(--text-muted);
            font-weight: 600;
            text-transform: uppercase;
        }

        /* Sections */
        section {
            margin-bottom: 20px;
            background: var(--surface);
            border-radius: 12px;
            border: 1px solid var(--border);
            overflow: hidden;
        }

        .sec-head {
            background: var(--surface);
            padding: 12px;
            display: flex;
            flex-direction: column;
            /* Search box di bawah judul di layar sempit */
            gap: 10px;
            border-bottom: 1px solid var(--border);
        }

        .sec-head h2 {
            font-size: 14px;
            margin: 0;
            color: var(--text-main);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .badge {
            font-size: 10px;
            padding: 3px 6px;
            border-radius: 4px;
            font-weight: 700;
        }

        .b-fast {
            background: #dcfce7;
            color: #166534;
        }

        .b-slow {
            background: #fee2e2;
            color: #991b1b;
        }

        .b-new {
            background: #dbeafe;
            color: #1e40af;
        }

        /* Search Full Width */
        .search-box {
            position: relative;
            width: 100%;
        }

        .search-box input {
            width: 100%;
            padding: 8px 30px 8px 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 12px;
            outline: none;
            background: #f8fafc;
        }

        .search-box input:focus {
            border-color: var(--primary);
            background: var(--surface);
        }

        .search-box i {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            font-size: 12px;
        }

        /* Table */
        .tbl-wrap {
            max-height: 300px;
            /* Dibatasi agar tidak terlalu panjang ke bawah */
            overflow-y: auto;
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 11px;
        }

        /* Font tabel dikecilkan */

        thead th {
            position: sticky;
            top: 0;
            background: #f1f5f9;
            text-align: left;
            padding: 10px 12px;
            font-weight: 600;
            color: var(--text-muted);
            border-bottom: 1px solid var(--border);
            white-space: nowrap;
            font-size: 10px;
            text-transform: uppercase;
            z-index: 10;
        }

        tbody tr {
            cursor: pointer;
        }

        tbody tr:hover {
            background: var(--bg);
        }

        tbody tr td {
            border-bottom: 1px solid #f1f5f9;
            padding: 10px 12px;
            vertical-align: middle;
            white-space: nowrap;
        }

        .srv-id {
            font-family: 'Courier New', monospace;
            font-weight: 700;
            color: var(--text-muted);
            background: var(--bg);
            padding: 2px 4px;
            border-radius: 4px;
        }

        .srv-name {
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: 600;
            color: var(--text-main);
            display: block;
        }

        /* Alignment */
        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .col-num {
            font-weight: 600;
            color: var(--text-main);
        }

        .st-rate {
            font-weight: 700;
            color: var(--success);
        }

        .st-rate.low {
            color: var(--danger);
        }

        /* Badge Text di Tabel */
        .badge-status {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            display: inline-block;
            min-width: 24px;
            text-align: center;
        }

        .text-proc {
            color: var(--warning);
            background: #fef3c7;
        }

        .text-fail {
            color: var(--danger);
            background: #fee2e2;
        }

        .sub-text {
            font-size: 10px;
            color: var(--text-muted);
            margin-top: 2px;
        }

        /* Floating Refresh Button - Dikecilkan */
        .refresh-float {
            position: fixed;
            bottom: 16px;
            right: 16px;
            background: var(--primary);
            color: #fff;
            border: none;
            width: 46px;
            height: 46px;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(104, 121, 239, 0.4);
            cursor: pointer;
            display: grid;
            place-items: center;
            font-size: 16px;
            z-index: 900;
        }

        .refresh-float:active {
            transform: scale(0.95);
        }

        /* Modal Detail (Tetap sama tapi padding disesuaikan) */
        .modal {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.6);
            z-index: 9999;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(2px);
            padding: 16px;
        }

        .modal.show {
            display: flex;
        }

        .modal-box {
            background: var(--surface);
            width: 100%;
            max-width: 360px;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            animation: popUp 0.2s ease-out;
        }

        @keyframes popUp {
            from {
                transform: scale(0.95);
                opacity: 0;
            }

            to {
                transform: scale(1);
                opacity: 1;
            }
        }

        .m-head {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border);
        }

        .m-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--text-main);
            line-height: 1.3;
            margin-top: 4px;
            word-break: break-word;
            white-space: normal;
        }

        .close-btn {
            background: #f1f5f9;
            border: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            font-size: 16px;
            color: var(--text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .m-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .m-item {
            background: var(--bg);
            padding: 12px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid var(--border);
        }

        .m-val {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-main);
        }

        .m-lbl {
            font-size: 10px;
            color: var(--text-muted);
            margin-top: 4px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .full-w {
            grid-column: span 2;
        }
    </style>
</head>

<body>

    <div class="container">
        <div class="header">
            <h1><i class="fas fa-chart-pie"></i> Monitor Layanan</h1>
            <div class="window-badge"><i class="far fa-clock"></i> Win: <?= $windowDays ?> Hari</div>
        </div>

        <div class="stats-summary">
            <div class="stat-box">
                <span class="num"><?= count($dataFast) ?></span>
                <span class="lbl">Cepat</span>
            </div>
            <div class="stat-box">
                <span class="num"><?= count($dataSlow) ?></span>
                <span class="lbl">Lambat</span>
            </div>
            <div class="stat-box">
                <span class="num"><?= count($dataNew) ?></span>
                <span class="lbl">Baru</span>
            </div>
        </div>

        <?php
        function renderRow($r, $type)
        {
            $s = $r['stats'];
            $extra = $type == 'new' ? $r['fmt_date'] : $r['fmt_time'];
            $rateColor = $s['rate'] < 50 && $s['total'] > 0 ? 'low' : '';
        
            $procDisplay = $s['process'] > 0 ? '<span class="badge-status text-proc">' . $s['process'] . '</span>' : '<span style="color:#cbd5e1">-</span>';
            $failDisplay = $s['failed'] > 0 ? '<span class="badge-status text-fail">' . $s['failed'] . '</span>' : '<span style="color:#cbd5e1">-</span>';
        
            echo "<tr onclick='openModal(" . htmlspecialchars(json_encode($r), ENT_QUOTES, 'UTF-8') . ", \"$type\")'>";
            echo "<td><span class='srv-id'>{$r['service_id']}</span></td>";
            echo "<td><div class='srv-name'>" . htmlspecialchars($r['name']) . '</div></td>';
            echo "<td class='text-right col-num'>{$s['total']}</td>";
        
            echo "<td class='text-right'>";
            echo "<div class='st-rate $rateColor'>{$s['rate']}%</div>";
            echo '</td>';
        
            echo "<td class='text-center'>{$procDisplay}</td>";
            echo "<td class='text-center'>{$failDisplay}</td>";
        
            echo "<td class='text-right' style='color:var(--text-muted); font-weight:500;'>{$extra}</td>";
            echo '</tr>';
        }
        ?>

        <section>
            <div class="sec-head">
                <div style="display:flex; justify-content:space-between; align-items:center; width: 100%;">
                    <h2><i class="fas fa-bolt" style="color:#10b981"></i> Cepat <span class="badge b-fast">≤ 2
                            Jam</span></h2>
                </div>
                <div class="search-box">
                    <input type="text" id="sFast" placeholder="Cari ID / Nama Layanan..."
                        onkeyup="filterTbl('sFast','tFast')">
                    <i class="fas fa-search"></i>
                </div>
            </div>
            <div class="tbl-wrap">
                <table id="tFast">
                    <thead>
                        <tr>
                            <th width="50">ID</th>
                            <th>Layanan</th>
                            <th class="text-right">Tot</th>
                            <th class="text-right">Sks</th>
                            <th class="text-center">Prs</th>
                            <th class="text-center">Ggl</th>
                            <th class="text-right">Durasi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if(empty($dataFast)): ?>
                        <tr>
                            <td colspan="7" class="text-center" style="padding:30px;color:var(--text-muted);">Tidak
                                ada data</td>
                        </tr>
                        <?php else: foreach($dataFast as $r): renderRow($r, 'fast'); endforeach; endif; ?>
                    </tbody>
                </table>
            </div>
        </section>

        <section>
            <div class="sec-head">
                <div style="display:flex; justify-content:space-between; align-items:center; width: 100%;">
                    <h2><i class="fas fa-plus-circle" style="color:#3b82f6"></i> Baru <span
                            class="badge b-new">Added</span></h2>
                </div>
                <div class="search-box">
                    <input type="text" id="sNew" placeholder="Cari ID / Nama Layanan..."
                        onkeyup="filterTbl('sNew','tNew')">
                    <i class="fas fa-search"></i>
                </div>
            </div>
            <div class="tbl-wrap">
                <table id="tNew">
                    <thead>
                        <tr>
                            <th width="50">ID</th>
                            <th>Layanan</th>
                            <th class="text-right">Tot</th>
                            <th class="text-right">Sks</th>
                            <th class="text-center">Prs</th>
                            <th class="text-center">Ggl</th>
                            <th class="text-right">Tgl</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if(empty($dataNew)): ?>
                        <tr>
                            <td colspan="7" class="text-center" style="padding:30px;color:var(--text-muted);">Tidak
                                ada data</td>
                        </tr>
                        <?php else: foreach($dataNew as $r): renderRow($r, 'new'); endforeach; endif; ?>
                    </tbody>
                </table>
            </div>
        </section>

        <section>
            <div class="sec-head">
                <div style="display:flex; justify-content:space-between; align-items:center; width: 100%;">
                    <h2><i class="fas fa-hourglass-half" style="color:#ef4444"></i> Lambat <span class="badge b-slow">≥
                            1 Hari</span></h2>
                </div>
                <div class="search-box">
                    <input type="text" id="sSlow" placeholder="Cari ID / Nama Layanan..."
                        onkeyup="filterTbl('sSlow','tSlow')">
                    <i class="fas fa-search"></i>
                </div>
            </div>
            <div class="tbl-wrap">
                <table id="tSlow">
                    <thead>
                        <tr>
                            <th width="50">ID</th>
                            <th>Layanan</th>
                            <th class="text-right">Tot</th>
                            <th class="text-right">Sks</th>
                            <th class="text-center">Prs</th>
                            <th class="text-center">Ggl</th>
                            <th class="text-right">Durasi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if(empty($dataSlow)): ?>
                        <tr>
                            <td colspan="7" class="text-center" style="padding:30px;color:var(--text-muted);">Tidak
                                ada data</td>
                        </tr>
                        <?php else: foreach($dataSlow as $r): renderRow($r, 'slow'); endforeach; endif; ?>
                    </tbody>
                </table>
            </div>
        </section>

    </div>

    <button class="refresh-float" onclick="location.reload()"><i class="fas fa-sync-alt"></i></button>

    <div id="dtlModal" class="modal">
        <div class="modal-box">
            <div class="m-head">
                <div style="width: calc(100% - 30px);">
                    <div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;font-weight:600;">SERVICE ID:
                        <span id="mId" style="color:var(--primary)"></span></div>
                    <div class="m-title" id="mName">Nama Layanan</div>
                </div>
                <button class="close-btn" onclick="closeModal()"><i class="fas fa-times"></i></button>
            </div>

            <div class="m-grid">
                <div class="m-item">
                    <div class="m-val" id="mTotal">0</div>
                    <div class="m-lbl">Total Order</div>
                </div>
                <div class="m-item">
                    <div class="m-val" style="color:var(--success)" id="mSuccess">0%</div>
                    <div class="m-lbl">Sukses Rate</div>
                </div>

                <div class="m-item">
                    <div class="m-val" style="color:var(--danger)" id="mFail">0</div>
                    <div class="m-lbl">Gagal / Batal</div>
                </div>
                <div class="m-item">
                    <div class="m-val" style="color:var(--warning)" id="mProc">0</div>
                    <div class="m-lbl">Proses</div>
                </div>

                <div class="m-item full-w" id="mExtraBox"
                    style="background:var(--primary-light); border-color:#e0e7ff">
                    <div class="m-val" style="color:var(--primary-dark);font-size:16px" id="mExtra"></div>
                    <div class="m-lbl" id="mExtraLbl" style="color:#6366f1">Info Tambahan</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function filterTbl(inId, tblId) {
            let input = document.getElementById(inId);
            let filter = input.value.toUpperCase();
            let table = document.getElementById(tblId);
            let tr = table.getElementsByTagName("tr");

            for (let i = 1; i < tr.length; i++) {
                let tdId = tr[i].getElementsByTagName("td")[0];
                let tdName = tr[i].getElementsByTagName("td")[1];
                if (tdId || tdName) {
                    let txtValueId = tdId.textContent || tdId.innerText;
                    let txtValueName = tdName.textContent || tdName.innerText;
                    if (txtValueId.toUpperCase().indexOf(filter) > -1 || txtValueName.toUpperCase().indexOf(filter) > -1) {
                        tr[i].style.display = "";
                    } else {
                        tr[i].style.display = "none";
                    }
                }
            }
        }

        function openModal(data, type) {
            document.getElementById('mId').innerText = data.service_id;
            document.getElementById('mName').innerText = data.name;

            let s = data.stats;
            document.getElementById('mTotal').innerText = s.total;
            document.getElementById('mSuccess').innerText = s.rate + "% (" + s.success + ")";
            document.getElementById('mFail').innerText = s.failed;
            document.getElementById('mProc').innerText = s.process;

            let exVal = document.getElementById('mExtra');
            let exLbl = document.getElementById('mExtraLbl');

            if (type === 'new') {
                exVal.innerText = data.fmt_date;
                exLbl.innerText = "Tanggal Ditambahkan";
            } else {
                exVal.innerText = data.fmt_time;
                exLbl.innerText = "Rata-rata Waktu Proses";
            }

            document.getElementById('dtlModal').classList.add('show');
        }

        function closeModal() {
            document.getElementById('dtlModal').classList.remove('show');
        }

        window.onclick = function(event) {
            let m = document.getElementById('dtlModal');
            if (event.target == m) {
                m.classList.remove('show');
            }
        }
    </script>
</body>

</html>
