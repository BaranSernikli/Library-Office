if (!localStorage.getItem('oduncKitaplar')) {
    localStorage.setItem('oduncKitaplar', JSON.stringify([]));
}

let seciliKitapIndex = null;
let seciliKitapTipi = null;

let kitapTeslimModalInstance = null;

let toastContainerElement = null;
let liveToastElement = null;
let toastMessageElement = null;

window.onload = function () {
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    if (!aktifKullanici || aktifKullanici.tip !== 'user') {
        window.location.href = '../login/login.html';
        return;
    }

    document.getElementById('userAdSoyad').textContent = aktifKullanici.ad;
    document.getElementById('userEmail').textContent = aktifKullanici.eposta;

    toastContainerElement = document.querySelector('.toast-container');
    liveToastElement = document.getElementById('liveToast');
    toastMessageElement = document.getElementById('toastMessage');

    if (!toastContainerElement || !liveToastElement || !toastMessageElement) {
        console.error('Toast elementleri başlangıçta bulunamadı!');
    }

    bolumGoster('bilgi');
    menuAyarla();
    tablolariGuncelle();
};

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

function tablolariGuncelle() {
    const kitaplar = JSON.parse(localStorage.getItem('kitaplar')) || [];
    let oduncKitaplar = JSON.parse(localStorage.getItem('oduncKitaplar')) || [];
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));

    if (!aktifKullanici) return;
    
    oduncKitaplar = oduncKitaplar.map(oduncKitap => {
        const guncelKitap = kitaplar.find(k => 
            (k.ad === oduncKitap.ad && k.yazar === oduncKitap.yazar) || 
            (k.id === oduncKitap.id)
        );
        return guncelKitap ? { ...guncelKitap, oduncAlan: oduncKitap.oduncAlan, oduncTarihi: oduncKitap.oduncTarihi } : oduncKitap;
    });
    
    localStorage.setItem('oduncKitaplar', JSON.stringify(oduncKitaplar));

    const mevcutTablo = document.getElementById('mevcutKitaplarTablo');
    mevcutTablo.innerHTML = '';
    kitaplar.forEach((kitap, index) => {
        const kitapOduncAlinmis = oduncKitaplar.some(odunc => 
            (odunc.ad === kitap.ad && odunc.yazar === odunc.yazar) || 
            (odunc.id === kitap.id)
        );

        const butonHTML = kitapOduncAlinmis 
            ? '<span class="badge badge-danger">Ödünç Alındı</span>' 
            : '<button class="btn btn-info btn-sm" onclick="kitapDetayGoster(' + index + ', \'mevcut\')">İncele</button>';

        mevcutTablo.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${kitap.ad}</td>
                <td>${kitap.yazar}</td>
                <td>${kitap.tur || '-'}</td>
                <td>${butonHTML}</td>
            </tr>
        `;
    });
    
    const kullanicininOduncKitaplari = oduncKitaplar.filter(kitap => kitap.oduncAlan === aktifKullanici.eposta);

    const oduncTablo = document.getElementById('oduncKitaplarTablo');
    oduncTablo.innerHTML = '';
    kullanicininOduncKitaplari.forEach((kitap, index) => {
        const oduncTarihi = new Date(kitap.oduncTarihi);
        const oduncTarihiFormatted = oduncTarihi.toLocaleDateString('tr-TR');
        
        oduncTablo.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${kitap.ad}</td>
                <td>${kitap.yazar}</td>
                <td>${kitap.tur || '-'}</td>
                <td>${oduncTarihiFormatted}</td>
                <td><button class="btn btn-warning btn-sm" onclick="kitapTeslimModalGoster(${index})">Teslim Et</button></td>
            </tr>
        `;
    });
}

