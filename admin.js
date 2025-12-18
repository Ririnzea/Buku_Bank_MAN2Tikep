class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.currentEditIndex = -1;
        this.adminCredentials = {
            username: 'admin',
            password: 'admin123'
        };
        this.settings = {
            namaMadrasah: 'MAN 2 KOTA TIDORE KEPULAUAN',
            namaKepala: 'Nurlaila Usman, S.Pd',
            nipKepala: 'NIP.196604021994032001',
            namaBendahara: 'Sarbanun senuk, S.Pd',
            nipBendahara: 'NIP 198005052003122003',
            logo: ''
        };
        this.transactions = [];
        this.initializeApp();
        this.loadData();
        this.checkLoginSession();
    }

    initializeApp() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Home button
        document.getElementById('homeBtn').addEventListener('click', () => this.goHome());
        document.getElementById('headerHomeBtn').addEventListener('click', () => this.goHome());

        // Settings form
        document.getElementById('settingsForm').addEventListener('submit', (e) => this.handleSettingsSubmit(e));
        document.getElementById('resetSettingsBtn').addEventListener('click', () => this.resetSettings());

        // Logo upload
        document.getElementById('uploadLogoBtn').addEventListener('click', () => {
            document.getElementById('logoUpload').click();
        });
        document.getElementById('logoUpload').addEventListener('change', (e) => this.handleLogoUpload(e));
        document.getElementById('removeLogoBtn').addEventListener('click', () => this.removeLogo());

        // Transaction management
        document.getElementById('addTransactionBtn').addEventListener('click', () => this.openTransactionModal());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllTransactions());
        document.getElementById('loadSampleBtn').addEventListener('click', () => this.loadSampleData());
        document.getElementById('transactionForm').addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        document.getElementById('cancelTransactionBtn').addEventListener('click', () => this.closeTransactionModal());
        document.querySelector('.close').addEventListener('click', () => this.closeTransactionModal());

        // Reports
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateReport());

        // Backup & Restore
        document.getElementById('backupBtn').addEventListener('click', () => this.backupData());
        document.getElementById('restoreBtn').addEventListener('click', () => {
            document.getElementById('restoreFile').click();
        });
        document.getElementById('restoreFile').addEventListener('change', (e) => this.restoreData(e));

        // Security
        document.getElementById('securityForm').addEventListener('submit', (e) => this.handleSecuritySubmit(e));

        // Export data
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());

        // Modal close on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('transactionModal');
            if (e.target === modal) {
                this.closeTransactionModal();
            }
        });
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === this.adminCredentials.username && password === this.adminCredentials.password) {
            this.isLoggedIn = true;
            // Save login session
            localStorage.setItem('adminLoginSession', 'true');
            localStorage.setItem('adminLoginTime', new Date().getTime().toString());
            
            this.showDashboard();
        } else {
            alert('❌ Username atau password salah!');
        }
    }

    logout() {
        this.isLoggedIn = false;
        // Clear login session
        localStorage.removeItem('adminLoginSession');
        localStorage.removeItem('adminLoginTime');
        
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('loginForm').reset();
    }

    goHome() {
        // Redirect back to main application
        window.location.href = 'index.html';
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
        document.getElementById(sectionName).classList.add('active');

        // Load section-specific data
        if (sectionName === 'dashboard') {
            this.updateDashboard();
        } else if (sectionName === 'transactions') {
            this.loadTransactionTable();
        } else if (sectionName === 'settings') {
            this.loadSettingsForm();
        }
    }

    loadData() {
        // Load settings
        const savedSettings = localStorage.getItem('bankBookSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }

        // Load credentials
        const savedCredentials = localStorage.getItem('adminCredentials');
        if (savedCredentials) {
            this.adminCredentials = JSON.parse(savedCredentials);
        }

        // Load transactions (from main app)
        const savedTransactions = localStorage.getItem('bankBookTransactions');
        if (savedTransactions) {
            this.transactions = JSON.parse(savedTransactions);
        } else {
            this.loadSampleData();
        }
    }

    saveData() {
        localStorage.setItem('bankBookSettings', JSON.stringify(this.settings));
        localStorage.setItem('adminCredentials', JSON.stringify(this.adminCredentials));
        localStorage.setItem('bankBookTransactions', JSON.stringify(this.transactions));
    }

    updateDashboard() {
        const totalTransactions = this.transactions.length;
        const totalPenerimaan = this.transactions.reduce((sum, t) => sum + (t.penerimaan || 0), 0);
        const totalPengeluaran = this.transactions.reduce((sum, t) => sum + (t.pengeluaran || 0), 0);
        const saldoAkhir = totalPenerimaan - totalPengeluaran;

        document.getElementById('totalTransactions').textContent = totalTransactions;
        document.getElementById('totalPenerimaan').textContent = this.formatCurrency(totalPenerimaan);
        document.getElementById('totalPengeluaran').textContent = this.formatCurrency(totalPengeluaran);
        document.getElementById('saldoAkhir').textContent = this.formatCurrency(saldoAkhir);
    }

    loadSettingsForm() {
        document.getElementById('namaMadrasah').value = this.settings.namaMadrasah;
        document.getElementById('namaKepala').value = this.settings.namaKepala;
        document.getElementById('nipKepala').value = this.settings.nipKepala;
        document.getElementById('namaBendahara').value = this.settings.namaBendahara;
        document.getElementById('nipBendahara').value = this.settings.nipBendahara;
        this.updateLogoPreview();
    }

    handleSettingsSubmit(e) {
        e.preventDefault();
        
        this.settings = {
            ...this.settings,
            namaMadrasah: document.getElementById('namaMadrasah').value,
            namaKepala: document.getElementById('namaKepala').value,
            nipKepala: document.getElementById('nipKepala').value,
            namaBendahara: document.getElementById('namaBendahara').value,
            nipBendahara: document.getElementById('nipBendahara').value
        };

        this.saveData();
        alert('✅ Pengaturan berhasil disimpan!');
    }

    resetSettings() {
        if (confirm('Apakah Anda yakin ingin mereset pengaturan ke default?')) {
            this.settings = {
                namaMadrasah: 'MAN 2 KOTA TIDORE KEPULAUAN',
                namaKepala: 'Nurlaila Usman, S.Pd',
                nipKepala: 'NIP.196604021994032001',
                namaBendahara: 'Sarbanun senuk, S.Pd',
                nipBendahara: 'NIP 198005052003122003',
                logo: ''
            };
            this.loadSettingsForm();
            this.saveData();
            alert('✅ Pengaturan berhasil direset!');
        }
    }

    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('❌ Ukuran file terlalu besar! Maksimal 2MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                this.settings.logo = event.target.result;
                this.updateLogoPreview();
                document.getElementById('removeLogoBtn').style.display = 'inline-block';
            };
            reader.readAsDataURL(file);
        }
    }

    updateLogoPreview() {
        const preview = document.getElementById('logoPreview');
        const removeBtn = document.getElementById('removeLogoBtn');
        
        if (this.settings.logo) {
            preview.innerHTML = `<img src="${this.settings.logo}" alt="Logo Preview">`;
            removeBtn.style.display = 'inline-block';
        } else {
            preview.innerHTML = '<span>Belum ada logo</span>';
            removeBtn.style.display = 'none';
        }
    }

    removeLogo() {
        if (confirm('Apakah Anda yakin ingin menghapus logo?')) {
            this.settings.logo = '';
            this.updateLogoPreview();
            document.getElementById('logoUpload').value = '';
        }
    }

    loadSampleData() {
        this.transactions = [
            {
                date: '2025-04-11',
                bukti: 'SO/814/15/018',
                uraian: 'Saldo Awal',
                kodeRekening: '',
                penerimaan: 1500000,
                pengeluaran: 0
            },
            {
                date: '2025-08-15',
                bukti: 'DIKNAS15',
                uraian: 'Dana Masuk sesuai SP2D',
                kodeRekening: '',
                penerimaan: 103500000,
                pengeluaran: 0
            },
            {
                date: '2025-08-20',
                bukti: 'BMM904926',
                uraian: 'Tarik Tunai',
                kodeRekening: '',
                penerimaan: 0,
                pengeluaran: 56000000
            },
            {
                date: '2025-10-23',
                bukti: 'BMM904926',
                uraian: 'Tarik Tunai',
                kodeRekening: '',
                penerimaan: 0,
                pengeluaran: 47500000
            }
        ];
        this.saveData();
        this.loadTransactionTable();
        this.updateDashboard();
        alert('✅ Data contoh berhasil dimuat!');
    }

    clearAllTransactions() {
        if (confirm('Apakah Anda yakin ingin menghapus semua data transaksi?')) {
            this.transactions = [];
            this.saveData();
            this.loadTransactionTable();
            this.updateDashboard();
            alert('✅ Semua data transaksi berhasil dihapus!');
        }
    }

    loadTransactionTable() {
        const tbody = document.getElementById('transactionTableBody');
        const transactionsWithSaldo = this.calculateSaldo();
        
        tbody.innerHTML = '';
        
        transactionsWithSaldo.forEach((transaction, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.bukti}</td>
                <td>${transaction.uraian}</td>
                <td>${transaction.kodeRekening}</td>
                <td class="number-cell">${this.formatCurrency(transaction.penerimaan)}</td>
                <td class="number-cell">${this.formatCurrency(transaction.pengeluaran)}</td>
                <td class="number-cell">${this.formatCurrency(transaction.saldo)}</td>
                <td>
                    <button class="btn btn-info" onclick="adminPanel.editTransaction(${index})" style="margin-right: 5px; padding: 5px 10px; font-size: 12px;">Edit</button>
                    <button class="btn btn-danger" onclick="adminPanel.deleteTransaction(${index})" style="padding: 5px 10px; font-size: 12px;">Hapus</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    openTransactionModal(index = -1) {
        this.currentEditIndex = index;
        const modal = document.getElementById('transactionModal');
        const title = document.getElementById('modalTitle');
        
        if (index >= 0) {
            title.textContent = 'Edit Transaksi';
            const transaction = this.transactions[index];
            document.getElementById('transactionDate').value = transaction.date;
            document.getElementById('transactionBukti').value = transaction.bukti;
            document.getElementById('transactionUraian').value = transaction.uraian;
            document.getElementById('transactionKode').value = transaction.kodeRekening;
            document.getElementById('transactionPenerimaan').value = transaction.penerimaan || '';
            document.getElementById('transactionPengeluaran').value = transaction.pengeluaran || '';
        } else {
            title.textContent = 'Tambah Transaksi';
            document.getElementById('transactionForm').reset();
            document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
        }
        
        modal.style.display = 'block';
    }

    closeTransactionModal() {
        document.getElementById('transactionModal').style.display = 'none';
        this.currentEditIndex = -1;
    }

    handleTransactionSubmit(e) {
        e.preventDefault();
        
        const formData = {
            date: document.getElementById('transactionDate').value,
            bukti: document.getElementById('transactionBukti').value,
            uraian: document.getElementById('transactionUraian').value,
            kodeRekening: document.getElementById('transactionKode').value,
            penerimaan: parseFloat(document.getElementById('transactionPenerimaan').value) || 0,
            pengeluaran: parseFloat(document.getElementById('transactionPengeluaran').value) || 0
        };

        if (this.currentEditIndex >= 0) {
            this.transactions[this.currentEditIndex] = formData;
        } else {
            this.transactions.push(formData);
        }

        this.transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.saveData();
        this.loadTransactionTable();
        this.updateDashboard();
        this.closeTransactionModal();
        alert('✅ Transaksi berhasil disimpan!');
    }

    editTransaction(index) {
        this.openTransactionModal(index);
    }

    deleteTransaction(index) {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            this.transactions.splice(index, 1);
            this.saveData();
            this.loadTransactionTable();
            this.updateDashboard();
            alert('✅ Transaksi berhasil dihapus!');
        }
    }

    generateReport() {
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        
        let filteredTransactions = this.transactions;
        
        if (startDate) {
            filteredTransactions = filteredTransactions.filter(t => t.date >= startDate);
        }
        if (endDate) {
            filteredTransactions = filteredTransactions.filter(t => t.date <= endDate);
        }

        const totalPenerimaan = filteredTransactions.reduce((sum, t) => sum + (t.penerimaan || 0), 0);
        const totalPengeluaran = filteredTransactions.reduce((sum, t) => sum + (t.pengeluaran || 0), 0);
        const saldo = totalPenerimaan - totalPengeluaran;
        const transactionsWithSaldo = this.calculateSaldoForTransactions(filteredTransactions);

        const reportResult = document.getElementById('reportResult');
        reportResult.innerHTML = `
            <div class="print-header" style="text-align: center; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 30px; margin-bottom: 20px;">
                    ${this.settings.logo ? `<img src="${this.settings.logo}" alt="Logo Madrasah" style="max-height: 80px; max-width: 80px; object-fit: contain;">` : ''}
                    <div style="flex: 1; text-align: center;">
                        <h1 style="font-size: 20px; margin-bottom: 5px; font-weight: bold;">LAPORAN KEUANGAN</h1>
                        <h2 style="font-size: 16px; margin-bottom: 5px; font-weight: bold;">BUKU PEMBANTU BANK</h2>
                        <h3 style="font-size: 14px; color: #666;">${this.settings.namaMadrasah}</h3>
                    </div>
                    ${this.settings.logo ? `<div style="width: 80px;"></div>` : ''}
                </div>
                <hr style="border: 2px solid #333; margin: 20px 0;">
            </div>
            
            <div class="report-info" style="margin-bottom: 25px;">
                <p><strong>Periode:</strong> ${startDate ? this.formatDate(startDate) : 'Semua'} - ${endDate ? this.formatDate(endDate) : 'Semua'}</p>
                <p><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
            </div>
            
            <div class="summary-section" style="margin-bottom: 30px;">
                <h4 style="background: #333; color: white; padding: 10px; text-align: center; margin-bottom: 15px;">RINGKASAN KEUANGAN</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="border: 1px solid #333; padding: 10px; font-weight: bold;">Total Transaksi</td>
                        <td style="border: 1px solid #333; padding: 10px; text-align: right;">${filteredTransactions.length}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #333; padding: 10px; font-weight: bold;">Total Penerimaan</td>
                        <td style="border: 1px solid #333; padding: 10px; text-align: right; color: #28a745;">${this.formatCurrency(totalPenerimaan)}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #333; padding: 10px; font-weight: bold;">Total Pengeluaran</td>
                        <td style="border: 1px solid #333; padding: 10px; text-align: right; color: #dc3545;">${this.formatCurrency(totalPengeluaran)}</td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                        <td style="border: 1px solid #333; padding: 10px; font-weight: bold;">Saldo Akhir</td>
                        <td style="border: 1px solid #333; padding: 10px; text-align: right; font-weight: bold;">${this.formatCurrency(saldo)}</td>
                    </tr>
                </table>
            </div>
            
            <div class="transaction-detail" style="margin-bottom: 40px;">
                <h4 style="background: #333; color: white; padding: 10px; text-align: center; margin-bottom: 15px;">DETAIL TRANSAKSI</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="border: 1px solid #333; padding: 8px; font-weight: bold;">No</th>
                            <th style="border: 1px solid #333; padding: 8px; font-weight: bold;">Tanggal</th>
                            <th style="border: 1px solid #333; padding: 8px; font-weight: bold;">No Bukti</th>
                            <th style="border: 1px solid #333; padding: 8px; font-weight: bold;">Uraian</th>
                            <th style="border: 1px solid #333; padding: 8px; font-weight: bold;">Kode Rekening</th>
                            <th style="border: 1px solid #333; padding: 8px; font-weight: bold;">Penerimaan</th>
                            <th style="border: 1px solid #333; padding: 8px; font-weight: bold;">Pengeluaran</th>
                            <th style="border: 1px solid #333; padding: 8px; font-weight: bold;">Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactionsWithSaldo.map((transaction, index) => `
                            <tr>
                                <td style="border: 1px solid #333; padding: 6px; text-align: center;">${index + 1}</td>
                                <td style="border: 1px solid #333; padding: 6px; text-align: center;">${this.formatDate(transaction.date)}</td>
                                <td style="border: 1px solid #333; padding: 6px; text-align: center;">${transaction.bukti}</td>
                                <td style="border: 1px solid #333; padding: 6px; text-align: left;">${transaction.uraian}</td>
                                <td style="border: 1px solid #333; padding: 6px; text-align: center;">${transaction.kodeRekening}</td>
                                <td style="border: 1px solid #333; padding: 6px; text-align: right;">${this.formatCurrency(transaction.penerimaan)}</td>
                                <td style="border: 1px solid #333; padding: 6px; text-align: right;">${this.formatCurrency(transaction.pengeluaran)}</td>
                                <td style="border: 1px solid #333; padding: 6px; text-align: right; font-weight: bold;">${this.formatCurrency(transaction.saldo)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="signature-section" style="display: flex; justify-content: space-between; margin-top: 50px;">
                <div style="text-align: center; width: 45%;">
                    <p>Mengetahui</p>
                    <p><strong>Kepala Madrasah</strong></p>
                    <div style="height: 60px; margin: 15px 0;"></div>
                    <p><strong>${this.settings.namaKepala}</strong></p>
                    <p>${this.settings.nipKepala}</p>
                </div>
                <div style="text-align: center; width: 45%;">
                    <p>Tidore, ${new Date().toLocaleDateString('id-ID')}</p>
                    <p><strong>Bendahara BOSDA</strong></p>
                    <div style="height: 60px; margin: 15px 0;"></div>
                    <p><strong>${this.settings.namaBendahara}</strong></p>
                    <p>${this.settings.nipBendahara}</p>
                </div>
            </div>
            
            <div class="no-print" style="margin-top: 30px; text-align: center;">
                <button class="btn btn-primary" onclick="window.print()">🖨️ Cetak Laporan</button>
            </div>
        `;
    }

    calculateSaldoForTransactions(transactions) {
        let saldo = 0;
        return transactions.map(transaction => {
            saldo += (transaction.penerimaan || 0) - (transaction.pengeluaran || 0);
            return { ...transaction, saldo };
        });
    }

    backupData() {
        const backupData = {
            settings: this.settings,
            transactions: this.transactions,
            credentials: this.adminCredentials,
            timestamp: new Date().toISOString()
        };

        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `backup-buku-bank-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        alert('✅ Backup berhasil diunduh!');
    }

    restoreData(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const backupData = JSON.parse(event.target.result);
                    
                    if (confirm('Apakah Anda yakin ingin mengembalikan data dari backup? Data saat ini akan ditimpa.')) {
                        this.settings = backupData.settings || this.settings;
                        this.transactions = backupData.transactions || [];
                        this.adminCredentials = backupData.credentials || this.adminCredentials;
                        
                        this.saveData();
                        this.loadSettingsForm();
                        this.loadTransactionTable();
                        this.updateDashboard();
                        
                        alert('✅ Data berhasil dipulihkan dari backup!');
                    }
                } catch (error) {
                    alert('❌ File backup tidak valid!');
                }
            };
            reader.readAsText(file);
        }
    }

    handleSecuritySubmit(e) {
        e.preventDefault();
        
        const newUsername = document.getElementById('newUsername').value;
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (currentPassword !== this.adminCredentials.password) {
            alert('❌ Password saat ini salah!');
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            alert('❌ Konfirmasi password tidak cocok!');
            return;
        }

        if (newUsername.trim()) {
            this.adminCredentials.username = newUsername.trim();
        }
        if (newPassword.trim()) {
            this.adminCredentials.password = newPassword.trim();
        }

        this.saveData();
        document.getElementById('securityForm').reset();
        alert('✅ Kredensial admin berhasil diperbarui!');
    }

    exportData() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `data-buku-bank-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        alert('✅ Data berhasil diekspor ke CSV!');
    }

    generateCSV() {
        const headers = ['No', 'Tanggal', 'No Bukti', 'Uraian', 'Kode Rekening', 'Penerimaan', 'Pengeluaran', 'Saldo'];
        const transactionsWithSaldo = this.calculateSaldo();
        
        let csv = headers.join(',') + '\n';
        
        transactionsWithSaldo.forEach((transaction, index) => {
            const row = [
                index + 1,
                transaction.date,
                `"${transaction.bukti}"`,
                `"${transaction.uraian}"`,
                `"${transaction.kodeRekening}"`,
                transaction.penerimaan || 0,
                transaction.pengeluaran || 0,
                transaction.saldo
            ];
            csv += row.join(',') + '\n';
        });
        
        return csv;
    }

    calculateSaldo() {
        let saldo = 0;
        return this.transactions.map(transaction => {
            saldo += (transaction.penerimaan || 0) - (transaction.pengeluaran || 0);
            return { ...transaction, saldo };
        });
    }

    formatCurrency(amount) {
        if (!amount || amount === 0) return 'Rp 0';
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    checkLoginSession() {
        const loginSession = localStorage.getItem('adminLoginSession');
        const loginTime = localStorage.getItem('adminLoginTime');
        
        // Check if coming from main app (URL parameter or referrer)
        const urlParams = new URLSearchParams(window.location.search);
        const fromMainApp = urlParams.get('from') === 'main' || document.referrer.includes('index.html');
        
        if (loginSession === 'true' && loginTime) {
            const currentTime = new Date().getTime();
            const sessionTime = parseInt(loginTime);
            const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            // Check if session is still valid (24 hours)
            if (currentTime - sessionTime < sessionDuration) {
                this.isLoggedIn = true;
                this.showDashboard();
                return;
            } else {
                // Session expired, clear it
                localStorage.removeItem('adminLoginSession');
                localStorage.removeItem('adminLoginTime');
            }
        }
        
        // If coming from main app and no valid session, auto-login with default credentials
        if (fromMainApp) {
            this.autoLogin();
        }
    }

    showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        this.updateDashboard();
        this.loadSettingsForm();
    }

    autoLogin() {
        // Auto login with default credentials when coming from main app
        this.isLoggedIn = true;
        // Save login session
        localStorage.setItem('adminLoginSession', 'true');
        localStorage.setItem('adminLoginTime', new Date().getTime().toString());
        
        this.showDashboard();
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel();