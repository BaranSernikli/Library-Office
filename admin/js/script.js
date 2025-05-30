if (!localStorage.getItem('kitaplar')) {
    localStorage.setItem('kitaplar', JSON.stringify([]));
}

window.onload = function () {
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    if (!aktifKullanici || aktifKullanici.tip !== 'admin') {
        window.location.href = '../login/login.html';
        return;
    }

    document.getElementById('adminAdSoyad').textContent = 'Baran Sernikli';
    document.getElementById('adminEmail').textContent = aktifKullanici.eposta;

    bolumGoster('adminBilgi');
    menuAyarla();
    kitaplariListele();
    kullanicilariListele();
};

function cikisYap() {
    localStorage.removeItem('aktifKullanici');
    window.location.href = '../login/login.html';
}

function menuAyarla() {
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.onclick = function (e) {
            e.preventDefault();
            bolumGoster(this.getAttribute('href').substring(1));
        };
    });
}
function bolumGoster(id) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.add('d-none'));
    document.getElementById(id).classList.remove('d-none');
}
function kitaplariListele() {
    const kitaplar = JSON.parse(localStorage.getItem('kitaplar')) || [];
    const tbody = document.getElementById('kitaplarTabloGovde');
    tbody.innerHTML = '';

    kitaplar.forEach((kitap, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${kitap.ad}</td>
            <td>${kitap.yazar}</td>
            <td>${kitap.tur || '-'}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="kitapDuzenle(${index})">Düzenle</button>
                <button class="btn btn-danger btn-sm" onclick="kitapSilModalGoster(${index})">Sil</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
function kitapEkleModalGoster() {
    $('#kitapEkleModal').modal('show');
    document.getElementById('kitapEkleForm').reset();
}
function kitapEkle() {
    const ad = document.getElementById('kitapAdi').value.trim();
    const yazar = document.getElementById('yazarAdi').value.trim();
    const tur = document.getElementById('kitapTuru').value.trim();
    const ozet = document.getElementById('kitapOzeti').value.trim();
    const resimInput = document.getElementById('kitapResmi');

    if (!ad || !yazar || !tur) {
        alert('Lütfen kitap adı, yazar ve tür bilgilerini doldurun!');
        return;
    }
    const kitaplar = JSON.parse(localStorage.getItem('kitaplar')) || [];

    if (resimInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const yeniKitap = {
                ad: ad,
                yazar: yazar,
                tur: tur,
                ozet: ozet,
                resim: e.target.result
            };
            kitaplar.push(yeniKitap);
            localStorage.setItem('kitaplar', JSON.stringify(kitaplar));
            $('#kitapEkleModal').modal('hide');
            kitaplariListele();
        };
        reader.readAsDataURL(resimInput.files[0]);
    } else {
        const yeniKitap = {
            ad: ad,
            yazar: yazar,
            tur: tur,
            ozet: ozet,
            resim: null
        };
        kitaplar.push(yeniKitap);
        localStorage.setItem('kitaplar', JSON.stringify(kitaplar));
        $('#kitapEkleModal').modal('hide');
        kitaplariListele();
    }
}
function kitapDuzenle(index) {
    const kitaplar = JSON.parse(localStorage.getItem('kitaplar')) || [];
    const kitap = kitaplar[index];
    if (!kitap) return;
    document.getElementById('kitapAdi').value = kitap.ad;
    document.getElementById('yazarAdi').value = kitap.yazar;
    document.getElementById('kitapTuru').value = kitap.tur || '';
    document.getElementById('kitapOzeti').value = kitap.ozet || '';
    $('#kitapEkleModal').modal('show');
    const kaydetBtn = document.querySelector('#kitapEkleModal .btn-primary');
    kaydetBtn.onclick = function () {
        kitap.ad = document.getElementById('kitapAdi').value.trim();
        kitap.yazar = document.getElementById('yazarAdi').value.trim();
        kitap.tur = document.getElementById('kitapTuru').value.trim();
        kitap.ozet = document.getElementById('kitapOzeti').value.trim();
        localStorage.setItem('kitaplar', JSON.stringify(kitaplar));
        $('#kitapEkleModal').modal('hide');
        kitaplariListele();
    };
}
function kitapSilModalGoster(index) {
    const silOnayBtn = document.getElementById('kitapSilOnayBtn');
    silOnayBtn.onclick = null;
    silOnayBtn.onclick = function() {
        kitapSil(index);
        $('#kitapSilModal').modal('hide');
    };
    $('#kitapSilModal').modal('show');
}
function kitapSil(index) {
    const kitaplar = JSON.parse(localStorage.getItem('kitaplar')) || [];
    kitaplar.splice(index, 1);
    localStorage.setItem('kitaplar', JSON.stringify(kitaplar));
    kitaplariListele();
}

function kullanicilariListele() {
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    const adminler = JSON.parse(localStorage.getItem('adminler')) || [];
    const tbody = document.getElementById('kullanicilarTabloGovde');
    tbody.innerHTML = '';

    // Tüm kullanıcıları birleştir (önce adminler, sonra normal kullanıcılar)
    const tumKullanicilar = [
        ...adminler.filter(admin => admin.adSoyad && admin.email).map(admin => ({
            ...admin,
            tip: 'admin',
            tamAd: admin.adSoyad,
            eposta: admin.email
        })),
        ...kullanicilar.filter(kullanici => kullanici.tamAd && kullanici.eposta).map(kullanici => ({
            ...kullanici,
            tip: 'user'
        }))
    ];

    tumKullanicilar.forEach((kullanici, index) => {
        const tr = document.createElement('tr');
        const kayitTarihi = kullanici.kayitTarihi 
            ? new Date(kullanici.kayitTarihi).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : 'Sistem Başlangıcı';
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${kullanici.tamAd}</td>
            <td>${kullanici.eposta}</td>
            <td><span class="badge badge-${kullanici.tip === 'admin' ? 'danger' : 'info'}">${kullanici.tip === 'admin' ? 'Admin' : 'Kullanıcı'}</span></td>
            <td>${kayitTarihi}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="kullaniciDetayGoster('${kullanici.eposta}', '${kullanici.tip}')">
                    Daha Fazla
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function kullaniciDetayGoster(eposta, tip) {
    console.log('kullaniciDetayGoster called for:', eposta, '(' + tip + ')');
    
    // Kullanıcı bilgilerini bul
    let kullanici;
    if (tip === 'admin') {
        const adminler = JSON.parse(localStorage.getItem('adminler')) || [];
        kullanici = adminler.find(a => a.email === eposta);
        if (kullanici) {
            kullanici.tip = 'admin';
            kullanici.tamAd = kullanici.adSoyad;
            kullanici.eposta = kullanici.email;
        }
    } else {
        const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
        kullanici = kullanicilar.find(k => k.eposta === eposta);
    }

    if (!kullanici) {
        console.error('Kullanıcı detayları bulunamadı!', eposta, tip);
        alert('Kullanıcı bulunamadı!');
        return;
    }

    console.log('Bulunan kullanıcı verisi:', kullanici);

    // Modal alanlarını doldur
    document.getElementById('detayAdSoyad').value = kullanici.tamAd || '';
    document.getElementById('detayEmail').value = kullanici.eposta || '';
    document.getElementById('detaySifre').value = kullanici.sifre || '';

    // Ödünç alınan kitapları göster
    const oduncKitaplar = JSON.parse(localStorage.getItem('oduncKitaplar')) || {};
    const kullaniciKitaplari = oduncKitaplar[eposta] || [];
    const kitaplarDiv = document.getElementById('detayKitaplar');
    
    if (kitaplarDiv) {
        if (kullaniciKitaplari.length > 0) {
            kitaplarDiv.innerHTML = kullaniciKitaplari.map(kitap => 
                `<div class="mb-2">${kitap.ad} - ${kitap.yazar}</div>`
            ).join('');
        } else {
            kitaplarDiv.innerHTML = '<div class="text-muted">Ödünç alınan kitap bulunmuyor.</div>';
        }
    } else {
        console.error('Detay kitaplar divi bulunamadı!');
    }
    

    // Modalı göster
    console.log('Attempting to show modal #kullaniciDetayModal');
    $('#kullaniciDetayModal').modal('show');

    // Modal tamamen gösterildikten sonra buton işlemlerini yap
    $('#kullaniciDetayModal').on('shown.bs.modal', function () {
        const hesapSilBtn = document.getElementById('hesapSilBtn');
        console.log('Modal shown.bs.modal event fired. Hesap silme butonu elementi:', hesapSilBtn, 'Kullanıcı tipi:', tip);

        if (hesapSilBtn) {
            if (tip === 'admin') {
                console.log('Modal shown: Kullanıcı admin, hesap silme butonu gizleniyor.');
                hesapSilBtn.style.display = 'none';
                hesapSilBtn.onclick = null; // Admin için click eventini kaldır
            } else if (tip === 'user') {
                console.log('Modal shown: Kullanıcı normal kullanıcı, hesap silme butonu gösteriliyor.');
                hesapSilBtn.style.display = 'block'; // Butonu görünür yap
                hesapSilBtn.onclick = function() {
                    if (confirm('Bu kullanıcının hesabını silmek istediğinizden emin misiniz?')) {
                        kullaniciHesapSil(eposta);
                    }
                };
            } else {
                 console.log('Modal shown: Bilinmeyen kullanıcı tipi (' + tip + '), hesap silme butonu gizleniyor.');
                 hesapSilBtn.style.display = 'none';
                 hesapSilBtn.onclick = null;
            }
        } else {
            console.error('Modal shown: Hesap silme butonu #hesapSilBtn modalda bulunamadı!');
        }
    });
}

function kullaniciHesapSil(eposta) {
     console.log('Hesap silme işlemi başlatıldı:', eposta);
    // Kullanıcıyı sil
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
     console.log('Mevcut kullanıcılar:', kullanicilar);
    const yeniKullanicilar = kullanicilar.filter(k => k.eposta !== eposta);
     console.log('Silindikten sonraki kullanıcılar:', yeniKullanicilar);
    localStorage.setItem('kullanicilar', JSON.stringify(yeniKullanicilar));

    // Ödünç alınan kitapları temizle
    const oduncKitaplar = JSON.parse(localStorage.getItem('oduncKitaplar')) || {};
     console.log('Mevcut ödünç kitaplar:', oduncKitaplar);
    delete oduncKitaplar[eposta];
     console.log('Silindikten sonraki ödünç kitaplar:', oduncKitaplar);
    localStorage.setItem('oduncKitaplar', JSON.stringify(oduncKitaplar));

    // Modalı kapat ve listeyi güncelle
    $('#kullaniciDetayModal').modal('hide');
    kullanicilariListele();
    alert('Kullanıcı hesabı başarıyla silindi!');
     console.log('Kullanıcı hesabı silme işlemi tamamlandı.');
}

function hesabiSilAdmin() {
    if (confirm('Admin hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
        if (!aktifKullanici || aktifKullanici.tip !== 'admin') {
            alert('Admin hesabı bulunamadı.');
            return;
        }

        const adminler = JSON.parse(localStorage.getItem('adminler')) || [];
        const guncelAdminler = adminler.filter(admin => admin.email !== aktifKullanici.eposta);
        localStorage.setItem('adminler', JSON.stringify(guncelAdminler));

        localStorage.removeItem('aktifKullanici');
        alert('Admin hesabınız başarıyla silindi.');
        window.location.href = '../login/login.html';
    }
}