function kitapDetayGoster(index, tip) {
    console.log('kitapDetayGoster çağrıldı', { index, tip });

    const kitaplar = JSON.parse(localStorage.getItem('kitaplar')) || [];
    const oduncKitaplar = JSON.parse(localStorage.getItem('oduncKitaplar')) || [];
    
    let kitap;
    if (tip === 'mevcut') {
        kitap = kitaplar[index];
        console.log('Mevcut kitap bulundu:', kitap);
    } else {
        const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
        if (!aktifKullanici) {
            console.error('Aktif kullanıcı bilgisi bulunamadı.');
            return;
        }
        const kullanicininOduncKitaplari = oduncKitaplar.filter(k => k.oduncAlan === aktifKullanici.eposta);
         kitap = kullanicininOduncKitaplari[index];
         console.log('Ödünç alınmış kitap bulundu:', kitap);
    }

    if (!kitap) {
        console.error('Kitap bilgisi bulunamadı!', { index, tip });
        return;
    }

    seciliKitapIndex = index;
    seciliKitapTipi = tip;
    
    document.getElementById('yanPanelKitapAdi').textContent = kitap.ad;
    document.getElementById('yanPanelKitapYazar').textContent = kitap.yazar;
    document.getElementById('yanPanelKitapTuru').textContent = kitap.tur || 'Tür belirtilmemiş.';
    document.getElementById('yanPanelKitapOzeti').textContent = kitap.ozet || 'Özet bulunmuyor.';
    document.getElementById('yanPanelKitapResmi').src = kitap.resim || '';
    
    const oduncAlBtn = document.querySelector('#kitapDetaySidebar .btn-primary');
    const kitapOduncAlinmis = oduncKitaplar.some(odunc => 
        (odunc.ad === kitap.ad && odunc.yazar === kitap.yazar) || 
        (odunc.id === kitap.id)
    );

    if (tip === 'mevcut' && !kitapOduncAlinmis) {
        oduncAlBtn.style.display = 'block';
    } else {
        oduncAlBtn.style.display = 'none';
    }
    
    const sidebarElement = document.getElementById('kitapDetaySidebar');
    if (sidebarElement) {
        sidebarElement.classList.add('active');
        console.log('Sidebar aktif edildi.');
    } else {
        console.error('Sidebar elementi bulunamadı!');
    }
}

function yanPanelKapat() {
    document.getElementById('kitapDetaySidebar').classList.remove('active');
    seciliKitapIndex = null;
    seciliKitapTipi = null;
}

