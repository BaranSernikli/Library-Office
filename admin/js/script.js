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
    const tbody = document.getElementById('kullanicilarTabloGovde');
    tbody.innerHTML = '';

    const adminBilgileri = {
        eposta: 'admin@kutuphane.com',
        sifre: 'admin123',
        tip: 'admin',
        tamAd: 'Baran Sernikli',
        olusturmaTarihi: 'Sistem Başlangıcı'
    };

    const tumKullanicilar = [
        { ...adminBilgileri, id: 'ADMIN' },
        ...kullanicilar
    ];

    tumKullanicilar.forEach((kullanici, index) => {
        const tr = document.createElement('tr');
        const kayitTarihi = kullanici.id === 'ADMIN' 
            ? kullanici.olusturmaTarihi 
            : new Date(kullanici.olusturmaTarihi).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${kullanici.tamAd}</td>
            <td>${kullanici.eposta}</td>
            <td><span class="badge badge-${kullanici.tip === 'admin' ? 'danger' : 'info'}">${kullanici.tip === 'admin' ? 'Admin' : 'Kullanıcı'}</span></td>
            <td>${kayitTarihi}</td>
        `;
        tbody.appendChild(tr);
    });
}

