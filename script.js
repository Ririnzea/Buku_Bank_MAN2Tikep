class BankBookApp {
    constructor() {
        this.transactions = [];
        this.currentEditIndex = -1;
        this.settings = {
            namaMadrasah: 'MAN 2 KOTA TIDORE KEPULAUAN',
            namaKepala: 'Nurlaila Usman, S.Pd',
            nipKepala: 'NIP.196604021994032001',
            namaBendahara: 'Sarbanun senuk, S.Pd',
            nipBendahara: 'NIP 198005052003122003',
            logo: ''
        };
        this.initializeApp();
        this.loadSettings();
        this.loadSampleData();
    }

    initializeApp() {
        // Event listeners
        document.getElementById('addEntryBtn').addEventListener('click', () => {
            console.log('Add Entry button clicked');
            this.openModal();
        });
        document.getElementById('adminBtn').addEventListener('click', () => this.openAdminPanel());
        document.getElementById('printBtn').addEventListener('click', () => this.printTable());
        document.getElementById('transactionForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const transactionModal = document.getElementById('transactionModal');
            if (e.target === transactionModal) {
                this.closeModal();
            }
        });

        // Update current date
        this.updateCurrentDate();
    }

    openAdminPanel() {
        // Redirect to admin dashboard with parameter
        window.location.href = 'admin.html?from=main';
    }

    loadSampleData() {
        // Load from localStorage first
        const savedTransactions = localStorage.getItem('bankBookTransactions');
        if (savedTransactions) {
            this.transactions = JSON.parse(savedTransactions);
        } else {
            // Data contoh sesuai dengan gambar referensi
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
            this.saveTransactions();
        }
        this.renderTable();
    }

    saveTransactions() {
        localStorage.setItem('bankBookTransactions', JSON.stringify(this.transactions));
    }

    openModal(index = -1) {
        console.log('Opening modal, index:', index);
        const modal = document.getElementById('transactionModal');
        const form = document.getElementById('transactionForm');
        const title = document.getElementById('modalTitle');
        
        if (!modal) {
            console.error('Modal element not found!');
            return;
        }
        
        console.log('Modal element found:', modal);
        
        this.currentEditIndex = index;
        
        if (index >= 0) {
            // Edit mode
            title.textContent = 'Edit Transaksi';
            const transaction = this.transactions[index];
            document.getElementById('date').value = transaction.date;
            document.getElementById('bukti').value = transaction.bukti;
            document.getElementById('uraian').value = transaction.uraian;
            document.getElementById('kodeRekening').value = transaction.kodeRekening;
            document.getElementById('penerimaan').value = transaction.penerimaan || '';
            document.getElementById('pengeluaran').value = transaction.pengeluaran || '';
        } else {
            // Add mode
            title.textContent = 'Tambah Transaksi';
            form.reset();
            // Set default date to today
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
        }
        
        // Force show modal with inline styles
        modal.style.display = 'block';
        modal.style.position = 'fixed';
        modal.style.zIndex = '9999';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        
        console.log('Modal should be visible now');
    }

    closeModal() {
        document.getElementById('transactionModal').style.display = 'none';
        this.currentEditIndex = -1;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            date: document.getElementById('date').value,
            bukti: document.getElementById('bukti').value,
            uraian: document.getElementById('uraian').value,
            kodeRekening: document.getElementById('kodeRekening').value,
            penerimaan: parseFloat(document.getElementById('penerimaan').value) || 0,
            pengeluaran: parseFloat(document.getElementById('pengeluaran').value) || 0
        };

        if (this.currentEditIndex >= 0) {
            // Edit existing transaction
            this.transactions[this.currentEditIndex] = formData;
        } else {
            // Add new transaction
            this.transactions.push(formData);
        }

        // Sort transactions by date
        this.transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        this.saveTransactions();
        this.renderTable();
        this.closeModal();
    }

    deleteTransaction(index) {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            this.transactions.splice(index, 1);
            this.saveTransactions();
            this.renderTable();
        }
    }

    calculateSaldo() {
        let saldo = 0;
        return this.transactions.map(transaction => {
            saldo += transaction.penerimaan - transaction.pengeluaran;
            return { ...transaction, saldo };
        });
    }

    formatCurrency(amount) {
        if (!amount || amount === 0) return '';
        return new Intl.NumberFormat('id-ID').format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    }

    renderTable() {
        const tbody = document.getElementById('tableBody');
        const transactionsWithSaldo = this.calculateSaldo();
        
        tbody.innerHTML = '';
        
        transactionsWithSaldo.forEach((transaction, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.bukti}</td>
                <td style="text-align: left; padding-left: 8px;">${transaction.uraian}</td>
                <td>${transaction.kodeRekening}</td>
                <td class="number-cell">${this.formatCurrency(transaction.penerimaan)}</td>
                <td class="number-cell">${this.formatCurrency(transaction.pengeluaran)}</td>
                <td class="number-cell">${this.formatCurrency(transaction.saldo)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="app.openModal(${index})" style="margin-right: 5px; padding: 3px 8px; font-size: 11px;">Edit</button>
                    <button class="btn btn-danger" onclick="app.deleteTransaction(${index})" style="padding: 3px 8px; font-size: 11px;">Hapus</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'Asia/Jakarta'
        };
        const dateString = now.toLocaleDateString('id-ID', options);
        document.getElementById('currentDate').textContent = `Tidore, ${dateString}`;
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('bankBookSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        this.updateDisplay();
    }

    updateDisplay() {
        document.getElementById('madrasahName').textContent = this.settings.namaMadrasah;
        document.getElementById('kepalaName').textContent = this.settings.namaKepala;
        document.getElementById('kepalaNip').textContent = this.settings.nipKepala;
        document.getElementById('bendaharaName').textContent = this.settings.namaBendahara;
        document.getElementById('bendaharaNip').textContent = this.settings.nipBendahara;
        
        // Update logo
        const logoImg = document.getElementById('logoImage');
        if (this.settings.logo) {
            logoImg.src = this.settings.logo;
            logoImg.style.display = 'block';
        } else {
            logoImg.style.display = 'none';
        }
    }

    printTable() {
        // Hide action column before printing
        const actionCells = document.querySelectorAll('th:last-child, td:last-child');
        actionCells.forEach(cell => {
            cell.style.display = 'none';
        });
        
        window.print();
        
        // Show action column after printing
        setTimeout(() => {
            actionCells.forEach(cell => {
                cell.style.display = '';
            });
        }, 1000);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const app = new BankBookApp();
    window.app = app; // Make it globally accessible
});