function toastGoster(mesaj, tip = 'success') {
    if (!toastContainerElement || !liveToastElement || !toastMessageElement) {
        console.error('Toast elementleri bulunamadı! (toastGoster fonksiyonu)');
        return;
    }

    toastContainerElement.classList.remove('d-none');

    toastMessageElement.textContent = mesaj;
    liveToastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body" id="toastMessage">
                ${mesaj}
            </div>
        </div>
    `;
    liveToastElement.className = `toast align-items-center text-white border-0 bg-${tip}`;

    const bsToast = new bootstrap.Toast(liveToastElement, {
        animation: true,
        autohide: true,
        delay: 3000
    });
    bsToast.show();

    liveToastElement.addEventListener('hidden.bs.toast', function () {
        toastContainerElement.classList.add('d-none');
    }, { once: true });
}

function kitapOduncAl() {
    if (seciliKitapIndex === null || seciliKitapTipi !== 'mevcut') return;
    
    const kitaplar = JSON.parse(localStorage.getItem('kitaplar')) || [];
    let oduncKitaplar = JSON.parse(localStorage.getItem('oduncKitaplar')) || [];
    const kitap = kitaplar[seciliKitapIndex];
    
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    if (!aktifKullanici) return;

    const kitapZatenOduncAlinmis = oduncKitaplar.some(k => 
        k.oduncAlan === aktifKullanici.eposta && 
        k.ad === kitap.ad && 
        k.yazar === kitap.yazar
    );

    if (kitap && kitapZatenOduncAlinmis) {
        toastGoster('Bu kitap zaten sizde mevcut!', 'danger');
        return;
    }

    const kitapBaskaBirindeOduncMu = oduncKitaplar.some(k => 
        k.ad === kitap.ad && 
        k.yazar === kitap.yazar
    );

     if (kitap && kitapBaskaBirindeOduncMu) {
        toastGoster('Bu kitap şu anda başka bir kullanıcıda ödünç!', 'danger');
        return;
    }
    
    if (kitap) {
        const oduncAlinanKitap = {
            ...kitap,
            oduncAlan: aktifKullanici.eposta,
            oduncTarihi: new Date().toISOString()
        };

        oduncKitaplar.push(oduncAlinanKitap);
        localStorage.setItem('oduncKitaplar', JSON.stringify(oduncKitaplar));
        yanPanelKapat();
        tablolariGuncelle();
        toastGoster(`${kitap.ad} kitabı başarıyla ödünç alındı!`, 'success');
    }
}

function kitapTeslimModalGoster(index) {
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    if (!aktifKullanici) return;

    const oduncKitaplar = JSON.parse(localStorage.getItem('oduncKitaplar')) || [];
    const kullanicininOduncKitaplari = oduncKitaplar.filter(kitap => kitap.oduncAlan === aktifKullanici.eposta);
    const kitap = kullanicininOduncKitaplari[index];
    
    if (!kitap) return;
    
    document.getElementById('teslimKitapBilgisi').textContent = `${kitap.ad} - ${kitap.yazar}`;
    
    const onayBtn = document.getElementById('kitapTeslimOnayBtn');
    const old_element = onayBtn;
    const new_element = onayBtn.cloneNode(true);
    onayBtn.parentNode.replaceChild(new_element, old_element);
    const finalOnayBtn = document.getElementById('kitapTeslimOnayBtn');

    finalOnayBtn.onclick = function() {
        const orijinalIndex = oduncKitaplar.findIndex(k => 
            k.oduncAlan === aktifKullanici.eposta && 
            k.ad === kitap.ad && 
            k.yazar === kitap.yazar
        );
        if(orijinalIndex !== -1) {
             kitapTeslimEt(orijinalIndex);
        }
       
        if (kitapTeslimModalInstance) {
            kitapTeslimModalInstance.hide();
        }
    };
    
    const modalElement = document.getElementById('kitapTeslimModal');
    kitapTeslimModalInstance = new bootstrap.Modal(modalElement);
    kitapTeslimModalInstance.show();
}

function kitapTeslimEt(originalIndex) {
    let oduncKitaplar = JSON.parse(localStorage.getItem('oduncKitaplar')) || [];
    const kitap = oduncKitaplar[originalIndex];
    
    if (kitap) {
        oduncKitaplar.splice(originalIndex, 1);
        localStorage.setItem('oduncKitaplar', JSON.stringify(oduncKitaplar));
        tablolariGuncelle();
        toastGoster(`${kitap.ad} kitabı başarıyla teslim edildi!`, 'success');
    }
}

function cikisYap() {
    localStorage.removeItem('aktifKullanici');
    window.location.href = '../login/login.html';
}

function hesabiSil() {
    console.log('Hesap silme modalı gösteriliyor...');
    $('#hesapSilOnayModal').modal('show');
}

function confirmHesapSil() {
    console.log('Hesap silme onaylandı, işlem başlatılıyor...');
    $('#hesapSilOnayModal').modal('hide'); 

    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    if (!aktifKullanici) {
        alert('Aktif kullanıcı bulunamadı.');
        console.error('Aktif kullanıcı silme işlemi sırasında bulunamadı.');
        return;
    }

    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    const guncelKullanicilar = kullanicilar.filter(k => k.eposta !== aktifKullanici.eposta);
    localStorage.setItem('kullanicilar', JSON.stringify(guncelKullanicilar));
    console.log('Kullanıcı listesinden silindi:', aktifKullanici.eposta);

    
    const oduncKitaplar = JSON.parse(localStorage.getItem('oduncKitaplar')) || {};
    if (oduncKitaplar[aktifKullanici.eposta]) {
        delete oduncKitaplar[aktifKullanici.eposta];
        localStorage.setItem('oduncKitaplar', JSON.stringify(oduncKitaplar));
        console.log('Ödünç alınan kitapları temizlendi:', aktifKullanici.eposta);
    }

    localStorage.removeItem('aktifKullanici');
    alert('Hesabınız başarıyla silindi.');
    console.log('Hesap silme işlemi tamamlandı, çıkış yapılıyor.');
    window.location.href = '../login/login.html';
}
